import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { apiJson } from "@/lib/api";

export default function MilkList() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await apiJson("/api/milk/entries");
        const list = Array.isArray(data) ? data : (data.results || []);
        setRecords(list || []);
      } catch (err) {
        console.error("Failed to load milk entries", err);
      }
    })();
  }, []);

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
              {records.map((rec: any) => (
                <TableRow key={rec._id || `${rec.farmer?._id}-${rec.date}`}>
                  <TableCell>{rec.date ? (rec.date.split ? rec.date.split('T')[0] : rec.date) : ''}</TableCell>
                  <TableCell>{rec.farmer ? `${rec.farmer.firstName || ''} ${rec.farmer.surname || ''}` : (rec.farmerName || '')}</TableCell>
                  <TableCell>{(rec.quantity || 0).toFixed ? (rec.quantity).toFixed(1) : rec.quantity}</TableCell>
                  <TableCell>{rec.fat ?? 0}</TableCell>
                  <TableCell>{rec.snf ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="default">recorded</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => console.log("Edit record", rec._id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => console.log("Delete record", rec._id)}>
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
