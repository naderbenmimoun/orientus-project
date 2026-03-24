// ProgramCard — Carte d'un programme universitaire

import React from 'react';
import type { ProgramResult } from '../types/chatbot';

// Labels lisibles pour les degrés
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

// Classe CSS associée à chaque degré
const DEGREE_CSS: Record<string, string> = {
  BACHELOR: 'bachelor',
  MASTER: 'master',
  MASTER_OF_ARTS: 'master_of_arts',
  MASTER_OF_SCIENCE: 'master_of_science',
  MBA: 'mba',
  PHD: 'phd',
  DIPLOMA: 'diploma',
  CERTIFICATE: 'certificate',
};

/**
 * Formater un montant : 6000 → "6 000 €/an"
 */
function formatTuition(amount: number | null): string {
  if (amount === null || amount === undefined) return 'Prix non disponible';
  return amount.toLocaleString('fr-FR') + ' €/an';
}

interface ProgramCardProps {
  program: ProgramResult;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const degreeLabel = DEGREE_LABELS[program.degree] || program.degree;
  const degreeCss = DEGREE_CSS[program.degree] || '';

  return (
    <div className="program-card">
      <p className="program-card-title">{program.title}</p>
      <p className="program-card-university">{program.university}</p>

      <div className="program-card-badges">
        <span className={`degree-badge ${degreeCss}`}>{degreeLabel}</span>
        {program.category && (
          <span className="category-tag">📂 {program.category}</span>
        )}
      </div>

      <p className="program-card-info">🌍 {program.country}{program.city ? ` / ${program.city}` : ''}</p>
      <p className="program-card-info">💰 {formatTuition(program.tuition)}</p>

      {program.duration && (
        <p className="program-card-info">⏱️ {program.duration}</p>
      )}
      {program.language && (
        <p className="program-card-info">🌐 {program.language}</p>
      )}
    </div>
  );
};

export default React.memo(ProgramCard);
