"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useHttp } from "@/hooks/use-http"
import { Loader2, ShieldCheck, Wallet, UploadCloud, AlertCircle } from "lucide-react"

interface WithdrawFormProps {
  onSuccess?: () => void;
  availableBalance?: number;
}

export function WithdrawForm({ onSuccess, availableBalance = 0 }: WithdrawFormProps) {
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionPin, setTransactionPin] = useState("")
  const [currency, setCurrency] = useState("USDT")
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  
  const [idFile, setIdFile] = useState<string>("")
  const [selfieFile, setSelfieFile] = useState<string>("")
  const [kycLoading, setKycLoading] = useState(false)
  
  const token = useSelector((state: RootState) => state.token.token)
  const { sendHttpRequest, loading } = useHttp()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPinStatus = async () => {
      try {
        const res = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data?.user) {
          setHasPin(data.data.user.hasTransactionPin)
          setKycStatus(data.data.user.kycStatus)
        }
      } catch (err) {
        console.error("Failed to check PIN status", err)
      }
    }
    if (token) {
      fetchPinStatus()
    }
  }, [token])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFile: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
             setFile(compressedDataUrl);
          } else {
             setFile(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const submitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      toast({ title: "Missing documents", description: "Please upload both ID and Selfie.", variant: "destructive" });
      return;
    }
    setKycLoading(true);
    await sendHttpRequest({
        requestConfig: {
           url: "/api/user/kyc",
           method: "POST",
           isAuth: true,
           token: token || undefined,
           body: { idDocument: idFile, selfieDocument: selfieFile },
           successMessage: "KYC documents submitted for approval."
        },
        successRes: () => {
            setKycStatus("pending")
        }
    });
    setKycLoading(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number.parseFloat(amount)
    if (!amount || withdrawAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    if (availableBalance > 0 && withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient balance",
        description: `Max available for withdrawal: $${availableBalance.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    sendHttpRequest({
      requestConfig: {
        url: "/api/user/withdrawal",
        method: "POST",
        isAuth: true,
        token: token || undefined,
        body: {
          amount: withdrawAmount,
          walletAddress,
          transactionPin,
          currency
        },
        successMessage: `Withdrawal request of $${withdrawAmount.toFixed(2)} submitted successfully`,
      },
      successRes: () => {
        setAmount("")
        setWalletAddress("")
        setTransactionPin("")
        if (onSuccess) onSuccess();
      }
    });
  }

  if (kycStatus === "pending") {
    return (
      <Card className="p-8 border-border bg-card shadow-xl flex flex-col items-center justify-center text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-yellow-500 mb-2" />
        <h2 className="text-xl font-bold">Verification Pending</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Your identity verification documents have been received and are currently under review by our compliance team. You will be able to withdraw funds as soon as your account is verified.
        </p>
      </Card>
    )
  }

  if (kycStatus === "unverified" || kycStatus === "rejected") {
    return (
      <Card className="p-6 border-border bg-card shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldCheck size={120} className="text-primary" />
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Identity Verification Required
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            To comply with financial regulations and secure your account, you must verify your identity before withdrawing funds.
            {kycStatus === "rejected" && <span className="text-destructive font-bold block mt-1">Your previous submission was rejected. Please upload clear, valid documents.</span>}
          </p>
        </div>

        <form onSubmit={submitKyc} className="space-y-6">
          <div className="space-y-2">
            <Label>Valid Government ID (Passport, Driver's License)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition">
              <Input type="file" accept="image/*" className="hidden" id="idUpload" onChange={(e) => handleFileUpload(e, setIdFile)} />
              <Label htmlFor="idUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">{idFile ? "ID Uploaded (Click to change)" : "Upload ID Document"}</span>
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Selfie with ID</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition">
              <Input type="file" accept="image/*" capture="user" className="hidden" id="selfieUpload" onChange={(e) => handleFileUpload(e, setSelfieFile)} />
              <Label htmlFor="selfieUpload" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">{selfieFile ? "Selfie Uploaded (Click to change)" : "Take a Selfie"}</span>
              </Label>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-bold" disabled={kycLoading || !idFile || !selfieFile}>
            {kycLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...</> : "Submit Documents"}
          </Button>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-border bg-card shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ShieldCheck size={100} className="text-primary" />
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Request Withdrawal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
             <Label htmlFor="amount">Withdrawal Amount</Label>
             <span className="text-muted-foreground">Available: <b className="text-primary">${availableBalance.toLocaleString()}</b></span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 h-11 text-lg font-bold"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="currency">Withdrawal Method</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={loading}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USDT">USDT (TRC20)</SelectItem>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="walletAddress">{currency} Receiving Address</Label>
                <Input
                    id="walletAddress"
                    placeholder={`Enter your ${currency} address...`}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    disabled={loading}
                    className="h-10"
                    required
                />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionPin">
            {hasPin ? "Authentication PIN" : "Create Transaction PIN"}
          </Label>
          <Input
            id="transactionPin"
            type="password"
            maxLength={6}
            placeholder={hasPin ? "Enter your 4-6 digit PIN" : "Create a new 4-6 digit PIN"}
            value={transactionPin}
            onChange={(e) => setTransactionPin(e.target.value)}
            disabled={loading}
            className="h-10 tracking-[1em] text-center"
            required
          />
          {!hasPin && (
            <p className="text-[10px] bg-primary/5 p-2 rounded border border-primary/20 text-primary">
              <b>Important:</b> This is your first withdrawal. The PIN you set now will be required for all future payouts.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-12 font-bold text-base shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? (
             <>
               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
               Processing Securely...
             </>
          ) : (
            "Authorize Withdrawal"
          )}
        </Button>
      </form>
    </Card>
  )
}
