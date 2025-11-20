import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useFarmers } from "@/context/FarmersContext";

export default function FarmersList() {
  const [, setLocation] = useLocation();
  const { farmers } = useFarmers();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Farmers List</h1>
      <Card>
        <CardHeader>
          <CardTitle>Registered Farmers ({farmers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {farmers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No farmers registered yet. Go to <span className="font-semibold">Farmer Registration</span> to add a new farmer.</p>
            </div>
          ) : (
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
                {farmers.map((farmer) => (
                  <TableRow key={farmer.id} data-testid={`row-farmer-${farmer.id}`}>
                    <TableCell className="font-semibold text-blue-600">{farmer.memberNo}</TableCell>
                    <TableCell data-testid={`text-name-${farmer.id}`}>
                      {farmer.firstName} {farmer.middleName} {farmer.surname}
                    </TableCell>
                    <TableCell data-testid={`text-phone-${farmer.id}`}>{farmer.phone}</TableCell>
                    <TableCell>{farmer.city}</TableCell>
                    <TableCell className="font-mono text-sm">{farmer.idNumber}</TableCell>
                    <TableCell>
                      <Badge className={farmer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {farmer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLocation(`/farmers/profile/${farmer.id}`)}
                        data-testid={`button-view-${farmer.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
