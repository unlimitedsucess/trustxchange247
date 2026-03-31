"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Menu, X, Wallet, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHttp } from "@/hooks/use-http";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { toast } from "sonner";

const wallets = ["ETH", "BTC", "USDT"];

export default function InvestmentPlansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`/api/admin/plans?t=${new Date().getTime()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        const data = await res.json();
        if (data.success) {
          setPlans(data.data.filter((p: any) => p.isActive !== false));
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [successWalletAddress, setSuccessWalletAddress] = useState("");
  const [successWalletNetwork, setSuccessWalletNetwork] = useState<
    string | null
  >(null);
  const [successAmount, setSuccessAmount] = useState("");

  const { sendHttpRequest, loading } = useHttp();
  const token = useSelector((state: RootState) => state.token.token);

  const handleInvestClick = (plan: any) => {
    setSelectedPlan(plan);
    setWalletModalOpen(true);
  };

  const handleclose = () => {
    setDepositAmount("");
    setSelectedPlan(null);
    setSelectedWallet(null);
    setSuccessModalOpen(false);
  };
  const handleWalletSelect = (wallet: string) => {
    setSelectedWallet(wallet);
    setWalletModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmDeposit = () => {
    if (!selectedPlan || !selectedWallet || !depositAmount) return;
    if (!token) {
      toast.error("Unauthorized, Please login");
      return;
    }

    const amountNum = Number(depositAmount);
    if (
      amountNum < selectedPlan.minInvestment ||
      amountNum > selectedPlan.maxInvestment
    ) {
      toast.error(
        `Amount must be between $${selectedPlan.minInvestment} and $${selectedPlan.maxInvestment}`
      );
      return;
    }

    sendHttpRequest({
      requestConfig: {
        url: "/api/user/deposite",
        method: "POST",
        body: {
          plan: selectedPlan.name,
          wallet: selectedWallet,
          amount: depositAmount,
        },
        token,
        successMessage: "Deposit request sent successfully",
      },
      successRes: (res: any) => {
        console.log("response", res);
        setConfirmModalOpen(false);

        // Determine wallet address based on selectedWallet
        let address = "";
        let network: string | null = null;
        switch (selectedWallet) {
          case "BTC":
            address = "bc1qmcyk7ak9f4dcvc9ynkhdqawkmazu4fqzmk0rma";
            network = null;
            break;
          case "ETH":
            address = "0x4c5eecE2966A60DCd79B3182cDe82b5C9420B48E";
            network = null;
            break;
          case "USDT":
            address = "TEBYYX38FSLK39QwnccgR9tUcHU2bupHuY";
            network = "TRC20";
            break;
        }

        // Set success modal data
        setSuccessWalletAddress(address);
        setSuccessWalletNetwork(network);
        setSuccessAmount(depositAmount);
        setSuccessModalOpen(true);
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-50 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
          <span className="font-semibold">Investment Plans</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background">
          <h2 className="text-2xl font-semibold mb-6">
            Choose Your Investment Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingPlans ? (
              <p className="text-muted-foreground p-4">Loading investment plans...</p>
            ) : plans.length === 0 ? (
              <p className="text-muted-foreground p-4">No active plans available right now.</p>
            ) : (
              plans.map((plan) => (
                <Card
                  key={plan._id}
                  className="flex flex-col justify-between border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">
                      {plan.name}
                    </CardTitle>
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Range: ${plan.minInvestment} - ${plan.maxInvestment}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ROI: {plan.dailyRoi}% daily
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {plan.durationDays} Days
                    </p>
                    <Button
                      className="mt-4 gap-2 font-semibold transition-transform hover:scale-[1.02]"
                      onClick={() => handleInvestClick(plan)}
                    >
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Wallet Selection Modal */}
        <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a Wallet</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              {wallets.map((wallet) => (
                <Button key={wallet} onClick={() => handleWalletSelect(wallet)}>
                  {wallet}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Deposit Modal */}
        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to {selectedWallet}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <p>Enter amout:</p>

              <Input
                type="number"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleConfirmDeposit}
                className="w-full font-semibold h-11 mt-6 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "Confirm Deposit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onOpenChange={handleclose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Successful</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <p>
                Please make your transfer of{" "}
                <span className="font-semibold">${successAmount}</span> to the{" "}
                {selectedWallet} wallet below:
              </p>
              <div className="p-4 bg-gray-100 rounded font-mono flex flex-col gap-2 text-black overflow-hidden relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs sm:text-sm break-all">{successWalletAddress}</span>
                  <Button
                    size="sm"
                   className="cursor-pointer bg-transparent shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(successWalletAddress);
                      toast.success("Wallet address copied!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {successWalletNetwork && (
                  <span>Network: {successWalletNetwork}</span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleclose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
