import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FarmersDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Farmers Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Farmers Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the navigation menu to register new farmers or view the farmers list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
