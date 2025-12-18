import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function MilkPayout() {
  const { toast } = useToast();
  const [period, setPeriod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rate, setRate] = useState<string>("");
  const [processedPayouts, setProcessedPayouts] = useState<any[]>([]);
  const { token } = useAuth();

  const handleProcessPayout = async () => {
    if (!period) return toast({ title: "Select period", description: "Choose YYYY-MM period", variant: "destructive" });
    const rateNum = Number(rate || 0);
    if (!rate || isNaN(rateNum) || rateNum <= 0) {
      return toast({ title: "Enter rate", description: "Provide milk rate per liter", variant: "destructive" });
    }
    setProcessing(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/payouts/process?period=${encodeURIComponent(period)}&rate=${encodeURIComponent(rateNum)}`, { method: "POST", headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || "Failed to process payouts");
      }
      const body = await res.json();
      const results = body.results || [];

      // fetch farmers map for enriched display
      const farmersRes = await fetch(`/api/farmers`);
      const farmersBody = await farmersRes.json().catch(() => ({}));
      const farmers = farmersBody?.farmers || [];
      const fmap: Record<string, any> = {};
      farmers.forEach((f: any) => { fmap[f._id] = f; });

      const enriched = results.map((r: any) => ({ ...r, farmer: fmap[r.farmerId] || null }));
      setReport(enriched);
      setPreview(null); // clear preview after processing
      toast({ title: "Payouts Processed", description: `Processed payouts for ${body.period} (${results.length} farmers)` });
    } catch (err: any) {
      console.error("Error processing payouts:", err);
      toast({ title: "Error", description: err.message || "Failed to process payouts", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handlePreview = async () => {
    if (!period) return toast({ title: "Select period", description: "Choose YYYY-MM period", variant: "destructive" });
    const rateNum = Number(rate || 0);
    if (!rate || isNaN(rateNum) || rateNum <= 0) {
      return toast({ title: "Enter rate", description: "Provide milk rate per liter", variant: "destructive" });
    }
    try {
      // Call server preview endpoint — returns exact same breakdown as process but non-mutating
      const res = await fetch(`/api/payouts/preview?period=${encodeURIComponent(period)}&rate=${encodeURIComponent(rateNum)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Failed to preview payouts");
      }
      const body = await res.json();
      const results = body?.results || [];

      // fetch farmers map for display
      const farmersRes = await fetch(`/api/farmers`);
      const farmersBody = await farmersRes.json().catch(() => ({}));
      const farmers = farmersBody?.farmers || [];
      const fmap: Record<string, any> = {};
      farmers.forEach((f: any) => { fmap[f._id] = f; });

      const enriched = results.map((r: any) => ({ ...r, farmer: fmap[r.farmerId] || null }));
      setPreview(enriched);
      setExpandedRow(null);
      toast({ title: "Preview Ready", description: `Preview computed for ${period}` });
    } catch (err: any) {
      console.error("Preview failed:", err);
      toast({ title: "Error", description: err.message || "Failed to compute preview", variant: "destructive" });
    }
  };

  useEffect(() => {
    // Fetch default milk rate from settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((body) => {
        const defaultRate = body?.settings?.milkPricePerLiter;
        if (defaultRate) setRate(String(defaultRate));
      })
      .catch(() => null);

    // Load processed payouts list for quick visibility
    fetch("/api/payouts")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setProcessedPayouts(list);
      })
      .catch(() => null);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Milk Payout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payout Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="period" data-testid="label-period">
                <span className="font-semibold">Period (YYYY-MM)</span>
              </Label>
              <Input
                id="period"
                placeholder="e.g., 2025-11"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                data-testid="input-period"
              />
              <p className="text-xs text-gray-500 mt-2">Enter the month you want to process. All farmers with milk collections in this period will be included.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" data-testid="label-rate">
                <span className="font-semibold">Milk Rate (KES per liter)</span>
              </Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 50"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                data-testid="input-rate"
              />
              <p className="text-xs text-gray-500 mt-2">This rate is used to compute Gross = Qty × Rate. Defaults to server setting if available.</p>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={processing || !period}
                  data-testid="button-preview-payout"
                >
                  Preview
                </Button>
                <Button
                  className="w-full"
                  onClick={handleProcessPayout}
                  disabled={processing || !period}
                  data-testid="button-process-payout"
                >
                  {processing ? "Processing…" : "Process"}
                </Button>
              </div>
            </div>

            {preview && preview.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-900">Ready to Process</p>
                <p className="text-sm text-green-800">{preview.length} farmer(s) with collections</p>
              </div>
            )}

            {report && report.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900">Last Processed</p>
                <p className="text-sm text-blue-800">{report.length} farmer(s) processed</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            {preview && preview.length > 0 ? (
              <>
                <div className="mb-3 text-xs text-gray-600">Server-calculated preview (click row to expand account & loan breakdown). This is non-mutating — click "Process Payouts" to persist.</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Total Qty (L)</TableHead>
                      <TableHead>Gross (KES)</TableHead>
                      <TableHead>Loan Deductions</TableHead>
                      <TableHead>Contributions</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row: any) => (
                      <>
                        <TableRow
                          key={`main-${row.farmerId}`}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setExpandedRow(expandedRow === row.farmerId ? null : row.farmerId)}
                        >
                          <TableCell className="w-8">
                            <span className="text-gray-400">{expandedRow === row.farmerId ? '▼' : '▶'}</span>
                          </TableCell>
                          <TableCell>{row.farmer ? `${row.farmer.firstName} ${row.farmer.surname} (${row.farmer.memberNo})` : row.farmerId}</TableCell>
                          <TableCell>{row.totalQty}</TableCell>
                          <TableCell>KES {Number(row.gross).toFixed(2)}</TableCell>
                          <TableCell>KES {Number(row.totalLoanDeductions).toFixed(2)}</TableCell>
                          <TableCell>KES {Number(row.totalContributions).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold">KES {Number(row.netAmount).toFixed(2)}</TableCell>
                        </TableRow>

                        {/* Expandable breakdown row */}
                        {expandedRow === row.farmerId && (
                          <TableRow key={`expand-${row.farmerId}`} className="bg-blue-50">
                            <TableCell colSpan={7} className="p-4">
                              <div className="grid grid-cols-2 gap-6">
                                {/* Accounts breakdown */}
                                <div>
                                  <h4 className="font-semibold text-xs mb-2">Accounts (Contributions)</h4>
                                  {row.accounts && row.accounts.length > 0 ? (
                                    <div className="space-y-2 text-xs">
                                      {row.accounts.map((acc: any, idx: number) => (
                                        <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                          <p className="font-medium text-gray-700">{acc.accountName}</p>
                                          <p className="text-gray-600">Monthly: KES {Number(acc.monthlyContribution).toFixed(2)}</p>
                                          <p className="text-gray-600">Current Balance: KES {Number(acc.currentBalance).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">No accounts</p>
                                  )}
                                </div>

                                {/* Loans breakdown */}
                                <div>
                                  <h4 className="font-semibold text-xs mb-2">Loans (Deductions)</h4>
                                  {row.loans && row.loans.length > 0 ? (
                                    <div className="space-y-2 text-xs">
                                      {row.loans.map((loan: any, idx: number) => (
                                        <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                          <p className="font-medium text-gray-700">Loan ID: {String(loan._id).slice(-6)}</p>
                                          <p className="text-gray-600">Amount: KES {Number(loan.amount).toFixed(2)}</p>
                                          <p className="text-gray-600">Monthly Installment: KES {Number(loan.monthlyInstallment).toFixed(2)}</p>
                                          <p className="text-gray-600">Remaining: KES {Number(loan.remaining).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">No active loans</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-sm space-y-2">
                  <div className="text-xs text-gray-500">Calculation: Gross (sum of milk amount for period) − Loan Deductions (monthly installment or remaining) − Contributions = Net</div>
                  <div className="text-xs text-gray-500">After processing, net amount will be credited to farmer's Payout account.</div>
                </div>
              </>
            ) : report.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Total Collected</TableHead>
                    <TableHead>Total Loan Deductions</TableHead>
                    <TableHead>Total Contributions</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map((row: any) => (
                    <TableRow key={String(row.payoutId)}>
                      <TableCell>{row.farmer ? `${row.farmer.firstName} ${row.farmer.surname} (${row.farmer.memberNo})` : row.farmerId}</TableCell>
                      <TableCell>KES {Number(row.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>KES {Number(row.totalLoanDeductions).toFixed(2)}</TableCell>
                      <TableCell>KES {Number(row.totalContributions).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">KES {Number(row.netAmount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No payout report yet. Select a period and click "Preview Calculations" or "Process Payouts".</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Processed payouts history */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Processed Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {processedPayouts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No payouts processed yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Total Qty (L)</TableHead>
                  <TableHead>Gross (KES)</TableHead>
                  <TableHead>Deductions (Loans+Contrib)</TableHead>
                  <TableHead className="text-right">Net (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedPayouts.map((p: any) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.period}</TableCell>
                    <TableCell>{p.farmer ? `${p.farmer.firstName} ${p.farmer.surname}` : p.farmerId || p.farmer}</TableCell>
                    <TableCell>{Number(p.totalMilkQuantity || 0).toFixed(2)}</TableCell>
                    <TableCell>KES {Number(p.totalMilkAmount || 0).toFixed(2)}</TableCell>
                    <TableCell>KES {Number((p.totalLoanDeductions || 0) + (p.totalContributions || 0)).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">KES {Number(p.netAmount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
