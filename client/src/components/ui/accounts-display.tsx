import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Link } from "wouter";

export interface AccountItem {
  id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency?: string;
  type?: string;
  status?: "active" | "inactive" | "closed";
  lastTransaction?: string;
}

interface AccountsGridProps {
  accounts: AccountItem[];
  onEdit?: (account: AccountItem) => void;
  onDelete?: (account: AccountItem) => void;
  onSelect?: (account: AccountItem) => void;
  showActions?: boolean;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  closed: "bg-red-100 text-red-800",
};

export function AccountsGrid({
  accounts,
  onEdit,
  onDelete,
  onSelect,
  showActions = true,
}: AccountsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className="hover-elevate transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect?.(account)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{account.accountName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.accountNumber}
                </p>
              </div>
              {account.status && (
                <Badge className={`${statusColors[account.status] || ""} ml-2`}>
                  {account.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold">
                {account.currency || "KES"} {account.balance.toLocaleString()}
              </p>
            </div>

            {account.type && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Type:</span> {account.type}
              </p>
            )}

            {account.lastTransaction && (
              <p className="text-xs text-muted-foreground">
                Last transaction: {account.lastTransaction}
              </p>
            )}

            {showActions && (onEdit || onDelete) && (
              <div className="flex gap-2 pt-2 border-t">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(account);
                    }}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(account);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface AccountsListProps {
  accounts: AccountItem[];
  onEdit?: (account: AccountItem) => void;
  onDelete?: (account: AccountItem) => void;
  showActions?: boolean;
}

export function AccountsList({
  accounts,
  onEdit,
  onDelete,
  showActions = true,
}: AccountsListProps) {
  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-sm">{account.accountName}</p>
                <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
              </div>
            </div>
          </div>

          <div className="text-right mr-4">
            <p className="font-semibold text-sm">
              {account.currency || "KES"} {account.balance.toLocaleString()}
            </p>
            {account.type && (
              <p className="text-xs text-muted-foreground">{account.type}</p>
            )}
          </div>

          {account.status && (
            <Badge className={`${statusColors[account.status] || ""} mr-3`}>
              {account.status}
            </Badge>
          )}

          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(account);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(account);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
