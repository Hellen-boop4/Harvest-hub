import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FarmerProfile() {
  const [match, params] = useRoute("/farmers/profile/:id");
  const id = params?.id;

  //todo: remove mock functionality
  const mockFarmer = {
    id,
    name: "John Kamau",
    phone: "0712345678",
    village: "Kiambu",
    status: "active",
    registrationDate: "2024-01-15",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Farmer Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>{mockFarmer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Phone:</span>
            <p className="font-medium">{mockFarmer.phone}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Village:</span>
            <p className="font-medium">{mockFarmer.village}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Status:</span>
            <p className="font-medium capitalize">{mockFarmer.status}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Registration Date:</span>
            <p className="font-medium">{mockFarmer.registrationDate}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
