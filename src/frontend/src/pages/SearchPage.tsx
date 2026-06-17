import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowRight,
  Droplets,
  LocateFixed,
  MapPin,
  Search,
  Users,
  MessageSquare,
  Trophy,
  Heart,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DonorCard } from "../components/DonorCard";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAllDonors, useCheckAvailability, useSearchDonors, useLogDonation } from "../hooks/useBackend";
import { useAuth } from "../hooks/useAuth";
import { useTranslate } from "../lib/translations";
import { ChatDialog } from "../components/ChatDialog";

type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied"; message: string };

export function SearchPage() {
  const { language, isLoggedIn, user } = useAuth();
  const t = useTranslate(language);

  const [activeTab, setActiveTab] = useState<"search" | "leaderboard">("search");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [area, setArea] = useState("");
  const [locationState, setLocationState] = useState<LocationState>({ status: "idle" });
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  // Messaging Dialog State
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string } | null>(null);

  const checkAvailability = useCheckAvailability();
  const logDonation = useLogDonation();

  useEffect(() => {
    checkAvailability.mutate();
    const timer = setInterval(() => {
      checkAvailability.mutate();
    }, 3600000);
    return () => clearInterval(timer);
  }, []);

  const hasLocation = locationState.status === "granted";

  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchDonors(
    bloodTypeFilter === "all" ? "" : bloodTypeFilter,
    division,
    district,
    subDistrict,
    area,
    hasLocation ? locationState.lat : 0,
    hasLocation ? locationState.lng : 0,
    searchTriggered && hasLocation,
  );

  const {
    data: allDonors,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useAllDonors();

  const isLoading = searchTriggered && hasLocation ? searchLoading : allLoading;
  const hasError = searchTriggered && hasLocation ? searchError : allError;

  let displayedDonors: any[] = [];
  if (searchTriggered && hasLocation && searchResults) {
    displayedDonors = searchResults;
  } else if (allDonors) {
    displayedDonors =
      bloodTypeFilter === "all"
        ? allDonors
        : allDonors.filter((d) => d.bloodType === bloodTypeFilter);
  }

  // Sorted list of top donors for public leaderboard
  const leaderboardDonors = [...(allDonors || [])].sort((a, b) => b.donationCount - a.donationCount);

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocationState({
        status: "denied",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    setLocationState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationState({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        toast.success(language === "en" ? "Location locked successfully!" : "অবস্থান সফলভাবে লক করা হয়েছে!");
      },
      () => {
        setLocationState({
          status: "denied",
          message: "Location access denied. Results shown without distance ranking.",
        });
      },
      { timeout: 10000 },
    );
  }

  function handleSearch() {
    setSearchTriggered(true);
    if (hasLocation) {
      refetchSearch();
    }
  }

  function handleReset() {
    setBloodTypeFilter("all");
    setDivision("");
    setDistrict("");
    setSubDistrict("");
    setArea("");
    setLocationState({ status: "idle" });
    setSearchTriggered(false);
  }

  const getDonationBadge = (count: number) => {
    if (count >= 5) return { label: t("levelHero"), color: "bg-red-500 text-white" };
    if (count >= 3) return { label: t("levelChampion"), color: "bg-amber-500 text-white" };
    return { label: t("levelLifesaver"), color: "bg-emerald-500 text-white" };
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-ocid="search.page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-12 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
            <Droplets className="h-8 w-8 text-primary-foreground animate-bounce" />
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight">{t("findDonors")}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm opacity-90">{t("findDonorsSub")}</p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="mx-auto max-w-6xl px-4 mt-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "search" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            {t("searchTab")}
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "leaderboard" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="h-4 w-4" />
            {t("leaderboardTab")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === "search" ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Filter Panel */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm h-fit">
              <h2 className="text-base font-bold font-display">{t("selectBloodGroup")}</h2>
              <select
                className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
              >
                <option value="all">{t("allBloodTypes")}</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Division"
                  className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="District"
                  className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Sub-district / Upazila"
                  className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Area / Ward"
                  className="w-full border border-border bg-card p-2 rounded-md text-sm outline-none"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={handleLocate}
                disabled={locationState.status === "locating"}
              >
                <LocateFixed className="h-4 w-4" />
                {locationState.status === "locating" ? t("locating") : t("locateMe")}
              </Button>

              {hasLocation && (
                <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 p-2 rounded">
                  GPS Latitude/Longitude: {locationState.lat.toFixed(4)}, {locationState.lng.toFixed(4)}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={handleReset}>
                  {t("reset")}
                </Button>
                <Button className="flex-1 text-xs" onClick={handleSearch}>
                  {t("search")}
                </Button>
              </div>
            </div>

            {/* Donor List View */}
            <div className="md:col-span-2 space-y-4">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="donor-card h-20 bg-muted/20 animate-pulse rounded-lg border" />
                  ))}
                </div>
              )}

              {hasError && !isLoading && (
                <ErrorMessage message="Failed to fetch donors list" onRetry={handleSearch} />
              )}

              {!isLoading && !hasError && displayedDonors.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg bg-card">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-bold">{t("noDonors")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("noDonorsDesc")}</p>
                </div>
              )}

              {!isLoading && !hasError && displayedDonors.length > 0 && (
                <div className="space-y-3">
                  {displayedDonors.map((donor, idx) => {
                    const isClosest = idx === 0 && hasLocation;
                    return (
                      <div
                        key={donor.id}
                        className={`rounded-xl border border-border p-4 shadow-sm bg-card hover:shadow flex justify-between items-center gap-4 transition-all ${
                          isClosest ? "border-primary/60 bg-primary/5 shadow-md" : ""
                        }`}
                      >
                        <div className="flex gap-3 min-w-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-xl flex-shrink-0">
                            {donor.bloodType}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold flex items-center gap-1.5 text-base text-foreground">
                              {donor.name}
                              {isClosest && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-0.5">
                                  <Heart className="h-2.5 w-2.5 animate-pulse" /> {t("nearestBadge")}
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {[donor.area, donor.subDistrict, donor.district, donor.division].filter(Boolean).join(", ")} {donor.address ? `- ${donor.address}` : ""}
                              {hasLocation && donor.distanceKm > 0 && (
                                <span className="font-bold text-primary font-mono ml-1">
                                  ({donor.distanceKm} {t("kmAway")})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isLoggedIn && user?.id !== donor.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setChatTarget({ id: donor.id, name: donor.name })}
                              className="gap-1.5 text-xs font-semibold"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {t("chatDonor")}
                            </Button>
                          )}
                          <div className="text-right flex flex-col items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              donor.isAvailable ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                            }`}>
                              {donor.isAvailable ? "Available" : "Unavailable"}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-1">
                              {donor.donationCount} {t("donorStatus")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Public Leaderboard View */
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-3xl mx-auto space-y-4">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-bold font-display">Public Donor Leaderboard</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Celebrating our community heroes. The leaderboard ranks our active donors based on total successful blood donation logs.
            </p>

            <div className="divide-y divide-border/60">
              {leaderboardDonors.map((donor, index) => {
                const badge = getDonationBadge(donor.donationCount);
                return (
                  <div key={donor.id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold font-mono">
                        {donor.bloodType}
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          {donor.name}
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{donor.address}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-primary">{donor.donationCount} Times</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Donations Logged</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Messaging Modal overlay */}
      {chatTarget && (
        <ChatDialog
          isOpen={!!chatTarget}
          onClose={() => setChatTarget(null)}
          receiverId={chatTarget.id}
          receiverName={chatTarget.name}
        />
      )}
    </div>
  );
}
