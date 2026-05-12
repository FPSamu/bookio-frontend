import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientLayout from '../../layouts/ClientLayout'
import SearchBar from '../../components/search/SearchBar'
import RatingFilter from '../../components/search/RatingFilter'
import BusinessGrid from '../../components/business/BusinessGrid'
import { getBusinesses, getRecommendedBusinesses } from '../../services/businesses'

const ALL = 'all'

/* ── Icons ──────────────────────────────────────────────────────────────── */
const S = (p) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...p} />
)

const Icons = {
  restaurant: () => <S><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6h3.5A1.5 1.5 0 0 1 21 14.5v.5"/><path d="M18 22v-3"/></S>,
  spa:        () => <S><path d="M12 22c-4.97 0-9-2.69-9-6 0-1.5.83-2.9 2.2-3.93C6.6 10.9 8.13 9.77 9 8c.7-1.4.9-3 .9-5 0 0 3.1 1 4.1 4 .5 1.5.5 3 .3 4.5-.2 1.4-.7 2.7-1.3 3.5"/><path d="M12 22c4.97 0 9-2.69 9-6 0-1.5-.83-2.9-2.2-3.93"/><path d="M12 15c0 2.2-1.3 4-3 5"/></S>,
  salon:      () => <S><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></S>,
  barbershop: () => <S><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></S>,
  medical:    () => <S><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></S>,
  other:      () => <S><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></S>,
}

