import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
  Loader2,
  MapPin,
  Phone,
  Save,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BloodTypeBadge } from "../components/BloodTypeBadge";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import {
  useLogDonation,
  useMyProfile,
  useUpdateProfile,
} from "../hooks/useBackend";

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="label mb-0.5">{label}</p>
        <p className="body-base truncate">{value}</p>
      </div>
    </div>
  );
}

function DonorAvatar({ name }: { name: string }) {
  return (
    <div className="relative inline-block">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 font-display text-3xl font-bold text-primary shadow-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

// ─── Edit Profile Panel ───────────────────────────────────────────────────────

interface EditProfilePanelProps {
  initialName: string;
  initialAddress: string;
  initialPhone: string;
  initialLat: number;
  initialLng: number;
  onCancel: () => void;
}

function EditProfilePanel({
  initialName,
  initialAddress,
  initialPhone,
  initialLat,
  initialLng,
  onCancel,
}: EditProfilePanelProps) {
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({
    name: initialName,
    address: initialAddress,
    phone: initialPhone,
    lat: initialLat,
    lng: initialLng,
  });
  const [gettingLoc, setGettingLoc] = useState(false);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        toast.success("Location updated!");
        setGettingLoc(false);
      },
      () => {
        toast.error("Could not get location. Please allow access.");
        setGettingLoc(false);
      },
      { timeout: 10000 },
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile.mutateAsync(form);
      if (result.__kind__ === "ok") {
        toast.success("Profile updated successfully!");
        onCancel();
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4"
      data-ocid="donor.edit_profile_form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Full Name</Label>
          <Input
            id="edit-name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your full name"
            data-ocid="donor.edit_name_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-phone">Phone</Label>
          <Input
            id="edit-phone"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
            data-ocid="donor.edit_phone_input"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-address">Address</Label>
        <Input
          id="edit-address"
          required
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, City, State"
          data-ocid="donor.edit_address_input"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Location</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={detectLocation}
            disabled={gettingLoc}
            className="gap-2"
            data-ocid="donor.edit_detect_location_button"
          >
            {gettingLoc ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <MapPin className="h-4 w-4" aria-hidden />
            )}
            {gettingLoc ? "Detecting…" : "Update Location"}
          </Button>
          {(form.lat !== 0 || form.lng !== 0) && (
            <span className="text-sm text-muted-foreground">
              {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          size="sm"
          disabled={updateProfile.isPending}
          className="gap-2"
          data-ocid="donor.edit_save_button"
        >
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          {updateProfile.isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          data-ocid="donor.edit_cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DonorDashboard() {
  const { isLoggedIn, isLoading: authLoading, login } = useAuth();
  const { data: profile, isLoading: profileLoading, error } = useMyProfile();
  const logDonation = useLogDonation();
  const [donating, setDonating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDonate, setConfirmDonate] = useState(false);

  // Reset editing state when profile refreshes after save
  useEffect(() => {
    if (!profileLoading) setIsEditing(false);
  }, [profileLoading]);

  // ── Auth guard ──
  if (authLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-ocid="donor.loading_state"
      >
        <LoadingSpinner label="Checking authentication…" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div
        className="mx-auto max-w-md px-4 py-24 text-center"
        data-ocid="donor.unauthenticated_state"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <User className="h-10 w-10 text-primary" aria-hidden />
        </div>
        <h1 className="heading-xl mb-3">Donor Login Required</h1>
        <p className="body-sm mb-8">
          Log in with Internet Identity to access your donor dashboard, manage
          your profile, and record blood donations.
        </p>
        <Button
          onClick={login}
          size="lg"
          className="gap-2"
          data-ocid="donor.login_button"
        >
          <Droplets className="h-5 w-5" aria-hidden />
          Login as Donor
        </Button>
      </div>
    );
  }

  // ── Profile loading ──
  if (profileLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-ocid="donor.profile_loading_state"
      >
        <LoadingSpinner label="Loading your profile…" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-auto max-w-md px-4 py-16"
        data-ocid="donor.error_state"
      >
        <ErrorMessage message="Failed to load your donor profile. Please try again." />
      </div>
    );
  }

  // ── Not registered ──
  if (!profile) {
    return (
      <div
        className="mx-auto max-w-md px-4 py-24 text-center"
        data-ocid="donor.unregistered_state"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Heart className="h-10 w-10 text-primary" aria-hidden />
        </div>
        <h1 className="heading-xl mb-3">Become a Blood Donor</h1>
        <p className="body-sm mb-2">
          You're not registered as a donor yet. Join our network to help people
          in need find life-saving blood near them.
        </p>
        <p className="body-sm mb-8">Registration takes less than 2 minutes.</p>
        <Link to="/donor/register">
          <Button size="lg" className="gap-2" data-ocid="donor.register_button">
            <Droplets className="h-5 w-5" aria-hidden />
            Register as Donor
          </Button>
        </Link>
      </div>
    );
  }

  // ── Log donation handler ──
  const handleLogDonation = async () => {
    if (!confirmDonate) {
      setConfirmDonate(true);
      return;
    }
    setDonating(true);
    setConfirmDonate(false);
    try {
      const result = await logDonation.mutateAsync();
      if (result.__kind__ === "ok") {
        toast.success(
          "Donation recorded! Your status is now unavailable. It will auto-reset in 4 months.",
        );
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to log donation. Please try again.");
    } finally {
      setDonating(false);
    }
  };

  // ── Dashboard ──
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8"
      data-ocid="donor.dashboard_page"
    >
      {/* Page header */}
      <div className="mb-8">
        <h1 className="heading-xl mb-1">Donor Dashboard</h1>
        <p className="body-sm">
          Manage your donor profile and track your donations.
        </p>
      </div>

      {/* Profile card */}
      <section
        className="mb-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        data-ocid="donor.profile_card"
      >
        {/* Avatar + name + badges */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative flex-shrink-0">
            <DonorAvatar name={profile.name} />
            <span
              className="absolute -bottom-1 -right-1"
              aria-label={profile.isAvailable ? "Available" : "Unavailable"}
            >
              <StatusBadge isAvailable={profile.isAvailable} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="heading-lg">{profile.name}</h2>
              <BloodTypeBadge bloodType={profile.bloodType} size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge isAvailable={profile.isAvailable} showLabel />
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Info rows */}
        <div className="divide-y divide-border">
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={profile.address}
          />
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={profile.phone}
          />
          <InfoRow
            icon={<Droplets className="h-4 w-4" />}
            label="Blood Type"
            value={profile.bloodType}
          />
        </div>
      </section>

      {/* Donation section */}
      <section
        className="mb-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        data-ocid="donor.donation_section"
      >
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="heading-md">Donation Status</h2>
        </div>

        {profile.isAvailable ? (
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4"
              data-ocid="donor.available_notice"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
                aria-hidden
              />
              <div>
                <p className="font-medium text-foreground">
                  You're available to donate
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Your profile is visible to people searching for{" "}
                  <span className="font-semibold text-foreground">
                    {profile.bloodType}
                  </span>{" "}
                  blood.
                </p>
              </div>
            </div>

            <div>
              <p className="body-sm mb-4">
                Donated today? Record it below. Your status will be set to
                unavailable and will automatically reset after 4 months.
              </p>

              {confirmDonate ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Confirm you donated today?
                  </span>
                  <Button
                    size="sm"
                    onClick={handleLogDonation}
                    disabled={donating}
                    className="gap-2"
                    data-ocid="donor.confirm_donation_button"
                  >
                    {donating ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    )}
                    Yes, Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDonate(false)}
                    data-ocid="donor.cancel_donation_button"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogDonation}
                  disabled={donating}
                  className="gap-2"
                  data-ocid="donor.log_donation_button"
                >
                  <Heart className="h-4 w-4" aria-hidden />I Donated Today
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
              data-ocid="donor.unavailable_notice"
            >
              <XCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive"
                aria-hidden
              />
              <div>
                <p className="font-medium text-foreground">
                  Currently unavailable
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  You recently donated. Your profile will automatically become
                  available again 4 months after your last donation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock
                className="h-4 w-4 flex-shrink-0 text-primary"
                aria-hidden
              />
              <span>Status resets automatically — no action needed.</span>
            </div>

            <Button
              disabled
              className="gap-2 opacity-60"
              data-ocid="donor.log_donation_button"
            >
              <Heart className="h-4 w-4" aria-hidden />I Donated Today
            </Button>
            <p className="text-xs text-muted-foreground">
              The donate button is disabled while you're unavailable.
            </p>
          </div>
        )}
      </section>

      {/* Update profile section */}
      <section
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
        data-ocid="donor.edit_profile_section"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="heading-md">Update Profile</h2>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsEditing(true)}
              data-ocid="donor.edit_profile_button"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <EditProfilePanel
            initialName={profile.name}
            initialAddress={profile.address}
            initialPhone={profile.phone}
            initialLat={profile.lat}
            initialLng={profile.lng}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="body-sm">
            Click <strong>Edit</strong> to update your name, address, phone
            number, or location. Blood type cannot be changed after
            registration.
          </p>
        )}
      </section>
    </div>
  );
}
