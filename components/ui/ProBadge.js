/**
 * "PRO" tag for TrickBook Plus subscribers. Yellow with dark text — never
 * yellow text on a light background (low contrast).
 */
export default function ProBadge({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'px-1.5 text-[9px] leading-[14px]',
    md: 'px-2 text-[10px] leading-4',
    lg: 'px-2.5 text-xs leading-5',
    xl: 'px-3 text-sm leading-6',
  };

  return (
    <span
      className={`inline-block rounded-full bg-yellow-300 font-black tracking-[0.12em] text-[#080908] shadow-[0_0_0_2px_#080908] ${sizes[size] || sizes.md} ${className}`}
      title="TrickBook Plus"
    >
      PRO
    </span>
  );
}
