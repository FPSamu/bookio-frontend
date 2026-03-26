import { useState, useMemo } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import SearchBar from '../../components/search/SearchBar'
import BusinessTypeFilter from '../../components/search/BusinessTypeFilter'
import CategoryFilter, { CATEGORIES_BY_TYPE } from '../../components/search/CategoryFilter'
import RatingFilter from '../../components/search/RatingFilter'
import BusinessGrid from '../../components/business/BusinessGrid'
import SectionTitle from '../../components/ui/SectionTitle'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamadas a la API (GET /businesses, GET /businesses/recommended)

const MOCK_BUSINESSES = [
  // ── Restaurantes ────────────────────────────────────────────────────────────
  {
    id: '1', type: 'restaurant', name: 'El Origen', category: 'mexican', rating: 4.8,
    reviewCount: 312, imageUrl: null, location: 'Col. Roma Norte, CDMX',
    tags: ['Mexicana', 'Contemporánea'], isOpen: true,
  },
  {
    id: '2', type: 'restaurant', name: 'Brunch & Co.', category: 'brunch', rating: 4.5,
    reviewCount: 187, imageUrl: null, location: 'Col. Condesa, CDMX',
    tags: ['Brunch', 'Desayunos'], isOpen: true,
  },
  {
    id: '3', type: 'restaurant', name: 'Sushi Nami', category: 'japanese', rating: 4.6,
    reviewCount: 240, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Japonesa', 'Sushi', 'Omakase'], isOpen: true,
  },
  {
    id: '4', type: 'restaurant', name: 'La Mar', category: 'seafood', rating: 4.9,
    reviewCount: 198, imageUrl: null, location: 'Col. Anzures, CDMX',
    tags: ['Mariscos', 'Ceviche', 'Pescados'], isOpen: true,
  },
  {
    id: '5', type: 'restaurant', name: 'Oliva Mediterráneo', category: 'mediterranean', rating: 4.7,
    reviewCount: 156, imageUrl: null, location: 'Santa Fe, CDMX',
    tags: ['Mediterránea', 'Griega', 'Tapas'], isOpen: true,
  },
  {
    id: '6', type: 'restaurant', name: 'La Trattoria', category: 'italian', rating: 4.3,
    reviewCount: 201, imageUrl: null, location: 'Col. Nápoles, CDMX',
    tags: ['Italiana', 'Pasta', 'Pizza'], isOpen: true,
  },
  {
    id: '7', type: 'restaurant', name: 'Green Bowl', category: 'vegan', rating: 4.4,
    reviewCount: 134, imageUrl: null, location: 'Col. Juárez, CDMX',
    tags: ['Vegana', 'Orgánica', 'Saludable'], isOpen: true,
  },
  {
    id: '8', type: 'restaurant', name: 'Pekin Garden', category: 'chinese', rating: 4.2,
    reviewCount: 89, imageUrl: null, location: 'Col. del Valle, CDMX',
    tags: ['China', 'Dim Sum', 'Wok'], isOpen: true,
  },
  {
    id: '9', type: 'restaurant', name: 'Taquería Los Compadres', category: 'mexican', rating: 4.2,
    reviewCount: 420, imageUrl: null, location: 'Iztapalapa, CDMX',
    tags: ['Mexicana', 'Tacos', 'Antojitos'], isOpen: true,
  },
  {
    id: '10', type: 'restaurant', name: 'Smash House', category: 'american', rating: 4.5,
    reviewCount: 310, imageUrl: null, location: 'Col. Roma Sur, CDMX',
    tags: ['Americana', 'Burgers', 'Brunch'], isOpen: false,
  },
  {
    id: '11', type: 'restaurant', name: 'Umami Fusion', category: 'fusion', rating: 4.6,
    reviewCount: 172, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Fusión', 'Nikkei', 'Contemporánea'], isOpen: true,
  },

  // ── Spas ────────────────────────────────────────────────────────────────────
  {
    id: '12', type: 'spa', name: 'Zen Garden Spa', category: 'massage', rating: 4.9,
    reviewCount: 214, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Masajes', 'Relajación', 'Piedras calientes'], isOpen: true,
  },
  {
    id: '13', type: 'spa', name: 'Lumière Beauty Spa', category: 'facial', rating: 4.7,
    reviewCount: 98, imageUrl: null, location: 'Col. Condesa, CDMX',
    tags: ['Faciales', 'Limpieza profunda', 'Hidratación'], isOpen: true,
  },
  {
    id: '14', type: 'spa', name: 'Aqua Vitae', category: 'hydrotherapy', rating: 4.5,
    reviewCount: 67, imageUrl: null, location: 'Santa Fe, CDMX',
    tags: ['Hidroterapia', 'Jacuzzi', 'Flotación'], isOpen: true,
  },

  // ── Médicos ─────────────────────────────────────────────────────────────────
  {
    id: '15', type: 'medical', name: 'Clínica Salud Integral', category: 'general', rating: 4.6,
    reviewCount: 342, imageUrl: null, location: 'Col. Doctores, CDMX',
    tags: ['Medicina general', 'Urgencias', 'Laboratorio'], isOpen: true,
  },
  {
    id: '16', type: 'medical', name: 'DermaVida', category: 'dermatology', rating: 4.8,
    reviewCount: 189, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Dermatología', 'Estética', 'Acné'], isOpen: true,
  },
  {
    id: '17', type: 'medical', name: 'Sonrisa Perfecta', category: 'dentistry', rating: 4.7,
    reviewCount: 256, imageUrl: null, location: 'Col. Narvarte, CDMX',
    tags: ['Odontología', 'Ortodoncia', 'Blanqueamiento'], isOpen: false,
  },

  // ── Salón ────────────────────────────────────────────────────────────────────
  {
    id: '18', type: 'salon', name: 'Studio 54 Hair', category: 'color', rating: 4.8,
    reviewCount: 301, imageUrl: null, location: 'Col. Roma Norte, CDMX',
    tags: ['Color', 'Balayage', 'Highlights'], isOpen: true,
  },
  {
    id: '19', type: 'salon', name: 'The Barber Society', category: 'beard', rating: 4.9,
    reviewCount: 415, imageUrl: null, location: 'Col. Juárez, CDMX',
    tags: ['Barba', 'Corte clásico', 'Afeitado'], isOpen: true,
  },
  {
    id: '20', type: 'salon', name: 'Nails & Co.', category: 'nails', rating: 4.6,
    reviewCount: 178, imageUrl: null, location: 'Col. Del Valle, CDMX',
    tags: ['Uñas', 'Gel', 'Nail art'], isOpen: true,
  },
]

