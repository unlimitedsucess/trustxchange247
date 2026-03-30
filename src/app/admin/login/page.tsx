"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHttp } from "@/hooks/use-http";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { sendHttpRequest, loading } = useHttp();
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    sendHttpRequest({
      requestConfig: {
        url: "/api/admin/login",
        method: "POST",
        body: { email, password },
        successMessage:("Logged in successfully")
      },
      successRes: (res: any) => {
        localStorage.setItem("adminToken", res.token);
        toast.success("Logged in successfully");
        router.push("/admin"); // redirect to admin dashboard
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />

      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Portal Access</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Sign in to manage users, plans, and system configurations securely.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="admin@trustxchange247.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Master Password</label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background pl-10"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full py-6 mt-4 text-md font-semibold" 
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to Workspace"}
          </Button>
        </div>
      </div>
    </div>
  );
}
