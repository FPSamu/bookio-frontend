function Bone({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200 ${className}`} />
  )
}

export default function FavoriteCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      {/* Imagen */}
      <div className="h-44 w-full animate-pulse bg-neutral-200" />

      {/* Contenido */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-4 w-12 rounded-full" />
        </div>
        <Bone className="h-3 w-1/2" />
        <Bone className="h-3 w-2/5" />
        <div className="flex gap-1.5">
          <Bone className="h-5 w-14 rounded-full" />
          <Bone className="h-5 w-12 rounded-full" />
        </div>
        <Bone className="mt-1 h-9 w-full rounded-full" />
      </div>
    </div>
  )
}
