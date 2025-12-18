import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Farmer {
  _id: string;
  memberNo: string;
  firstName: string;
  middleName?: string;
  surname: string;
  phone: string;
  email?: string;
  idNumber?: string;
  idType?: string;
  city?: string;
  county?: string;
  address?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  kraPIN?: string;
  memberCategory?: string;
  status?: string;
  registeredAt?: string;
  photoPath?: string;
  signaturePath?: string;
}

export default function FarmerProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    accountsCount: 0,
    totalBalance: 0,
  });
  const [monthlyMilk, setMonthlyMilk] = useState({ quantity: 0, amount: 0 });
  const [loansList, setLoansList] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/farmers\/profile\/([^/]+)$/);
    if (match) {
      fetchFarmer(match[1]);
      fetchFarmerStats(match[1]);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFarmer = async (id: string) => {
    try {
      const response = await fetch(`/api/farmers/${id}`);
      const ct = response.headers.get("content-type") || "";
      let data: any = null;
      if (ct.includes("text/html") || !response.ok) {
        const directRes = await fetch(`http://localhost:5000/api/farmers/${encodeURIComponent(id)}`);
        if (!directRes.ok) throw new Error("Failed to fetch farmer from backend");
        data = await directRes.json();
      } else {
        data = await response.json();
      }
      const f = data?.farmer || data;
      setFarmer(f);
    } catch (err: any) {
      console.error("Error fetching farmer:", err);
      toast({ title: "Error", description: "Failed to load farmer", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const fetchFarmerStats = async (farmerId: string) => {
    try {
      const accountsRes = await fetch(`/api/accounts?farmerId=${farmerId}`);
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        const accounts = data.accounts || [];
        setAccountsList(accounts);
        const balance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
        setStats({
          accountsCount: accounts.length,
          totalBalance: balance,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }

    try {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const milkRes = await fetch(`/api/milk?farmerId=${farmerId}&period=${period}`);
      if (milkRes.ok) {
        const m = await milkRes.json();
        setMonthlyMilk({ quantity: m.totalQuantity || 0, amount: m.totalAmount || 0 });
      }
    } catch (err) {
      console.error("Error fetching monthly milk:", err);
    }

    try {
      const loansRes = await fetch(`/api/loans?farmerId=${farmerId}`);
      if (loansRes.ok) {
        const data = await loansRes.json();
        setLoansList(data.loans || []);
      }
    } catch (err) {
      console.error("Error fetching loans:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading farmer profile...</div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Farmer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ChevronLeft
          className="w-5 h-5 text-gray-600 cursor-pointer"
          onClick={() => setLocation("/farmers/list")}
        />
        <div>
          <h2 className="text-sm text-gray-600">Member Profile</h2>
          <h1 className="text-lg font-semibold">
            {farmer.memberNo} · {farmer.firstName} {farmer.surname}
          </h1>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT PANEL — MEMBER DETAILS */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 pb-3">
              <CardTitle className="text-lg">Member Details</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="report" className="w-full">

                {/* TAB HEADER */}
                <TabsList className="flex overflow-x-auto justify-start rounded-none border-b bg-gray-50 p-0 h-auto w-full">
                  <TabsTrigger value="report">Report</TabsTrigger>
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  <TabsTrigger value="details">Next of Kin</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* REPORT TAB */}
                <TabsContent value="report" className="p-6 mt-0">
                  <div className="grid grid-cols-2 gap-6">

                    {/* BASIC INFO */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-3">Basic Information</h4>
                      <div style={{ borderBottom: '1px dotted #e5e7eb' }} className="pb-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">Member No.</Label>
                            <Input readOnly value={farmer.memberNo} className="bg-gray-50 text-sm" />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Full Name</Label>
                            <Input readOnly value={`${farmer.firstName} ${farmer.middleName || ''} ${farmer.surname}`.trim()} className="bg-gray-50 text-sm" />
                          </div>
                        </div>
                      </div>

                      <div style={{ borderBottom: '1px dotted #e5e7eb' }} className="pb-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {((farmer as any).capturedBy) && (
                            <div>
                              <Label className="text-xs text-gray-500">Captured By</Label>
                              <Input readOnly value={(farmer as any).capturedBy?.username || String((farmer as any).capturedBy)} className="bg-gray-50 text-sm" />
                              {(farmer as any).capturedAt && (
                                <div className="text-xs text-gray-400 mt-1">{new Date((farmer as any).capturedAt).toLocaleString()}</div>
                              )}
                            </div>
                          )}

                          <div>
                            <Label className="text-xs text-gray-500">Gender</Label>
                            <Input readOnly value={farmer.gender || "N/A"} className="bg-gray-50 text-sm" />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Marital Status</Label>
                            <Input readOnly value={farmer.maritalStatus || "N/A"} className="bg-gray-50 text-sm" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-3">Identification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-500">ID Type</Label>
                            <Input readOnly value={farmer.idType || "National ID"} className="bg-gray-50 text-sm" />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">ID Number</Label>
                            <Input readOnly value={farmer.idNumber} className="bg-gray-50 text-sm" />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">KRA PIN</Label>
                            <Input readOnly value={farmer.kraPIN || "N/A"} className="bg-gray-50 text-sm" />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">Date of Birth</Label>
                            <Input readOnly value={farmer.dob || "N/A"} className="bg-gray-50 text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONTACT */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-3">Contact & Location</h4>
                      <div style={{ borderBottom: '1px dotted #e5e7eb' }} className="pb-3 mb-3">
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Mobile Phone</p>
                            <p className="font-medium">{farmer.phone}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-blue-600">{farmer.email || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">County</p>
                            <p className="font-medium">{farmer.county || "N/A"}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">City</p>
                            <p className="font-medium">{farmer.city || "N/A"}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-medium text-xs">{farmer.address || "N/A"}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="font-medium">{farmer.memberCategory || "Member"}</p>
                          </div>
                        </div>

                        {/* PICTURES */}
                        <div className="col-span-2 mt-4">
                          <h4 className="text-xs font-semibold text-gray-600 mb-3">Info Base</h4>
                          <div className="flex gap-6 items-start">

                            {/* PHOTO */}
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">Picture</p>
                              {farmer.photoPath ? (
                                <img
                                  src={
                                    farmer.photoPath.startsWith("http")
                                      ? farmer.photoPath
                                      : `http://localhost:5000${farmer.photoPath}`
                                  }
                                  alt="Member photo"
                                  className="w-36 h-36 object-cover rounded"
                                />
                              ) : (
                                <div className="w-36 h-36 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  No Photo
                                </div>
                              )}
                            </div>

                            {/* SIGNATURE */}
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">Signature</p>
                              {farmer.signaturePath ? (
                                <img
                                  src={
                                    farmer.signaturePath.startsWith("http")
                                      ? farmer.signaturePath
                                      : `http://localhost:5000${farmer.signaturePath}`
                                  }
                                  alt="Member signature"
                                  className="w-56 h-24 object-contain rounded border"
                                />
                              ) : (
                                <div className="w-56 h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  No Signature
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </TabsContent>

                {/* ACCOUNT TAB */}
                <TabsContent value="accounts" className="p-6 mt-0">
                  {accountsList.length > 0 ? (
                    <div className="space-y-4">
                      {accountsList.map((account: any) => (
                        <div key={account._id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Account Number</p>
                              <p className="font-medium">{account.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Account Name</p>
                              <p className="font-medium text-sm">{account.accountName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Type</p>
                              <p className="font-medium">{account.type || "Savings"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <Badge className={account.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {account.status || "Active"}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Current Balance</p>
                              <p className="font-bold text-green-600">KES {(account.balance || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Monthly Contribution</p>
                              <p className="font-medium">KES {(account.monthlyContribution || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Currency</p>
                              <p className="font-medium">{account.currency || "KES"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Transaction</p>
                              <p className="text-xs text-gray-600">{account.lastTransaction ? new Date(account.lastTransaction).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No accounts found for this member.</p>
                    </div>
                  )}
                </TabsContent>

                {/* DETAILS TAB - NEXT OF KIN */}
                <TabsContent value="details" className="p-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-4">Next of Kin Information</h4>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-gray-500">Next of Kin Name</Label>
                          <Input
                            readOnly
                            value={(farmer as any).nokName || "N/A"}
                            className="bg-gray-50 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Relationship</Label>
                          <Input
                            readOnly
                            value={(farmer as any).nokRelationship || "N/A"}
                            className="bg-gray-50 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Phone Number</Label>
                          <Input
                            readOnly
                            value={(farmer as any).nokPhone || "N/A"}
                            className="bg-gray-50 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Email Address</Label>
                          <Input
                            readOnly
                            value={(farmer as any).nokEmail || "N/A"}
                            className="bg-gray-50 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary on the right */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">NOK Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-blue-700">Full NOK Name</p>
                          <p className="font-medium text-blue-900">{(farmer as any).nokName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Relation to Member</p>
                          <p className="font-medium text-blue-900">{(farmer as any).nokRelationship || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Contact Phone</p>
                          <p className="font-medium text-blue-900">{(farmer as any).nokPhone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Contact Email</p>
                          <p className="font-medium text-blue-900 break-all">{(farmer as any).nokEmail || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="p-6 mt-0">
                  <div className="text-center text-gray-500 py-8">
                    <p>Member activity history coming soon...</p>
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">

          {/* LOANS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Loans Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Loan Product Type</span>
                <span className="font-medium">{loansList[0]?.productName || "—"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Approved Amount</span>
                <span className="font-medium">
                  KES{" "}
                  {loansList
                    .reduce((s, l) => s + (l.amount || 0), 0)
                    .toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Outstanding Principal</span>
                <span className="font-medium">
                  KES{" "}
                  {loansList
                    .reduce(
                      (s, l) => s + Math.max(0, (l.amount || 0) - (l.repaidAmount || 0)),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Outstanding Interest</span>
                <span className="font-medium">
                  KES{" "}
                  {loansList
                    .reduce((s, l) => s + (l.outstandingInterest || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SAVINGS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Savings Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-2">
              {stats.accountsCount > 0 ? (
                <>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Accounts</span>
                    <span>{stats.accountsCount}</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total Balance</span>
                    <span className="font-medium">
                      KES {stats.totalBalance.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-500">No accounts</div>
              )}
            </CardContent>
          </Card>

          {/* EXTRA INFO */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Member Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm">
              <div className="text-xs text-gray-600">Member No</div>
              <div className="font-medium mb-2">{farmer.memberNo}</div>

              <div className="text-xs text-gray-600">Captured At</div>
              <div className="font-medium">
                {(farmer as any).capturedAt
                  ? new Date((farmer as any).capturedAt).toLocaleString()
                  : "—"}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
