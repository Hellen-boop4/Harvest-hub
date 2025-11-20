import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LoansDashboard() {
  const mockLoans = [
    { id: 1, farmer: "John Kamau", amount: 50000, status: "active", dueDate: "2025-12-31" },
    { id: 2, farmer: "Mary Wanjiku", amount: 75000, status: "active", dueDate: "2025-11-30" },
    { id: 3, farmer: "David Omondi", amount: 30000, status: "paid", dueDate: "2025-10-15" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Loan Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Amount (KES)</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLoans.map((loan) => (
                <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`}>
                  <TableCell data-testid={`text-farmer-${loan.id}`}>{loan.farmer}</TableCell>
                  <TableCell data-testid={`text-amount-${loan.id}`}>
                    {loan.amount.toLocaleString()}
                  </TableCell>
                  <TableCell data-testid={`text-due-${loan.id}`}>{loan.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={loan.status === "paid" ? "default" : "secondary"}
                      data-testid={`badge-status-${loan.id}`}
                    >
                      {loan.status}
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
