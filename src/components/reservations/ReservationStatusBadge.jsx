const STATUS_MAP = {
  confirmed: {
    label: 'Confirmada',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pendiente',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cancelled: {
    label: 'Cancelada',
    classes: 'bg-red-50 text-red-600 border-red-200',
  },
}

export default function ReservationStatusBadge({ status }) {
  const { label, classes } = STATUS_MAP[status] ?? STATUS_MAP.pending

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${classes}`}
    >
      {label}
    </span>
  )
}
