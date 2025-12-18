import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter } from "lucide-react";
import { apiJson } from "@/lib/api";

export default function MilkPayoutReports() {
  const [startDate, setStartDate] = useState("2025-11-01");
  const [endDate, setEndDate] = useState("2025-11-19");
  const [status, setStatus] = useState("all");

  // live payouts loaded below in useEffect

  const [payouts, setPayouts] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const data: any = await apiJson('/api/payouts');
        const list = Array.isArray(data) ? data : (data.results || []);
        setPayouts(list || []);
      } catch (e) {
        console.error('Failed to load payouts', e);
      }
    })();
  }, []);

  const totalAmountLive = payouts.reduce((s, p) => s + (p.netAmount || p.totalMilkAmount || 0), 0);
  const paidAmountLive = payouts.filter(p => p.paid).reduce((s, p) => s + (p.netAmount || p.totalMilkAmount || 0), 0);
  const pendingAmountLive = totalAmountLive - paidAmountLive;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Milk Payout Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date" data-testid="label-start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" data-testid="label-end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter" data-testid="label-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button data-testid="button-apply-filter">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-payouts">
              KES {totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="text-paid">
              KES {paidAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground" data-testid="text-pending">
              KES {pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payment History</CardTitle>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Quantity (L)</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((row: any) => (
                <TableRow key={row._id} data-testid={`row-payout-${row._id}`}>
                  <TableCell data-testid={`text-id-${row._id}`}>{row._id}</TableCell>
                  <TableCell data-testid={`text-date-${row._id}`}>{row.period}</TableCell>
                  <TableCell data-testid={`text-farmer-${row._id}`}>{row.farmer ? `${row.farmer.firstName || ''} ${row.farmer.surname || ''}` : ''}</TableCell>
                  <TableCell data-testid={`text-quantity-${row._id}`}>{(row.totalMilkQuantity || 0).toFixed(1)}</TableCell>
                  <TableCell data-testid={`text-amount-${row._id}`}>
                    {(row.netAmount || row.totalMilkAmount || 0).toLocaleString()
                    }</TableCell>
                  <TableCell>
                    <Badge
                      variant={(row.paid || row.status === 'paid') ? "default" : "secondary"}
                      data-testid={`badge-status-${row._id}`}
                    >
                      {(row.paid || row.status) ? (row.status || (row.paid ? 'paid' : 'pending')) : 'unknown'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
