import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFarmers } from "@/context/FarmersContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Edit2, Share2, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

// Helper: Calculate age from DOB (YYYY-MM-DD format)
const calculateAgeFromDOB = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

// Helper: Format DOB from YYYY-MM-DD to MM/DD/YYYY
const formatDOBDisplay = (dob: string): string => {
  if (!dob || dob.length !== 10) return "";
  const [year, month, day] = dob.split("-");
  return `${month}/${day}/${year}`;
};

// Helper: Parse DOB from MM/DD/YYYY to YYYY-MM-DD
const parseDOBInput = (input: string): string => {
  // Remove non-digit characters and normalize
  const digits = input.replace(/\D/g, "");
  if (digits.length < 8) return "";

  let month = digits.substring(0, 2);
  let day = digits.substring(2, 4);
  let year = digits.substring(4, 8);

  // Validate month
  const monthNum = parseInt(month);
  if (monthNum < 1 || monthNum > 12) return "";

  // Validate day
  const dayNum = parseInt(day);
  if (dayNum < 1 || dayNum > 31) return "";

  // Validate year (reasonable range: 1900-2025)
  const yearNum = parseInt(year);
  if (yearNum < 1900 || yearNum > 2025) return "";

  // Pad with zeros
  month = month.padStart(2, "0");
  day = day.padStart(2, "0");

  // Return in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
};

// Helper: Calculate DOB from age (approximate: sets to Jan 1 of calculated year)
const calculateDOBFromAge = (age: number): string => {
  if (age <= 0) return "";
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return `${birthYear}-01-01`;
};

const defaultFormData = {
  memberNo: "",
  firstName: "",
  middleName: "",
  surname: "",
  salutationCode: "MR",
  applicationDate: new Date().toISOString().split('T')[0],
  idType: "National ID",
  idNumber: "",
  age: "",
  kraPIN: "",
  Route: " ",
  gender: "Male",
  maritalStatus: "Single",
  memberCategory: "Member",
  capturedBy: "",
  status: "Open",
  locality: "Local",
  postCode: "",
  poBox: "",
  physicalAddress: "",
  city: "",
  countryCode: "KE",
  phoneCode: "+254",
  mobilePhone: "",
  alternativePhone: "",
  personalEmail: "",
  workEmail: "",
  county: "",
  residential: "",
  dob: "",
  nokName: "",
  nokRelationship: "",
  nokPhone: "",
  nokEmail: "",
};

