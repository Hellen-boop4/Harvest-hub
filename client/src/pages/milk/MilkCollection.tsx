import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function MilkCollection() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [mode, setMode] = useState<"new" | "edit" | "view">("new");

  const mockDailyCollections = [
    { date: "2025-11-18", totalQuantity: 96.0, farmersCount: 4, avgFat: 3.8, avgSnf: 8.5, status: "completed" },
    { date: "2025-11-17", totalQuantity: 89.5, farmersCount: 4, avgFat: 3.7, avgSnf: 8.4, status: "completed" },
    { date: "2025-11-16", totalQuantity: 92.0, farmersCount: 3, avgFat: 3.9, avgSnf: 8.6, status: "completed" },
    { date: "2025-11-15", totalQuantity: 88.0, farmersCount: 4, avgFat: 3.8, avgSnf: 8.5, status: "completed" },
  ];

  const handleNewCollection = () => {
    setMode("new");
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  const handleView = (date: string) => {
    setMode("view");
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleEdit = (date: string) => {
    setMode("edit");
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    console.log("Saving collection for date:", selectedDate);
    toast({
      title: "Success",
      description: mode === "new" ? "Collection created successfully" : "Collection updated successfully",
    });
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Milk Collection</h1>
        <Button onClick={handleNewCollection} data-testid="button-new-collection">
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead>Total Quantity (L)</TableHead>
                <TableHead>Farmers</TableHead>
                <TableHead>Avg. Fat %</TableHead>
                <TableHead>Avg. SNF %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDailyCollections.map((collection) => (
                <TableRow key={collection.date} data-testid={`row-collection-${collection.date}`}>
                  <TableCell className="font-medium" data-testid={`text-date-${collection.date}`}>
                    {collection.date}
                  </TableCell>
                  <TableCell data-testid={`text-quantity-${collection.date}`}>
                    {collection.totalQuantity.toFixed(1)}
                  </TableCell>
                  <TableCell data-testid={`text-farmers-${collection.date}`}>
                    {collection.farmersCount}
                  </TableCell>
                  <TableCell data-testid={`text-fat-${collection.date}`}>
                    {collection.avgFat}
                  </TableCell>
                  <TableCell data-testid={`text-snf-${collection.date}`}>
                    {collection.avgSnf}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" data-testid={`badge-status-${collection.date}`}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleView(collection.date)}
                        data-testid={`button-view-${collection.date}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(collection.date)}
                        data-testid={`button-edit-${collection.date}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "new" ? "New Collection" : mode === "edit" ? "Edit Collection" : "View Collection"}
            </DialogTitle>
            <DialogDescription>
              {mode === "new" ? "Record milk collection for the day" : `Collection for ${selectedDate}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="collection-date">Collection Date</Label>
              <Input
                id="collection-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={mode === "view"}
                data-testid="input-collection-date"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-4">Farmer Collections</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Fat %</TableHead>
                    <TableHead>SNF %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mode !== "new" && (
                    <>
                      <TableRow>
                        <TableCell>John Kamau</TableCell>
                        <TableCell>
                          {mode === "view" ? "25.5" : (
                            <Input type="number" step="0.1" defaultValue="25.5" className="w-24" />
                          )}
                        </TableCell>
                        <TableCell>
                          {mode === "view" ? "3.8" : (
                            <Input type="number" step="0.1" defaultValue="3.8" className="w-20" />
                          )}
                        </TableCell>
                        <TableCell>
                          {mode === "view" ? "8.5" : (
                            <Input type="number" step="0.1" defaultValue="8.5" className="w-20" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Mary Wanjiku</TableCell>
                        <TableCell>
                          {mode === "view" ? "30.0" : (
                            <Input type="number" step="0.1" defaultValue="30.0" className="w-24" />
                          )}
                        </TableCell>
                        <TableCell>
                          {mode === "view" ? "4.0" : (
                            <Input type="number" step="0.1" defaultValue="4.0" className="w-20" />
                          )}
                        </TableCell>
                        <TableCell>
                          {mode === "view" ? "8.7" : (
                            <Input type="number" step="0.1" defaultValue="8.7" className="w-20" />
                          )}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  {mode === "new" && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Add farmers to this collection
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {mode !== "view" && (
                <Button variant="outline" className="mt-4" data-testid="button-add-farmer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Farmer
                </Button>
              )}
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button onClick={handleSave} data-testid="button-save">
                  {mode === "new" ? "Create Collection" : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
