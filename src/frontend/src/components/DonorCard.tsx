import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import type { DonorPublicView } from "../types";
import { BloodTypeBadge } from "./BloodTypeBadge";
import { StatusBadge } from "./StatusBadge";

interface DonorCardProps {
  donor: DonorPublicView;
  index?: number;
  showDistance?: boolean;
}

export function DonorCard({
  donor,
  index,
  showDistance = true,
}: DonorCardProps) {
  const ocid = index !== undefined ? `donor.item.${index + 1}` : "donor.card";

  return (
    <article className="donor-card flex gap-4" data-ocid={ocid}>
      {/* Avatar with status indicator */}
      <div className="relative flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
          {donor.name.charAt(0).toUpperCase()}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusBadge isAvailable={donor.isAvailable} size="sm" />
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="heading-md truncate">{donor.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <BloodTypeBadge bloodType={donor.bloodType} size="sm" />
              <StatusBadge
                isAvailable={donor.isAvailable}
                showLabel
                size="sm"
              />
            </div>
          </div>
          {showDistance && donor.distanceKm > 0 && (
            <span className="label flex-shrink-0 rounded-md bg-muted px-2 py-1">
              {donor.distanceKm < 1
                ? `${Math.round(donor.distanceKm * 1000)} m`
                : `${donor.distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="body-sm truncate">{donor.address}</span>
        </div>

        {donor.isAvailable && donor.phone && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              data-ocid={
                index !== undefined
                  ? `donor.contact_button.${index + 1}`
                  : "donor.contact_button"
              }
            >
              <a href={`tel:${donor.phone}`} aria-label={`Call ${donor.name}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Contact Donor
              </a>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