export default function FullRegistration() {
  const { toast } = useToast();
  const { addFarmer, refetchFarmers } = useFarmers();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("report");
  const [formData, setFormData] = useState(defaultFormData);
  const [displayDob, setDisplayDob] = useState("");
  const [dobError, setDobError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [defaultProducts, setDefaultProducts] = useState<any[]>([]);
  const [selectedDefaultAccounts, setSelectedDefaultAccounts] = useState<Record<string, { create: boolean; monthlyContribution: number; openingBalance: number }>>({});

  // Fetch products that auto-open accounts so we can show them under Default Accounts tab
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        const auto = (data.products || []).filter((p: any) => p.autoOpenAccount);
        if (!mounted) return;
        setDefaultProducts(auto);
        const map: Record<string, { create: boolean; monthlyContribution: number; openingBalance: number }> = {};
        auto.forEach((p: any) => (map[p.productId] = { create: true, monthlyContribution: p.monthlyContribution ?? p.expectedContribution ?? 0, openingBalance: 0 }));
        setSelectedDefaultAccounts(map);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    // DOB handling uses a separate display state so users can type freely
    if (field === "dob" && typeof value === "string") {
      setDisplayDob(value);
      if (!value) {
        setDobError("");
        setFormData(prev => ({ ...prev, dob: "", age: "" }));
        return;
      }

      const parsedDOB = parseDOBInput(value);
      if (parsedDOB) {
        const calculatedAge = calculateAgeFromDOB(parsedDOB);
        setDobError("");
        setFormData(prev => ({ ...prev, dob: parsedDOB, age: calculatedAge.toString() }));
      } else {
        setDobError("Invalid date. Use MM/DD/YYYY");
        // don't overwrite stored dob when user is typing invalid input
      }
      return;
    }

    if (field === "age" && typeof value === "string") {
      const age = parseInt(value) || 0;
      if (age > 0 && age < 150) {
        const calculatedDOB = calculateDOBFromAge(age);
        setDobError("");
        setDisplayDob(formatDOBDisplay(calculatedDOB));
        setFormData(prev => ({ ...prev, age: value, dob: calculatedDOB }));
      } else {
        setFormData(prev => ({ ...prev, age: value }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName.trim() || !formData.surname.trim() || !formData.mobilePhone.trim() || !formData.idNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Surname, Phone, ID Number)",
        variant: "destructive",
      });
      return;
    }

    // DOB validation
    if (dobError) {
      toast({
        title: "Invalid Date of Birth",
        description: dobError,
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to MongoDB via Vite proxy at /api/farmers (multipart for files)
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("middleName", formData.middleName);
      form.append("surname", formData.surname);
      form.append("phone", formData.mobilePhone);
      form.append("email", formData.personalEmail || "");
      form.append("idNumber", formData.idNumber);
      form.append("city", formData.city || "");
      form.append("county", formData.county || "");
      form.append("address", formData.physicalAddress || "");
      form.append("dob", formData.dob || "");
      form.append("gender", formData.gender || "");
      form.append("maritalStatus", formData.maritalStatus || "");
      form.append("kraPIN", formData.kraPIN || "");
      form.append("memberCategory", formData.memberCategory || "Member");
      form.append("status", "active");
      // NOK
      form.append("nokName", formData.nokName || "");
      form.append("nokRelationship", formData.nokRelationship || "");
      form.append("nokPhone", formData.nokPhone || "");
      form.append("nokEmail", formData.nokEmail || "");
      // files
      if (photoFile) form.append("photo", photoFile);
      if (signatureFile) form.append("signature", signatureFile);

      // Selected default accounts to create (productId array)
      try {
        const selected = Object.keys(selectedDefaultAccounts).filter((k) => selectedDefaultAccounts[k]?.create);
        form.append("createAccountsFor", JSON.stringify(selected));
        const data: Record<string, any> = {};
        selected.forEach((pid) => {
          const v = selectedDefaultAccounts[pid];
          if (v) data[pid] = { monthlyContribution: v.monthlyContribution || 0, openingBalance: v.openingBalance || 0 };
        });
        form.append("createAccountsData", JSON.stringify(data));
      } catch (e) {
        // ignore
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      console.log("Sending registration request with headers:", headers);
      console.log("FormData keys:", Array.from(form.keys()));

      const response = await fetch("/api/farmers", {
        method: "POST",
        headers,
        body: form,
      });

      console.log("Response status:", response.status, "ok:", response.ok);

      if (!response.ok) {
        let errMsg = `Server returned ${response.status}`;
        try {
          const errorBody = await response.json();
          errMsg = errorBody.error || errorBody.message || errMsg;
        } catch (_e) {
          // response had no JSON body
        }
        throw new Error(errMsg);
      }


      const body = await response.json().catch(() => null);

      // If server returned the created farmer, use its id for navigation
      const createdFarmer = body?.farmer || null;

      // Add to local context (include backend id if available)
      addFarmer({
        // include backend id when available; normalize both `_id` and `id` fields
        _id: createdFarmer?._id,
        id: createdFarmer?._id || (createdFarmer as any)?._id,
        memberNo: createdFarmer?.memberNo || "",
        firstName: formData.firstName,
        middleName: formData.middleName,
        surname: formData.surname,
        phone: formData.mobilePhone,
        email: formData.personalEmail,
        idNumber: formData.idNumber,
        city: formData.city || "N/A",
        status: "active",
      });

      // Refetch farmers from server to ensure list is fresh
      await refetchFarmers();

      toast({
        title: "Success!",
        description: `Member ${formData.firstName} ${formData.surname} has been registered successfully.`,
      });

      // Clear form
      setFormData(defaultFormData);
      setActiveTab("report");

      // If we have the created farmer's id from the server, navigate to the profile card.
      if (createdFarmer?._id) {
        setTimeout(() => setLocation(`/farmers/profile/${createdFarmer._id}`), 700);
      } else {
        // Fallback: go to farmers list
        setTimeout(() => setLocation("/farmers/list"), 700);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ChevronLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
        <div>
          <h2 className="text-sm text-gray-600">Member Registration Card</h2>
          <h1 className="text-lg font-semibold">
            {formData.memberNo} · {formData.firstName} {formData.middleName} {formData.surname}
          </h1>
        </div>
      </div>

      {/* Action buttons removed as requested */}

      <div className="p-6">
        <Card className="w-full">
          {/* Ribbon Header */}
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {formData.firstName.charAt(0)}{formData.surname.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formData.firstName} {formData.middleName} {formData.surname}
                  </h3>
                  <p className="text-sm text-gray-600">{formData.memberNo}</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">ACTIVE</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="report" className="w-full">
              {/* Tab Navigation */}
              <TabsList className="flex overflow-x-auto justify-start rounded-none border-b bg-gray-50 p-0 h-auto w-full">
                <TabsTrigger value="report" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                  Report
                </TabsTrigger>
                <TabsTrigger value="signatures" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                  Account Signatories & NOK
                </TabsTrigger>
                <TabsTrigger value="picture" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                  Picture & Signature
                </TabsTrigger>
                <TabsTrigger value="accounts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                  Default Accounts
                </TabsTrigger>
                <TabsTrigger value="approval" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white">
                  Approval Requests
                </TabsTrigger>

              </TabsList>

              {/* Report Tab Content */}
              <TabsContent value="report" className="p-6 space-y-6 mt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* GENERAL SECTION */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">General</h3>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">No.</Label>
                        <Input value={formData.memberNo} readOnly className="bg-gray-50" />
                      </div>
                      <div className="col-span-3 space-y-2">
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">First Name</Label>
                        <Input value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Middle Name</Label>
                        <Input value={formData.middleName} onChange={(e) => handleInputChange("middleName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Surname</Label>
                        <Input value={formData.surname} onChange={(e) => handleInputChange("surname", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Date of Birth</Label>
                        <Input
                          placeholder="MM/DD/YYYY"
                          value={displayDob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          maxLength={10}
                          className={`font-mono ${dobError ? "border-red-500 focus:ring-red-200" : ""}`}
                        />
                        {dobError ? (
                          <p className="text-xs text-red-600">{dobError}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Format: MM/DD/YYYY</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Age</Label>
                        <Input
                          type="number"
                          placeholder="Auto-calculated"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          min="0"
                          max="150"
                        />
                        <p className="text-xs text-gray-500">Auto-fills from DOB</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">KRA PIN</Label>
                        <Input value={formData.kraPIN} onChange={(e) => handleInputChange("kraPIN", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Marital Status</Label>
                        <Select value={formData.maritalStatus} onValueChange={(value) => handleSelectChange("maritalStatus", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">ID Type</Label>
                        <Select value={formData.idType} onValueChange={(value) => handleSelectChange("idType", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="National ID">National ID</SelectItem>
                            <SelectItem value="National ID">Passport No.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">ID No./Passport No</Label>
                        <Input value={formData.idNumber} onChange={(e) => handleInputChange("idNumber", e.target.value)} />
                      </div>
                    </div>

                    {/* Employment Section on Same Row */}


                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Member Category</Label>
                        <Select value={formData.memberCategory} onValueChange={(value) => handleSelectChange("memberCategory", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Farmer</SelectItem>
                            <SelectItem value="Farmer">Porter</SelectItem>
                            <SelectItem value="Farmer">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Captured By</Label>
                        <Input value={formData.capturedBy} onChange={(e) => handleInputChange("capturedBy", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Active</SelectItem>
                            <SelectItem value="Closed">Dormant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Route</Label>
                        <Select value={formData.Route} onValueChange={(value) => handleSelectChange("costCenter", value)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Other">Route 1</SelectItem>
                            <SelectItem value="Main">Route 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2"></div>
                    </div>
                  </div>

                  {/* COMMUNICATION SECTION */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Communication</h3>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-4">Address</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Post Code</Label>
                            <Input value={formData.postCode} onChange={(e) => handleInputChange("postCode", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">P.O. Box</Label>
                            <Input value={formData.poBox} onChange={(e) => handleInputChange("poBox", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Physical Address</Label>
                            <Input value={formData.physicalAddress} onChange={(e) => handleInputChange("physicalAddress", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">City</Label>
                            <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Country/Region Code</Label>
                            <Input value={formData.countryCode} onChange={(e) => handleInputChange("countryCode", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Phone Code</Label>
                            <Input value={formData.phoneCode} onChange={(e) => handleInputChange("phoneCode", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">County</Label>
                            <Input value={formData.county} onChange={(e) => handleInputChange("county", e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-4">Personal / Contact</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Residential</Label>
                            <Input value={formData.residential} onChange={(e) => handleInputChange("residential", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Mobile Phone No.</Label>
                            <Input value={formData.mobilePhone} onChange={(e) => handleInputChange("mobilePhone", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Alternative Phone No.</Label>
                            <Input value={formData.alternativePhone} onChange={(e) => handleInputChange("alternativePhone", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Personal Email</Label>
                            <Input type="email" value={formData.personalEmail} onChange={(e) => handleInputChange("personalEmail", e.target.value)} />
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-6 border-t">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600">
                      Save Member Registration
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Other Tab Contents - Placeholder */}
              <TabsContent value="signatures" className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Next of Kin / Signatories</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Next of Kin Name</Label>
                    <Input value={formData.nokName} onChange={(e) => handleInputChange("nokName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Relationship</Label>
                    <Input value={formData.nokRelationship} onChange={(e) => handleInputChange("nokRelationship", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Next of Kin Phone</Label>
                    <Input value={formData.nokPhone} onChange={(e) => handleInputChange("nokPhone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Next of Kin Email</Label>
                    <Input value={formData.nokEmail} onChange={(e) => handleInputChange("nokEmail", e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">These details will be stored as the member's primary contact for emergencies and signatory purposes.</p>
              </TabsContent>

              <TabsContent value="picture" className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Photo & Signature</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Photograph</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {photoFile ? (
                      // preview
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      <img src={URL.createObjectURL(photoFile)} alt="photo preview" className="mt-2 w-40 h-40 object-cover rounded" />
                    ) : (
                      <p className="text-xs text-gray-500">No photo selected</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Signature</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSignatureFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {signatureFile ? (
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      <img src={URL.createObjectURL(signatureFile)} alt="signature preview" className="mt-2 w-40 h-24 object-contain rounded border" />
                    ) : (
                      <p className="text-xs text-gray-500">No signature selected</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Upload a clear portrait and a scanned signature (PNG/JPG).</p>
              </TabsContent>

              <TabsContent value="accounts" className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Default Accounts</h3>
                {defaultProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">No default accounts configured.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">Monthly Contribution (KES)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Account Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defaultProducts.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedDefaultAccounts[p.productId]?.create || false}
                              onChange={() =>
                                setSelectedDefaultAccounts((prev) => ({
                                  ...prev,
                                  [p.productId]: {
                                    ...(prev[p.productId] || { create: true, monthlyContribution: p.monthlyContribution ?? p.expectedContribution ?? 0, openingBalance: 0 }),
                                    create: !prev[p.productId]?.create,
                                  },
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{p.productId}</TableCell>
                          <TableCell className="font-medium">{p.productName}</TableCell>
                          <TableCell className="text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={selectedDefaultAccounts[p.productId]?.monthlyContribution ?? (p.monthlyContribution ?? p.expectedContribution ?? 0)}
                              onChange={(e) =>
                                setSelectedDefaultAccounts((prev) => ({
                                  ...prev,
                                  [p.productId]: {
                                    ...(prev[p.productId] || { create: true, monthlyContribution: p.monthlyContribution ?? p.expectedContribution ?? 0, openingBalance: 0 }),
                                    monthlyContribution: parseFloat(e.target.value) || 0,
                                  },
                                }))
                              }
                              className="w-28 text-right px-2 border rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              step="0.01"
                              value={selectedDefaultAccounts[p.productId]?.openingBalance ?? 0}
                              onChange={(e) =>
                                setSelectedDefaultAccounts((prev) => ({
                                  ...prev,
                                  [p.productId]: {
                                    ...(prev[p.productId] || { create: true, monthlyContribution: p.monthlyContribution ?? p.expectedContribution ?? 0, openingBalance: 0 }),
                                    openingBalance: parseFloat(e.target.value) || 0,
                                  },
                                }))
                              }
                              className="w-28 px-2 border rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                          </TableCell>
                          <TableCell className="text-sm">{p.productType || "Savings"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="approval" className="p-6 text-center text-gray-500">
                <p>Approval Requests section coming soon...</p>
              </TabsContent>

              <TabsContent value="create" className="p-6 text-center text-gray-500">
                <p>Create section coming soon...</p>
              </TabsContent>

              <TabsContent value="other" className="p-6 text-center text-gray-500">
                <p>Other Options section coming soon...</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 