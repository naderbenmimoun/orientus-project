import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/applicationService';
import { BudgetRange, BUDGET_LABELS } from '../models/Application';
import type { Program } from '../models/Program';

interface ApplicationModalProps {
  program: Program;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationModal = ({ program, isOpen, onClose, onSuccess }: ApplicationModalProps) => {
  const { user } = useAuth();

  const [budgetRange, setBudgetRange] = useState<BudgetRange | ''>('');
  const [hasPassport, setHasPassport] = useState(false);
  const [hasEnglishB2, setHasEnglishB2] = useState(false);
  const [hasFrenchB2, setHasFrenchB2] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!budgetRange) {
      setError('Veuillez sélectionner votre budget.');
      return;
    }

    if (!user?.id) {
      setError('Utilisateur non identifié. Veuillez vous reconnecter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applicationService.createApplication(user.id, program.id, {
        budgetRange,
        hasPassport,
        hasEnglishB2,
        hasFrenchB2,
        additionalNotes,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la soumission de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Postuler au programme</h2>
                <p className="text-sm text-gray-500 mt-0.5">{program.title} - {program.university}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Student Info (pre-filled, read-only) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Vos informations</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={user?.firstName || ''}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                    <input
                      type="text"
                      value={user?.lastName || ''}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Budget estimé <span className="text-red-500">*</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.values(BudgetRange).map((range) => (
                    <label
                      key={range}
                      className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        budgetRange === range
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budgetRange"
                        value={range}
                        checked={budgetRange === range}
                        onChange={(e) => setBudgetRange(e.target.value as BudgetRange)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        budgetRange === range ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {budgetRange === range && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        budgetRange === range ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {BUDGET_LABELS[range]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Documents & Certifications */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Documents & Certifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasPassport}
                      onChange={(e) => setHasPassport(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">Passeport valide</span>
                      <p className="text-xs text-gray-500">J'ai un passeport en cours de validité</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasEnglishB2}
                      onChange={(e) => setHasEnglishB2(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">Anglais B2+</span>
                      <p className="text-xs text-gray-500">J'ai un certificat de niveau B2 ou supérieur en anglais</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasFrenchB2}
                      onChange={(e) => setHasFrenchB2(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700">Français B2+</span>
                      <p className="text-xs text-gray-500">J'ai un certificat de niveau B2 ou supérieur en français</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Notes supplémentaires</h3>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ajoutez des informations supplémentaires sur votre profil, motivation, etc. (optionnel)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer ma candidature
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;
