import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import type { Program, ProgramFilters, SortOption } from '../models/Program';
import {
  DEGREE_LABELS,
  CATEGORY_LABELS,
  LANGUAGE_OPTIONS,
  DURATION_OPTIONS,
} from '../models/Program';
import { usePrograms } from '../hooks/usePrograms';
import {
  SkeletonProgramGrid,
  SkeletonSearchBar,
  SkeletonFilterSidebar,
  SkeletonFilterBadges,
  LoadingMessage,
} from '../components/SkeletonCard';

// ─── Carte programme avec React.memo + hover CSS (pas framer-motion) ───

const ProgramCard = React.memo(({ program }: { program: Program }) => (
  <div className="program-card-hover bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
    {/* Image + logo */}
    <div className="relative h-48">
      <img
        src={program.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'}
        alt={program.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {program.universityLogo && (
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-lg shadow-md p-2 flex items-center justify-center">
          <img
            src={program.universityLogo}
            alt={program.university}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {program.featured && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-xs font-semibold rounded-full shadow">
          ⭐ Promu
        </div>
      )}
    </div>

    {/* Contenu */}
    <div className="p-5">
      <p className="text-sm text-gray-500 mb-1">{program.university}</p>
      <h3 className="font-bold text-lg text-blue-600 mb-2 line-clamp-2 hover:text-blue-700 transition-colors">
        <Link to={`/programs/${program.id}`}>{program.title}</Link>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {program.city}, {program.country}
      </p>

      {/* Badges info */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-600">
        <span className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" />
          </svg>
          <span>{DEGREE_LABELS[program.degree] || program.degree}</span>
        </span>
        <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{program.duration}</span>
        </span>
        <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Sur le campus</span>
        </span>
        <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>{program.language}</span>
        </span>
      </div>

      {/* Extrait de la description */}
      <div className="border-l-4 border-blue-200 pl-3 mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">{program.description}</p>
      </div>

      {/* Lien détail */}
      <Link
        to={`/programs/${program.id}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
      >
        Lire la suite
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>
));

ProgramCard.displayName = 'ProgramCard';

// ─── Page Programmes ───────────────────────────────────────────────

const ProgramsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce pour le champ de recherche local
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Hook hybride
  const {
    programs,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    isFetching,
    filters,
    filterCounts,
    setPage,
    setFilters,
    setSortBy,
    activeFilters,
    sortBy,
    resetFilters: hookResetFilters,
    mode,
    isFirstLoad,
    error,
    refetch,
  } = usePrograms();

  // Sections de filtre déroulées
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    degree: true,
    category: true,
    country: false,
    duration: false,
    language: false,
  });

  // Synchroniser les filtres initiaux depuis l'URL
  useEffect(() => {
    const urlFilters: ProgramFilters = {
      search: searchParams.get('search') || '',
      degree: searchParams.get('degree') || '',
      category: searchParams.get('category') || '',
      country: searchParams.get('country') || '',
      language: searchParams.get('language') || '',
      duration: searchParams.get('duration') || '',
    };
    // N'appliquer que s'il y a des filtres dans l'URL
    const hasFilters = Object.values(urlFilters).some((v) => v);
    if (hasFilters) {
      setFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mettre à jour l'URL quand les filtres changent
  const updateURLParams = useCallback(
    (newFilters: ProgramFilters) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      setSearchParams(params);
    },
    [setSearchParams]
  );

  // Changement de filtre
  const handleFilterChange = useCallback(
    (key: keyof ProgramFilters, value: string) => {
      const newFilters = { ...activeFilters, [key]: value };
      setFilters(newFilters);
      updateURLParams(newFilters);
    },
    [activeFilters, setFilters, updateURLParams]
  );

  // Recherche avec debounce local (300ms)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleFilterChange('search', value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Reset
  const resetFilters = () => {
    hookResetFilters();
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Compteur de filtres actifs
  const activeFilterCount = Object.values(activeFilters).filter((v) => v).length;

  // ─── Sous-composants ─────────────────────────────────────────────

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const FilterCheckbox = ({
    value,
    label,
    filterKey,
    count,
  }: {
    value: string;
    label: string;
    filterKey: keyof ProgramFilters;
    count?: number;
  }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          name={filterKey}
          checked={activeFilters[filterKey] === value}
          onChange={() => handleFilterChange(filterKey, activeFilters[filterKey] === value ? '' : value)}
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-gray-400 text-sm">({count})</span>
      )}
    </label>
  );

  // Utiliser les données de filtres dynamiques en priorité, fallback sur les constantes statiques
  const countryOptions = filters.countries.length > 0 ? filters.countries : [];

  // Helper pour obtenir le compteur par filtre
  const getCount = (type: 'byDegree' | 'byCategory' | 'byCountry' | 'byLanguage', key: string): number | undefined => {
    const counts = filterCounts[type];
    if (!counts || Object.keys(counts).length === 0) return undefined;
    return counts[key] ?? 0;
  };

  // Contenu des filtres (partagé mobile + desktop)
  const filterContent = (
    <>
      <FilterSection title="Type de diplôme" section="degree">
        {Object.entries(DEGREE_LABELS).map(([value, label]) => (
          <FilterCheckbox
            key={value}
            value={value}
            label={label}
            filterKey="degree"
            count={getCount('byDegree', value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Domaines d'études" section="category">
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <FilterCheckbox
            key={value}
            value={value}
            label={label}
            filterKey="category"
            count={getCount('byCategory', value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Emplacements" section="country">
        {countryOptions.map((country) => (
          <FilterCheckbox
            key={country}
            value={country}
            label={country}
            filterKey="country"
            count={getCount('byCountry', country)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Durée" section="duration">
        {DURATION_OPTIONS.map((duration) => (
          <FilterCheckbox key={duration} value={duration} label={duration} filterKey="duration" />
        ))}
      </FilterSection>

      <FilterSection title="Langue" section="language">
        {LANGUAGE_OPTIONS.map((lang) => (
          <FilterCheckbox
            key={lang}
            value={lang}
            label={lang}
            filterKey="language"
            count={getCount('byLanguage', lang)}
          />
        ))}
      </FilterSection>
    </>
  );

  // ─── Rendu ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pt-32 pb-12">
      {/* CSS hover pour les cartes (remplace whileHover framer-motion) */}
      <style>{`
        .program-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .program-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-700 font-medium">Programmes</li>
          </ol>
        </nav>

        {/* En-tête */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {isLoading ? '...' : totalItems.toLocaleString()} Degree Programs
          </h1>
          <p className="text-gray-600">
            Discover study programs from universities around the world
            {mode === 'all' && (
              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">⚡ Instant mode</span>
            )}
          </p>
        </motion.div>

        {/* Message de premier chargement (cold start) */}
        <LoadingMessage isFirstLoad={isFirstLoad && isLoading} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bouton filtres mobile */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeFilterCount}</span>
            )}
          </button>

          {/* Sidebar filtres — Mobile overlay */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsFilterOpen(false)}
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween' }}
                  className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Filtres</h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <button onClick={resetFilters} className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4">
                      Réinitialiser
                    </button>
                    {filterContent}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar filtres — Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {isLoading ? (
              <SkeletonFilterSidebar />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-32">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">Filtres</h2>
                  <button onClick={resetFilters} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Réinitialiser
                  </button>
                </div>
                {filterContent}
              </div>
            )}
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {/* Barre de recherche + tri */}
            {isLoading ? (
              <SkeletonSearchBar />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search programs, universities..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm whitespace-nowrap">Trier par:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="recommended">Recommandé</option>
                      <option value="newest">Plus récent</option>
                      <option value="titleAsc">A-Z</option>
                      <option value="titleDesc">Z-A</option>
                      <option value="tuitionAsc">Frais ↑</option>
                      <option value="tuitionDesc">Frais ↓</option>
                    </select>
                  </div>
                </div>

                {/* Tags filtres actifs */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    {activeFilters.degree && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {DEGREE_LABELS[activeFilters.degree]}
                        <button onClick={() => handleFilterChange('degree', '')} className="ml-2 hover:text-blue-900">×</button>
                      </span>
                    )}
                    {activeFilters.category && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {CATEGORY_LABELS[activeFilters.category]}
                        <button onClick={() => handleFilterChange('category', '')} className="ml-2 hover:text-blue-900">×</button>
                      </span>
                    )}
                    {activeFilters.country && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {activeFilters.country}
                        <button onClick={() => handleFilterChange('country', '')} className="ml-2 hover:text-blue-900">×</button>
                      </span>
                    )}
                    {activeFilters.duration && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {activeFilters.duration}
                        <button onClick={() => handleFilterChange('duration', '')} className="ml-2 hover:text-blue-900">×</button>
                      </span>
                    )}
                    {activeFilters.language && (
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {activeFilters.language}
                        <button onClick={() => handleFilterChange('language', '')} className="ml-2 hover:text-blue-900">×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Indicateur de fetching (changement de filtre en mode paginé) */}
            {isFetching && !isLoading && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="text-blue-700 text-sm font-medium">Chargement des programmes...</span>
              </div>
            )}

            {/* Onglets de type (raccourcis) */}
            {!isLoading && (
              <SkeletonFilterBadges />
            )}

            {/* État de chargement → Skeleton */}
            {isLoading ? (
              <>
                <SkeletonFilterBadges />
                <SkeletonProgramGrid count={6} />
              </>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                <p>{error instanceof Error ? error.message : 'Failed to load programs'}</p>
                <button onClick={() => refetch()} className="mt-2 text-sm underline hover:no-underline">
                  Try again
                </button>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Grille de programmes — un seul motion.div fade-in sur le conteneur */}
                <div className={`transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {programs.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </motion.div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* CTA Bannière */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Les meilleurs programmes pour vous</h3>
                  <p className="text-blue-100 text-sm">
                    Répondez à quelques questions et nous vous proposerons des programmes qui vous correspondent !
                  </p>
                </div>
              </div>
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Commencer
              </Link>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
