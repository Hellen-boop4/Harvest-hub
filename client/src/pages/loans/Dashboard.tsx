import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListOrdered, CheckSquare, PenSquare } from "lucide-react";
import { useLocation } from "wouter";
import { apiJson } from "@/lib/api";

export default function LoansDashboard() {
  const [, setLocation] = useLocation();
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const l: any = await apiJson('/api/loans');
        const list = Array.isArray(l) ? l : (l.loans || []);
        setLoans(list || []);
      } catch (e) {
        console.error('Failed to load loans', e);
      }
    })();
  }, []);

  const appliedLoans = loans;
  const activeLoans = loans.filter((l) => l.status === "disbursed");

  const renderTable = (rows: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Loan No</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Farmer</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Amount</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Repaid</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Term (mo)</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((loan, idx) => (
            <tr key={loan._id || idx} className="border-b hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-800">{loan.loanNo || loan._id?.toString().slice(-6)}</td>
              <td className="px-4 py-3">{loan.farmer?.firstName} {loan.farmer?.surname}</td>
              <td className="px-4 py-3">KES {(loan.amount || 0).toLocaleString("en-KE")}</td>
              <td className="px-4 py-3">KES {(loan.repaidAmount || 0).toLocaleString("en-KE")}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  loan.status === "disbursed" ? "bg-blue-100 text-blue-800" :
                  loan.status === "overdue" ? "bg-red-100 text-red-800" :
                  "bg-emerald-100 text-emerald-800"
                }`}>
                  {loan.status}
                </span>
              </td>
              <td className="px-4 py-3">{loan.termMonths || 0}</td>
              <td className="px-4 py-3">{loan.createdAt ? loan.createdAt.split("T")[0] : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="text-sm text-slate-500 py-4 text-center">No records.</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Loan Management</h1>
          <p className="text-muted-foreground">Loan Registration, Posted Loans, and Loan Changes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setLocation('/loans/new')}>
            <ListOrdered className="h-4 w-4 mr-2" />
            Loan Registration
          </Button>
          <Button size="sm" variant="outline" onClick={() => setLocation('/loans')}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Posted Loans
          </Button>
          <Button size="sm" variant="outline" onClick={() => setLocation('/loans')}>
            <PenSquare className="h-4 w-4 mr-2" />
            Loan Changes
          </Button>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Applied Loans</CardTitle>
        </CardHeader>
        <CardContent>{renderTable(appliedLoans)}</CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Active Loans (Disbursed)</CardTitle>
        </CardHeader>
        <CardContent>{renderTable(activeLoans)}</CardContent>
      </Card>
    </div>
  );
}
