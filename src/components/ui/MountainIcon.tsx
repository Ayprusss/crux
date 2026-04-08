import React from "react"

interface MountainIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function MountainIcon({ className, ...props }: MountainIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Three minimalist geometric peaks */}
      <path d="M2 20L9 6L16 20H2Z" />
      <path d="M12 20L18 10L24 20H12Z" />
      <path d="M7 20L12 11L17 20" />
      <circle cx="20" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
