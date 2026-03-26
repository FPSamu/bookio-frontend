function Bone({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 ${className}`} />
  )
}

export default function ReservationCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

      {/* Bloque de fecha */}
      <div className="flex w-[68px] flex-shrink-0 flex-col items-center justify-center gap-1.5 border-r border-neutral-100 bg-neutral-50 py-4">
        <Bone className="h-2.5 w-7" />
        <Bone className="h-7 w-8" />
        <Bone className="h-2.5 w-6" />
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <Bone className="h-4 w-2/5" />
          <Bone className="h-4 w-16 rounded-full" />
        </div>
        <Bone className="h-3 w-1/2" />
        <Bone className="h-3 w-1/3" />
        <Bone className="mt-1 h-3 w-24" />
      </div>
    </div>
  )
}
