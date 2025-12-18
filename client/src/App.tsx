import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FarmersProvider } from "@/context/FarmersContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminSetup from "./pages/AdminSetup";
import FinanceDashboard from "./pages/finance/Dashboard";
import FarmersDashboard from "./pages/farmers/Dashboard";
import FarmerAccountsDashboard from "./pages/farmers/FarmerAccounts";
import FullRegistration from "./pages/farmers/farmerregistration";
import LoansDashboard from "./pages/loans/Dashboard";
import LoanChanges from "./pages/loans/LoanChanges";
import MilkCollection from "./pages/milk/MilkCollection";
import MilkPayout from "./pages/milk/MilkPayout";
import MilkCollectionReports from "./pages/milk/MilkCollectionReports";
import MilkPayoutReports from "./pages/milk/MilkPayoutReports";
import FarmersList from "./pages/farmers/FarmersList";
import FarmerProfile from "./pages/farmers/farmerProfile";
import FarmerChanges from "./pages/farmers/FarmerChanges";
import ProductList from "./pages/products/ProductList";
import ProductCard from "./pages/products/ProductCard";
import NewLoan from "./pages/loans/NewLoan";
import FundsManagement from "./pages/funds/FundsManagement";

function Nav({ username, onLogout }: { username: string; onLogout: () => void }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-primary text-primary-foreground shadow-md z-50">
      <div className="nav-container w-full mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold hover:opacity-80 transition-opacity">Harvest Hub</h1>
        </Link>

        <ul className="flex items-center gap-6">
          <li>
            <Link
              href="/"
              className={`hover-elevate px-3 py-2 rounded transition ${location === "/" ? "bg-primary-foreground/10" : ""
                }`}
              data-testid="link-home"
            >
              Home
            </Link>
          </li>

          {/* FARMERS DROPDOWN */}
          <li className="relative group">
            <button
              className={`hover-elevate px-3 py-2 rounded transition flex items-center gap-1 ${isActive("/farmers") ? "bg-primary-foreground/10" : ""
                }`}
              data-testid="button-farmers-dropdown"
            >
              Farmers Mgt
              <ChevronDown className="h-4 w-4" />
            </button>

            <ul className="absolute left-0 mt-2 w-56 bg-card text-card-foreground rounded-md shadow-lg border border-card-border opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200">
              <li>
                <Link
                  href="/farmers/register"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-farmer-registration"
                >
                  Farmer Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/farmers/list"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-farmers-list"
                >
                  Farmers List
                </Link>
              </li>
              <li>
                <Link
                  href="/farmers/accounts"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-farmer-accounts"
                >
                  Farmer Accounts
                </Link>
              </li>
              <li>
                <Link
                  href="/farmers/changes"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-farmer-changes"
                >
                  Farmer Changes
                </Link>
              </li>
            </ul>
          </li>

          {/* MILK MANAGEMENT DROPDOWN */}
          <li className="relative group">
            <button
              className={`hover-elevate px-3 py-2 rounded transition flex items-center gap-1 ${isActive("/milk") ? "bg-primary-foreground/10" : ""
                }`}
              data-testid="button-milk-dropdown"
            >
              Milk Mgt
              <ChevronDown className="h-4 w-4" />
            </button>

            <ul className="absolute left-0 mt-2 w-56 bg-card text-card-foreground rounded-md shadow-lg border border-card-border opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200">
              <li>
                <Link
                  href="/milk/collection"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-milk-collection"
                >
                  Milk Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/milk/payout"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-milk-payout"
                >
                  Milk Payout
                </Link>
              </li>
              <li>
                <Link
                  href="/milk/collection-reports"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-milk-collection-reports"
                >
                  Milk Collection Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/milk/payout-reports"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-milk-payout-reports"
                >
                  Milk Payout Reports
                </Link>
              </li>
            </ul>
          </li>

          {/* FUNDS MANAGEMENT MODULE (after Milk Mgt) */}
          <li>
            <Link
              href="/funds"
              className={`hover-elevate px-3 py-2 rounded transition ${location === "/funds" ? "bg-primary-foreground/10" : ""
                }`}
            >
              Funds Mgt
            </Link>
          </li>

          {/* LOAN MANAGEMENT DROPDOWN */}
          <li className="relative group">
            <button
              className={`hover-elevate px-3 py-2 rounded transition flex items-center gap-1 ${isActive("/loans") ? "bg-primary-foreground/10" : ""
                }`}
              data-testid="button-loans-dropdown"
            >
              Loan Mgt
              <ChevronDown className="h-4 w-4" />
            </button>

            <ul className="absolute left-0 mt-2 w-56 bg-card text-card-foreground rounded-md shadow-lg border border-card-border opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200">
              <li>
                <Link
                  href="/loans/new"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-loan-registration"
                >
                  Loan Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/loans"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-loan-applied"
                >
                  Loan Applied
                </Link>
              </li>
              <li>
                <Link
                  href="/loans"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-loan-changes"
                >
                  Loan Changes
                </Link>
              </li>
              <li>
                <Link
                  href="/finance"
                  className="block px-4 py-2 hover-elevate rounded-md"
                  data-testid="link-loan-reports"
                >
                  Loan Reports
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              href="/finance"
              className={`hover-elevate px-3 py-2 rounded transition ${location === "/finance" ? "bg-primary-foreground/10" : ""
                }`}
              data-testid="link-finance"
            >
              Finance
            </Link>
          </li>

          {user?.role === "admin" && (
            <li>
              <Link
                href="/products"
                className={`hover-elevate px-3 py-2 rounded transition ${location === "/products" ? "bg-primary-foreground/10" : ""
                  }`}
                data-testid="link-products"
              >
                Products Setup
              </Link>
            </li>
          )}

          <li>
            <Link
              href="/admin-setup"
              className={`hover-elevate px-3 py-2 rounded transition text-xs ${location === "/admin-setup" ? "bg-primary-foreground/10" : ""
                }`}
              title="Admin setup helper (development)"
            >
              Admin Setup
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <span className="text-sm text-primary-foreground/80">
            {username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="hover-elevate"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Router({ username, onLogout }: { username: string; onLogout: () => void }) {
  return (
    <>
      <Nav username={username} onLogout={onLogout} />
      <div className="pt-28 px-6 w-full min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/admin-setup" component={AdminSetup} />

          {/* FARMERS MODULE */}
          <Route path="/farmers" component={FarmersDashboard} />
          <Route path="/farmers/register" component={FullRegistration} />
          <Route path="/farmers/profile/:id" component={FarmerProfile} />
          <Route path="/farmers/list" component={FarmersList} />
          <Route path="/farmers/changes" component={FarmerChanges} />
          <Route path="/farmers/accounts" component={FarmerAccountsDashboard} />

          {/* PRODUCTS MODULE */}
          <Route path="/products" component={ProductList} />
          <Route path="/products/new" component={ProductCard} />
          <Route path="/products/:id" component={ProductCard} />

          {/* MILK MANAGEMENT MODULE */}
          <Route path="/milk/collection" component={MilkCollection} />
          <Route path="/milk/payout" component={MilkPayout} />
          <Route path="/milk/collection-reports" component={MilkCollectionReports} />
          <Route path="/milk/payout-reports" component={MilkPayoutReports} />

          {/* FUNDS MANAGEMENT MODULE */}
          <Route path="/funds" component={FundsManagement} />

          {/* OTHER MODULES */}
          <Route path="/finance" component={FinanceDashboard} />
          <Route path="/loans" component={LoansDashboard} />
          <Route path="/loans/new" component={NewLoan} />
          <Route path="/loans/changes" component={LoanChanges} />
        </Switch>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FarmersProvider>
            <AppContent />
            <Toaster />
          </FarmersProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const handleLogout = () => {
    logout();
  };

  return <Router username={user.username} onLogout={handleLogout} />;
}

interface RouterProps {
  username: string;
  onLogout: () => void;
}
