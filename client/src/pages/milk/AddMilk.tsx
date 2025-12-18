import { useState, useEffect } from "react";
import { apiJson } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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

  const { token } = useAuth();
  const [farmers, setFarmers] = useState<Array<{ _id: string; firstName?: string; surname?: string; memberNo?: string }>>([]);
  const [pricePerLiter, setPricePerLiter] = useState<number>(50);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await apiJson("/api/farmers");
        const list = Array.isArray(data) ? data : (data.farmers || data.results || []);
        setFarmers(list || []);
      } catch (err) {
        console.error("Failed to load farmers", err);
      }
    })();
    (async () => {
      try {
        const s: any = await apiJson('/api/settings');
        if (s && s.settings && typeof s.settings.milkPricePerLiter === 'number') setPricePerLiter(s.settings.milkPricePerLiter);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const qty = Number(formData.quantity) || 0;
      const computedAmount = Math.round(qty * pricePerLiter * 100) / 100;
      const res = await fetch("/api/milk", { method: "POST", headers, body: JSON.stringify({ farmerId: formData.farmerId, quantity: qty, amount: computedAmount, fat: Number(formData.fat), snf: Number(formData.snf), date: formData.date }) });
      if (!res.ok) {
        const body = await res.text().catch(() => null);
        throw new Error(body || "Failed to save milk record");
      }
      toast({ title: "Success", description: "Milk record added successfully" });
      setFormData({ farmerId: "", farmerName: "", quantity: "", fat: "", snf: "", date: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed", description: err?.message || "Could not add record", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-emerald-50 border-emerald-200">
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
                  const farmer = farmers.find(f => f._id === value);
                  setFormData({ ...formData, farmerId: value, farmerName: farmer ? `${farmer.firstName || ''} ${farmer.surname || ''}`.trim() : "" });
                }}
              >
                <SelectTrigger id="farmer" data-testid="select-farmer">
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer._id} value={farmer._id}>
                      {farmer.firstName} {farmer.surname} <span className="text-xs text-muted-foreground">{farmer.memberNo}</span>
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
              <div className="text-xs text-muted-foreground mt-1">Price per L: KES {pricePerLiter}. Estimated amount: KES {((Number(formData.quantity) || 0) * pricePerLiter).toFixed(2)}</div>
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
