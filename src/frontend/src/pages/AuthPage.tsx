import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, ShieldAlert, Heart, Store, User, ArrowRight, Lock, Mail, UserCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useTranslate } from "../lib/translations";
import { toast } from "sonner";

export function AuthPage() {
  const { loginWithOAuth, loginWithCredentials, registerNewProfile, language } = useAuth();
  const t = useTranslate(language);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"donor" | "shopkeeper" | "viewer">("viewer");

  // OAuth Popup Simulation State
  const [oauthPopup, setOauthPopup] = useState<{ isOpen: boolean; provider: "google" | "facebook" | null }>({
    isOpen: false,
    provider: null,
  });
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleOAuthClick = (provider: "google" | "facebook") => {
    setOauthPopup({ isOpen: true, provider });
    setOauthLoading(true);
    // Simulate accounts loading inside oauth screen
    setTimeout(() => {
      setOauthLoading(false);
    }, 1200);
  };

  const handleOAuthSelectAccount = (accountEmail: string, accountName: string) => {
    setOauthPopup({ isOpen: false, provider: null });
    const userObj = loginWithOAuth(oauthPopup.provider!, role);
    toast.success(`Successfully authenticated via ${oauthPopup.provider} as ${userObj.role}!`);
    setTimeout(() => {
      window.location.href = userObj.role === "admin" ? "/admin" : userObj.role === "donor" ? "/donor" : userObj.role === "shopkeeper" ? "/shopkeeper" : "/";
    }, 800);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        const userObj = registerNewProfile(email, name || email.split("@")[0], role, password);
        toast.success(`Registration complete! Welcome ${userObj.name}.`);
        setTimeout(() => {
          window.location.href = role === "donor" ? "/donor" : role === "shopkeeper" ? "/shopkeeper" : "/";
        }, 800);
      } else {
        const userObj = loginWithCredentials(email, password);
        toast.success(`Success! Logged in as ${userObj.name} (${userObj.role})`);
        setTimeout(() => {
          window.location.href = userObj.role === "admin" ? "/admin" : userObj.role === "donor" ? "/donor" : userObj.role === "shopkeeper" ? "/shopkeeper" : "/";
        }, 800);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/40 p-4" data-ocid="auth.page">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-300">

        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-primary" />

        <div className="p-8">
          {/* Logo & Heading */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Droplets className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {isSignUp ? t("register") : t("login")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t("welcomeDesc")}
            </p>
          </div>

          {/* Separate Registration vs Login Flow */}
          <div className="flex bg-muted p-1 rounded-lg mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!isSignUp ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t("login")}
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${isSignUp ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t("register")}
            </button>
          </div>

          {/* Role Picker Section (Signup only - restricts admin!) */}
          {isSignUp && (
            <div className="mb-6 animate-in slide-in-from-top-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block text-center">
                Select Sign Up Profile Type
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: "viewer", label: t("roleViewer"), icon: User, activeBg: "border-emerald-500 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400" },
                  { type: "donor", label: t("roleDonor"), icon: Heart, activeBg: "border-primary bg-primary/5 text-primary" },
                  { type: "shopkeeper", label: t("roleShopkeeper"), icon: Store, activeBg: "border-blue-500 bg-blue-50/10 text-blue-600 dark:text-blue-400" },
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = role === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setRole(item.type as any)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all gap-1.5 ${isSelected ? item.activeBg + " border-2 shadow-sm" : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-[10px] font-bold truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Credentials Email & Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1">
                <Label htmlFor="reg-name">{t("fullName")}</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    placeholder="Rahul Ahmed"
                    className="pl-9"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1">
                <Label htmlFor="confirm-password">{t("confirmPass")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gap-2">
              {isSignUp ? t("register") : t("login")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center justify-between">
            <span className="h-px w-full bg-border" />
            <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">{t("or")}</span>
            <span className="h-px w-full bg-border" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleOAuthClick("google")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card py-2 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              <FaGoogle className="h-4 w-4 text-red-500" />
              {t("oauthGoogle")}
            </button>
            <button
              onClick={() => handleOAuthClick("facebook")}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card py-2 text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              <FaFacebookF className="h-4 w-4 text-blue-600" />
              {t("oauthFacebook")}
            </button>
          </div>

        </div>
      </div>

      {/* OAuth Simulated Consent Popup Modal */}
      {oauthPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold font-display border-b border-border pb-3 flex items-center gap-2">
              {oauthPopup.provider === "google" ? (
                <FaGoogle className="h-5 w-5 text-red-500" />
              ) : (
                <FaFacebookF className="h-5 w-5 text-blue-600" />
              )}
              Sign in with {oauthPopup.provider === "google" ? "Google" : "Facebook"}
            </h3>

            {/* OAuth Email Input */}
            {oauthLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Loading accounts list...</span>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <p className="text-xs text-muted-foreground mb-1">Enter your {oauthPopup.provider} email to continue:</p>
                <Input
                  id="oauth-email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button variant="default" className="w-full mt-2" onClick={() => {
                  const userObj = loginWithOAuth(oauthPopup.provider!, role, email);
                    // No manual DB update needed; loginWithOAuth handles email.
                    toast.success(`Successfully authenticated via ${oauthPopup.provider} as ${userObj.role}!`);
                    setOauthPopup({ isOpen: false, provider: null });
                    setTimeout(() => {
                      window.location.href = userObj.role === "admin" ? "/admin" : userObj.role === "donor" ? "/donor" : userObj.role === "shopkeeper" ? "/shopkeeper" : "/";
                    }, 800);
                }}>{t("continue")}</Button>
                <Button variant="outline" className="w-full mt-2" onClick={() => setOauthPopup({ isOpen: false, provider: null })}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}