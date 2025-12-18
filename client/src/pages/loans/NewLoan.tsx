import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { ChevronLeft, Plus, AlertCircle, Check } from "lucide-react";

interface Farmer {
  _id: string;
  memberNo: string;
  firstName: string;
  surname: string;
  phone: string;
  profileImage?: string;
  totalMilk?: number;
}

interface Product {
  _id: string;
  productId: string;
  productName: string;
  defaultInterestRate?: number;
  defaultTermMonths?: number;
  minLoanAmount?: number;
  maxLoanAmount?: number;
  loanCharges?: Array<{
    chargeCode: string;
    description: string;
    chargeType: "Fixed" | "Percentage";
    amount: number;
  }>;
}


export default function NewLoan() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [, setLocation] = useLocation();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [lookupTerm, setLookupTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  // loan type removed per request — use product mapping instead if needed
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [notes, setNotes] = useState("");
  const [repaymentStartDate, setRepaymentStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchFarmers();
    fetchProducts();
  }, []);

  // Auto-populate interest rate and term from product
  useEffect(() => {
    if (selectedProduct) {
      const prod = products.find((p) => p._id === selectedProduct);
      if (prod) {
        setInterestRate((prod.defaultInterestRate || 0).toString());
        setTermMonths((prod.defaultTermMonths || 12).toString());
      }
    }
  }, [selectedProduct, products]);

  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers");
      if (!response.ok) throw new Error("Failed to fetch farmers");
      const data = await response.json();
      setFarmers(data.farmers || []);
    } catch (err: any) {
      console.error("Error fetching farmers:", err);
      toast({
        title: "Error",
        description: "Failed to load farmers",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const creditProducts = (data.products || []).filter((p: any) => p.productType === "Credit");
      setProducts(creditProducts);
    } catch (err: any) {
      console.error("Error fetching products:", err);
    }
  };

  const filteredFarmers = lookupTerm
    ? farmers.filter(
      (f) =>
        f.memberNo.toLowerCase().includes(lookupTerm.toLowerCase()) ||
        `${f.firstName} ${f.surname}`.toLowerCase().includes(lookupTerm.toLowerCase()) ||
        f.phone.includes(lookupTerm)
    )
    : farmers;

  const handleSelectFarmer = (farmerId: string) => {
    setSelectedFarmer(farmerId);
    setLookupTerm("");
  };

  const selectedFarmerData = farmers.find((f) => f._id === selectedFarmer);
  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const { user } = useAuth();

  // Calculate charges
  const calculateCharges = () => {
    if (!selectedProductData || !loanAmount) return 0;

    let charges = 0;
    selectedProductData.loanCharges?.forEach((charge) => {
      if (charge.chargeType === "Fixed") {
        charges += charge.amount;
      } else if (charge.chargeType === "Percentage") {
        charges += (parseFloat(loanAmount) * charge.amount) / 100;
      }
    });
    return charges;
  };

  const charges = calculateCharges();
  const totalAmount = (parseFloat(loanAmount) || 0) + charges;
  const monthlyPayment = termMonths ? totalAmount / parseInt(termMonths) : 0;
  const netDisbursed = (parseFloat(loanAmount) || 0) - charges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarmer || !loanAmount) {
      toast({
        title: "Validation Error",
        description: "Please select a farmer and enter amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/loans", {
        method: "POST",
        headers,
        body: JSON.stringify({
          farmerId: selectedFarmer,
          productId: selectedProduct || undefined,
          amount: parseFloat(loanAmount),
          interestRate: parseFloat(interestRate) || 0,
          termMonths: parseInt(termMonths) || 12,
          repaymentStartDate,
          notes,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create loan");
      }

      toast({
        title: "Success",
        description: "Loan application submitted successfully",
      });

      // Reset form and redirect
      setSelectedFarmer("");
      setSelectedProduct("");
      setLoanAmount("");
      setInterestRate("");
      setTermMonths("");
      setNotes("");
      setRepaymentStartDate(new Date().toISOString().split('T')[0]);
      setLocation("/loans");
    } catch (err: any) {
      console.error("Error creating loan:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create loan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <ChevronLeft
          className="w-5 h-5 text-emerald-600 cursor-pointer hover:text-emerald-700"
          onClick={() => setLocation("/loans")}
        />
        <div>
          <h2 className="text-xs text-emerald-600 font-semibold uppercase">Loan Management</h2>
          <h1 className="text-xl font-bold text-slate-900">New Loan Application</h1>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm opacity-90">Loan Application</p>
              <p className="text-3xl font-semibold">Create New Loan</p>
            </div>
            <div className="text-sm text-emerald-50">
              <div>Captured By: <span className="font-semibold">{user?.username || "—"}</span></div>
              <div>Captured At: <span className="font-semibold">{new Date().toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Farmer selector */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Farmer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="farmer-lookup" className="font-medium text-slate-700">
                  Select Farmer <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="farmer-lookup"
                  type="text"
                  placeholder="Search member no, name, or phone..."
                  value={lookupTerm}
                  onChange={(e) => setLookupTerm(e.target.value)}
                  disabled={!!selectedFarmer}
                  className="mt-1"
                />
              </div>

              {lookupTerm && !selectedFarmer && filteredFarmers.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md shadow-sm max-h-48 overflow-y-auto">
                  {filteredFarmers.map((farmer) => (
                    <div
                      key={farmer._id}
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectFarmer(farmer._id)}
                    >
                      <div className="font-semibold text-slate-800">
                        {farmer.firstName} {farmer.surname}
                      </div>
                      <div className="text-xs text-slate-500">
                        {farmer.memberNo} • {farmer.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFarmerData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-emerald-900">
                      {selectedFarmerData.firstName} {selectedFarmerData.surname}
                    </div>
                    <div className="text-emerald-700">{selectedFarmerData.memberNo}</div>
                    {selectedFarmerData.totalMilk && (
                      <div className="text-emerald-700 font-medium">{selectedFarmerData.totalMilk}L collected</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFarmer("");
                      setLookupTerm("");
                    }}
                    className="text-emerald-700 hover:bg-emerald-100"
                  >
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan details */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Loan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Member No.</Label>
                  <Input readOnly value={selectedFarmerData?.memberNo || ""} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Member Name</Label>
                  <Input readOnly value={selectedFarmerData ? `${selectedFarmerData.firstName} ${selectedFarmerData.surname}` : ""} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Product</Label>
                  <select
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  >
                    <option value="">Select product...</option>
                    {products.map((prod) => (
                      <option key={prod._id} value={prod._id}>{prod.productName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Approved Amount</Label>
                  <Input
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="e.g. 100000"
                  />
                  <p className="text-xs text-slate-500">Amount approved for disbursement.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Amount To Disburse</Label>
                  <Input readOnly value={`KES ${netDisbursed.toLocaleString()}`} className="bg-slate-50 text-emerald-700 font-semibold" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Purpose</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Purpose of loan" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Rate %</Label>
                  <Input value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="e.g. 12" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Installments (months)</Label>
                  <Input value={termMonths} onChange={(e) => setTermMonths(e.target.value)} placeholder="e.g. 12" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Monthly Payment (est.)</Label>
                  <Input readOnly value={termMonths ? `KES ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""} className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Repayment Start Date</Label>
                  <Input id="repaymentStart" type="date" value={repaymentStartDate} onChange={(e) => setRepaymentStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Type of Disbursement</Label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" defaultValue="Full Disbursement">
                    <option>Full Disbursement</option>
                    <option>Partial</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Disbursement Date</Label>
                  <Input type="date" value={new Date().toISOString().split("T")[0]} readOnly className="bg-slate-50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Captured By</Label>
                  <Input readOnly value={user?.username || ""} className="bg-slate-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {selectedFarmerData && loanAmount ? (
              <Card className="shadow-sm border-slate-200 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500 text-xs">Borrower</p>
                      <p className="font-semibold text-slate-900">{selectedFarmerData.firstName} {selectedFarmerData.surname}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Captured By</p>
                      <p className="font-semibold text-slate-900">{user?.username || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Principal</p>
                      <p className="font-semibold">KES {parseFloat(loanAmount || "0").toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Charges</p>
                      <p className="font-semibold text-emerald-700">KES {charges.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Amount To Disburse</p>
                      <p className="font-semibold text-emerald-700">KES {netDisbursed.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Repayment Start</p>
                      <p className="font-semibold">{repaymentStartDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
                      <p className="text-xs text-emerald-700">Net Loan Take Home</p>
                      <p className="text-2xl font-bold text-emerald-700">KES {netDisbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                      <p className="text-xs text-slate-600">Total To Repay (Principal + Charges)</p>
                      <p className="text-xl font-semibold text-slate-900">KES {totalAmount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p>
                      {termMonths && (
                        <p className="text-xs text-slate-600 mt-1">
                          Monthly: KES {monthlyPayment.toLocaleString("en-KE", { maximumFractionDigits: 0 })} for {parseInt(termMonths) || 12} mo
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedProductData?.loanCharges && selectedProductData.loanCharges.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Charges</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                        {selectedProductData.loanCharges.map((charge, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{charge.description}</span>
                            <span className="font-medium">
                              {charge.chargeType === "Fixed" ? `KES ${charge.amount.toFixed(0)}` : `${charge.amount}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-amber-200 bg-amber-50 shadow-none">
                <CardContent className="p-3 flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Select a farmer and enter amount</p>
                    <p className="text-xs text-amber-700">Summary will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/loans")}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFarmer || !loanAmount || loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {loading ? "Creating..." : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Create Loan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
