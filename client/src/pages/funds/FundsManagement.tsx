import { useEffect, useState } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Account = {
  _id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  monthlyContribution?: number;
  currency?: string;
  type?: string;
  farmer?: {
    memberNo?: string;
    firstName?: string;
    surname?: string;
  };
};

type TxMode = "deposit" | "withdraw";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const winAny = window as any;
  if (winAny.fetchWithAuth) {
    return winAny.fetchWithAuth(url, options);
  }
  return fetch(url, options);
};

export default function FundsManagement() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [txOpen, setTxOpen] = useState(false);
  const [txMode, setTxMode] = useState<TxMode>("deposit");
  const [txAccount, setTxAccount] = useState<Account | null>(null);
  const [txAmount, setTxAmount] = useState<string>("");
  const [txDescription, setTxDescription] = useState<string>("");
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (!res.ok) {
          throw new Error("Failed to load accounts");
        }
        const body = await res.json().catch(() => ({}));
        setAccounts(body.accounts || []);
      } catch (err: any) {
        console.error("Failed to load accounts for funds management:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to load accounts",
          variant: "destructive",
        });
      }
    };

    loadAccounts();
  }, [toast]);

  const filteredAccounts = accounts.filter((acc) => {
    const term = searchTerm.toLowerCase();
    const farmerNo =
      (acc.farmer?.memberNo as string | undefined) ||
      (acc.accountNumber && acc.accountNumber.includes("-") ? acc.accountNumber.split("-")[0] : acc.accountNumber) ||
      "";
    return (
      farmerNo.toLowerCase().includes(term) ||
      (acc.accountNumber || "").toLowerCase().includes(term) ||
      (acc.accountName || "").toLowerCase().includes(term)
    );
  });

  const openTxDialog = (mode: TxMode, account: Account) => {
    setTxMode(mode);
    setTxAccount(account);
    setTxAmount("");
    setTxDescription("");
    setTxOpen(true);
  };

  const handleSubmitTx = async () => {
    if (!txAccount) return;
    const numericAmount = Number(txAmount);
    if (!numericAmount || numericAmount <= 0) {
      toast({ title: "Invalid amount", description: "Enter a positive amount.", variant: "destructive" });
      return;
    }

    setTxLoading(true);
    try {
      const endpoint =
        txMode === "deposit"
          ? `/api/accounts/${encodeURIComponent(txAccount._id)}/deposit`
          : `/api/accounts/${encodeURIComponent(txAccount._id)}/withdraw`;

      const res = await fetchWithAuth(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: numericAmount, description: txDescription }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || `Failed to ${txMode === "deposit" ? "deposit" : "withdraw"}`);
      }

      const updated: Account = body.account;
      setAccounts((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));

      toast({
        title: "Success",
        description: `${txMode === "deposit" ? "Deposit" : "Withdrawal"} completed successfully.`,
      });
      setTxOpen(false);
    } catch (err: any) {
      console.error("Funds transaction error:", err);
      toast({
        title: "Error",
        description: err.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Funds Management" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">Funds Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage member deposits and withdrawals across all accounts. Transactions update the linked farmer accounts
          immediately.
        </p>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Accounts</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{filteredAccounts.length} accounts found</p>
            </div>
            <div className="w-64">
              <Input
                placeholder="Search by farmer no, account no, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer No</TableHead>
                  <TableHead>Account No</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((acc) => {
                  const farmerNo =
                    acc.farmer?.memberNo ||
                    (acc.accountNumber && acc.accountNumber.includes("-")
                      ? acc.accountNumber.split("-")[0]
                      : acc.accountNumber);
                  return (
                    <TableRow key={acc._id}>
                      <TableCell>{farmerNo || "—"}</TableCell>
                      <TableCell>{acc.accountNumber || "—"}</TableCell>
                      <TableCell>{acc.accountName || "—"}</TableCell>
                      <TableCell>{acc.type || "—"}</TableCell>
                      <TableCell className="text-right">
                        {(acc.balance || 0).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openTxDialog("deposit", acc)}>
                            Deposit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openTxDialog("withdraw", acc)}>
                            Withdraw
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAccounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      No accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{txMode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</DialogTitle>
            <DialogDescription>
              {txAccount
                ? `${txAccount.accountName} (${txAccount.accountNumber}) - current balance ${(txAccount.balance || 0).toLocaleString(
                    "en-KE",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Narration (optional)</label>
              <Input
                placeholder="Reason / reference"
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTxOpen(false)} disabled={txLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTx} disabled={txLoading}>
                {txLoading ? "Processing..." : txMode === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
