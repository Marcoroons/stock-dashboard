import { useId } from 'react'

export function MadyLogo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '-')
  return (
    <svg
      viewBox="0 0 100 112"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mady Finance logo"
    >
      <defs>
        <mask id={id}>
          <ellipse cx="28" cy="27" rx="22" ry="26" fill="white" />
          <ellipse cx="72" cy="27" rx="22" ry="26" fill="white" />
          <ellipse cx="50" cy="75" rx="45" ry="35" fill="white" />
          <path d="M13,77 C17,67 29,63 39,69 C36,80 23,83 13,77Z" fill="black" />
          <path d="M87,77 C83,67 71,63 61,69 C64,80 77,83 87,77Z" fill="black" />
          <polygon points="50,87 54,91 50,95 46,91" fill="black" />
        </mask>
      </defs>
      <rect width="100" height="112" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  )
}
