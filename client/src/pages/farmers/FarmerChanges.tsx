import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Edit, Save, X, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

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
}

interface ChangeLog {
  _id: string;
  farmer: {
    memberNo: string;
    firstName: string;
    surname: string;
  };
  changedBy: {
    username: string;
  };
  field: string;
  oldValue: any;
  newValue: any;
  description: string;
  createdAt: string;
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const winAny = window as any;
  if (winAny.fetchWithAuth) {
    return winAny.fetchWithAuth(url, options);
  }
  return fetch(url, options);
};

export default function FarmerChanges() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Farmer>>({});
  const [loading, setLoading] = useState(false);
  const [changeLogsOpen, setChangeLogsOpen] = useState(false);
  const [changeLogsLoading, setChangeLogsLoading] = useState(false);

  useEffect(() => {
    loadFarmers();
    loadChangeLogs();
  }, []);

  const loadFarmers = async () => {
    try {
      const res = await fetch("/api/farmers");
      if (!res.ok) throw new Error("Failed to load farmers");
      const data = await res.json();
      setFarmers(data.farmers || []);
    } catch (err: any) {
      console.error("Failed to load farmers:", err);
      toast({ title: "Error", description: err.message || "Failed to load farmers", variant: "destructive" });
    }
  };

  const loadChangeLogs = async () => {
    setChangeLogsLoading(true);
    try {
      const res = await fetchWithAuth("/api/farmers/changes");
      if (!res.ok) throw new Error("Failed to load change logs");
      const data = await res.json();
      setChangeLogs(data.results || []);
    } catch (err: any) {
      console.error("Failed to load change logs:", err);
    } finally {
      setChangeLogsLoading(false);
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setEditForm({
      firstName: farmer.firstName,
      middleName: farmer.middleName || "",
      surname: farmer.surname,
      phone: farmer.phone,
      email: farmer.email || "",
      idNumber: farmer.idNumber || "",
      idType: farmer.idType || "National ID",
      city: farmer.city || "",
      county: farmer.county || "",
      address: farmer.address || "",
      dob: farmer.dob || "",
      gender: farmer.gender || "",
      maritalStatus: farmer.maritalStatus || "",
      kraPIN: farmer.kraPIN || "",
      memberCategory: farmer.memberCategory || "Member",
      status: farmer.status || "active",
    });
  };

  const handleSave = async () => {
    if (!editingFarmer) return;

    setLoading(true);
    try {
      // Remove memberNo from update data - it cannot be changed
      const updateData = { ...editForm };
      delete updateData.memberNo;
      
      const res = await fetchWithAuth(`/api/farmers/${editingFarmer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to update farmer");
      }

      toast({
        title: "Success",
        description: "Farmer updated successfully.",
      });

      setEditingFarmer(null);
      setEditForm({});
      loadFarmers();
      loadChangeLogs(); // Refresh change logs
    } catch (err: any) {
      console.error("Failed to update farmer:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update farmer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingFarmer(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Farmers", href: "/farmers/dashboard" },
          { label: "Farmer Changes" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">Farmer Changes</h1>
        <p className="text-sm text-muted-foreground">
          Edit farmer profiles and view change history. All modifications are logged.
        </p>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered Farmers ({farmers.length})</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Click Edit to modify farmer information
              </p>
            </div>
            <Button variant="outline" onClick={() => setChangeLogsOpen(true)}>
              <History className="h-4 w-4 mr-2" />
              View Change Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                      No farmers registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  farmers.map((farmer) => (
                    <TableRow key={farmer._id}>
                      <TableCell className="font-semibold text-blue-600">
                        {farmer.memberNo}
                      </TableCell>
                      <TableCell>
                        {farmer.firstName} {farmer.middleName} {farmer.surname}
                      </TableCell>
                      <TableCell>{farmer.phone}</TableCell>
                      <TableCell>{farmer.city || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{farmer.idNumber || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            farmer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {farmer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(farmer)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingFarmer} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Farmer Profile</DialogTitle>
            <DialogDescription>
              Update farmer information. All changes will be logged.
            </DialogDescription>
          </DialogHeader>

          {editingFarmer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Member No.</Label>
                  <Input value={editingFarmer.memberNo} disabled />
                </div>

                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={editForm.firstName || ""}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input
                    value={editForm.middleName || ""}
                    onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Surname *</Label>
                  <Input
                    value={editForm.surname || ""}
                    onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input
                    value={editForm.idNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, idNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select
                    value={editForm.idType || "National ID"}
                    onValueChange={(value) => setEditForm({ ...editForm, idType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="Birth Certificate">Birth Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editForm.city || ""}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>County</Label>
                  <Input
                    value={editForm.county || ""}
                    onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={editForm.address || ""}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={editForm.dob || ""}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={editForm.gender || ""}
                    onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Input
                    value={editForm.maritalStatus || ""}
                    onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>KRA PIN</Label>
                  <Input
                    value={editForm.kraPIN || ""}
                    onChange={(e) => setEditForm({ ...editForm, kraPIN: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Member Category</Label>
                  <Input
                    value={editForm.memberCategory || ""}
                    onChange={(e) => setEditForm({ ...editForm, memberCategory: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status || "active"}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Logs Dialog */}
      <Dialog open={changeLogsOpen} onOpenChange={setChangeLogsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Log History</DialogTitle>
            <DialogDescription>
              All modifications made to farmer profiles are logged here.
            </DialogDescription>
          </DialogHeader>

          {changeLogsLoading ? (
            <div className="py-6 text-sm text-muted-foreground text-center">Loading change logs...</div>
          ) : changeLogs.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">No changes logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.farmer?.memberNo || "—"} - {log.farmer?.firstName} {log.farmer?.surname}
                      </TableCell>
                      <TableCell className="font-semibold">{log.field}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.oldValue !== null && log.oldValue !== undefined
                          ? String(log.oldValue)
                          : "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.newValue !== null && log.newValue !== undefined
                          ? String(log.newValue)
                          : "—"}
                      </TableCell>
                      <TableCell>{log.changedBy?.username || "System"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
