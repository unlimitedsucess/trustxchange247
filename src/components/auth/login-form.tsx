"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useHttp } from "@/hooks/use-http";
// your redux slice
import { tokenActions } from "@/store/token/token-slice";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(""); // API error state

  const { sendHttpRequest, loading } = useHttp();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    const email = formData.email
    const password = formData.password


    if (Object.keys(newErrors).length === 0) {
      sendHttpRequest({
        requestConfig: {
          url: "/api/user/auth/login",
          method: "POST",
          body: { email, password},
          successMessage: "Login successful",
        },
        successRes: (res: any) => {
          const token = res.token;

          console.log("loging", res);

          dispatch(tokenActions.setToken(token));
          router.push("/dashboard");
        },
      });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in to access your investment portfolio
        </p>
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Login successful!</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="password"
            className="text-sm font-semibold mb-2 block"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 border-border rounded"
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
              Remember me
            </Label>
          </div>
          <Link href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full font-semibold h-11 mt-6"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-semibold"
          >
            Create one
          </Link>
        </p>
      </div>
    </Card>
  );
}
