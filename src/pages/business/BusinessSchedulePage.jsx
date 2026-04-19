import { useState, useEffect, useCallback } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import SectionTitle from '../../components/ui/SectionTitle'
import Button from '../../components/ui/Button'
import {
  getMySchedules, upsertDay, removeDay,
  addBlockedSlot, removeBlockedSlot,
} from '../../services/schedules'

// ── Constantes ────────────────────────────────────────────────────────────────

const DAYS = [
  { dow: 1, label: 'Lunes' },
  { dow: 2, label: 'Martes' },
  { dow: 3, label: 'Miércoles' },
  { dow: 4, label: 'Jueves' },
  { dow: 5, label: 'Viernes' },
  { dow: 6, label: 'Sábado' },
  { dow: 0, label: 'Domingo' },
]

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

function today() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
        checked ? 'bg-neutral-900' : 'bg-neutral-200',
      ].join(' ')}
    >
      <span className={[
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      ].join(' ')} />
    </button>
  )
}

// ── Fila de un día ────────────────────────────────────────────────────────────

function DayRow({ dow, label, schedule, onSave, onRemove }) {
  const isOpen = !!schedule
  const [start, setStart] = useState(schedule?.start_time ?? '09:00')
  const [end,   setEnd]   = useState(schedule?.end_time   ?? '18:00')
  const [dirty,   setDirty]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const handleToggle = async (open) => {
    if (!open && schedule) {
      setSaving(true)
      try { await onRemove(schedule.id) } catch { setError('Error al guardar') }
      finally { setSaving(false) }
    }
    if (open && !schedule) {
      setSaving(true)
      try { await onSave({ dayOfWeek: dow, startTime: start, endTime: end }); setDirty(false) }
      catch { setError('Error al guardar') }
      finally { setSaving(false) }
    }
  }

  const handleSave = async () => {
    if (start >= end) { setError('La hora de apertura debe ser antes del cierre'); return }
    setError('')
    setSaving(true)
    try { await onSave({ dayOfWeek: dow, startTime: start, endTime: end }); setDirty(false) }
    catch { setError('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <Toggle checked={isOpen} onChange={handleToggle} />
        <span className="w-24 text-sm font-medium text-neutral-700">{label}</span>

        {isOpen && (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => { setStart(e.target.value); setDirty(true) }}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <span className="text-xs text-neutral-400">a</span>
            <input
              type="time"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setDirty(true) }}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            )}
          </div>
        )}

        {!isOpen && (
          <span className="text-xs text-neutral-400">Cerrado</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 pl-12">{error}</p>}
    </div>
  )
}

// ── Formulario de bloqueo ─────────────────────────────────────────────────────

function BlockForm({ onAdded }) {
  const [date,      setDate]      = useState(today())
  const [fullDay,   setFullDay]   = useState(true)
  const [startTime, setStartTime] = useState('12:00')
  const [endTime,   setEndTime]   = useState('13:00')
  const [reason,    setReason]    = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullDay && startTime >= endTime) {
      setError('La hora de inicio debe ser antes de la hora de fin')
      return
    }
    setError('')
    setSaving(true)
    try {
      const slot = await addBlockedSlot({
        date,
        startTime: fullDay ? null : startTime,
        endTime:   fullDay ? null : endTime,
        reason:    reason.trim() || null,
      })
      onAdded(slot)
      setReason('')
    } catch {
      setError('No se pudo agregar el bloqueo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4" noValidate>
      <p className="text-sm font-semibold text-neutral-700">Nuevo bloqueo</p>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500">Fecha</label>
          <input
            type="date"
            value={date}
            min={today()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            required
          />
        </div>

        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 cursor-pointer pb-1.5">
            <input
              type="checkbox"
              checked={fullDay}
              onChange={(e) => setFullDay(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
            />
            <span className="text-sm text-neutral-700">Todo el día</span>
          </label>
        </div>

        {!fullDay && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Desde</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">Hasta</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-xs font-medium text-neutral-500">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Vacaciones, mantenimiento…"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : 'Agregar bloqueo'}
        </Button>
      </div>
    </form>
  )
}

// ── Fila de bloqueo existente ─────────────────────────────────────────────────

function BlockRow({ slot, onRemoved }) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    setRemoving(true)
    try { await removeBlockedSlot(slot.id); onRemoved(slot.id) }
    catch { setRemoving(false) }
  }

  const timeLabel = slot.start_time && slot.end_time
    ? `${slot.start_time} – ${slot.end_time}`
    : 'Todo el día'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-neutral-900">{formatDate(slot.date)}</span>
        <span className="text-xs text-neutral-400">
          {timeLabel}{slot.reason ? ` · ${slot.reason}` : ''}
        </span>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        className="flex-shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        {removing ? '…' : 'Eliminar'}
      </button>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BusinessSchedulePage() {
  const [scheduleMap,  setScheduleMap]  = useState({})  // { dow: schedule }
  const [blockedSlots, setBlockedSlots] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      try {
        const { schedules, blockedSlots: blocks } = await getMySchedules()
        if (cancelled) return
        const map = {}
        schedules.forEach((s) => { map[s.day_of_week] = s })
        setScheduleMap(map)
        setBlockedSlots(blocks)
      } catch (err) {
        console.error('Error cargando horarios:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  const handleSave = useCallback(async ({ dayOfWeek, startTime, endTime }) => {
    const saved = await upsertDay({ dayOfWeek, startTime, endTime })
    setScheduleMap((prev) => ({ ...prev, [dayOfWeek]: saved }))
  }, [])

  const handleRemoveDay = useCallback(async (id) => {
    await removeDay(id)
    setScheduleMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((dow) => {
        if (next[dow]?.id === id) delete next[dow]
      })
      return next
    })
  }, [])

  const handleBlockAdded = useCallback((slot) => {
    setBlockedSlots((prev) => [...prev, slot].sort((a, b) => a.date.localeCompare(b.date)))
  }, [])

  const handleBlockRemoved = useCallback((id) => {
    setBlockedSlots((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return (
    <BusinessLayout>

      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Horarios</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Define tu horario semanal y marca los días o horas en los que no tendrás disponibilidad.
        </p>
      </section>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* ── Horario semanal ───────────────────────────────────────── */}
          <section>
            <SectionTitle
              title="Horario semanal"
              subtitle="Activa los días que atiendes y define el horario de apertura y cierre."
              className="mb-4"
            />
            <div className="flex flex-col gap-2">
              {DAYS.map(({ dow, label }) => (
                <DayRow
                  key={dow}
                  dow={dow}
                  label={label}
                  schedule={scheduleMap[dow] ?? null}
                  onSave={handleSave}
                  onRemove={handleRemoveDay}
                />
              ))}
            </div>
          </section>

          {/* ── Bloqueos ──────────────────────────────────────────────── */}
          <section>
            <SectionTitle
              title="Días y horas bloqueadas"
              subtitle="Agrega fechas específicas en las que no tendrás disponibilidad."
              className="mb-4"
            />
            <div className="flex flex-col gap-3">
              <BlockForm onAdded={handleBlockAdded} />
              {blockedSlots.length === 0 ? (
                <p className="text-sm text-neutral-400 py-2">No tienes bloqueos programados.</p>
              ) : (
                blockedSlots.map((slot) => (
                  <BlockRow key={slot.id} slot={slot} onRemoved={handleBlockRemoved} />
                ))
              )}
            </div>
          </section>

        </div>
      )}

    </BusinessLayout>
  )
}
