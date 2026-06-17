import { Droplets, Shield, Store, User } from "lucide-react";
import React from "react";

export type Role = "donor" | "shopkeeper" | "admin" | "user";

/**
 * RoleIcon renders a distinctive icon for each user role.
 * Uses lucide-react icons for a modern, lightweight look.
 */
export function RoleIcon({
  role,
  className,
}: { role: Role; className?: string }) {
  const size = 20;
  switch (role) {
    case "donor":
      return <Droplets className={className} size={size} />; // donor as droplets icon
    case "shopkeeper":
      return <Store className={className} size={size} />; // shopkeeper represented by a store icon
    case "admin":
      return <Shield className={className} size={size} />; // admin with shield
    case "user":
    case "viewer":
    default:
      return <User className={className} size={size} />; // generic user silhouette
  }
}
