import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import socket from "@/lib/socket";
import { ChevronLeft, Plus, Search, Edit, Trash2 } from "lucide-react";

interface Product {
  _id: string;
  productId: string;
  productName: string;
  productType: "Savings" | "Credit";
  expectedContribution?: number;
  minimumContribution?: number;
  productPostingGroup?: string;
  createdAt: string;
}

export default function ProductList() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Savings" | "Credit">("all");
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();

    // Subscribe to socket updates
    const handleProductsUpdate = (data: any) => {
      toast({
        title: "Products Updated",
        description: `Product ${data.product?.productName || "unknown"} was updated.`,
      });
      fetchProducts();
    };

    socket.on("products:update", handleProductsUpdate);
    return () => {
      socket.off("products:update", handleProductsUpdate);
    };
  }, []);

  // Filter products when search or filter changes
  useEffect(() => {
    let filtered = products;

    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.productType === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.productId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, filterType, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleOpenProduct = (productId: string) => {
    setLocation(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ChevronLeft className="w-5 h-5 text-gray-600 cursor-pointer" onClick={() => setLocation("/")} />
        <div>
          <h2 className="text-sm text-gray-600">Product Management</h2>
          <h1 className="text-lg font-semibold">Products & Services Setup</h1>
        </div>
      </div>

      <div className="p-6">
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Products</CardTitle>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
                onClick={() => setLocation("/products/new")}
              >
                <Plus className="w-4 h-4" />
                New Product
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search and Filter */}
            <div className="mb-6 flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Savings">Savings Products</option>
                  <option value="Credit">Credit Products</option>
                </select>
              </div>
            </div>

            {/* Products Table/Grid */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Product ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Product Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Min. Contribution</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Expected Contribution</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOpenProduct(product._id)}
                      >
                        <td className="px-4 py-3 text-gray-800 font-medium">{product.productId}</td>
                        <td className="px-4 py-3 text-gray-800">{product.productName}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              product.productType === "Savings"
                                ? "bg-blue-500 text-white"
                                : "bg-orange-500 text-white"
                            }
                          >
                            {product.productType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {product.minimumContribution ? `KES ${product.minimumContribution.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {product.expectedContribution ? `KES ${product.expectedContribution.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-center flex gap-2 justify-center">
                          <button
                            className="p-2 hover:bg-blue-100 rounded text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/products/${product._id}`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-red-100 rounded text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
