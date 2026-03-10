import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { ApplicationStatus, BUDGET_LABELS, STATUS_LABELS } from '../../models/Application';
import type { Application } from '../../models/Application';

const statusBadgeStyles: Record<string, string> = {
  NON_REPONDU: 'bg-red-500/20 text-red-400 border-red-500/30',
  EN_COURS: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CONTACTE: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ApplicationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await applicationService.getApplicationById(Number(id));
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!application) return;
    setActionLoading(true);
    try {
      const result = await applicationService.updateApplicationStatus(application.id, status);
      setApplication(result.application);
      setSuccessMessage(`Statut mis à jour : ${STATUS_LABELS[status]}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      await applicationService.deleteApplication(application.id);
      navigate('/admin/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
        <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">Candidature introuvable</h3>
        <p className="text-slate-400 mb-6">{error || 'Cette candidature n\'existe pas.'}</p>
        <Link
          to="/admin/applications"
          className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Retour aux candidatures
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/applications')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Détails de la candidature</h1>
            <p className="text-slate-400 text-sm mt-0.5">#{application.id} — {formatDate(application.applicationDate)}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusBadgeStyles[application.status]}`}>
          <span className={`w-2 h-2 rounded-full ${
            application.status === 'NON_REPONDU' ? 'bg-red-400' :
            application.status === 'EN_COURS' ? 'bg-orange-400' : 'bg-green-400'
          }`} />
          {STATUS_LABELS[application.status]}
        </span>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm"
        >
          {successMessage}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informations de l'étudiant
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nom complet</p>
                <p className="text-white font-medium">{application.studentFirstName} {application.studentLastName}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium">{application.studentEmail}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-white font-medium">{application.studentPhone || 'Non renseigné'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nationalité</p>
                <p className="text-white font-medium">{application.studentNationality || 'Non renseignée'}</p>
              </div>
            </div>
          </motion.div>

          {/* Program Info */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Programme
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Programme</p>
                <p className="text-white font-medium">{application.program.title}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Université</p>
                <p className="text-white font-medium">{application.program.university}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 sm:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pays</p>
                <p className="text-white font-medium">{application.program.country}</p>
              </div>
            </div>
          </motion.div>

          {/* Budget & Documents */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Budget & Documents
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Budget estimé</p>
                <p className="text-white font-semibold text-lg">{BUDGET_LABELS[application.budgetRange]}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`rounded-lg p-4 text-center ${application.hasPassport ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-700/30'}`}>
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${application.hasPassport ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                    {application.hasPassport ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${application.hasPassport ? 'text-green-400' : 'text-slate-500'}`}>Passeport</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${application.hasEnglishB2 ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-700/30'}`}>
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${application.hasEnglishB2 ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                    {application.hasEnglishB2 ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${application.hasEnglishB2 ? 'text-green-400' : 'text-slate-500'}`}>Anglais B2</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${application.hasFrenchB2 ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-700/30'}`}>
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${application.hasFrenchB2 ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                    {application.hasFrenchB2 ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${application.hasFrenchB2 ? 'text-green-400' : 'text-slate-500'}`}>Français B2</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Notes */}
          {application.additionalNotes && (
            <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes supplémentaires
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{application.additionalNotes}</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Status Management */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              {application.status !== ApplicationStatus.EN_COURS && (
                <button
                  onClick={() => handleUpdateStatus(ApplicationStatus.EN_COURS)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marquer EN_COURS
                </button>
              )}
              {application.status !== ApplicationStatus.CONTACTE && (
                <button
                  onClick={() => handleUpdateStatus(ApplicationStatus.CONTACTE)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marquer CONTACTE
                </button>
              )}

              <div className="border-t border-slate-700 pt-3">
                <a
                  href={`mailto:${application.studentEmail}?subject=Votre candidature - ${application.program.title}`}
                  className="w-full py-2.5 px-4 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Envoyer un email
                </a>
              </div>

              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => setDeleteConfirm(true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 bg-red-600/20 text-red-400 border border-red-500/30 font-medium rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer la candidature
                </button>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Historique</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white">Candidature soumise</p>
                  <p className="text-xs text-slate-400">{formatDate(application.applicationDate)}</p>
                </div>
              </div>
              {application.updatedAt && application.updatedAt !== application.applicationDate && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    application.status === 'CONTACTE' ? 'bg-green-500' :
                    application.status === 'EN_COURS' ? 'bg-orange-500' : 'bg-slate-500'
                  }`} />
                  <div>
                    <p className="text-sm text-white">Dernière mise à jour</p>
                    <p className="text-xs text-slate-400">{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-slate-400 text-sm mb-6">
                Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationDetailsPage;
