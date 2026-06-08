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
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { DonorCard } from "../components/DonorCard";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAllDonors, useCheckAvailability, useSearchDonors, useLogDonation } from "../hooks/useBackend";
import type { BloodType, DonorPublicView } from "../types";
import { BLOOD_TYPES } from "../types";

type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied"; message: string };

function DonorCardSkeleton() {
  return (
    <div className="donor-card flex gap-4">
      <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-3 w-full" />
      </div>
    </div>
  );
}

export function SearchPage() {
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const { isLoggedIn } = useAuth();
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
  });
  const [searchTriggered, setSearchTriggered] = useState(false);
  const checkAvailability = useCheckAvailability();
  const logDonation = useLogDonation();

useEffect(() => {
  const timer = setInterval(() => {
    checkAvailability.mutate();
  }, 3600000);

  return () => clearInterval(timer);
}, []);

const hasLocation = locationState.status === "granted";

  // Search query — runs when user triggers search with location
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchDonors(
    bloodTypeFilter === "all" ? "" : bloodTypeFilter,
    hasLocation ? locationState.lat : 0,
    hasLocation ? locationState.lng : 0,
    searchTriggered && hasLocation,
  );

  // Fallback: all donors shown by default
  const {
    data: allDonors,
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useAllDonors();

  const isLoading = searchTriggered && hasLocation ? searchLoading : allLoading;
  const hasError = searchTriggered && hasLocation ? searchError : allError;
  
  // Determine displayed donors
  let displayedDonors: DonorPublicView[] = [];
  if (searchTriggered && hasLocation && searchResults) {
    displayedDonors = searchResults;
  } else if (allDonors) {
    displayedDonors =
      bloodTypeFilter === "all"
        ? allDonors
        : allDonors.filter((d) => d.bloodType === bloodTypeFilter);
  }

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
      },
      () => {
        setLocationState({
          status: "denied",
          message:
            "Location access denied. Results shown without distance ranking.",
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
    setLocationState({ status: "idle" });
    setSearchTriggered(false);
  }

  return (
    <div className="min-h-screen" data-ocid="search.page">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden bg-primary py-16 md:py-24"
        data-ocid="search.hero_section"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <Droplets className="absolute -left-6 top-4 h-40 w-40 rotate-12 text-primary-foreground/10" />
          <Droplets className="absolute -bottom-6 right-8 h-56 w-56 -rotate-12 text-primary-foreground/5" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              <Droplets className="h-3.5 w-3.5" />
              Blood Connect
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
              Find a Blood Donor
              <br />
              <span className="opacity-80">Near You</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              Search thousands of registered donors by blood type. Real-time
              availability, distance-based ranking — connecting you when every
              second counts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="/donor/register"
              className="inline-flex items-center gap-2 rounded-md bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-smooth hover:bg-primary-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              data-ocid="hero.register_link"
            >
              Become a Donor
              <ArrowRight className="h-4 w-4" />
            </a>
            
  {!isLoggedIn && (
  <a
    href="/donor"
    className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary-foreground/10"
  >
    Donor Login
  </a>
)}
          </motion.div>
        </div>
      </section>

      {/* ── Search Controls ── */}
      <section
        className="border-b bg-card py-8 shadow-sm"
        data-ocid="search.panel"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Blood type quick pills */}
          <div
            className="mb-4 flex flex-wrap items-center gap-2"
            data-ocid="search.blood_type_filter"
          >
            <span className="label">Quick select:</span>
            {(["all", ...BLOOD_TYPES] as const).map((bt) => {
              const key = bt === "all" ? "all" : bt;
              const ocidKey =
                bt === "all"
                  ? "all"
                  : bt.replace("+", "pos").replace("-", "neg");
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setBloodTypeFilter(bt);
                    setSearchTriggered(false);
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-bold font-mono transition-smooth ${
                    bloodTypeFilter === bt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  data-ocid={`search.blood_type_pill.${ocidKey}`}
                >
                  {bt === "all" ? "All" : bt}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Blood Type Select */}
            <div className="flex-1 space-y-1.5">
              <label htmlFor="blood-type-select" className="label block">
                Blood Type
              </label>
              <Select
                value={bloodTypeFilter}
                onValueChange={(v) => {
                  setBloodTypeFilter(v);
                  setSearchTriggered(false);
                }}
              >
                <SelectTrigger
                  id="blood-type-select"
                  className="bg-background"
                  data-ocid="search.blood_type_select"
                >
                  <SelectValue placeholder="All Blood Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Types</SelectItem>
                  {BLOOD_TYPES.map((bt: BloodType) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Button */}
            <div className="flex-1 space-y-1.5">
              <span className="label block">Your Location</span>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-background"
                onClick={handleLocate}
                disabled={locationState.status === "locating"}
                data-ocid="search.locate_button"
              >
                {locationState.status === "locating" ? (
                  <>
                    <LocateFixed className="h-4 w-4 animate-pulse text-primary" />
                    Locating…
                  </>
                ) : locationState.status === "granted" ? (
                  <>
                    <MapPin className="h-4 w-4 text-accent" />
                    Location Detected
                  </>
                ) : (
                  <>
                    <LocateFixed className="h-4 w-4 text-muted-foreground" />
                    Use My Location
                  </>
                )}
              </Button>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full gap-2 sm:w-auto"
              data-ocid="search.submit_button"
            >
              <Search className="h-4 w-4" />
              Search Donors
            </Button>

            {/* Reset */}
            {(bloodTypeFilter !== "all" ||
              locationState.status !== "idle" ||
              searchTriggered) && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="w-full text-muted-foreground sm:w-auto"
                data-ocid="search.reset_button"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Location feedback */}
          {locationState.status === "denied" && (
            <div
              className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
              data-ocid="search.location_error_state"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {locationState.message}
            </div>
          )}
          {locationState.status === "granted" && (
            <p className="mt-2 text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3 text-accent" />
              Results ranked nearest to you first.
            </p>
          )}
          {locationState.status === "idle" && (
            <p className="mt-2 body-sm">
              <MapPin className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              Enable location for distance-sorted results.
            </p>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      <section
        className="bg-background py-10"
        data-ocid="search.results_section"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Result count header */}
          {!isLoading && !hasError && (
            <motion.div
              key={displayedDonors.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="body-sm" data-ocid="search.results_count">
                  {displayedDonors.length === 0
                    ? "No donors found"
                    : `${displayedDonors.length} donor${displayedDonors.length !== 1 ? "s" : ""} found`}
                  {bloodTypeFilter !== "all" && (
                    <span className="ml-1 text-muted-foreground">
                      for blood type{" "}
                      <strong className="text-primary">
                        {bloodTypeFilter}
                      </strong>
                    </span>
                  )}
                </span>
              </div>
              {searchTriggered && hasLocation && displayedDonors.length > 0 && (
                <span className="label text-accent">Sorted nearest first</span>
              )}
            </motion.div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div
              className="space-y-4"
              aria-live="polite"
              data-ocid="search.loading_state"
            >
              {(["sk1", "sk2", "sk3", "sk4"] as const).map((k) => (
                <DonorCardSkeleton key={k} />
              ))}
            </div>
          )}

          {/* Error state */}
          {hasError && !isLoading && (
            <ErrorMessage
              message="Failed to load donors. Please try again."
              onRetry={() =>
                searchTriggered && hasLocation ? refetchSearch() : refetchAll()
              }
            />
          )}

          {/* Empty state */}
          {!isLoading && !hasError && displayedDonors.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center"
              data-ocid="search.empty_state"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Droplets className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="heading-md">No donors found</p>
                <p className="body-sm mx-auto mt-1 max-w-xs">
                  {bloodTypeFilter !== "all"
                    ? `No donors found for blood type ${bloodTypeFilter}. Try a different type or broaden your search.`
                    : "No donors are registered yet. Be the first to join!"}
                </p>
              </div>
              <a
                href="/donor/register"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
                data-ocid="search.empty_register_link"
              >
                Register as Donor
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          )}

          {/* Donor list */}
          {!isLoading && !hasError && displayedDonors.length > 0 && (
            <ul
              className="space-y-4 list-none p-0 m-0"
              aria-label="Blood donors"
              data-ocid="search.donor_list"
            >
              {displayedDonors.map((donor, i) => (
  <motion.li
    key={donor.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(i * 0.05, 0.4) }}
  >
    <DonorCard
      donor={donor}
      index={i}
      showDistance={searchTriggered && hasLocation}
    />

    <div className="mt-2 flex justify-end">
      <Button
        variant="destructive"
        onClick={() => {
          if (
            confirm(
              `Mark ${donor.name} as having donated blood today?`
            )
          ) {
            logDonation.mutate(donor.id);
          }
        }}
      >
        Mark Donated
      </Button>
    </div>
  </motion.li>
))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Info Banners ── */}
      <section className="border-t bg-muted/40 py-12">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: Droplets,
              title: "Any Blood Type",
              body: "All 8 blood groups covered — find the exact type your patient needs.",
            },
            {
              icon: MapPin,
              title: "Nearest First",
              body: "Enable location to rank donors by distance so help is never far away.",
            },
            {
              icon: Users,
              title: "Auto Availability",
              body: "Green means ready to donate. Donors auto-reset as available after 4 months.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="heading-md">{title}</h3>
              <p className="body-sm">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
