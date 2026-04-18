import { useState, useMemo, useEffect } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import SearchBar from '../../components/search/SearchBar'
import BusinessTypeFilter from '../../components/search/BusinessTypeFilter'
import CategoryFilter, { CATEGORIES_BY_TYPE } from '../../components/search/CategoryFilter'
import RatingFilter from '../../components/search/RatingFilter'
import BusinessGrid from '../../components/business/BusinessGrid'
import SectionTitle from '../../components/ui/SectionTitle'
import businessService from '../../services/business.service'

const ALL = 'all'

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedType, setSelectedType] = useState(ALL)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [minRating, setMinRating] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Cargar Recomendaciones
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await businessService.getRecommended()
        // La API devuelve { data: [...] }, extraemos el arreglo
        const recsArray = response.data || response.businesses || [];
        setRecommendations(recsArray);
      } catch (error) {
        console.error("Error cargando recomendaciones:", error);
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, []);

  // 2. Cargar Todos los Negocios
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = {
          // Enviamos tal cual viene del filtro (ej. "SPA", "BARBERSHOP")
          type: selectedType !== ALL ? selectedType : undefined,
          category: selectedCategory !== ALL ? selectedCategory : undefined,
          ratingGte: minRating || undefined, // Sincronizado con el controlador 'ratingGte'
          search: activeSearch || undefined,
        };

        const response = await businessService.getAll(params);

        // Sincronización con la estructura de tu API: { data: [...], meta: {...} }
        const businessesArray = response.data || [];
        setBusinesses(businessesArray);
      } catch (error) {
        console.error("Error en la API de Bookio:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [activeSearch, selectedType, selectedCategory, minRating]);

  // CORRECCIÓN: No normalizar a minúsculas, Prisma usa MAYÚSCULAS
  const handleTypeChange = (type) => {
    setSelectedType(type); // "SPA", "BARBERSHOP", etc.
    setSelectedCategory(ALL);
  };

  const handleClearFilters = () => {
    setActiveSearch('')
    setSearchQuery('')
    setSelectedType(ALL)
    setSelectedCategory(ALL)
    setMinRating(null)
  }

  // Filtrado local defensivo
  const filteredBusinesses = useMemo(() => {
    if (!Array.isArray(businesses)) return [];

    return businesses.filter((b) => {
      // 1. Búsqueda por nombre o tags (usando ?. por seguridad)
      const matchesSearch =
        !activeSearch ||
        b.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        (b.tags?.some((t) => t.toLowerCase().includes(activeSearch.toLowerCase())));

      // 2. Tipo (Comparación directa con el ENUM de Prisma)
      const matchesType = selectedType === ALL || b.type === selectedType;

      // 3. Rating (Sincronizado con 'average_rating' de tu DB)
      const matchesRating = minRating === null || (b.average_rating || 0) >= minRating;

      return matchesSearch && matchesType && matchesRating;
    });
  }, [businesses, activeSearch, selectedType, minRating]);

  const isFiltering =
    activeSearch ||
    selectedType !== ALL ||
    selectedCategory !== ALL ||
    minRating !== null

  return (
    <ClientLayout>
      <section className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">¿Qué quieres reservar hoy?</h1>
          <p className="mt-1 text-sm text-neutral-400">Descubre y reserva los mejores lugares cerca de ti.</p>
        </div>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={(q) => setActiveSearch(q)}
        />
      </section>

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

      {!isFiltering && (
        <section className="mb-10">
          <SectionTitle
            title="Recomendaciones para ti"
            subtitle="Basadas en calificación y popularidad"
            className="mb-4"
            action={{ label: 'Ver todos', onClick: () => handleClearFilters() }}
          />
          <BusinessGrid
            businesses={recommendations}
            loading={loading}
            skeletonCount={4}
            onReserve={(id) => console.log("Reservando:", id)}
          />
        </section>
      )}

      <section>
        <SectionTitle
          title={isFiltering ? 'Resultados de búsqueda' : 'Todos los negocios'}
          subtitle={
            isFiltering
              ? `${filteredBusinesses.length} resultado${filteredBusinesses.length !== 1 ? 's' : ''} encontrado${filteredBusinesses.length !== 1 ? 's' : ''}`
              : 'Explora restaurantes, spas, clínicas y salones'
          }
          className="mb-4"
          action={isFiltering ? { label: 'Limpiar filtros', onClick: handleClearFilters } : undefined}
        />
        <BusinessGrid
          businesses={filteredBusinesses}
          loading={loading}
          skeletonCount={6}
          onReserve={(id) => console.log("Reservando:", id)}
          emptyMessage="No encontramos negocios con esos filtros. Intenta ajustar tu búsqueda."
        />
      </section>
    </ClientLayout>
  )
}