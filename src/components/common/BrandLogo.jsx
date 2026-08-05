// ============================================================
// BrandLogo.jsx — Shared TransitOps mark (favicon / app logo)
// ============================================================

const LOGO_SRC = '/logo.png';

/**
 * BrandLogo — circular TransitOps mark used in nav, login, splash.
 * @param {'sm'|'md'|'lg'|'xl'} [size]
 * @param {string} [className]
 */
export default function BrandLogo({ size = 'md', className = '' }) {
  const dims = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  }[size] || 'w-10 h-10';

  return (
    <img
      src={LOGO_SRC}
      alt="TransitOps"
      width={96}
      height={96}
      className={`${dims} object-contain shrink-0 ${className}`.trim()}
      decoding="async"
    />
  );
}
