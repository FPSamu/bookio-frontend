import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientLayout from '../../layouts/ClientLayout'
import SearchBar from '../../components/search/SearchBar'
import BusinessTypeFilter from '../../components/search/BusinessTypeFilter'
import CategoryFilter, { CATEGORIES_BY_TYPE } from '../../components/search/CategoryFilter'
import RatingFilter from '../../components/search/RatingFilter'
import BusinessGrid from '../../components/business/BusinessGrid'
import SectionTitle from '../../components/ui/SectionTitle'
import { getBusinesses, getRecommendedBusinesses } from '../../services/businesses'

const ALL = 'all'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [businesses,      setBusinesses]      = useState([])
  const [recommended,     setRecommended]     = useState([])
  const [loading,         setLoading]         = useState(true)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [activeSearch,    setActiveSearch]    = useState('')
  const [selectedType,    setSelectedType]    = useState(ALL)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [minRating,       setMinRating]       = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const [{ businesses: biz }, rec] = await Promise.all([
          getBusinesses({ limit: 100 }),
          getRecommendedBusinesses(),
        ])
        if (!cancelled) {
          setBusinesses(biz)
          setRecommended(rec)
        }
      } catch (err) {
        console.error('Error cargando negocios:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [])

  const handleTypeChange = (type) => {
    setSelectedType(type)
    setSelectedCategory(ALL)
  }

  const handleClearFilters = () => {
    setActiveSearch('')
    setSearchQuery('')
    setSelectedType(ALL)
    setSelectedCategory(ALL)
    setMinRating(null)
  }

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        !activeSearch ||
        b.name.toLowerCase().includes(activeSearch.toLowerCase())
      const matchesType     = selectedType === ALL     || b.type === selectedType
      const matchesRating   = minRating === null       || b.rating >= minRating
      return matchesSearch && matchesType && matchesRating
    })
  }, [businesses, activeSearch, selectedType, minRating])

  const isFiltering =
    activeSearch ||
    selectedType !== ALL ||
    selectedCategory !== ALL ||
    minRating !== null

  return (
    <ClientLayout>

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            ¿Qué quieres reservar hoy?
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Descubre y reserva los mejores lugares cerca de ti.
          </p>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={(q) => setActiveSearch(q)}
        />
      </section>

      {/* ── Filtros ───────────────────────────────────────────────────── */}
      <section className="mb-8 flex flex-col gap-3">
        <BusinessTypeFilter selected={selectedType} onChange={handleTypeChange} />
        {selectedType !== ALL && (
          <CategoryFilter
            categories={CATEGORIES_BY_TYPE[selectedType]}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        )}
        <RatingFilter value={minRating} onChange={setMinRating} />
      </section>

      {/* ── Recomendaciones — solo si no hay filtros activos ──────────── */}
      {!isFiltering && (
        <section className="mb-10">
          <SectionTitle
            title="Recomendaciones para ti"
            subtitle="Basadas en calificación y popularidad"
            className="mb-4"
            action={{ label: 'Ver todos', onClick: () => {} }}
          />
          <BusinessGrid
            businesses={recommended}
            loading={loading}
            skeletonCount={4}
            onReserve={(b) => navigate(`/booking/${b.id}`)}
          />
        </section>
      )}

      {/* ── Resultados / Todos ────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={isFiltering ? 'Resultados de búsqueda' : 'Todos los negocios'}
          subtitle={
            isFiltering
              ? `${filteredBusinesses.length} resultado${filteredBusinesses.length !== 1 ? 's' : ''} encontrado${filteredBusinesses.length !== 1 ? 's' : ''}`
              : 'Explora restaurantes, spas, clínicas y salones'
          }
          className="mb-4"
          action={
            isFiltering
              ? { label: 'Limpiar filtros', onClick: handleClearFilters }
              : undefined
          }
        />
        <BusinessGrid
          businesses={filteredBusinesses}
          loading={loading}
          skeletonCount={6}
          onReserve={(b) => navigate(`/booking/${b.id}`)}
          emptyMessage="No encontramos negocios con esos filtros. Intenta ajustar tu búsqueda."
        />
      </section>

    </ClientLayout>
  )
}
