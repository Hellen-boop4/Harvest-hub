import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter } from "lucide-react";
import { apiJson } from "@/lib/api";

export default function MilkCollectionReports() {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFarmer, setSelectedFarmer] = useState("all");

  const [farmers, setFarmers] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const fdata: any = await apiJson("/api/farmers");
        const flist = Array.isArray(fdata) ? fdata : (fdata.farmers || fdata.results || []);
        setFarmers([{ _id: 'all', name: 'All Farmers' }, ...flist.map((f: any) => ({ _id: f._id, name: `${f.firstName || ''} ${f.surname || ''}` }))]);
      } catch (e) {
        console.error("Failed to load farmers for reports", e);
      }
    })();
  }, []);

  const applyFilters = async () => {
    try {
      const data: any = await apiJson("/api/milk/entries");
      const entries = Array.isArray(data) ? data : (data.results || []);
      // filter by date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filtered = entries.filter((e: any) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d >= start && d <= end;
      });

      // aggregate per farmer
      const map: Record<string, any> = {};
      filtered.forEach((e: any) => {
        const id = e.farmer?._id || e.farmer || 'unknown';
        const name = e.farmer ? `${e.farmer.firstName || ''} ${e.farmer.surname || ''}`.trim() : (e.farmerName || 'Unknown');
        if (!map[id]) map[id] = { farmer: name, collections: 0, totalQuantity: 0, totalFat: 0, totalSnf: 0 };
        map[id].collections += 1;
        map[id].totalQuantity += Number(e.quantity || 0);
        map[id].totalFat += Number(e.fat || 0);
        map[id].totalSnf += Number(e.snf || 0);
      });

      const rows = Object.values(map).map((r: any) => ({ ...r, avgFat: r.collections ? +(r.totalFat / r.collections).toFixed(1) : 0, avgSnf: r.collections ? +(r.totalSnf / r.collections).toFixed(1) : 0 }));
      setReportData(rows);
    } catch (err) {
      console.error("Failed to build report", err);
    }
  };

  const totalCollections = reportData.reduce((sum, item) => sum + (item.collections || 0), 0);
  const totalQuantity = reportData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);

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
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer._id} value={farmer._id}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button data-testid="button-apply-filter" onClick={applyFilters}>
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
              {reportData.map((row, idx) => (
                <TableRow key={idx} data-testid={`row-report-${idx}`}>
                  <TableCell data-testid={`text-farmer-${idx}`}>{row.farmer}</TableCell>
                  <TableCell data-testid={`text-collections-${idx}`}>{row.collections}</TableCell>
                  <TableCell data-testid={`text-quantity-${idx}`}>{(row.totalQuantity || 0).toFixed(1)}</TableCell>
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
