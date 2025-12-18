import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = {
  fetchAccounts: async () => {
    const res = await fetch('/api/accounts');
    if (!res.ok) return [];
    const body = await res.json().catch(() => ({}));
    return body.accounts || [];
  },
  fetchMilkCollection: async () => {
    const res = await fetch('/api/milk');
    if (!res.ok) return [];
    const body = await res.json().catch(() => ({}));
    return body.results || [];
  },
  fetchPayouts: async () => {
    const res = await fetch('/api/payouts');
    if (!res.ok) return [];
    const body = await res.json().catch(() => ({}));
    return body.results || [];
  },
  fetchFarmers: async () => {
    const res = await fetch('/api/farmers');
    if (!res.ok) return [];
    const body = await res.json().catch(() => ({}));
    return body.farmers || [];
  }
};

export default function FarmerAccountsDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyFarmer, setHistoryFarmer] = useState<string>("");
  const [milkCollection, setMilkCollection] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await API.fetchAccounts();
        if (!cancelled) setAccounts(list);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    };

    load();

    const onAccountsUpdate = (payload: any) => {
      // Simple approach: reload full list
      load();
    };

    socket.on('accounts:update', onAccountsUpdate);

    return () => {
      cancelled = true;
      socket.off('accounts:update', onAccountsUpdate);
    };
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      setReportsLoading(true);
      try {
        const [milkData, payoutData, farmersData] = await Promise.all([
          API.fetchMilkCollection(),
          API.fetchPayouts(),
          API.fetchFarmers()
        ]);
        setMilkCollection(milkData);
        setPayouts(payoutData);
        setFarmers(farmersData);
      } catch (e) {
        console.error('Failed to load reports data', e);
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
  }, []);

  const filteredAccounts = accounts.filter((acc: any) => {
    const term = searchTerm.toLowerCase();
    return (
      acc.accountNumber?.toLowerCase().includes(term) ||
      acc.accountName?.toLowerCase().includes(term) ||
      acc.farmer?.memberNo?.toLowerCase().includes(term)
    );
  });

  const loadPayoutHistory = async (farmerId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/payouts?farmerId=${encodeURIComponent(farmerId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load payouts");
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setHistory(list);
      setHistoryOpen(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load payout history", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: "Farmers", href: "/farmers/dashboard" },
          { label: "Accounts" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">Farmer Accounts</h1>
      </div>

      {/* Main Content */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Directory</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredAccounts.length} accounts found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by farmer no, account number, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer No</TableHead>
                  <TableHead>Product Id</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Monthly Contribution</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((acc: any) => (
                    <TableRow key={acc._id}>
                    <TableCell>
                      {acc.farmer?.memberNo
                        || (acc.accountNumber && acc.accountNumber.includes("-") ? acc.accountNumber.split("-")[0] : acc.accountNumber)
                        || "—"}
                    </TableCell>
                    <TableCell>
                      {acc.accountNumber
                        ? (acc.accountNumber.includes("-") ? acc.accountNumber.split("-").slice(-1)[0] : acc.accountNumber)
                        : "—"}
                    </TableCell>
                    <TableCell>{acc.accountName || "—"}</TableCell>
                    <TableCell className="text-right">
                      {(acc.monthlyContribution || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="px-0 text-right w-full justify-end"
                        onClick={() => {
                          if (acc.farmer?._id) {
                            setHistoryFarmer(acc.farmer._id);
                            loadPayoutHistory(acc.farmer._id);
                          } else {
                            toast({ title: "Unavailable", description: "No farmer linked to this account", variant: "destructive" });
                          }
                        }}
                      >
                        {(acc.balance || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAccounts.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">No accounts found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Member Reports</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Milk collection and payslip information for all members
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="milk" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="milk">Milk Collection (Kgs)</TabsTrigger>
              <TabsTrigger value="payslip">Payslips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="milk" className="mt-4">
              {reportsLoading ? (
                <div className="py-6 text-sm text-muted-foreground text-center">Loading milk collection data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member No</TableHead>
                        <TableHead>Farmer Name</TableHead>
                        <TableHead className="text-right">Total Quantity (L)</TableHead>
                        <TableHead className="text-right">Total Amount (KES)</TableHead>
                        <TableHead className="text-right">Avg Fat %</TableHead>
                        <TableHead className="text-right">Avg SNF %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milkCollection.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                            No milk collection data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        milkCollection.map((m: any) => {
                          const farmer = farmers.find((f: any) => (f._id || f.id) === (m._id || m.farmer));
                          return (
                            <TableRow key={m._id || m.farmer}>
                              <TableCell className="font-semibold">
                                {farmer?.memberNo || "—"}
                              </TableCell>
                              <TableCell>
                                {farmer ? `${farmer.firstName || ""} ${farmer.surname || ""}`.trim() || "—" : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                {(m.totalQuantity || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {(m.totalAmount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {(m.totalFat || m.avgFat || 0).toFixed(2)}%
                              </TableCell>
                              <TableCell className="text-right">
                                {(m.totalSnf || m.avgSnf || 0).toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payslip" className="mt-4">
              {reportsLoading ? (
                <div className="py-6 text-sm text-muted-foreground text-center">Loading payslip data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member No</TableHead>
                        <TableHead>Farmer Name</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Milk Qty (L)</TableHead>
                        <TableHead className="text-right">Gross Amount</TableHead>
                        <TableHead className="text-right">Loan Deductions</TableHead>
                        <TableHead className="text-right">Contributions</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                            No payslip data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        payouts.map((p: any) => {
                          const farmer = p.farmer && typeof p.farmer === 'object' ? p.farmer : farmers.find((f: any) => (f._id || f.id) === (p.farmer?._id || p.farmer));
                          return (
                            <TableRow key={p._id}>
                              <TableCell className="font-semibold">
                                {farmer?.memberNo || "—"}
                              </TableCell>
                              <TableCell>
                                {farmer ? `${farmer.firstName || ""} ${farmer.surname || ""}`.trim() || "—" : "—"}
                              </TableCell>
                              <TableCell>{p.period || "—"}</TableCell>
                              <TableCell className="text-right">
                                {(p.totalMilkQuantity || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                {(p.totalMilkAmount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {(p.totalLoanDeductions || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right text-orange-600">
                                {(p.totalContributions || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                {(p.netAmount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payout History</DialogTitle>
            <DialogDescription>Recent payouts applied to the payout account.</DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">No payouts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((p: any) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.period || "—"}</TableCell>
                      <TableCell>{p.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        {(p.netAmount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
