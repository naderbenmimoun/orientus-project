/**
 * Hook hybride intelligent pour les programmes.
 *
 * - Si totalPrograms < HYBRID_THRESHOLD → mode "all" (tout en mémoire, filtrage JS)
 * - Sinon → mode "paginated" (filtres côté serveur)
 * - Fallback automatique si les nouveaux endpoints n'existent pas (404)
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { programService } from '../services/programService';
import type {
  Program,
  ProgramFilters,
  FiltersMetadata,
  FilterCounts,
  SortOption,
} from '../models/Program';

// Seuil au-dessus duquel on passe en mode paginé
const HYBRID_THRESHOLD = 200;

// Nombre de programmes par page
const PAGE_SIZE = 12;

// Interface uniforme retournée au composant
export interface UseProgramsResult {
  programs: Program[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isFetching: boolean;
  filters: FiltersMetadata;
  filterCounts: FilterCounts;
  setPage: (page: number) => void;
  setFilters: (filters: ProgramFilters) => void;
  setSortBy: (sort: SortOption) => void;
  activeFilters: ProgramFilters;
  sortBy: SortOption;
  resetFilters: () => void;
  mode: 'all' | 'paginated';
  isFirstLoad: boolean;
  error: Error | null;
  refetch: () => void;
}

// ─── Helpers de filtrage / tri côté JS ────────────────────────────────

/** Filtrer les programmes en mémoire */
function filterProgramsLocal(programs: Program[], filters: ProgramFilters): Program[] {
  return programs.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.university.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.country && p.country !== filters.country) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.degree && p.degree !== filters.degree) return false;
    if (filters.language && p.language !== filters.language) return false;
    if (filters.duration && p.duration !== filters.duration) return false;
    return true;
  });
}

/** Trier les programmes en mémoire */
function sortProgramsLocal(programs: Program[], sortBy: SortOption): Program[] {
  const sorted = [...programs];
  switch (sortBy) {
    case 'titleAsc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'titleDesc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'tuitionAsc':
      return sorted.sort((a, b) => (a.tuition || 0) - (b.tuition || 0));
    case 'tuitionDesc':
      return sorted.sort((a, b) => (b.tuition || 0) - (a.tuition || 0));
    default:
      return sorted; // 'recommended' → ordre serveur
  }
}

/** Calculer les compteurs par filtre */
function computeFilterCounts(programs: Program[]): FilterCounts {
  const byCountry: Record<string, number> = {};
  const byDegree: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};

  for (const p of programs) {
    if (p.country) byCountry[p.country] = (byCountry[p.country] || 0) + 1;
    if (p.degree) byDegree[p.degree] = (byDegree[p.degree] || 0) + 1;
    if (p.category) byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    if (p.language) byLanguage[p.language] = (byLanguage[p.language] || 0) + 1;
  }

  return { byCountry, byDegree, byCategory, byLanguage };
}

// ─── Hook principal ───────────────────────────────────────────────────

