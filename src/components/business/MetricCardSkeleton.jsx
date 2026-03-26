function Bone({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 ${className}`} />
  )
}

export default function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <Bone className="h-2.5 w-20" />
      <Bone className="h-6 w-16" />
      <Bone className="h-2.5 w-14" />
    </div>
  )
}
