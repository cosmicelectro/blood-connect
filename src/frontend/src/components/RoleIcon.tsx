import React from "react";
import { User, Store, ShieldCheck, Users } from "lucide-react";

export type Role = "donor" | "shopkeeper" | "admin" | "user";

/**
 * RoleIcon renders a distinctive icon for each user role.
 * Uses lucide-react icons for a modern, lightweight look.
 */
export function RoleIcon({ role, className }: { role: Role; className?: string }) {
  const size = 20;
  switch (role) {
    case "donor":
      return <User className={className} size={size} />; // donor as a simple user silhouette
    case "shopkeeper":
      return <Store className={className} size={size} />; // shopkeeper represented by a store icon
    case "admin":
      return <ShieldCheck className={className} size={size} />; // admin with shield-check
    case "user":
    default:
      return <Users className={className} size={size} />; // generic user group icon
  }
}
