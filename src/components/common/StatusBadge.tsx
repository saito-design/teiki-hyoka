interface StatusBadgeProps {
  label: string;
  color?: string;
  variant?: 'default' | 'outline';
}

export function StatusBadge({
  label,
  color = '#6b7280',
  variant = 'default',
}: StatusBadgeProps) {
  if (variant === 'outline') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
        style={{ borderColor: color, color }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
