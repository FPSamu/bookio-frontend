function Bone({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 ${className}`} />
  )
}

export default function ReservationTimeSlotSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

      {/* Acento */}
      <div className="w-1 flex-shrink-0 animate-pulse bg-neutral-200" />

      {/* Hora */}
      <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center gap-1.5 border-r border-neutral-100 py-4 px-2">
        <Bone className="h-4 w-10" />
        <Bone className="h-2.5 w-7" />
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-16 rounded-full" />
        </div>
        <Bone className="h-3 w-40" />
      </div>
    </div>
  )
}
