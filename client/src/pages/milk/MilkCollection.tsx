import { useState, useEffect } from "react";
import { useFarmers } from "@/context/FarmersContext";
import { useAuth } from "@/context/AuthContext";
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
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function MilkCollection() {
  const { toast } = useToast();
  // useFarmers may throw if page rendered outside provider; guard against that to avoid runtime crash
  let farmersCtx = { farmers: [] as any[], refetchFarmers: async () => { } };
  try {
    farmersCtx = useFarmers();
  } catch (err) {
    // not within provider — continue with empty farmers list
    console.warn('useFarmers not available, continuing with empty farmers list');
  }
  const { farmers, refetchFarmers } = farmersCtx;
  const { token } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [mode, setMode] = useState<"new" | "edit" | "view">("new");
  const [lookupValue, setLookupValue] = useState("");
  const [collectionFarmers, setCollectionFarmers] = useState<any[]>([]);
  const [dailyCollections, setDailyCollections] = useState<any[]>([]);
  const [pricePerLiter, setPricePerLiter] = useState<number>(50);

  // Fetch milk collections from server
  const fetchCollections = async () => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch("/api/milk/entries", { headers });
      let body: any = null;

      // If the proxied request returned HTML (vite index) or failed, try direct backend URL
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/html") || !res.ok) {
        console.warn("Proxy fetch returned HTML or failed; attempting direct backend fetch...");
        try {
          const directUrl = "http://localhost:5000/api/milk/entries";
          const directRes = await fetch(directUrl, { headers });
          const dct = directRes.headers.get("content-type") || "";
          if (dct.includes("text/html") || !directRes.ok) {
            const text = await directRes.text().catch(() => null) || await res.text().catch(() => null);
            console.error("Direct backend fetch also returned HTML or failed:", text?.slice?.(0, 1000));
            throw new Error("Unexpected HTML response from server (check backend is running and listening on port 5000)");
          }
          body = await directRes.json();
        } catch (err) {
          throw err;
        }
      } else {
        body = await res.json();
      }
      // debug: log raw response to help trace why UI might not update
      console.debug("/api/milk/entries response:", body);
      const data = Array.isArray(body.results) ? body.results : [];

      // Group collections by date
      const grouped: Record<string, any> = {};
      data.forEach((entry: any) => {
        if (!entry.date || !entry.farmer) return; // skip invalid entries
        const date = entry.date.split("T")[0];
        if (!grouped[date]) grouped[date] = { date, totalQuantity: 0, farmersCount: 0, totalFat: 0, totalSnf: 0, entries: [] };
        grouped[date].totalQuantity += entry.quantity || 0;
        grouped[date].totalFat += entry.fat || 0;
        grouped[date].totalSnf += entry.snf || 0;
        grouped[date].farmersCount += 1;
        grouped[date].entries.push(entry);
      });

      const summaries = Object.values(grouped).map((g: any) => ({
        ...g,
        avgFat: g.farmersCount ? +(g.totalFat / g.farmersCount).toFixed(1) : 0,
        avgSnf: g.farmersCount ? +(g.totalSnf / g.farmersCount).toFixed(1) : 0,
        status: "completed"
      }));

      // debug: log computed daily summaries
      console.debug("computed dailyCollections summaries:", summaries);

      setDailyCollections(summaries.sort((a: any, b: any) => b.date.localeCompare(a.date)));
    } catch (e: any) {
      console.error("Failed to fetch milk collections:", e);
      toast({ title: "Error", description: "Could not fetch milk collections", variant: "destructive" });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const sRes = await fetch('/api/settings');
        if (sRes.ok) {
          const sb = await sRes.json().catch(() => null);
          if (sb?.settings?.milkPricePerLiter) setPricePerLiter(Number(sb.settings.milkPricePerLiter));
        }
      } catch (e) { }
    })();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleNewCollection = () => {
    setMode("new");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setCollectionFarmers([]);
    setIsDialogOpen(true);
  };

  const handleView = (date: string) => {
    const day = dailyCollections.find(dc => dc.date === date);
    setCollectionFarmers(day?.entries.map((e: any) => ({
      farmer: e.farmer,
      quantity: e.quantity,
      fat: e.fat,
      snf: e.snf
    })) || []);
    setMode("view");
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleEdit = (date: string) => {
    const day = dailyCollections.find(dc => dc.date === date);
    setCollectionFarmers(day?.entries.map((e: any) => ({
      farmer: e.farmer,
      quantity: e.quantity,
      fat: e.fat,
      snf: e.snf
    })) || []);
    setMode("edit");
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleGetFarmer = async () => {
    const term = lookupValue.trim();
    if (!term) {
      toast({ title: "Lookup required", description: "Enter farmer _id, idNumber or phone", variant: "destructive" });
      return;
    }

    let found = farmers.find(f =>
      f._id === term || f.id === term || f.memberNo === term || f.idNumber === term || f.phone === term
    );

    if (!found) {
      try {
        const res = await fetch(`/api/farmers/${encodeURIComponent(term)}`);
        if (res.ok) {
          const body = await res.json().catch(() => null);
          // server returns { success: true, farmer }
          found = body?.farmer || body || null;
        }
      } catch { }
    }

    if (!found) {
      toast({ title: "Not found", description: `No farmer matched '${term}'`, variant: "destructive" });
      return;
    }

    setCollectionFarmers(prev => {
      if (!found) return prev;
      if (prev.some(p => p.farmer?._id === found._id || p.farmer?.id === found._id)) return prev;
      return [...prev, { farmer: found, quantity: 0, fat: 0, snf: 0 }];
    });
    setLookupValue("");
  };

  const handleRemoveCollectionFarmer = (idx: number) => {
    setCollectionFarmers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveToServer = async () => {
    if (!selectedDate) {
      toast({ title: "Date required", description: "Pick a collection date", variant: "destructive" });
      return;
    }
    if (collectionFarmers.length === 0) {
      toast({ title: "No farmers", description: "Add at least one farmer", variant: "destructive" });
      return;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const savedEntries: any[] = [];
      const errors: string[] = [];

      for (const entry of collectionFarmers) {
        const qty = Number(entry.quantity) || 0;
        const payload = {
          farmerId: entry.farmer._id || entry.farmer.id,
          quantity: qty,
          amount: Math.round(qty * pricePerLiter * 100) / 100,
          fat: Number(entry.fat),
          snf: Number(entry.snf),
          date: selectedDate
        };

        // Try proxied POST first
        let res = await fetch("/api/milk", { method: "POST", headers, body: JSON.stringify(payload) }).catch(() => null as any);
        let body: any = null;

        const isHtml = (r: any) => {
          try {
            const ct = r?.headers?.get?.("content-type") || "";
            return ct.includes("text/html");
          } catch { return false; }
        };

        if (!res || isHtml(res) || !res.ok) {
          // fallback to direct backend
          try {
            const directUrl = "http://localhost:5000/api/milk";
            const directRes = await fetch(directUrl, { method: "POST", headers, body: JSON.stringify(payload) }).catch(() => null as any);
            if (!directRes || isHtml(directRes) || !directRes.ok) {
              const text = await (directRes?.text?.().catch(() => null) || res?.text?.().catch(() => null));
              errors.push(String(text || "Unexpected server response while saving entry"));
              continue;
            }
            body = await directRes.json().catch(() => null);
          } catch (err: any) {
            errors.push(err?.message || "Failed to save entry");
            continue;
          }
        } else {
          body = await res.json().catch(() => null);
        }

        if (body && (body.milk || body.success)) savedEntries.push(body.milk || body);
        else savedEntries.push({ farmer: entry.farmer, quantity: Number(entry.quantity) || 0, fat: Number(entry.fat) || 0, snf: Number(entry.snf) || 0, date: selectedDate });
      }

      if (errors.length > 0) {
        console.error("Errors saving some entries:", errors);
        toast({ title: "Save failed", description: errors[0], variant: "destructive" });
        // try to resync with server data even if some failed
        await fetchCollections();
        return;
      }

      // Build a daily summary from saved entries (or from current form if server didn't return details)
      const entries = savedEntries.length ? savedEntries : collectionFarmers.map((entry: any) => ({ farmer: entry.farmer, quantity: Number(entry.quantity) || 0, fat: Number(entry.fat) || 0, snf: Number(entry.snf) || 0, date: selectedDate }));
      const totalQuantity = entries.reduce((s, e) => s + (e.quantity || 0), 0);
      const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0);
      const totalSnf = entries.reduce((s, e) => s + (e.snf || 0), 0);
      const farmersCount = entries.length;

      const optimisticSummary = {
        date: selectedDate,
        totalQuantity,
        totalFat,
        totalSnf,
        farmersCount,
        avgFat: farmersCount ? +(totalFat / farmersCount).toFixed(1) : 0,
        avgSnf: farmersCount ? +(totalSnf / farmersCount).toFixed(1) : 0,
        status: "completed",
        entries
      };

      setDailyCollections(prev => {
        if (prev.some(p => p.date === optimisticSummary.date)) {
          return prev.map(p => p.date === optimisticSummary.date ? optimisticSummary : p);
        }
        return [optimisticSummary, ...prev];
      });

      toast({ title: "Saved", description: "Collection recorded successfully" });
      setIsDialogOpen(false);
      await refetchFarmers();
      await fetchCollections();
      setCollectionFarmers([]);
    } catch (e: any) {
      console.error("Save error:", e);
      toast({ title: "Save failed", description: e?.message || "Could not save collection", variant: "destructive" });
    }
  };

  const suggestions = lookupValue
    ? farmers.filter(f =>
      f.memberNo?.toLowerCase().includes(lookupValue.toLowerCase()) ||
      `${f.firstName} ${f.surname}`.toLowerCase().includes(lookupValue.toLowerCase()) ||
      f.phone?.includes(lookupValue) ||
      f.idNumber?.includes(lookupValue)
    )
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Milk Collection</h1>
        <Button onClick={handleNewCollection}>
          <Plus className="h-4 w-4 mr-2" /> New Collection
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
                <TableHead><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</div></TableHead>
                <TableHead>Total Quantity (L)</TableHead>
                <TableHead>Farmers</TableHead>
                <TableHead>Avg. Fat %</TableHead>
                <TableHead>Avg. SNF %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyCollections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No milk collections recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {dailyCollections.map(dc => (
                <TableRow key={dc.date}>
                  <TableCell className="font-medium">{dc.date}</TableCell>
                  <TableCell>{dc.totalQuantity.toFixed(1)}</TableCell>
                  <TableCell>{dc.farmersCount}</TableCell>
                  <TableCell>{dc.avgFat}</TableCell>
                  <TableCell>{dc.avgSnf}</TableCell>
                  <TableCell><Badge variant="default">{dc.status}</Badge></TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => handleView(dc.date)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(dc.date)}><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "new" ? "New Collection" : mode === "edit" ? "Edit Collection" : "View Collection"}</DialogTitle>
            <DialogDescription>{mode === "new" ? "Record milk collection for the day" : `Collection for ${selectedDate}`}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="collection-date">Collection Date</Label>
              <Input
                id="collection-date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                disabled={mode !== "new"}
              />
            </div>

            {mode === "new" && (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Lookup Farmer (_id, ID no. or phone)</Label>
                    <Input value={lookupValue} onChange={e => setLookupValue(e.target.value)} placeholder="Type name, ID number, or phone" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleGetFarmer} className="h-9">Get Farmer</Button>
                    <Button variant="ghost" onClick={() => setLookupValue("")}>Clear</Button>
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="bg-white border rounded shadow-sm max-h-48 overflow-auto">
                    {suggestions.map(s => (
                      <div key={s._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                        onClick={() => setCollectionFarmers(prev => [...prev, { farmer: s, quantity: 0, fat: 0, snf: 0 }])}>
                        <div>
                          <div className="font-medium">{s.firstName} {s.surname} <span className="text-xs text-muted-foreground">{s.memberNo || s.idNumber}</span></div>
                          <div className="text-xs text-gray-500">{s.phone}</div>
                        </div>
                        <div className="text-xs text-gray-400">Add</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Farmer Entries Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Quantity (L)</TableHead>
                  <TableHead>Fat %</TableHead>
                  <TableHead>SNF %</TableHead>
                  {mode !== "view" && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionFarmers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {mode === "view" ? "No entries recorded for this date." : "Add farmers using the lookup above."}
                    </TableCell>
                  </TableRow>
                )}

                {collectionFarmers.map((c, idx) => (
                  <TableRow key={c.farmer?._id || c.farmer?.id || idx}>
                    <TableCell>
                      <div className="font-medium">{c.farmer.firstName} {c.farmer.surname}</div>
                      <div className="text-xs text-muted-foreground">{c.farmer.memberNo || c.farmer.idNumber || c.farmer.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={c.quantity} disabled={mode === "view"} className="w-28"
                        onChange={e => { const copy = [...collectionFarmers]; copy[idx].quantity = Number(e.target.value); setCollectionFarmers(copy); }}
                      />
                      <div className="text-xs text-muted-foreground mt-1">Amt: KES {((Number(c.quantity) || 0) * pricePerLiter).toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={c.fat} disabled={mode === "view"} className="w-20"
                        onChange={e => { const copy = [...collectionFarmers]; copy[idx].fat = Number(e.target.value); setCollectionFarmers(copy); }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.1" value={c.snf} disabled={mode === "view"} className="w-20"
                        onChange={e => { const copy = [...collectionFarmers]; copy[idx].snf = Number(e.target.value); setCollectionFarmers(copy); }}
                      />
                    </TableCell>
                    {mode !== "view" && (
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => handleRemoveCollectionFarmer(idx)}>Remove</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

              </TableBody>
            </Table>

            {mode !== "view" && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveToServer}>{mode === "new" ? "Create Collection" : "Save Changes"}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
