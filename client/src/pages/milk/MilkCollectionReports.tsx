import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter } from "lucide-react";

export default function MilkCollectionReports() {
  const [startDate, setStartDate] = useState("2025-11-01");
  const [endDate, setEndDate] = useState("2025-11-19");
  const [selectedFarmer, setSelectedFarmer] = useState("all");

  //todo: remove mock functionality
  const mockFarmers = [
    { id: "all", name: "All Farmers" },
    { id: "1", name: "John Kamau" },
    { id: "2", name: "Mary Wanjiku" },
    { id: "3", name: "David Omondi" },
    { id: "4", name: "Sarah Akinyi" },
  ];

  const mockReportData = [
    { farmer: "John Kamau", collections: 15, totalQuantity: 378.5, avgFat: 3.8, avgSnf: 8.5 },
    { farmer: "Mary Wanjiku", collections: 18, totalQuantity: 540.0, avgFat: 4.0, avgSnf: 8.7 },
    { farmer: "David Omondi", collections: 12, totalQuantity: 222.0, avgFat: 3.6, avgSnf: 8.3 },
    { farmer: "Sarah Akinyi", collections: 16, totalQuantity: 352.0, avgFat: 3.9, avgSnf: 8.6 },
  ];

  const totalCollections = mockReportData.reduce((sum, item) => sum + item.collections, 0);
  const totalQuantity = mockReportData.reduce((sum, item) => sum + item.totalQuantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Milk Collection Reports</h1>

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
              <Label htmlFor="farmer-filter" data-testid="label-farmer">Farmer</Label>
              <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                <SelectTrigger id="farmer-filter" data-testid="select-farmer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockFarmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </SelectItem>
                  ))}
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
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-collections">
              {totalCollections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-quantity">
              {totalQuantity.toFixed(1)} L
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-daily">
              {(totalQuantity / 19).toFixed(1)} L
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Collection Summary by Farmer</CardTitle>
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
                <TableHead>Farmer</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead>Total Quantity (L)</TableHead>
                <TableHead>Avg. Fat %</TableHead>
                <TableHead>Avg. SNF %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReportData.map((row, idx) => (
                <TableRow key={idx} data-testid={`row-report-${idx}`}>
                  <TableCell data-testid={`text-farmer-${idx}`}>{row.farmer}</TableCell>
                  <TableCell data-testid={`text-collections-${idx}`}>{row.collections}</TableCell>
                  <TableCell data-testid={`text-quantity-${idx}`}>{row.totalQuantity.toFixed(1)}</TableCell>
                  <TableCell data-testid={`text-fat-${idx}`}>{row.avgFat}</TableCell>
                  <TableCell data-testid={`text-snf-${idx}`}>{row.avgSnf}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
