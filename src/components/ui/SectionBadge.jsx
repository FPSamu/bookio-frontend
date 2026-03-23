export default function SectionBadge({ children, dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-1 text-xs font-semibold text-neutral-700 ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      )}
      {children}
    </span>
  )
}
