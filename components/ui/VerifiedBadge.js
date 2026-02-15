/**
 * Blue verified checkmark badge for TrickBook Plus subscribers
 * Similar to X/Meta verified badges
 */
export default function VerifiedBadge({ size = 'md', className = '' }) {
  const sizes = {
    sm: { badge: 14, check: 8 },
    md: { badge: 18, check: 10 },
    lg: { badge: 24, check: 14 },
    xl: { badge: 32, check: 18 },
  };

  const { badge, check } = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-[#1DA1F2] ${className}`}
      style={{ width: badge, height: badge }}
      title="TrickBook Plus"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: check, height: check }}
      >
        <path
          d="M9 12.75L11.25 15L15 9.75"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
