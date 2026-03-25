/**
 * Composants Skeleton pour le chargement de la page programmes.
 * Utilise animate-pulse de Tailwind — aucune librairie externe.
 */

import React from 'react';

// ─── Skeleton d'une carte programme ────────────────────────────────

export const SkeletonProgramCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
    {/* Image placeholder */}
    <div className="h-48 bg-gray-200" />

    {/* Contenu */}
    <div className="p-5 space-y-3">
      {/* Université */}
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      {/* Titre */}
      <div className="h-5 bg-gray-200 rounded w-4/5" />
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      {/* Localisation */}
      <div className="h-3 bg-gray-200 rounded w-1/2" />

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>

      {/* Description */}
      <div className="border-l-4 border-gray-200 pl-3 space-y-2 mt-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Lien */}
      <div className="h-4 bg-gray-200 rounded w-24 mt-2" />
    </div>
  </div>
);

// ─── Skeleton de la barre de recherche ─────────────────────────────

export const SkeletonSearchBar: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-4 mb-6 animate-pulse">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg w-40" />
    </div>
  </div>
);

// ─── Skeleton de la sidebar de filtres ─────────────────────────────

export const SkeletonFilterSidebar: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse space-y-6">
    {/* Titre + reset */}
    <div className="flex items-center justify-between">
      <div className="h-5 bg-gray-200 rounded w-16" />
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>

    {/* Sections de filtres */}
    {[1, 2, 3].map((section) => (
      <div key={section} className="border-t border-gray-100 pt-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-32" />
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded" style={{ width: `${60 + item * 15}px` }} />
            </div>
            <div className="h-3 bg-gray-200 rounded w-6" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── Skeleton des badges de filtre actifs ──────────────────────────

export const SkeletonFilterBadges: React.FC = () => (
  <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div
        key={i}
        className="h-9 bg-gray-200 rounded-full"
        style={{ width: `${60 + i * 12}px` }}
      />
    ))}
  </div>
);

// ─── Grille de 6 skeleton cards ────────────────────────────────────

export const SkeletonProgramGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonProgramCard key={i} />
    ))}
  </div>
);

// ─── Message de chargement intelligent ─────────────────────────────

export const LoadingMessage: React.FC<{ isFirstLoad: boolean }> = ({ isFirstLoad }) => {
  if (!isFirstLoad) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 flex items-center space-x-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 flex-shrink-0" />
      <p className="text-blue-700 text-sm font-medium">
        ⏳ Connexion au serveur en cours... (première connexion, peut prendre quelques secondes)
      </p>
    </div>
  );
};
