

export const PreviewCornerOrnament = ({ className = '', color }) => (
    <div className={className}>
        <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden="true">
            <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 122C18 80 42 54 84 54" strokeWidth="6" />
                <path d="M34 122C34 90 52 70 84 70" strokeWidth="3.8" opacity="0.84" />
                <path d="M18 96C38 96 52 106 56 122" strokeWidth="3.8" />
                <path d="M18 78C32 78 42 86 48 98" strokeWidth="3.2" opacity="0.78" />
                <path d="M50 52C64 46 76 38 84 26" strokeWidth="3.2" opacity="0.72" />
                <path d="M66 62C76 56 84 48 92 38" strokeWidth="2.8" opacity="0.62" />
            </g>
            <circle cx="20" cy="122" r="4.2" fill={color} />
            <circle cx="84" cy="26" r="3.4" fill={color} opacity="0.82" />
        </svg>
    </div>
);

export const PreviewOrnamentBand = ({ color, className = '' }) => (
    <div className={className}>
        <svg viewBox="0 0 640 24" className="h-full w-full" aria-hidden="true" preserveAspectRatio="none">
            <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 12H90" strokeWidth="2.2" opacity="0.5" />
                <path d="M550 12H640" strokeWidth="2.2" opacity="0.5" />
                <path d="M118 12C128 12 136 4 146 4C156 4 164 12 174 12C164 12 156 20 146 20C136 20 128 12 118 12Z" strokeWidth="2.6" />
                <path d="M190 12C200 12 208 4 218 4C228 4 236 12 246 12C236 12 228 20 218 20C208 20 200 12 190 12Z" strokeWidth="2.6" opacity="0.82" />
                <path d="M262 12C272 12 280 4 290 4C300 4 308 12 318 12C308 12 300 20 290 20C280 20 272 12 262 12Z" strokeWidth="2.6" />
                <path d="M334 12C344 12 352 4 362 4C372 4 380 12 390 12C380 12 372 20 362 20C352 20 344 12 334 12Z" strokeWidth="2.6" opacity="0.82" />
                <path d="M406 12C416 12 424 4 434 4C444 4 452 12 462 12C452 12 444 20 434 20C424 20 416 12 406 12Z" strokeWidth="2.6" />
                <path d="M478 12C488 12 496 4 506 4C516 4 524 12 534 12C524 12 516 20 506 20C496 20 488 12 478 12Z" strokeWidth="2.6" opacity="0.82" />
            </g>
            <circle cx="102" cy="12" r="2.6" fill={color} />
            <circle cx="538" cy="12" r="2.6" fill={color} />
        </svg>
    </div>
);

export const PreviewTundukSeal = ({ primaryColor, accentColor }) => (
    <svg viewBox="0 0 220 220" className="h-10 w-10" aria-hidden="true">
        <defs>
            <radialGradient id="previewSealGlow" cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#FFF8D9" />
                <stop offset="40%" stopColor={accentColor} />
                <stop offset="100%" stopColor="#8F641A" />
            </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="108" fill="url(#previewSealGlow)" />
        <circle cx="110" cy="110" r="93" fill="none" stroke={primaryColor} strokeOpacity="0.42" strokeWidth="4" />
        <circle cx="110" cy="110" r="64" fill="none" stroke={primaryColor} strokeOpacity="0.56" strokeWidth="4" />
        <circle cx="110" cy="110" r="18" fill="none" stroke={primaryColor} strokeOpacity="0.7" strokeWidth="4" />
        <g stroke={primaryColor} strokeOpacity="0.76" strokeWidth="4.2" strokeLinecap="round">
            <line x1="46" y1="110" x2="174" y2="110" />
            <line x1="110" y1="46" x2="110" y2="174" />
            <line x1="66" y1="66" x2="154" y2="154" />
            <line x1="154" y1="66" x2="66" y2="154" />
            <line x1="82" y1="54" x2="138" y2="166" />
            <line x1="138" y1="54" x2="82" y2="166" />
            <line x1="54" y1="82" x2="166" y2="138" />
            <line x1="54" y1="138" x2="166" y2="82" />
        </g>
        <path
            d="M110 16C124 30 138 36 160 40C146 50 138 62 134 78C126 60 118 50 104 40C118 34 126 28 110 16Z"
            fill="#FFF4CD"
            opacity="0.85"
        />
        <circle cx="110" cy="110" r="101" fill="none" stroke="#FFF6E0" strokeOpacity="0.72" strokeWidth="2" />
    </svg>
);
