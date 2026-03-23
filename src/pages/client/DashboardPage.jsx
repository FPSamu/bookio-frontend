import { useState, useMemo } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import SearchBar from '../../components/search/SearchBar'
import CategoryFilter from '../../components/search/CategoryFilter'
import RatingFilter from '../../components/search/RatingFilter'
import BusinessGrid from '../../components/business/BusinessGrid'
import SectionTitle from '../../components/ui/SectionTitle'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamadas a la API (GET /businesses, GET /businesses/recommended)

const MOCK_BUSINESSES = [
  {
    id: '1', name: 'El Origen', category: 'mexican', rating: 4.8,
    reviewCount: 312, imageUrl: null, location: 'Col. Roma Norte, CDMX',
    tags: ['Mexicana', 'Contemporánea'], isOpen: true,
  },
  {
    id: '2', name: 'Brunch & Co.', category: 'brunch', rating: 4.5,
    reviewCount: 187, imageUrl: null, location: 'Col. Condesa, CDMX',
    tags: ['Brunch', 'Desayunos'], isOpen: true,
  },
  {
    id: '3', name: 'Sushi Nami', category: 'japanese', rating: 4.6,
    reviewCount: 240, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Japonesa', 'Sushi', 'Omakase'], isOpen: true,
  },
  {
    id: '4', name: 'La Mar', category: 'seafood', rating: 4.9,
    reviewCount: 198, imageUrl: null, location: 'Col. Anzures, CDMX',
    tags: ['Mariscos', 'Ceviche', 'Pescados'], isOpen: true,
  },
  {
    id: '5', name: 'Oliva Mediterráneo', category: 'mediterranean', rating: 4.7,
    reviewCount: 156, imageUrl: null, location: 'Santa Fe, CDMX',
    tags: ['Mediterránea', 'Griega', 'Tapas'], isOpen: true,
  },
  {
    id: '6', name: 'La Trattoria', category: 'italian', rating: 4.3,
    reviewCount: 201, imageUrl: null, location: 'Col. Nápoles, CDMX',
    tags: ['Italiana', 'Pasta', 'Pizza'], isOpen: true,
  },
  {
    id: '7', name: 'Green Bowl', category: 'vegan', rating: 4.4,
    reviewCount: 134, imageUrl: null, location: 'Col. Juárez, CDMX',
    tags: ['Vegana', 'Orgánica', 'Saludable'], isOpen: true,
  },
  {
    id: '8', name: 'Pekin Garden', category: 'chinese', rating: 4.2,
    reviewCount: 89, imageUrl: null, location: 'Col. del Valle, CDMX',
    tags: ['China', 'Dim Sum', 'Wok'], isOpen: true,
  },
  {
    id: '9', name: 'Taquería Los Compadres', category: 'mexican', rating: 4.2,
    reviewCount: 420, imageUrl: null, location: 'Iztapalapa, CDMX',
    tags: ['Mexicana', 'Tacos', 'Antojitos'], isOpen: true,
  },
  {
    id: '10', name: 'Smash House', category: 'american', rating: 4.5,
    reviewCount: 310, imageUrl: null, location: 'Col. Roma Sur, CDMX',
    tags: ['Americana', 'Burgers', 'Brunch'], isOpen: false,
  },
  {
    id: '11', name: 'Umami Fusion', category: 'fusion', rating: 4.6,
    reviewCount: 172, imageUrl: null, location: 'Polanco, CDMX',
    tags: ['Fusión', 'Nikkei', 'Contemporánea'], isOpen: true,
  },
]

// Índices de los negocios que el backend marcaría como "recomendados"
const RECOMMENDED_IDS = ['1', '3', '5', '2']

// Los ids de categoría coinciden directamente con el campo category del negocio,
// excepto 'all' que no filtra.
const ALL_CATEGORY = 'all'

// ── Página ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('') // se aplica al hacer submit
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minRating, setMinRating] = useState(null)
  const [loading] = useState(false) // TODO: true mientras carga la API

  // Negocios recomendados — no se filtran por búsqueda ni categoría
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
      const matchesCategory =
        selectedCategory === ALL_CATEGORY || b.category === selectedCategory
      const matchesRating = minRating === null || b.rating >= minRating
      return matchesSearch && matchesCategory && matchesRating
    })
  }, [activeSearch, selectedCategory, minRating])

  const isFiltering = activeSearch || selectedCategory !== ALL_CATEGORY || minRating !== null

  const handleReserve = (business) => {
    // TODO: navegar a página de detalle / modal de reserva
    console.log('Reservar:', business.name)
  }

  return (
    <ClientLayout>

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            ¿A dónde quieres ir hoy?
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
        <CategoryFilter
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <RatingFilter value={minRating} onChange={setMinRating} />
      </section>

      {/* ── Recomendaciones — solo si no hay búsqueda activa ──────────── */}
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
            onReserve={handleReserve}
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
              : 'Explora todos los negocios disponibles'
          }
          className="mb-4"
          action={
            isFiltering
              ? {
                  label: 'Limpiar filtros',
                  onClick: () => {
                    setActiveSearch('')
                    setSearchQuery('')
                    setSelectedCategory(ALL_CATEGORY)
                    setMinRating(null)
                  },
                }
              : undefined
          }
        />
        <BusinessGrid
          businesses={filteredBusinesses}
          loading={loading}
          skeletonCount={6}
          onReserve={handleReserve}
          emptyMessage="No encontramos negocios con esos filtros. Intenta ajustar tu búsqueda."
        />
      </section>

    </ClientLayout>
  )
}
