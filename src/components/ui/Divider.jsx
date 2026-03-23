export default function Divider({ label, className = '' }) {
  if (!label) {
    return <hr className={`border-t border-neutral-200 ${className}`} />
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex-1 border-t border-neutral-200" />
      <span className="text-xs font-medium text-neutral-400 select-none whitespace-nowrap">
        {label}
      </span>
      <span className="flex-1 border-t border-neutral-200" />
    </div>
  )
}
