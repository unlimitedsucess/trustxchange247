"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useHttp } from "@/hooks/use-http";

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", 
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", 
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", 
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", 
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", 
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", 
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", 
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", 
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendHttpRequest, loading, error: httpError } = useHttp();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
  };

  const validateEmailStep = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    return newErrors;
  };

  const validateCompleteStep = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";
    return newErrors;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateEmailStep();

    if (Object.keys(newErrors).length === 0) {
      sendHttpRequest({
        requestConfig: {
          url: "/api/user/auth/registration",
          method: "POST",
          body: { email: formData.email },
          successMessage: "Verification code sent to your email!",
        },
        successRes: () => {
          setStep(2);
        },
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 6) {
      setErrors({ verification: "Please enter the 6-digit code" });
      return;
    }

    sendHttpRequest({
      requestConfig: {
        url: "/api/user/auth/verify",
        method: "POST",
        body: {
          email: formData.email,
          code: verificationCode,
        },
        successMessage: "Email verified successfully!",
      },
      successRes: () => {
        setStep(3); // Move to profile completion step
      },
    });
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateCompleteStep();

    if (Object.keys(newErrors).length === 0) {
      sendHttpRequest({
        requestConfig: {
          url: "/api/user/auth/complete",
          method: "POST",
          body: {
            email: formData.email,
            fullName: formData.fullName,
            password: formData.password,
            country: formData.country,
          },
          successMessage: "Registration complete!",
        },
        successRes: () => {
          setStep(1);
          setSubmitted(true);
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        },
      });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {step === 1 && !submitted 
            ? "Create Account" 
            : step === 2 && !submitted 
            ? "Verify Email" 
            : step === 3 && !submitted 
            ? "Complete Profile" 
            : "Welcome Aboard!"}
        </h1>
        <p className="text-muted-foreground">
          {step === 1 && !submitted 
            ? "Enter your email to join TrustXchange247" 
            : step === 2 && !submitted 
            ? "We've sent a 6-digit code to your email." 
            : step === 3 && !submitted 
            ? "Tell us a little bit about yourself." 
            : "Your account is ready."}
        </p>
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Registration successful!</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </div>
        </div>
      )}

      {errors.api && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{errors.api}</p>
        </div>
      )}

      {step === 1 && !submitted && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full font-semibold h-11 mt-6 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Sending Code..." : "Continue"}
          </Button>
        </form>
      )}

      {step === 2 && !submitted && (
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-sm font-semibold mb-2 block text-center">
              Enter 6-Digit Code for {formData.email}
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={`text-center tracking-widest text-lg ${errors.verification ? "border-destructive" : ""}`}
            />
            {errors.verification && (
              <p className="text-destructive text-xs mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.verification}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full font-semibold h-11 mt-6 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Complete"}
          </Button>

          <div className="text-center mt-4">
            <Button variant="link" size="sm" type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary">
              Change Email / Back
            </Button>
          </div>
        </form>
      )}

      {step === 3 && !submitted && (
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-semibold mb-2 block">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-semibold mb-2 block">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.password}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-semibold mb-2 block">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country" className="text-sm font-semibold mb-2 block">
              Country
            </Label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.country ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">Select a country</option>
              {ALL_COUNTRIES.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.country}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 border-border rounded"
            />
            <Label htmlFor="agreeTerms" className="text-sm cursor-pointer">
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.agreeTerms && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.agreeTerms}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold h-11 mt-6 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Registration"}
          </Button>
        </form>
      )}

      {!submitted && (
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </Card>
  );
}
