import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

export default function MilkList() {
  const mockRecords = [
    { id: 1, farmer: "John Kamau", date: "2025-11-18", quantity: 25.5, fat: 3.8, snf: 8.5, status: "verified" },
    { id: 2, farmer: "Mary Wanjiku", date: "2025-11-18", quantity: 30.0, fat: 4.0, snf: 8.7, status: "verified" },
    { id: 3, farmer: "David Omondi", date: "2025-11-18", quantity: 18.5, fat: 3.6, snf: 8.3, status: "pending" },
    { id: 4, farmer: "Sarah Akinyi", date: "2025-11-18", quantity: 22.0, fat: 3.9, snf: 8.6, status: "verified" },
    { id: 5, farmer: "John Kamau", date: "2025-11-17", quantity: 24.0, fat: 3.7, snf: 8.4, status: "verified" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milk Collection Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Quantity (L)</TableHead>
                <TableHead>Fat %</TableHead>
                <TableHead>SNF %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecords.map((record) => (
                <TableRow key={record.id} data-testid={`row-record-${record.id}`}>
                  <TableCell data-testid={`text-date-${record.id}`}>{record.date}</TableCell>
                  <TableCell data-testid={`text-farmer-${record.id}`}>{record.farmer}</TableCell>
                  <TableCell data-testid={`text-quantity-${record.id}`}>{record.quantity}</TableCell>
                  <TableCell data-testid={`text-fat-${record.id}`}>{record.fat}</TableCell>
                  <TableCell data-testid={`text-snf-${record.id}`}>{record.snf}</TableCell>
                  <TableCell>
                    <Badge
                      variant={record.status === "verified" ? "default" : "secondary"}
                      data-testid={`badge-status-${record.id}`}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => console.log("Edit record", record.id)}
                        data-testid={`button-edit-${record.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => console.log("Delete record", record.id)}
                        data-testid={`button-delete-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
