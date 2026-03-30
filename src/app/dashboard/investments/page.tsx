"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { InvestmentsDashboard } from "@/components/dashboard/investments";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHttp } from "@/hooks/use-http";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";

export default function InvestmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const { sendHttpRequest, loading } = useHttp();
  const token = useSelector((state: RootState) => state.token.token);
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")

      return;
    }
    sendHttpRequest({
      requestConfig: {
        url: "/api/user/deposite",
        method: "GET",

        token,
        successMessage: "",
      },
      successRes: (res: any) => {
        setDeposits(res.deposits || []);
      }
    });
  }, [token]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
          <span className="font-semibold text-lg">Investments</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Breadcrumb */}
          <div className="mb-6 md:mb-8 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">Dashboard</span> /
            Investments
          </div>

          {/* Dashboard Cards and Table */}
          {loading ? (
            <div className="flex animate-pulse space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <InvestmentsDashboard data={deposits} />
          )}
        </div>
      </main>
    </div>
  );
}
