interface BloodTypeBadgeProps {
  bloodType: string;
  size?: "sm" | "md" | "lg";
}

const bloodTypeColors: Record<string, string> = {
  "A+": "bg-primary/10 text-primary border-primary/30",
  "A-": "bg-primary/10 text-primary border-primary/30",
  "B+": "bg-orange-50 text-orange-700 border-orange-200",
  "B-": "bg-orange-50 text-orange-700 border-orange-200",
  "AB+": "bg-purple-50 text-purple-700 border-purple-200",
  "AB-": "bg-purple-50 text-purple-700 border-purple-200",
  "O+": "bg-blue-50 text-blue-700 border-blue-200",
  "O-": "bg-blue-50 text-blue-700 border-blue-200",
};

export function BloodTypeBadge({
  bloodType,
  size = "md",
}: BloodTypeBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 font-semibold",
    md: "text-sm px-2 py-0.5 font-bold",
    lg: "text-base px-3 py-1 font-bold",
  };

  const colorClass =
    bloodTypeColors[bloodType] ??
    "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={`inline-flex items-center rounded border ${colorClass} ${sizeClasses[size]} font-mono tracking-wide`}
    >
      {bloodType}
    </span>
  );
}
