import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState<number | null>(null);

  const handlePromoteAdmin = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/promote-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to promote user");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `User '${data.user.username}' promoted to admin role`,
      });
      setUsername("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to promote user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateMemberNos = async () => {
    if (!confirm("This will renumber ALL existing members to sequential member numbers (fm0001...). Are you sure? Make a DB backup first.")) return;
    setMigrating(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/admin/migrate-membernos", { method: "POST", headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || "Migration failed");
      }
      const body = await res.json();
      setMigratedCount(body.migrated || 0);
      toast({ title: "Migration Complete", description: `Renumbered ${body.migrated || 0} members.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Migration failed", variant: "destructive" });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ChevronLeft
          className="w-5 h-5 text-gray-600 cursor-pointer"
          onClick={() => setLocation("/")}
        />
        <div>
          <h2 className="text-sm text-gray-600">Development Helper</h2>
          <h1 className="text-lg font-semibold">Admin Setup</h1>
        </div>
      </div>

      <div className="p-6 max-w-md">
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b-2 border-purple-300">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <CardTitle>Promote User to Admin</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              This is a development helper tool. Enter a username to promote them to admin role, which grants access to the Product Setup module.
            </p>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              onClick={handlePromoteAdmin}
              disabled={loading || !username.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Promoting..." : "Promote to Admin"}
            </Button>

            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Tip:</strong> You can also set <code className="bg-blue-100 px-1 rounded">SEED_DEFAULT_ADMIN=true</code> in your <code className="bg-blue-100 px-1 rounded">.env</code> file to create a default admin user with username/password <code className="bg-blue-100 px-1 rounded">admin/admin</code>.
              </p>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Maintenance</h3>
              <p className="text-xs text-gray-600 mb-3">Development helper: renumber all existing members to sequential member numbers (fm0001...)</p>
              <div className="flex gap-2">
                <Button onClick={handleMigrateMemberNos} disabled={migrating} className="bg-yellow-600 hover:bg-yellow-700">
                  {migrating ? "Running migration…" : "Renumber All Members"}
                </Button>
                {migratedCount !== null && (
                  <div className="px-3 py-2 bg-green-50 text-green-800 rounded">Renamed: {migratedCount}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
