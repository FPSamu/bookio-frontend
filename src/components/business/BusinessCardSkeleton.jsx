function Bone({ className }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-100 ${className}`} />
}

export default function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="h-44 w-full animate-pulse bg-neutral-100" />
      <div className="flex flex-col gap-3 p-4">
        <Bone className="h-[15px] w-3/4" />
        <div className="flex items-center gap-1.5">
          <Bone className="h-3.5 w-20 rounded-full" />
          <Bone className="h-3 w-8" />
        </div>
        <Bone className="h-3 w-2/5" />
        <Bone className="mt-1 h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}
