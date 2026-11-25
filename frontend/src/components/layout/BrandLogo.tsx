interface BrandLogoProps {
  variant?: 'light' | 'dark'
}

export function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  const isDarkBg = variant === 'dark'
  const markBg = isDarkBg ? '#F7F4EE' : '#0D2D23'
  const markStroke = isDarkBg ? '#0D2D23' : '#F7F4EE'
  const textColor = isDarkBg ? 'text-[#F7F4EE]' : 'text-[#1F1B16]'

  return (
    <span className="inline-flex items-center gap-3 select-none">
      {/* Custom DS Monogram SVG */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 block"
      >
        <rect width="36" height="36" rx="9" fill={markBg} />
        {/* Architectural D */}
        <path
          d="M9.5 10.5H14.5C18.366 10.5 21.5 13.634 21.5 17.5C21.5 21.366 18.366 24.5 14.5 24.5H9.5V10.5Z"
          stroke={markStroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Interlocking S curve */}
        <path
          d="M26.5 13.2C25.9 11.7 24.4 10.7 22.6 10.7C20.4 10.7 18.8 12.1 18.8 13.9C18.8 15.8 20.4 16.7 22.7 17.3C25.1 17.9 26.8 18.9 26.8 21.1C26.8 23.2 25 24.7 22.5 24.7C20.5 24.7 18.9 23.7 18.2 22.2"
          stroke={markStroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <span className={`font-brand text-[25px] font-semibold tracking-[-0.02em] leading-[1] -translate-y-[1px] ${textColor}`}>
        DreamShops
      </span>
    </span>
  )
}