/* ── Category config ────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurantes', bg: 'bg-orange-50',   active: 'bg-orange-500',   ring: 'ring-orange-300',   text: 'text-orange-500' },
  { id: 'spa',        label: 'Spas',         bg: 'bg-emerald-50',  active: 'bg-emerald-600',  ring: 'ring-emerald-300',  text: 'text-emerald-600' },
  { id: 'salon',      label: 'Salones',      bg: 'bg-violet-50',   active: 'bg-violet-600',   ring: 'ring-violet-300',   text: 'text-violet-600' },
  { id: 'barbershop', label: 'Barberías',    bg: 'bg-amber-50',    active: 'bg-amber-500',    ring: 'ring-amber-300',    text: 'text-amber-600' },
  { id: 'medical',    label: 'Médicos',      bg: 'bg-sky-50',      active: 'bg-sky-500',      ring: 'ring-sky-300',      text: 'text-sky-600' },
  { id: 'other',      label: 'Otros',        bg: 'bg-neutral-100', active: 'bg-neutral-500',  ring: 'ring-neutral-300',  text: 'text-neutral-500' },
]

/* ── Recommended card ───────────────────────────────────────────────────── */
function RecommendedCard({ business, onClick }) {
  const cfg = {
    restaurant: 'from-orange-100 to-amber-50',
    spa:        'from-emerald-100 to-teal-50',
    salon:      'from-violet-100 to-purple-50',
    barbershop: 'from-amber-100 to-yellow-50',
    medical:    'from-sky-100 to-blue-50',
    other:      'from-neutral-100 to-neutral-50',
  }[business.type] ?? 'from-neutral-100 to-neutral-50'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-48 flex-shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-200 active:scale-[0.97] hover:shadow-md hover:-translate-y-0.5 text-left"
    >
      <div className="relative h-28 w-full">
        {business.imageUrl ? (
          <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${cfg} flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-neutral-900">{business.name}</p>
        {business.location && (
          <p className="mt-0.5 truncate text-xs text-neutral-400">{business.location}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-amber-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-xs font-bold text-neutral-800">{business.rating.toFixed(1)}</span>
          <span className="text-[11px] text-neutral-400">({business.reviewCount})</span>
        </div>
      </div>
    </button>
  )
}

/* ── Close chip ─────────────────────────────────────────────────────────── */
function X() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate()
  const [businesses,       setBusinesses]       = useState([])
  const [recommended,      setRecommended]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [searchQuery,      setSearchQuery]      = useState('')
  const [activeSearch,     setActiveSearch]     = useState('')
  const [selectedType,     setSelectedType]     = useState(ALL)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [minRating,        setMinRating]        = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const [{ businesses: biz }, rec] = await Promise.all([
          getBusinesses({ limit: 100 }),
          getRecommendedBusinesses(),
        ])
        if (!cancelled) { setBusinesses(biz); setRecommended(rec) }
      } catch (err) {
        console.error('Error cargando negocios:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [])

  const handleTypeChange = (type) => { setSelectedType(type); setSelectedCategory(ALL) }
  const handleClearFilters = () => {
    setActiveSearch(''); setSearchQuery('')
    setSelectedType(ALL); setSelectedCategory(ALL); setMinRating(null)
  }

  const filteredBusinesses = useMemo(() => businesses.filter((b) => {
    const matchesSearch = !activeSearch || b.name.toLowerCase().includes(activeSearch.toLowerCase())
    const matchesType   = selectedType === ALL || b.type === selectedType
    const matchesRating = minRating === null    || b.rating >= minRating
    return matchesSearch && matchesType && matchesRating
  }), [businesses, activeSearch, selectedType, minRating])

  const isFiltering  = !!(activeSearch || selectedType !== ALL || minRating !== null)
  const activeCat = CATEGORIES.find(c => c.id === selectedType)

  return (
    <ClientLayout>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="mb-7 animate-slide-up">
        <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
          ¿Qué quieres reservar hoy?
        </h1>
        <div className="mt-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={(q) => setActiveSearch(q)}
            placeholder="Busca restaurantes, spas, barberías…"
          />
        </div>
      </section>

      {/* ── Category grid ──────────────────────────────────────────────── */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const isActive = selectedType === cat.id
            const Icon = Icons[cat.id]
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTypeChange(isActive ? ALL : cat.id)}
                className="group/cat flex flex-col items-center gap-2 focus:outline-none"
              >
                <div className={[
                  'relative flex h-[52px] w-full max-w-[52px] items-center justify-center rounded-2xl transition-all duration-200',
                  isActive
                    ? `${cat.active} text-white shadow-md scale-105`
                    : `${cat.bg} ${cat.text} group-hover/cat:scale-105 group-hover/cat:shadow-sm`,
                ].join(' ')}>
                  <Icon />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-white shadow" style={{ background: 'currentColor' }} />
                  )}
                </div>
                <span className={[
                  'text-[11px] font-medium leading-tight text-center',
                  isActive ? 'text-neutral-900 font-semibold' : 'text-neutral-500',
                ].join(' ')}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <section className="mb-6 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap items-center gap-3">
          <RatingFilter value={minRating} onChange={setMinRating} />

          {(activeCat || minRating !== null) && (
            <div className="hidden sm:block h-4 w-px bg-neutral-200" />
          )}

          {activeCat && (
            <button
              type="button"
              onClick={() => handleTypeChange(ALL)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${activeCat.bg} ${activeCat.text} border-transparent hover:opacity-80`}
            >
              {activeCat.label}
              <X />
            </button>
          )}

          {minRating !== null && (
            <button
              type="button"
              onClick={() => setMinRating(null)}
              className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
            >
              ★ {minRating}+
              <X />
            </button>
          )}
        </div>
      </section>

      {/* ── Recommended ────────────────────────────────────────────────── */}
      {!isFiltering && (recommended.length > 0 || loading) && (
        <section className="mb-8 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Recomendados</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Mejor calificados cerca de ti</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="w-48 h-[172px] flex-shrink-0 rounded-2xl bg-neutral-100 animate-pulse" />
                ))
              : recommended.map((b) => (
                  <RecommendedCard key={b.id} business={b} onClick={() => navigate(`/business/${b.id}`)} />
                ))
            }
          </div>
        </section>
      )}

      {/* ── Separator ──────────────────────────────────────────────────── */}
      {!isFiltering && <div className="mb-6 h-px bg-neutral-100" />}

      {/* ── Business grid ──────────────────────────────────────────────── */}
      <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {isFiltering
                ? activeCat ? activeCat.label : 'Resultados'
                : 'Todos los negocios'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isFiltering
                ? `${filteredBusinesses.length} negocio${filteredBusinesses.length !== 1 ? 's' : ''} encontrado${filteredBusinesses.length !== 1 ? 's' : ''}`
                : 'Restaurantes, spas, barberías, salones y más'}
            </p>
          </div>
          {isFiltering && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-neutral-400 underline-offset-2 hover:underline hover:text-neutral-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <BusinessGrid
          businesses={filteredBusinesses}
          loading={loading}
          skeletonCount={6}
          emptyMessage="No encontramos negocios con esos filtros."
        />
      </section>

    </ClientLayout>
  )
}
