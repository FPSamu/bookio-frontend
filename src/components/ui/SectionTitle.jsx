export default function SectionTitle({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold leading-tight text-neutral-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-neutral-400">{subtitle}</p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex-shrink-0 text-sm font-medium text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline"
        >
          {action.label} →
        </button>
      )}
    </div>
  )
}
