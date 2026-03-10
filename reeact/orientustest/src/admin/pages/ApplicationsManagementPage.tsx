import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { ApplicationStatus, BUDGET_LABELS, STATUS_LABELS } from '../../models/Application';
import type { Application } from '../../models/Application';

const statusFilterOptions = [
  { value: '', label: 'Toutes' },
  { value: ApplicationStatus.NON_REPONDU, label: 'Non répondu' },
  { value: ApplicationStatus.EN_COURS, label: 'En cours' },
  { value: ApplicationStatus.CONTACTE, label: 'Contacté' },
];

const statusBadgeStyles: Record<string, string> = {
  NON_REPONDU: 'bg-red-500/20 text-red-400 border-red-500/30',
  EN_COURS: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CONTACTE: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ApplicationsManagementPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await applicationService.getApplications(
        currentPage,
        10,
        statusFilter || undefined
      );
      setApplications(data.applications);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = (filter: ApplicationStatus | '') => {
    setStatusFilter(filter);
    setCurrentPage(0);
  };

  const handleUpdateStatus = async (id: number, status: ApplicationStatus) => {
    setActionLoading(id);
    try {
      await applicationService.updateApplicationStatus(id, status);
      setSuccessMessage(`Statut mis à jour : ${STATUS_LABELS[status]}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await applicationService.deleteApplication(id);
      setDeleteConfirm(null);
      setSuccessMessage('Candidature supprimée avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.studentFirstName?.toLowerCase().includes(q) ||
      app.studentLastName?.toLowerCase().includes(q) ||
      app.studentEmail?.toLowerCase().includes(q) ||
      app.program.title?.toLowerCase().includes(q) ||
      app.program.university?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des candidatures</h1>
          <p className="text-slate-400 mt-1">{totalItems} candidature{totalItems !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou programme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            />
          </div>
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value as ApplicationStatus | '')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredApplications.length === 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune candidature</h3>
          <p className="text-slate-400">Aucune candidature ne correspond à vos critères de recherche.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredApplications.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Étudiant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Programme</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {formatDate(app.applicationDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {app.studentFirstName} {app.studentLastName}
                        </p>
                        <p className="text-xs text-slate-400">{app.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{app.program.title}</p>
                        <p className="text-xs text-slate-400">{app.program.university}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {BUDGET_LABELS[app.budgetRange]}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeStyles[app.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'NON_REPONDU' ? 'bg-red-400' :
                          app.status === 'EN_COURS' ? 'bg-orange-400' : 'bg-green-400'
                        }`} />
                        {STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                          title="Voir les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {app.status !== ApplicationStatus.EN_COURS && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, ApplicationStatus.EN_COURS)}
                            disabled={actionLoading === app.id}
                            className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-slate-400 hover:text-orange-400"
                            title="Marquer En cours"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {app.status !== ApplicationStatus.CONTACTE && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, ApplicationStatus.CONTACTE)}
                            disabled={actionLoading === app.id}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-slate-400 hover:text-green-400"
                            title="Marquer Contacté"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(app.id)}
                          disabled={actionLoading === app.id}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Page {currentPage + 1} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700">

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
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading === deleteConfirm}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === deleteConfirm ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagementPage;
