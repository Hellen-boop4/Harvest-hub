import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function MilkPayout() {
  const { toast } = useToast();
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [period, setPeriod] = useState("");
  const [ratePerLiter, setRatePerLiter] = useState("45");

  const mockFarmers = [
    { id: "1", name: "John Kamau" },
    { id: "2", name: "Mary Wanjiku" },
    { id: "3", name: "David Omondi" },
    { id: "4", name: "Sarah Akinyi" },
  ];

  const mockPayoutData = selectedFarmer
    ? [
      { date: "2025-11-18", quantity: 25.5, amount: (25.5 * parseFloat(ratePerLiter)).toFixed(2) },
      { date: "2025-11-17", quantity: 24.0, amount: (24.0 * parseFloat(ratePerLiter)).toFixed(2) },
      { date: "2025-11-16", quantity: 26.5, amount: (26.5 * parseFloat(ratePerLiter)).toFixed(2) },
    ]
    : [];

  const totalQuantity = mockPayoutData.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = mockPayoutData.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const handleProcessPayout = () => {
    console.log("Processing payout for farmer:", selectedFarmer);
    toast({
      title: "Payout Processed",
      description: `Payment of KES ${totalAmount.toFixed(2)} has been processed successfully`,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Milk Payout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="farmer-select" data-testid="label-farmer">Select Farmer</Label>
              <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                <SelectTrigger id="farmer-select" data-testid="select-farmer">
                  <SelectValue placeholder="Choose farmer" />
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

            <div className="space-y-2">
              <Label htmlFor="period" data-testid="label-period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" data-testid="select-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" data-testid="label-rate">Rate per Liter (KES)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={ratePerLiter}
                onChange={(e) => setRatePerLiter(e.target.value)}
                data-testid="input-rate"
              />
            </div>

            {selectedFarmer && (
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Quantity:</span>
                  <span className="font-semibold" data-testid="text-total-quantity">
                    {totalQuantity.toFixed(1)} L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="text-lg font-bold text-primary" data-testid="text-total-amount">
                    KES {totalAmount.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleProcessPayout}
                  disabled={!selectedFarmer}
                  data-testid="button-process-payout"
                >
                  Process Payout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFarmer ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayoutData.map((item, idx) => (
                    <TableRow key={idx} data-testid={`row-payout-${idx}`}>
                      <TableCell data-testid={`text-date-${idx}`}>{item.date}</TableCell>
                      <TableCell data-testid={`text-quantity-${idx}`}>{item.quantity}</TableCell>
                      <TableCell className="text-right" data-testid={`text-amount-${idx}`}>
                        {item.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a farmer to view collection details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
