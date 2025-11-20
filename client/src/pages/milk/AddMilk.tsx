import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AddMilk() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    farmerId: "",
    farmerName: "",
    quantity: "",
    fat: "",
    snf: "",
    date: new Date().toISOString().split('T')[0],
  });

  const mockFarmers = [
    { id: "1", name: "John Kamau" },
    { id: "2", name: "Mary Wanjiku" },
    { id: "3", name: "David Omondi" },
    { id: "4", name: "Sarah Akinyi" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Milk record added:", formData);
    toast({
      title: "Success",
      description: "Milk record added successfully",
    });
    setFormData({
      farmerId: "",
      farmerName: "",
      quantity: "",
      fat: "",
      snf: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Milk Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="farmer" data-testid="label-farmer">Farmer Name</Label>
              <Select
                value={formData.farmerId}
                onValueChange={(value) => {
                  const farmer = mockFarmers.find(f => f.id === value);
                  setFormData({ ...formData, farmerId: value, farmerName: farmer?.name || "" });
                }}
              >
                <SelectTrigger id="farmer" data-testid="select-farmer">
                  <SelectValue placeholder="Select farmer" />
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
              <Label htmlFor="date" data-testid="label-date">Collection Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" data-testid="label-quantity">Quantity (Liters)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                data-testid="input-quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" data-testid="label-fat">Fat Content (%)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                data-testid="input-fat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="snf" data-testid="label-snf">SNF Content (%)</Label>
              <Input
                id="snf"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.snf}
                onChange={(e) => setFormData({ ...formData, snf: e.target.value })}
                data-testid="input-snf"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" data-testid="button-submit">
              Add Record
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                farmerId: "",
                farmerName: "",
                quantity: "",
                fat: "",
                snf: "",
                date: new Date().toISOString().split('T')[0],
              })}
              data-testid="button-reset"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
