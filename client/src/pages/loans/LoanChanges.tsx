import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoanChanges() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState("");
  const [changeType, setChangeType] = useState("repayment_amount");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/loans");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.loans || [];
        setLoans(list);
      } catch (e) {
        console.error("Failed to load loans", e);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) {
      toast({ title: "Select loan", description: "Choose a loan first", variant: "destructive" });
      return;
    }
    if (!value) {
      toast({ title: "Enter a value", description: "Provide change value", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/loans/${selectedLoan}/change`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ type: changeType, value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to apply change");
      }
      toast({ title: "Saved", description: "Loan change applied" });
      setValue("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderValueInput = () => {
    if (changeType === "repayment_start") {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="input-change-date"
        />
      );
    }
    if (changeType === "repayment_mode") {
      return (
        <Input
          placeholder="e.g. MPesa, Bank Transfer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="input-change-mode"
        />
      );
    }
    return (
      <Input
        type="number"
        placeholder="e.g. 1500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-testid="input-change-amount"
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Loan Changes</h1>
        <p className="text-muted-foreground text-sm">Update repayment amount, mode, or start date for a selected loan.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Apply Change</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loan</Label>
                <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan: any) => (
                      <SelectItem key={loan._id} value={loan._id}>
                        {(loan.loanNo || "").toUpperCase() || loan._id?.slice(-6)} — {loan.farmer?.firstName} {loan.farmer?.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type of Change</Label>
                <Select value={changeType} onValueChange={setChangeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repayment_amount">Repayment Amount</SelectItem>
                    <SelectItem value="repayment_mode">Repay Mode</SelectItem>
                    <SelectItem value="repayment_start">Repayment Start Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Value</Label>
              {renderValueInput()}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Apply Change"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

