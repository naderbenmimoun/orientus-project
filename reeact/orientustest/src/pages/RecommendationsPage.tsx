import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import type { StudentProfile, RecommendationWithDetails } from '../models/Recommendation';
import {
  INTEREST_FIELDS,
  COUNTRIES,
  LANGUAGES,
  TARGET_DEGREES,
  CURRENT_DEGREES,
  LANGUAGE_LEVELS,
  STUDY_MODES,
} from '../models/Recommendation';

type PageStep = 'form' | 'loading' | 'results' | 'error';

const DEFAULT_PROFILE: StudentProfile = {
  interestField: '',
  preferredCountry: 'ANY',
  preferredLanguage: 'ANY',
  targetDegree: '',
  currentDegree: '',
  gpa: null,
  languageLevel: 'B2',
  ieltsScore: null,
  maxBudget: 8000,
  studyMode: 'ON_CAMPUS',
  needsScholarship: false,
};

// ─── Wizard form steps ─────────────────────────────────
const WIZARD_STEPS = [
  { id: 1, title: 'Vos études', icon: '🎓' },
  { id: 2, title: 'Préférences', icon: '🌍' },
  { id: 3, title: 'Compétences', icon: '📊' },
  { id: 4, title: 'Budget', icon: '💰' },
];

function getScoreColor(pct: number) {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreRing(pct: number) {
  if (pct >= 80) return 'ring-green-500/30';
  if (pct >= 60) return 'ring-yellow-500/30';
  return 'ring-red-500/30';
}

function getBarColor(pct: number) {
  if (pct >= 80) return 'from-green-400 to-green-500';
  if (pct >= 60) return 'from-yellow-400 to-yellow-500';
  return 'from-red-400 to-red-500';
}

function formatTuition(amount?: number) {
  if (amount === undefined || amount === null) return 'Non disponible';
  return amount.toLocaleString('fr-FR') + ' €/an';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [pageStep, setPageStep] = useState<PageStep>('form');
  const [wizardStep, setWizardStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [results, setResults] = useState<RecommendationWithDetails[]>([]);
  const [mlAvailable, setMlAvailable] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (wizardStep === 1) {
      if (!profile.interestField) errors.interestField = 'Ce champ est obligatoire';
      if (!profile.targetDegree) errors.targetDegree = 'Ce champ est obligatoire';
      if (!profile.currentDegree) errors.currentDegree = 'Ce champ est obligatoire';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof StudentProfile, value: string | number | boolean | null) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const nextWizardStep = () => {
    if (!validateCurrentStep()) return;
    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };
  const prevWizardStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setPageStep('loading');
    setErrorMsg('');

    try {
      const response = await recommendationService.getRecommendations(profile);
      setMlAvailable(response.mlAvailable);

      const detailed: RecommendationWithDetails[] = await Promise.all(
        response.recommendations.map(async (rec) => {
          try {
            const prog = await recommendationService.getProgramDetails(rec.programId);
            return {
              ...rec,
              university: prog.university,
              country: prog.country,
              city: prog.city,
              degree: prog.degree,
              category: prog.category,
              tuition: prog.tuition,
              language: prog.language,
              image: prog.image,
              universityLogo: prog.universityLogo,
              description: prog.description,
            };
          } catch {
            return { ...rec };
          }
        })
      );

      setResults(detailed);
      setPageStep('results');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue lors de l'appel au service de recommandation.";
      setErrorMsg(message);
      setPageStep('error');
    }
  };

  // ─── Shared select component ─────────────────────
  const SelectField = ({
    label,
    field,
    options,
    required,
    icon,
  }: {
    label: string;
    field: keyof StudentProfile;
    options: { value: string; label: string }[];
    required?: boolean;
    icon?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {icon && <span className="mr-1">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={profile[field] as string}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`w-full border ${
          validationErrors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
        } bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300`}
      >
        <option value="">— Sélectionner —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {validationErrors[field] && <p className="text-red-500 text-xs mt-1">{validationErrors[field]}</p>}
    </div>
  );

  // ─── Wizard progress bar ─────────────────────────
  const WizardProgress = () => (
    <div className="flex items-center justify-center mb-10">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <motion.button
            onClick={() => {
              if (s.id < wizardStep || validateCurrentStep()) setWizardStep(s.id);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              wizardStep === s.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : wizardStep > s.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </motion.button>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 mx-1 rounded-full transition-colors ${
                wizardStep > s.id ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ─── FORM ─────────────────────────────────────────
  const renderForm = () => (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-200 mb-4"
        >
          <span className="text-3xl">🎯</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Trouvez votre programme{' '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">idéal</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Notre IA analyse votre profil et trouve les programmes les plus adaptés
        </p>
      </div>

      <WizardProgress />

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Studies */}
          {wizardStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🎓 Vos études
              </h2>
              <SelectField label="Domaine d'intérêt" field="interestField" options={INTEREST_FIELDS} required icon="📚" />
              <SelectField label="Diplôme visé" field="targetDegree" options={TARGET_DEGREES} required icon="🎯" />
              <SelectField label="Diplôme actuel" field="currentDegree" options={CURRENT_DEGREES} required icon="📜" />

              {profile.currentDegree !== 'HIGH_SCHOOL' && profile.currentDegree !== '' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    📊 Moyenne (GPA /20)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    placeholder="Ex: 14.0"
                    value={profile.gpa ?? ''}
                    onChange={(e) => handleChange('gpa', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border border-gray-200 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Preferences */}
          {wizardStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🌍 Vos préférences
              </h2>
              <SelectField label="Pays préféré" field="preferredCountry" options={COUNTRIES} icon="📍" />
              <SelectField label="Langue préférée" field="preferredLanguage" options={LANGUAGES} icon="💬" />
              <SelectField label="Mode d'études" field="studyMode" options={STUDY_MODES} icon="🏫" />
            </motion.div>
          )}

          {/* Step 3: Skills */}
          {wizardStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                📊 Compétences linguistiques
              </h2>
              <SelectField label="Niveau de langue" field="languageLevel" options={LANGUAGE_LEVELS} icon="🗣️" />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  📝 Score IELTS <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  placeholder="Ex: 6.5"
                  value={profile.ieltsScore ?? ''}
                  onChange={(e) => handleChange('ieltsScore', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border border-gray-200 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300"
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Budget */}
          {wizardStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                💰 Budget & financement
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  💶 Budget maximum annuel (€)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={50000}
                  step={500}
                  value={profile.maxBudget}
                  onChange={(e) => handleChange('maxBudget', parseFloat(e.target.value) || 1000)}
                  className="w-full border border-gray-200 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>1 000 €</span>
                  <span className="font-medium text-blue-600 text-sm">{profile.maxBudget.toLocaleString('fr-FR')} €</span>
                  <span>50 000 €</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('needsScholarship', !profile.needsScholarship)}
                  className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
                    profile.needsScholarship ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      profile.needsScholarship ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
                <div>
                  <p className="text-gray-800 font-medium text-sm">Besoin d'une bourse ?</p>
                  <p className="text-gray-500 text-xs">Prioriser les programmes offrant des bourses</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {wizardStep > 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevWizardStep}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2.5 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </motion.button>
          ) : (
            <div />
          )}

          {wizardStep < 4 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextWizardStep}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
            >
              Suivant
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
            >
              🔍 Trouver mes programmes
            </motion.button>
          )}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Gratuit
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Résultats instantanés
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Propulsé par l'IA
        </div>
      </div>
    </motion.div>
  );

  // ─── LOADING ──────────────────────────────────────
  const renderLoading = () => (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto text-center py-20"
    >
      {/* Animated AI brain */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-30" />
        <div className="absolute w-20 h-20 bg-blue-200 rounded-full animate-pulse" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🧠</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse en cours…</h2>
      <p className="text-gray-500 mb-2">Notre IA compare votre profil avec des centaines de programmes</p>

      {/* Animated dots */}
      <div className="flex justify-center gap-1.5 mt-4 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-blue-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 animate-pulse">
            <div className="h-40 bg-gray-100 rounded-xl mb-4" />
            <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded-full w-2/3" />
          </div>
        ))}
      </div>
    </motion.div>
  );

  // ─── RESULTS ──────────────────────────────────────
  const renderResults = () => (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            🏆 Vos programmes recommandés
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full border border-blue-100">
              {results.length} programme{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </span>
            {mlAvailable && (
              <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-100">
                ✨ Recommandation IA
              </span>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setPageStep('form'); setWizardStep(1); }}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Modifier mon profil
        </motion.button>
      </div>

      {/* ML warning */}
      {!mlAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-yellow-500 text-xl">⚠️</span>
          <div>
            <p className="text-yellow-800 font-medium text-sm">Modèle IA temporairement indisponible</p>
            <p className="text-yellow-600 text-xs mt-0.5">
              Les résultats sont basés sur un filtrage simple. Réessayez plus tard pour des recommandations IA.
            </p>
          </div>
        </div>
      )}

      {/* No results */}
      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun programme trouvé</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Aucun programme ne correspond à votre profil. Essayez de modifier vos critères pour élargir la recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((rec, idx) => (
            <motion.div
              key={rec.programId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={rec.image || FALLBACK_IMAGE}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {/* University logo */}
                {rec.universityLogo && (
                  <div className="absolute bottom-3 left-3 w-11 h-11 bg-white rounded-lg shadow-md p-1.5 flex items-center justify-center">
                    <img
                      src={rec.universityLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {/* Match badge */}
                <div
                  className={`absolute top-3 right-3 ${getScoreColor(rec.matchPercentage)} ring-4 ${getScoreRing(rec.matchPercentage)} text-white text-sm font-bold w-13 h-13 rounded-full flex items-center justify-center shadow-lg`}
                  style={{ width: '3.25rem', height: '3.25rem' }}
                >
                  {rec.matchPercentage}%
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-gray-900 font-bold text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {rec.title}
                </h3>
                {rec.university && (
                  <p className="text-gray-500 text-sm mb-3">
                    {rec.university}
                    {rec.city && rec.country ? ` · ${rec.city}, ${rec.country}` : ''}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {rec.degree && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                      🎓 {rec.degree}
                    </span>
                  )}
                  {rec.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      📂 {rec.category}
                    </span>
                  )}
                  {rec.language && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      🌐 {rec.language}
                    </span>
                  )}
                </div>

                {/* Tuition */}
                <p className="text-gray-700 text-sm font-medium mb-3">💰 {formatTuition(rec.tuition)}</p>

                {/* Match bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Compatibilité</span>
                    <span className="font-semibold text-gray-700">{rec.matchPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.matchPercentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08 + 0.3 }}
                      className={`h-full bg-gradient-to-r ${getBarColor(rec.matchPercentage)} rounded-full`}
                    />
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/programs/${rec.programId}`)}
                  className="w-full text-center text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all"
                >
                  Voir le programme →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ─── ERROR ────────────────────────────────────────
  const renderError = () => (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-lg mx-auto text-center py-20"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
        <span className="text-4xl">❌</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Une erreur est survenue</h3>
      <p className="text-red-500 mb-6 text-sm">{errorMsg}</p>
      <div className="flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
        >
          Réessayer
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setPageStep('form'); setWizardStep(1); }}
          className="text-gray-600 hover:text-gray-800 border border-gray-200 px-6 py-2.5 rounded-lg transition-colors bg-white shadow-sm"
        >
          Modifier le profil
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-32 md:pt-36 pb-20 px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {pageStep === 'form' && renderForm()}
          {pageStep === 'loading' && renderLoading()}
          {pageStep === 'results' && renderResults()}
          {pageStep === 'error' && renderError()}
        </AnimatePresence>
      </div>
    </section>
  );
}
