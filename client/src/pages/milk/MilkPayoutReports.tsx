import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter } from "lucide-react";

export default function MilkPayoutReports() {
  const [startDate, setStartDate] = useState("2025-11-01");
  const [endDate, setEndDate] = useState("2025-11-19");
  const [status, setStatus] = useState("all");

  const mockPayoutData = [
    { id: "P001", date: "2025-11-18", farmer: "John Kamau", quantity: 378.5, amount: 17032.50, status: "paid" },
    { id: "P002", date: "2025-11-18", farmer: "Mary Wanjiku", quantity: 540.0, amount: 24300.00, status: "paid" },
    { id: "P003", date: "2025-11-15", farmer: "David Omondi", quantity: 222.0, amount: 9990.00, status: "pending" },
    { id: "P004", date: "2025-11-15", farmer: "Sarah Akinyi", quantity: 352.0, amount: 15840.00, status: "paid" },
    { id: "P005", date: "2025-11-10", farmer: "John Kamau", quantity: 320.0, amount: 14400.00, status: "paid" },
  ];

  const totalAmount = mockPayoutData.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = mockPayoutData.filter(p => p.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = mockPayoutData.filter(p => p.status === "pending").reduce((sum, item) => sum + item.amount, 0);

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
              {mockPayoutData.map((row) => (
                <TableRow key={row.id} data-testid={`row-payout-${row.id}`}>
                  <TableCell data-testid={`text-id-${row.id}`}>{row.id}</TableCell>
                  <TableCell data-testid={`text-date-${row.id}`}>{row.date}</TableCell>
                  <TableCell data-testid={`text-farmer-${row.id}`}>{row.farmer}</TableCell>
                  <TableCell data-testid={`text-quantity-${row.id}`}>{row.quantity.toFixed(1)}</TableCell>
                  <TableCell data-testid={`text-amount-${row.id}`}>
                    {row.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === "paid" ? "default" : "secondary"}
                      data-testid={`badge-status-${row.id}`}
                    >
                      {row.status}
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
