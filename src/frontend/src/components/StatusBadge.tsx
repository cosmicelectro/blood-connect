interface StatusBadgeProps {
  isAvailable: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({
  isAvailable,
  showLabel = false,
  size = "md",
}: StatusBadgeProps) {
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const ringSize = size === "sm" ? "ring-1" : "ring-2";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`status-badge ${dotSize} ${ringSize} ring-offset-background ${
          isAvailable
            ? "bg-accent ring-accent"
            : "bg-destructive ring-destructive"
        }`}
        aria-label={isAvailable ? "Available" : "Unavailable"}
        role="status"
      />
      {showLabel && (
        <span
          className={`text-xs font-medium ${
            isAvailable ? "text-accent" : "text-destructive"
          }`}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      )}
    </span>
  );
}