const RECOMMENDED_IDS = ['1', '3', '12', '19', '16', '18']
const ALL = 'all'

// ── Página ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [searchQuery,     setSearchQuery]     = useState('')
  const [activeSearch,    setActiveSearch]    = useState('')
  const [selectedType,    setSelectedType]    = useState(ALL)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [minRating,       setMinRating]       = useState(null)
  const [loading] = useState(false) // TODO: true mientras carga la API

  const handleTypeChange = (type) => {
    setSelectedType(type)
    setSelectedCategory(ALL) // reset subcategoría al cambiar tipo
  }

  const handleClearFilters = () => {
    setActiveSearch('')
    setSearchQuery('')
    setSelectedType(ALL)
    setSelectedCategory(ALL)
    setMinRating(null)
  }

  // Recomendaciones — no se filtran, siempre las mismas
  const recommendations = useMemo(
    () => MOCK_BUSINESSES.filter((b) => RECOMMENDED_IDS.includes(b.id)),
    []
  )

  // Resultados filtrados
  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      const matchesSearch =
        !activeSearch ||
        b.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(activeSearch.toLowerCase()))
      const matchesType     = selectedType === ALL     || b.type === selectedType
      const matchesCategory = selectedCategory === ALL || b.category === selectedCategory
      const matchesRating   = minRating === null       || b.rating >= minRating
      return matchesSearch && matchesType && matchesCategory && matchesRating
    })
  }, [activeSearch, selectedType, selectedCategory, minRating])

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
            businesses={recommendations}
            loading={loading}
            skeletonCount={4}
            onReserve={() => {}}
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
          onReserve={() => {}}
          emptyMessage="No encontramos negocios con esos filtros. Intenta ajustar tu búsqueda."
        />
      </section>

    </ClientLayout>
  )
}
