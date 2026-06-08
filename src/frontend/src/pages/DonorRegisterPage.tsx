import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Loader2,
  MapPin,
  Navigation,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BloodTypeBadge } from "../components/BloodTypeBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import {
  useRegisterDonor,
} from "../hooks/useBackend";
import { BLOOD_TYPES } from "../types";

// ─── Location Section ─────────────────────────────────────────────────────────

interface LocationSectionProps {
  lat: number;
  lng: number;
  onLocation: (lat: number, lng: number) => void;
}

function LocationSection({ lat, lng, onLocation }: LocationSectionProps) {
  const [getting, setGetting] = useState(false);
  const hasLocation = lat !== 0 || lng !== 0;

  const detect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setGetting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocation(pos.coords.latitude, pos.coords.longitude);
        toast.success("Location detected!");
        setGetting(false);
      },
      () => {
        toast.error("Unable to get location. Please allow access.");
        setGetting(false);
      },
      { timeout: 10000 },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Navigation className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="heading-md">Your Location</h2>
      </div>
      <p className="body-sm mb-5">
        We use your location to rank you in distance-based search results,
        helping nearby seekers find you first.
      </p>

      <div className="space-y-4">
        <Button
          type="button"
          variant={hasLocation ? "outline" : "default"}
          onClick={detect}
          disabled={getting}
          className="gap-2"
          data-ocid="register.detect_location_button"
        >
          {getting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : hasLocation ? (
            <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
          ) : (
            <MapPin className="h-4 w-4" aria-hidden />
          )}
          {getting
            ? "Detecting…"
            : hasLocation
              ? "Re-detect Location"
              : "Detect My Location"}
        </Button>

        {hasLocation && (
          <div
            className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm"
            data-ocid="register.location_success_state"
          >
            <CheckCircle2
              className="h-4 w-4 flex-shrink-0 text-accent"
              aria-hidden
            />
            <span className="text-foreground">
              Location set —{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
            </span>
          </div>
        )}

        {/* Manual coordinate inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-lat" className="text-xs text-muted-foreground">
              Latitude (optional override)
            </Label>
            <Input
              id="reg-lat"
              type="number"
              step="any"
              value={lat === 0 ? "" : lat}
              onChange={(e) =>
                onLocation(Number.parseFloat(e.target.value) || 0, lng)
              }
              placeholder="e.g. 40.7128"
              data-ocid="register.lat_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-lng" className="text-xs text-muted-foreground">
              Longitude (optional override)
            </Label>
            <Input
              id="reg-lng"
              type="number"
              step="any"
              value={lng === 0 ? "" : lng}
              onChange={(e) =>
                onLocation(lat, Number.parseFloat(e.target.value) || 0)
              }
              placeholder="e.g. -74.0060"
              data-ocid="register.lng_input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DonorRegisterPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading, login } = useAuth();
  const existingProfile = null;
  const profileLoading = false;
  const registerDonor = useRegisterDonor();
  const isEditing = false;

  const [form, setForm] = useState({
    name: "",
    address: "",
    bloodType: "",
    phone: "",
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name,
        address: existingProfile.address,
        bloodType: existingProfile.bloodType,
        phone: existingProfile.phone,
        lat: existingProfile.lat,
        lng: existingProfile.lng,
      });
    }
  }, [existingProfile]);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bloodType) {
      toast.error("Please select a blood type.");
      return;
    }
    if (form.lat === 0 && form.lng === 0) {
      toast.error("Please detect or enter your location before continuing.");
      return;
    }

    try {
      const result =
  await registerDonor.mutateAsync(form);

      if (result.__kind__ === "ok") {
        toast.success(
          isEditing
            ? "Profile updated!"
            : "You're now a registered donor — welcome!",
        );
        navigate({ to: "/donor" });
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ── Loading ──
  if (authLoading || profileLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-ocid="register.loading_state"
      >
        <LoadingSpinner label="Loading…" />
      </div>
    );
  }

  // ── Auth guard ──
  if (!isLoggedIn) {
    return (
      <div
        className="mx-auto max-w-md px-4 py-24 text-center"
        data-ocid="register.unauthenticated_state"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <User className="h-10 w-10 text-primary" aria-hidden />
        </div>
        <h1 className="heading-xl mb-3">Login Required</h1>
        <p className="body-sm mb-8">
          You must be logged in with Internet Identity to register as a blood
          donor.
        </p>
        <Button
          onClick={login}
          size="lg"
          className="gap-2"
          data-ocid="register.login_button"
        >
          <Droplets className="h-5 w-5" aria-hidden />
          Login with Internet Identity
        </Button>
      </div>
    );
  }

  const isPending = registerDonor.isPending || updateProfile.isPending;

  return (
    <div className="mx-auto max-w-xl px-4 py-8" data-ocid="register.page">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link to="/donor">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            data-ocid="register.back_button"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="heading-xl leading-tight">
            {isEditing ? "Edit Your Profile" : "Register as a Donor"}
          </h1>
          <p className="body-sm mt-0.5">
            {isEditing
              ? "Update your personal details and location."
              : "Fill in your details to appear in blood donation searches."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        data-ocid="register.form"
      >
        {/* Personal Information */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="heading-md mb-5">Personal Information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full Name *</Label>
              <Input
                id="reg-name"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sarah Johnson"
                data-ocid="register.name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-phone">Phone Number *</Label>
              <Input
                id="reg-phone"
                required
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                data-ocid="register.phone_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-address">Address *</Label>
              <Input
                id="reg-address"
                required
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, City, State"
                data-ocid="register.address_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-blood-type">Blood Type *</Label>
              <Select
                value={form.bloodType}
                onValueChange={(v) => set("bloodType", v)}
                disabled={isEditing}
              >
                <SelectTrigger
                  id="reg-blood-type"
                  data-ocid="register.blood_type_select"
                >
                  <SelectValue placeholder="Select your blood type…" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      <div className="flex items-center gap-2">
                        <BloodTypeBadge bloodType={bt} size="sm" />
                        <span>{bt}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Blood type cannot be changed after registration.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <LocationSection
          lat={form.lat}
          lng={form.lng}
          onLocation={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
        />

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          disabled={isPending}
          data-ocid="register.submit_button"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Droplets className="h-5 w-5" aria-hidden />
          )}
          {isPending
            ? "Saving…"
            : isEditing
              ? "Save Changes"
              : "Register as Donor"}
        </Button>

        {!isEditing && (
          <p className="text-center text-xs text-muted-foreground">
            By registering, you agree to appear in public search results for
            blood donors in your area.
          </p>
        )}
      </form>
    </div>
  );
}
