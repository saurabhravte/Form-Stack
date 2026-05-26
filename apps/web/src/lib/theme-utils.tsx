/**
 * Shared helpers for the themed form renderer.
 *
 *  - isLightColor / readableOn: keep text legible on any theme background
 *    by computing perceptual luminance and choosing black/white text.
 *  - getThemeDoodle: returns a category-appropriate decorative SVG to use
 *    as a watermark behind themed forms.
 *
 * Designed so every theme — including the dark/black ones where text used
 * to disappear — gets readable copy out of the box.
 */

/** Returns true when the given hex color is light enough to need dark text. */
export function isLightColor(hex?: string): boolean {
  if (!hex) return false;
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceptual luminance — > 160 means a light surface.
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}

/**
 * Pick a readable foreground color for a given background.
 * Honors any `preferred` foreground supplied by the theme — but only if it
 * actually has enough contrast against the background. Otherwise falls back
 * to near-black or near-white.
 */
export function readableOn(background: string, preferred?: string): string {
  const lightBg = isLightColor(background);
  if (preferred) {
    const preferredIsLight = isLightColor(preferred);
    // If the theme's foreground would clash, override it.
    if (lightBg && preferredIsLight) return '#111111';
    if (!lightBg && !preferredIsLight) return '#FAFAFA';
    return preferred;
  }
  return lightBg ? '#111111' : '#FAFAFA';
}

/* ─────────────────────────────────────────────────────────────
   Doodle backgrounds — one playful SVG per theme category.
   They render as full-bleed watermarks behind themed forms,
   tinted by the theme's foreground color via `currentColor`.
   ───────────────────────────────────────────────────────────── */

type DoodleProps = { className?: string };

function NatureDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        <path d="M50 250 Q70 200 90 250" />
        <path d="M70 250 L70 220" />
        <path d="M300 270 Q320 220 340 270" />
        <path d="M320 270 L320 235" />
        <circle cx="350" cy="60" r="20" />
        <path d="M340 50 L360 70 M360 50 L340 70" />
        <path d="M30 100 Q60 80 90 100 Q120 80 150 100" />
        <path d="M250 50 Q280 30 310 50" />
        <circle cx="200" cy="40" r="2" fill="currentColor" />
        <circle cx="220" cy="60" r="2" fill="currentColor" />
        <circle cx="180" cy="80" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}

function FestivalDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        {/* lanterns */}
        <ellipse cx="80" cy="80" rx="18" ry="22" />
        <path d="M80 58 L80 50 M80 102 L80 110" strokeLinecap="round" />
        <ellipse cx="320" cy="120" rx="18" ry="22" />
        <path d="M320 98 L320 90 M320 142 L320 150" strokeLinecap="round" />
        {/* sparkles */}
        <g strokeLinecap="round">
          <path d="M180 60 L180 80 M170 70 L190 70" />
          <path d="M250 200 L250 220 M240 210 L260 210" />
          <path d="M50 230 L50 250 M40 240 L60 240" />
        </g>
        {/* string */}
        <path d="M0 30 Q200 60 400 30" strokeDasharray="4 6" />
      </g>
    </svg>
  );
}

function JapanDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        {/* sakura branches */}
        <path d="M0 60 Q80 40 160 70 Q240 100 340 60" strokeLinecap="round" />
        {/* blossoms */}
        {[
          [60, 50], [120, 60], [200, 80], [270, 90], [330, 65],
          [40, 220], [150, 250], [280, 230], [350, 200],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-5" rx="3" ry="6" transform={`rotate(${a})`} />
            ))}
            <circle r="1.5" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function IndiaDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        {/* mandala-ish */}
        <g transform="translate(80 80)">
          {[0, 45, 90, 135].map((a) => (
            <ellipse key={a} cx="0" cy="0" rx="30" ry="10" transform={`rotate(${a})`} />
          ))}
          <circle r="6" />
        </g>
        <g transform="translate(320 220)">
          {[0, 60, 120].map((a) => (
            <ellipse key={a} cx="0" cy="0" rx="25" ry="8" transform={`rotate(${a})`} />
          ))}
        </g>
        {/* paisley */}
        <path d="M200 150 Q220 130 230 150 Q230 180 210 180 Q190 175 200 150 Z" />
        <circle cx="215" cy="155" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}

function TechDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        {/* circuit lines */}
        <path d="M0 100 L120 100 L120 60 L240 60" />
        <path d="M280 60 L400 60" strokeDasharray="3 5" />
        <path d="M0 200 L80 200 L80 240 L200 240 L200 200 L300 200" />
        <circle cx="120" cy="100" r="4" />
        <circle cx="240" cy="60" r="4" />
        <circle cx="80" cy="200" r="4" />
        <circle cx="200" cy="240" r="4" />
        <rect x="260" y="180" width="40" height="40" rx="3" />
        <path d="M260 190 L256 190 M260 200 L256 200 M260 210 L256 210" />
      </g>
    </svg>
  );
}

function GamesDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        {/* pixel hearts */}
        <g transform="translate(60 60)">
          <rect x="0" y="0" width="6" height="6" /><rect x="6" y="0" width="6" height="6" />
          <rect x="18" y="0" width="6" height="6" /><rect x="24" y="0" width="6" height="6" />
          <rect x="0" y="6" width="30" height="6" />
          <rect x="6" y="12" width="18" height="6" />
          <rect x="12" y="18" width="6" height="6" />
        </g>
        {/* controller outline */}
        <path d="M260 180 Q260 160 280 160 L340 160 Q360 160 360 180 L360 220 Q360 240 340 240 L280 240 Q260 240 260 220 Z" />
        <circle cx="290" cy="200" r="6" /><circle cx="330" cy="200" r="6" />
        {/* stars */}
        <path d="M200 80 L204 92 L216 92 L206 99 L210 111 L200 104 L190 111 L194 99 L184 92 L196 92 Z" />
      </g>
    </svg>
  );
}

function MoviesDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5">
        <rect x="40" y="60" width="120" height="80" rx="6" />
        <circle cx="60" cy="80" r="4" /><circle cx="60" cy="120" r="4" />
        <circle cx="140" cy="80" r="4" /><circle cx="140" cy="120" r="4" />
        <path d="M180 100 L220 100 L210 90 M220 100 L210 110" strokeLinecap="round" strokeLinejoin="round" />
        {/* clapper */}
        <path d="M240 200 L360 200 L360 260 L240 260 Z" />
        <path d="M240 200 L260 180 L300 180 L280 200 M280 200 L300 180 L340 180 L320 200" />
      </g>
    </svg>
  );
}

function AnimeDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        {/* speed lines */}
        <path d="M0 80 L60 90 M0 100 L80 110 M0 130 L50 140" />
        <path d="M340 60 L400 70 M320 90 L400 100 M350 120 L400 130" />
        {/* sparkles */}
        {[
          [100, 220], [200, 60], [280, 240], [180, 180],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <path d="M0 -10 L0 10 M-10 0 L10 0" />
            <circle r="1.5" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function DefaultDoodle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className ?? 'w-full h-full'}>
      <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round">
        {/* envelopes */}
        <rect x="40" y="60" width="60" height="40" rx="2" />
        <path d="M40 60 L70 85 L100 60" />
        <rect x="300" y="200" width="60" height="40" rx="2" />
        <path d="M300 200 L330 225 L360 200" />
        {/* paper plane */}
        <path d="M200 100 L260 120 L210 130 L200 160 L195 130 L160 130 Z" />
        {/* dashed flight path */}
        <path d="M40 100 Q160 60 200 100" strokeDasharray="3 5" />
      </g>
    </svg>
  );
}

const DOODLES: Record<string, React.ComponentType<DoodleProps>> = {
  nature: NatureDoodle,
  festival: FestivalDoodle,
  japan: JapanDoodle,
  india: IndiaDoodle,
  season: NatureDoodle,
  os: TechDoodle,
  tech: TechDoodle,
  games: GamesDoodle,
  movies: MoviesDoodle,
  anime: AnimeDoodle,
  startups: TechDoodle,
  events: FestivalDoodle,
  community: DefaultDoodle,
  default: DefaultDoodle,
};

/** Returns the doodle component appropriate for a theme category. */
export function getThemeDoodle(category?: string): React.ComponentType<DoodleProps> {
  return DOODLES[category ?? 'default'] ?? DefaultDoodle;
}