import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import socket from "@/lib/socket";
import { ChevronLeft, Save, X, AlertCircle } from "lucide-react";

interface Product {
  _id?: string;
  productId: string;
  productName: string;
  productType: "Savings" | "Credit";
  expectedContribution?: number;
  monthlyContribution?: number;
  minimumContribution?: number;
  mandatoryContribution?: boolean;
  productPostingGroup?: string;
  autoOpenAccount?: boolean;
  settings?: any;
}

const defaultProduct: Product = {
  productId: "",
  productName: "",
  productType: "Savings",
  expectedContribution: 0,
  monthlyContribution: 0,
  minimumContribution: 0,
  productPostingGroup: "",
  mandatoryContribution: false,
  autoOpenAccount: false,
  settings: {},
};

export default function ProductCard() {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<string>("");
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loanAmount, setLoanAmount] = useState("");

  // Get productId from URL if editing
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/products\/([^/]+)$/);
    if (match && match[1] !== "new") {
      setProductId(match[1]);
      setIsNew(false);
      fetchProduct(match[1]);
    }
  }, []);

  // Fetch farmers for account creation/loan application
  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setProduct(data.product || defaultProduct);
    } catch (err: any) {
      console.error("Error fetching product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers");
      if (!response.ok) throw new Error("Failed to fetch farmers");
      const data = await response.json();
      setFarmers(data.farmers || []);
    } catch (err: any) {
      console.error("Error fetching farmers:", err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!product.productId || !product.productName) {
        toast({
          title: "Validation Error",
          description: "Please fill in Product ID and Product Name",
          variant: "destructive",
        });
        return;
      }

      if (user?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "Only administrators can create or modify products.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const url = isNew ? "/api/products" : `/api/products/${productId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        // Handle non-JSON responses (e.g., HTML error pages)
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to save product";

        if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action. Admin access required.";
        } else if (response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (contentType && contentType.includes("application/json")) {
          try {
            const err = await response.json();
            errorMessage = err.error || err.message || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        } else {
          errorMessage = `Server error (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: isNew ? "Product created successfully" : "Product updated successfully",
      });

      if (isNew) {
        setLocation("/products");
      } else {
        fetchProduct(productId!);
      }
    } catch (err: any) {
      console.error("Error saving product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedFarmer) {
      toast({
        title: "Validation Error",
        description: "Please select a farmer",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/products/${productId}/create-account`, {
        method: "POST",
        headers,
        body: JSON.stringify({ farmerId: selectedFarmer }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create account");
      }

      toast({
        title: "Success",
        description: "Account created successfully from product",
      });

      setSelectedFarmer("");
    } catch (err: any) {
      console.error("Error creating account:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLoan = async () => {
    if (!selectedFarmer || !loanAmount) {
      toast({
        title: "Validation Error",
        description: "Please select a farmer and enter loan amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // If productId exists, use product-specific endpoint; otherwise use direct loan endpoint
      const url = productId
        ? `/api/products/${productId}/apply-loan`
        : `/api/loans`;

      const payload = {
        farmerId: selectedFarmer,
        amount: parseFloat(loanAmount),
        ...(productId ? {} : { interestRate: 0, termMonths: 12 })
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create loan");
      }

      toast({
        title: "Success",
        description: "Loan created successfully",
      });

      setSelectedFarmer("");
      setLoanAmount("");
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

  if (loading && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ChevronLeft
          className="w-5 h-5 text-gray-600 cursor-pointer"
          onClick={() => setLocation("/products")}
        />
        <div>
          <h2 className="text-sm text-gray-600">Product Setup</h2>
          <h1 className="text-lg font-semibold">
            {isNew ? "New Product" : product.productName}
          </h1>
        </div>
      </div>

      <div className="p-6">
        {/* Admin Access Check */}
        {user?.role !== "admin" && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Admin Access Required</p>
                <p className="text-sm text-red-700">You must be logged in as an administrator to create or edit products.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>
                <Badge
                  className={
                    product.productType === "Savings"
                      ? "bg-blue-500 text-white"
                      : "bg-orange-500 text-white"
                  }
                >
                  {product.productType}
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/products")}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={loading || user?.role !== "admin"}
                  title={user?.role !== "admin" ? "Admin access required" : ""}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? "Create Product" : "Update Product"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Basic Info Section */}
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Product ID</Label>
                <Input
                  value={product.productId}
                  onChange={(e) => handleInputChange("productId", e.target.value)}
                  placeholder="e.g., SAV001"
                  readOnly={!isNew}
                  className={!isNew ? "bg-gray-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Product Name</Label>
                <Input
                  value={product.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  placeholder="e.g., Standard Savings Account"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Product Type</Label>
                <select
                  value={product.productType}
                  onChange={(e) => handleInputChange("productType", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Savings">Savings</option>
                  <option value="Credit">Credit/Loan</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Product Posting Group</Label>
                <Input
                  value={product.productPostingGroup || ""}
                  onChange={(e) => handleInputChange("productPostingGroup", e.target.value)}
                  placeholder="e.g., DOMESTIC"
                />
              </div>

              {/* Conditional fields based on product type */}
              {product.productType === "Savings" && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Savings Setup</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Minimum Contribution (KES)</Label>
                    <Input
                      type="number"
                      value={product.minimumContribution || ""}
                      onChange={(e) =>
                        handleInputChange("minimumContribution", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Expected Contribution (KES)</Label>
                    <Input
                      type="number"
                      value={product.expectedContribution || ""}
                      onChange={(e) =>
                        handleInputChange("expectedContribution", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Monthly Contribution (KES)</Label>
                    <Input
                      type="number"
                      value={product.monthlyContribution || ""}
                      onChange={(e) => handleInputChange("monthlyContribution", parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={product.autoOpenAccount || false}
                        onChange={(e) => handleInputChange("autoOpenAccount", e.target.checked)}
                      />
                      <span className="text-sm text-gray-600">Auto-open account when member is registered</span>
                    </label>
                  </div>
                </>
              )}

              {product.productType === "Credit" && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Loan Setup</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Interest Rate (%)</Label>
                    <Input
                      type="number"
                      value={product.settings?.interestRate || ""}
                      onChange={(e) =>
                        handleInputChange("settings", {
                          ...product.settings,
                          interestRate: parseFloat(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Default Term (Months)</Label>
                    <Input
                      type="number"
                      value={product.settings?.termMonths || ""}
                      onChange={(e) =>
                        handleInputChange("settings", {
                          ...product.settings,
                          termMonths: parseInt(e.target.value),
                        })
                      }
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Minimum Loan Amount (KES)</Label>
                    <Input
                      type="number"
                      value={product.minimumContribution || ""}
                      onChange={(e) =>
                        handleInputChange("minimumContribution", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Maximum Loan Amount (KES)</Label>
                    <Input
                      type="number"
                      value={product.expectedContribution || ""}
                      onChange={(e) =>
                        handleInputChange("expectedContribution", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  {/* Loan Charges Section */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Loan Charges</h3>
                    <p className="text-xs text-gray-500 mb-3">Define charges that apply when members take loans on this product</p>
                  </div>

                  {product.loanCharges && product.loanCharges.length > 0 && (
                    <div className="col-span-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Charge Code</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Amount</th>
                            <th className="px-3 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.loanCharges.map((charge, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2">{charge.chargeCode}</td>
                              <td className="px-3 py-2">{charge.description}</td>
                              <td className="px-3 py-2">{charge.chargeType}</td>
                              <td className="px-3 py-2">
                                {charge.chargeType === "Fixed" ? `KES ${charge.amount}` : `${charge.amount}%`}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  onClick={() => {
                                    const updated = product.loanCharges.filter((_, i) => i !== idx);
                                    handleInputChange("loanCharges", updated);
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="col-span-2 bg-green-50 p-3 rounded-md border border-green-200 mt-3">
                    <p className="text-xs text-gray-600 mb-3 font-semibold">Add New Charge</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <Input
                        type="text"
                        placeholder="Charge Code (e.g., PROC)"
                        className="text-xs"
                        id="chargeCode"
                      />
                      <Input
                        type="text"
                        placeholder="Description (e.g., Processing Fee)"
                        className="text-xs col-span-2"
                        id="chargeDesc"
                      />
                      <select className="px-2 py-1 border rounded text-xs" id="chargeType">
                        <option value="Fixed">Fixed</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Amount"
                        className="text-xs"
                        step="0.01"
                        id="chargeAmount"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const code = (document.getElementById("chargeCode") as HTMLInputElement)?.value;
                          const desc = (document.getElementById("chargeDesc") as HTMLInputElement)?.value;
                          const type = (document.getElementById("chargeType") as HTMLSelectElement)?.value;
                          const amount = parseFloat((document.getElementById("chargeAmount") as HTMLInputElement)?.value || "0");

                          if (!code || !desc) {
                            toast({
                              title: "Validation Error",
                              description: "Please fill in charge code and description",
                              variant: "destructive",
                            });
                            return;
                          }

                          const newCharges = [...(product.loanCharges || []), { chargeCode: code, description: desc, chargeType: type, amount }];
                          handleInputChange("loanCharges", newCharges);

                          // Clear inputs
                          (document.getElementById("chargeCode") as HTMLInputElement).value = "";
                          (document.getElementById("chargeDesc") as HTMLInputElement).value = "";
                          (document.getElementById("chargeAmount") as HTMLInputElement).value = "";
                        }}
                      >
                        Add Charge
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action section for existing products */}
            {!isNew && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs text-gray-600">Select Farmer</Label>
                      <select
                        value={selectedFarmer}
                        onChange={(e) => setSelectedFarmer(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Choose a farmer...</option>
                        {farmers.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.firstName} {f.surname} ({f.memberNo})
                          </option>
                        ))}
                      </select>
                    </div>

                    {product.productType === "Savings" && (
                      <div className="flex items-end">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                          onClick={handleCreateAccount}
                          disabled={!selectedFarmer || loading}
                        >
                          Create Account
                        </Button>
                      </div>
                    )}

                    {product.productType === "Credit" && (
                      <>
                        <div className="space-y-3">
                          <Label className="text-xs text-gray-600">Loan Amount (KES)</Label>
                          <Input
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={handleApplyLoan}
                            disabled={!selectedFarmer || !loanAmount || loading}
                          >
                            Apply Loan
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