export function usePrograms(): UseProgramsResult {
  const queryClient = useQueryClient();

  // État local
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<ProgramFilters>({});
  const [sortBy, setSortByState] = useState<SortOption>('recommended');
  const [forcePaginated, setForcePaginated] = useState(false);

  // Debounce pour le mode paginé
  const [debouncedFilters, setDebouncedFilters] = useState<ProgramFilters>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Étape 1 : Déterminer le mode via /api/programs/filters ──────

  const {
    data: filtersMeta,
    isLoading: isLoadingMeta,
  } = useQuery({
    queryKey: ['programs-filters-meta'],
    queryFn: () => programService.getFiltersMetadata(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Décision du mode
  const mode: 'all' | 'paginated' = useMemo(() => {
    if (forcePaginated) return 'paginated';
    if (filtersMeta === null) return 'paginated'; // endpoint 404 → fallback
    if (!filtersMeta) return 'all'; // encore en chargement → on tente "all" par défaut
    return filtersMeta.totalPrograms < HYBRID_THRESHOLD ? 'all' : 'paginated';
  }, [filtersMeta, forcePaginated]);

  // ─── Mode "all" : charger TOUT en 1 requête ─────────────────────

  const {
    data: allData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['all-programs'],
    queryFn: async () => {
      const result = await programService.getAllPrograms();
      if (result === null) {
        // Endpoint 404 — basculer en mode paginé
        setForcePaginated(true);
        return null;
      }
      return result;
    },
    enabled: mode === 'all',
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Filtrage + tri + pagination côté JS (mode "all")
  const allPrograms = allData?.programs ?? [];

  const filteredPrograms = useMemo(
    () => filterProgramsLocal(allPrograms, activeFilters),
    [allPrograms, activeFilters]
  );

  const sortedPrograms = useMemo(
    () => sortProgramsLocal(filteredPrograms, sortBy),
    [filteredPrograms, sortBy]
  );

  const allTotalItems = filteredPrograms.length;
  const allTotalPages = Math.max(1, Math.ceil(allTotalItems / PAGE_SIZE));

  const allPagePrograms = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedPrograms.slice(start, start + PAGE_SIZE);
  }, [sortedPrograms, currentPage]);

  // Compteurs (mode "all")
  const allFilterCounts = useMemo(
    () => computeFilterCounts(allPrograms),
    [allPrograms]
  );

  // Filtres disponibles (mode "all")
  const allFilters: FiltersMetadata = useMemo(() => {
    if (allData?.filters) return allData.filters;
    return {
      countries: [...new Set(allPrograms.map((p) => p.country))].filter(Boolean).sort(),
      categories: [...new Set(allPrograms.map((p) => p.category))].filter(Boolean).sort(),
      degrees: [...new Set(allPrograms.map((p) => p.degree))].filter(Boolean).sort(),
      languages: [...new Set(allPrograms.map((p) => p.language))].filter(Boolean).sort(),
    };
  }, [allData, allPrograms]);

  // ─── Mode "paginated" : filtres serveur ──────────────────────────

  // Debounce des filtres pour le mode paginé (400ms)
  useEffect(() => {
    if (mode !== 'paginated') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(activeFilters);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeFilters, mode]);

  const {
    data: paginatedData,
    isLoading: isLoadingPaginated,
    isFetching: isFetchingPaginated,
    error: errorPaginated,
    refetch: refetchPaginated,
  } = useQuery({
    queryKey: ['programs', currentPage, debouncedFilters],
    queryFn: () => programService.getPrograms(currentPage, PAGE_SIZE, debouncedFilters),
    enabled: mode === 'paginated',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Prefetch page N+1 (mode paginé)
  useEffect(() => {
    if (mode !== 'paginated') return;
    const nextPage = currentPage + 1;
    const totalPages = paginatedData?.totalPages ?? 0;
    if (nextPage < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['programs', nextPage, debouncedFilters],
        queryFn: () => programService.getPrograms(nextPage, PAGE_SIZE, debouncedFilters),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [mode, currentPage, paginatedData, debouncedFilters, queryClient]);

  // Filtres disponibles (mode paginé) — depuis filtersMeta
  const paginatedFilters: FiltersMetadata = useMemo(() => {
    if (filtersMeta) {
      return {
        countries: filtersMeta.countries ?? [],
        categories: filtersMeta.categories ?? [],
        degrees: filtersMeta.degrees ?? [],
        languages: filtersMeta.languages ?? [],
      };
    }
    return { countries: [], categories: [], degrees: [], languages: [] };
  }, [filtersMeta]);

  // ─── Actions ─────────────────────────────────────────────────────

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut de la grille
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setFilters = useCallback((newFilters: ProgramFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(0);
    setSortByState('recommended');
  }, []);

  // ─── Détection premier chargement (cold start) ──────────────────

  const isFirstLoad = !queryClient.getQueryData(['all-programs']) && !queryClient.getQueryData(['programs', 0, {}]);

  // ─── Résultat uniforme ───────────────────────────────────────────

  if (mode === 'all') {
    return {
      programs: allPagePrograms,
      totalItems: allTotalItems,
      totalPages: allTotalPages,
      currentPage,
      isLoading: isLoadingAll || isLoadingMeta,
      isFetching: isFetchingAll,
      filters: allFilters,
      filterCounts: allFilterCounts,
      setPage,
      setFilters,
      setSortBy,
      activeFilters,
      sortBy,
      resetFilters,
      mode: 'all',
      isFirstLoad,
      error: errorAll as Error | null,
      refetch: refetchAll,
    };
  }

  // Mode paginé
  return {
    programs: paginatedData?.programs ?? [],
    totalItems: paginatedData?.totalItems ?? 0,
    totalPages: paginatedData?.totalPages ?? 0,
    currentPage,
    isLoading: isLoadingPaginated || isLoadingMeta,
    isFetching: isFetchingPaginated,
    filters: paginatedFilters,
    filterCounts: { byCountry: {}, byDegree: {}, byCategory: {}, byLanguage: {} },
    setPage,
    setFilters,
    setSortBy,
    activeFilters,
    sortBy,
    resetFilters,
    mode: 'paginated',
    isFirstLoad,
    error: errorPaginated as Error | null,
    refetch: refetchPaginated,
  };
}
