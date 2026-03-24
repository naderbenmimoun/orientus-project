// ProgramResults — Grille de cartes programmes + bandeau de statistiques

import React from 'react';
import type { ProgramResult, SearchStats } from '../types/chatbot';
import ProgramCard from './ProgramCard';

// Labels lisibles pour les degrés (utilisé dans le bandeau stats)
const DEGREE_LABELS: Record<string, string> = {
  BACHELOR: 'Bachelor',
  MASTER: 'Master',
  MASTER_OF_ARTS: 'Master of Arts',
  MASTER_OF_SCIENCE: 'Master of Science',
  MBA: 'MBA',
  PHD: 'PhD',
  DIPLOMA: 'Diploma',
  CERTIFICATE: 'Certificate',
};

/**
 * Formater un montant pour le bandeau : 3200 → "3 200€"
 */
function formatAmount(amount: number | null): string {
  if (amount === null || amount === undefined) return '';
  return amount.toLocaleString('fr-FR') + '€';
}

interface ProgramResultsProps {
  results: ProgramResult[];
  stats?: SearchStats | null;
}

const ProgramResults: React.FC<ProgramResultsProps> = ({ results, stats }) => {
  if (!results || results.length === 0) return null;

  // Construction du bandeau de stats
  const renderStats = () => {
    if (!stats || stats.totalResults === 0) return null;

    const parts: string[] = [];
    parts.push(`📊 ${stats.totalResults} programme${stats.totalResults > 1 ? 's' : ''}`);

    if (stats.minTuition !== null && stats.maxTuition !== null) {
      parts.push(`💰 ${formatAmount(stats.minTuition)} - ${formatAmount(stats.maxTuition)}/an`);
    } else if (stats.minTuition !== null) {
      parts.push(`💰 à partir de ${formatAmount(stats.minTuition)}/an`);
    } else if (stats.maxTuition !== null) {
      parts.push(`💰 jusqu'à ${formatAmount(stats.maxTuition)}/an`);
    }

    if (stats.availableDegrees && stats.availableDegrees.length > 0) {
      const labels = stats.availableDegrees.map((d) => DEGREE_LABELS[d] || d);
      parts.push(`🎓 ${labels.join(', ')}`);
    }

    return <div className="stats-banner">{parts.join(' | ')}</div>;
  };

  return (
    <div>
      {renderStats()}
      <div className="program-results-grid">
        {results.map((program, index) => (
          <ProgramCard key={`${program.title}-${program.university}-${index}`} program={program} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ProgramResults);
