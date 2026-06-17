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
  MessageSquare,
  Send
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
  useMessages,
  useSendMessage
} from "../hooks/useBackend";
import { useTranslate } from "../lib/translations";

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

interface EditProfilePanelProps {
  initialId: string;
  initialName: string;
  initialAddress: string;
  initialDivision?: string;
  initialDistrict?: string;
  initialSubDistrict?: string;
  initialArea?: string;
  initialPhone: string;
  initialLat: number;
  initialLng: number;
  onCancel: () => void;
}

function EditProfilePanel({
  initialId,
  initialName,
  initialAddress,
  initialDivision,
  initialDistrict,
  initialSubDistrict,
  initialArea,
  initialPhone,
  initialLat,
  initialLng,
  onCancel,
}: EditProfilePanelProps) {
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({
    id: initialId,
    name: initialName,
    address: initialAddress,
    division: initialDivision || "",
    district: initialDistrict || "",
    subDistrict: initialSubDistrict || "",
    area: initialArea || "",
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
        toast.error("Operation failed");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-division">Division</Label>
          <Input
            id="edit-division"
            value={form.division}
            onChange={(e) => set("division", e.target.value)}
            placeholder="e.g. Dhaka"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-district">District</Label>
          <Input
            id="edit-district"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="e.g. Dhaka"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-subDistrict">Sub-district / Upazila</Label>
          <Input
            id="edit-subDistrict"
            value={form.subDistrict}
            onChange={(e) => set("subDistrict", e.target.value)}
            placeholder="e.g. Dhanmondi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-area">Area / Ward</Label>
          <Input
            id="edit-area"
            value={form.area}
            onChange={(e) => set("area", e.target.value)}
            placeholder="e.g. Road 15"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-address">Full Address Line</Label>
        <Input
          id="edit-address"
          required
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, Building, etc."
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

          <span className="font-mono text-xs text-muted-foreground">
            {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="donor.edit_cancel_button"
        >
          Cancel
        </Button>
        <Button type="submit" className="gap-2" data-ocid="donor.edit_save_button">
          <Save className="h-4 w-4" aria-hidden />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export function DonorDashboard() {
  const { language } = useAuth();
  const t = useTranslate(language);

  const { data: profile, isLoading, error, refetch } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDonate, setConfirmDonate] = useState(false);
  const [donating, setDonating] = useState(false);

  const logDonation = useLogDonation();

  // Chat Inbox states for Donor
  const { data: messages } = useMessages(profile?.id || "");
  const sendMessage = useSendMessage();
  const [selectedThreadSenderId, setSelectedThreadSenderId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [donationDateOption, setDonationDateOption] = useState<string>("today");

  const handleLogDonation = async () => {
    if (!profile) return;
    if (!confirmDonate) {
      setConfirmDonate(true);
      return;
    }
    setDonating(true);
    setConfirmDonate(false);

    let finalTimestamp = Date.now();
    if (donationDateOption === "1month") {
      finalTimestamp -= 30 * 24 * 60 * 60 * 1000;
    } else if (donationDateOption === "3months") {
      finalTimestamp -= 90 * 24 * 60 * 60 * 1000;
    } else if (donationDateOption === "4months") {
      finalTimestamp -= 121 * 24 * 60 * 60 * 1000;
    }

    try {
      const result = await logDonation.mutateAsync({ id: profile.id, date: finalTimestamp });
      if (result.__kind__ === "ok") {
        toast.success(
          donationDateOption === "4months"
            ? "Donation logged 4 months ago! Your status remains Available as the recovery period has elapsed."
            : "Donation recorded! Your status is now unavailable. It will auto-reset in 4 months.",
        );
      } else {
        toast.error("Operation failed");
      }
    } catch {
      toast.error("Failed to log donation. Please try again.");
    } finally {
      setDonating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!replyText.trim() || !selectedThreadSenderId) return;

    // Find the sender's name from messages list
    const firstMsg = (messages || []).find((m) => m.senderId === selectedThreadSenderId);
    const senderName = firstMsg ? firstMsg.senderName : "User Seeker";

    await sendMessage.mutateAsync({
      senderId: profile.id,
      senderName: profile.name,
      receiverId: selectedThreadSenderId,
      text: replyText.trim(),
    });
    setReplyText("");
  };

  // Group messages by sender id
  const chatThreadsMap = new Map();
  (messages || []).forEach((m) => {
    const threadPartnerId = m.senderId === profile?.id ? m.receiverId : m.senderId;
    if (!chatThreadsMap.has(threadPartnerId)) {
      chatThreadsMap.set(threadPartnerId, {
        partnerName: m.senderId === profile?.id ? "User Seeker" : m.senderName,
        messages: [],
      });
    }
    chatThreadsMap.get(threadPartnerId).messages.push(m);
  });

  const chatThreads = Array.from(chatThreadsMap.entries());

  if (isLoading) {
    return (
      <div className="py-24" data-ocid="donor.loading_state">
        <LoadingSpinner label="Loading donor profile…" />
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <ErrorMessage
          message="Failed to load donor profile. Please check connection."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center" data-ocid="donor.unregistered_state">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Droplets className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h1 className="heading-xl mb-3">Become a Blood Donor</h1>
        <p className="body-sm mb-8">
          You're not registered as a donor yet. Join our network to help people in need find life-saving blood near them.
        </p>
        <Link to="/donor/register">
          <Button size="lg" className="gap-2" data-ocid="donor.register_button">
            <Droplets className="h-5 w-5" aria-hidden />
            Register as Donor
          </Button>
        </Link>
      </div>
    );
  }

  const selectedThreadMessages = selectedThreadSenderId 
    ? (messages || []).filter(
        (m) =>
          (m.senderId === profile.id && m.receiverId === selectedThreadSenderId) ||
          (m.senderId === selectedThreadSenderId && m.receiverId === profile.id)
      )
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6" data-ocid="donor.dashboard_page">
      <div className="mb-6 pb-4 border-b border-border">
        <h1 className="heading-xl mb-1">{t("donorDashboard")}</h1>
        <p className="body-sm text-muted-foreground">
          Manage your donor profile, check status metrics, and read customer messages.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Profile info details */}
        <div className="space-y-6 md:col-span-1">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="relative">
                <DonorAvatar name={profile.name} />
                <span className="absolute -bottom-1 -right-1">
                  <StatusBadge isAvailable={profile.isAvailable} />
                </span>
              </div>
              <div>
                <h2 className="heading-lg mb-1">{profile.name}</h2>
                <div className="flex gap-2 justify-center items-center">
                  <BloodTypeBadge bloodType={profile.bloodType} size="md" />
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                    Level: {profile.donationCount >= 5 ? t("levelHero") : profile.donationCount >= 3 ? t("levelChampion") : t("levelLifesaver")}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="divide-y divide-border/60 text-sm">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={`${[profile.area, profile.subDistrict, profile.district, profile.division].filter(Boolean).join(", ")} - ${profile.address}`} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
              <div className="flex justify-between py-3">
                <span className="font-semibold text-muted-foreground">Total Donations:</span>
                <span className="font-bold text-primary font-mono">{profile.donationCount} Times</span>
              </div>
            </div>
          </section>

          {/* Update profile section */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="heading-md flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Edit Info
              </h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <EditProfilePanel
                initialId={profile.id}
                initialName={profile.name}
                initialAddress={profile.address}
                initialDivision={(profile as any).division}
                initialDistrict={(profile as any).district}
                initialSubDistrict={(profile as any).subDistrict}
                initialArea={(profile as any).area}
                initialPhone={profile.phone}
                initialLat={profile.lat}
                initialLng={profile.lng}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Update details to keep your search coordinates and contact information fresh.
              </p>
            )}
          </section>
        </div>

        {/* Right Side: Donation logging & Chat message box */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Donation section */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="heading-md">Log a Donation & Availability Check</h2>
            </div>

            {profile.isAvailable ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">You are available to donate</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Your blood type {profile.bloodType} is visible to seekers.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                  <Label htmlFor="donation-date-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    When did you donate?
                  </Label>
                  <select
                    id="donation-date-select"
                    className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                    value={donationDateOption}
                    onChange={(e) => setDonationDateOption(e.target.value)}
                  >
                    <option value="today">Today (Marks as Unavailable)</option>
                    <option value="1month">1 Month Ago (Marks as Unavailable)</option>
                    <option value="3months">3 Months Ago (Marks as Unavailable)</option>
                    <option value="4months">4 Months Ago (Stays Available - Eligibility Met)</option>
                  </select>

                  {confirmDonate ? (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="text-xs font-medium">Confirm logging donation?</span>
                      <Button size="sm" onClick={handleLogDonation} disabled={donating}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDonate(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleLogDonation} disabled={donating} className="gap-2 mt-2 w-full sm:w-auto">
                      <Heart className="h-4 w-4" /> Log Donation
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                  <XCircle className="mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-medium">Currently unavailable</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      You recently logged a donation. Your profile will automatically become available again after the 4-month recovery period (120 days).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Recovery time check updates automatically based on your last logged date.</span>
                </div>
              </div>
            )}
          </section>

          {/* Inbox Chat Panel */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("inbox")}
            </h2>

            {chatThreads.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground italic">
                No messages received from seekers yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Thread partner list */}
                <div className="space-y-1 sm:col-span-1 border-r border-border pr-3 h-64 overflow-y-auto">
                  {chatThreads.map(([partnerId, data]: any) => (
                    <button
                      key={partnerId}
                      onClick={() => setSelectedThreadSenderId(partnerId)}
                      className={`w-full text-left p-2 rounded text-xs font-semibold truncate ${
                        selectedThreadSenderId === partnerId ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {data.partnerName}
                      <span className="block text-[9px] font-normal text-muted-foreground">
                        {data.messages.length} Messages
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Thread view */}
                <div className="sm:col-span-2 flex flex-col justify-between h-64">
                  {selectedThreadSenderId ? (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded-lg">
                        {selectedThreadMessages.map((msg) => {
                          const isMe = msg.senderId === profile.id;
                          return (
                            <div key={msg.id} className={`max-w-[85%] ${isMe ? "ml-auto text-right" : "mr-auto text-left"}`}>
                              <div className={`p-2 rounded text-xs inline-block font-medium ${
                                isMe ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
                        <Input
                          placeholder="Type reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 text-xs h-8"
                        />
                        <Button type="submit" size="icon" className="h-8 w-8">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-24 italic">
                      Select a conversation on the left to read messages.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
