import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFarmers } from "@/context/FarmersContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Edit2, Share2, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

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
};

export default function FullRegistration() {
  const { toast } = useToast();
  const { addFarmer } = useFarmers();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("report");
  const [formData, setFormData] = useState(defaultFormData);

  const handleInputChange = (field: string, value: string | boolean) => {
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

    try {
      const memberNo = `MEM${Date.now().toString().slice(-6)}`;

      // Save to MongoDB via Vite proxy at /api/farmers
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/farmers", {
        method: "POST",
        headers,
        body: JSON.stringify({
          memberNo,
          firstName: formData.firstName,
          middleName: formData.middleName,
          surname: formData.surname,
          phone: formData.mobilePhone,
          email: formData.personalEmail,
          idNumber: formData.idNumber,
          city: formData.city,
          county: formData.county,
          address: formData.physicalAddress,
          dob: formData.dob,
          gender: formData.gender,
          maritalStatus: formData.maritalStatus,
          kraPIN: formData.kraPIN,
          memberCategory: formData.memberCategory,
          status: "active",
        }),
      });

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

      
      try {
        await response.json();
      } catch (_e) {
        // ignore JSON parse errors for empty responses
      }

      // Add to local context
      addFarmer({
        memberNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        surname: formData.surname,
        phone: formData.mobilePhone,
        email: formData.personalEmail,
        idNumber: formData.idNumber,
        city: formData.city || "N/A",
        status: "active",
      });

      toast({
        title: "Success!",
        description: `Member ${formData.firstName} ${formData.surname} has been registered successfully.`,
      });

      // Clear form
      setFormData(defaultFormData);
      setActiveTab("report");

      // Redirect to farmers list after 1 second
      setTimeout(() => {
        setLocation("/farmers/list");
      }, 1000);
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

      {/* Action buttons */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Edit2 className="w-4 h-4 text-blue-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="text-xs text-gray-500">✓ Saved</div>
      </div>

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                        <Input value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Age</Label>
                        <Input type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} />
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
              <TabsContent value="signatures" className="p-6 text-center text-gray-500">
                <p>Account Signatories & NOK section coming soon...</p>
              </TabsContent>

              <TabsContent value="picture" className="p-6 text-center text-gray-500">
                <p>Picture & Signature section coming soon...</p>
              </TabsContent>

              <TabsContent value="accounts" className="p-6 text-center text-gray-500">
                <p>Default Accounts section coming soon...</p>
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
