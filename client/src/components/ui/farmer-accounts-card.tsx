import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, Trash2 } from "lucide-react";

export interface FarmerAccount {
  id: string;
  farmerId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "closed";
  accountType: string;
  lastTransaction?: string;
  createdDate: string;
}

interface FarmerAccountsCardProps {
  farmer: {
    name: string;
    id: string;
  };
  accounts: FarmerAccount[];
  onAddAccount?: () => void;
  onViewAccount?: (account: FarmerAccount) => void;
  onEditAccount?: (account: FarmerAccount) => void;
  onDeleteAccount?: (account: FarmerAccount) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  closed: "bg-red-100 text-red-800",
};

export function FarmerAccountsCard({
  farmer,
  accounts,
  onAddAccount,
  onViewAccount,
  onEditAccount,
  onDeleteAccount,
}: FarmerAccountsCardProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{farmer.name} - Bank Accounts</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Total Balance: <span className="font-semibold">{farmer.name || "KES"} {totalBalance.toLocaleString()}</span>
            </p>
          </div>
          {onAddAccount && (
            <Button size="sm" onClick={onAddAccount}>
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bank accounts registered</p>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors group flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {account.accountName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{account.accountName}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.accountNumber} • {account.bankName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {account.accountType}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right mr-3 flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {account.currency} {account.balance.toLocaleString()}
                    </p>
                    <Badge className={`${statusColors[account.status] || ""} text-xs mt-1`}>
                      {account.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onViewAccount && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewAccount(account)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {onEditAccount && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditAccount(account)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                  {onDeleteAccount && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteAccount(account)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
