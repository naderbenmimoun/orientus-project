import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import type { AdminProfileResponse } from '../../services/adminService';

const AdminProfilePage = () => {
  const { admin, isOwner } = useAdminAuth();
  const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!admin?.email) return;

      try {
        setIsLoading(true);
        const profileData = await adminService.getAdminProfile(admin.email);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [admin?.email]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl p-8 border border-violet-500/20 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-500/25">
            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
          </div>
          
          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p className="text-slate-400 mt-1">{profile?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOwner
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              }`}>
                {profile?.role}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Profile Information</h2>
          <p className="text-sm text-slate-400 mt-1">Read-only view of your account details</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="text-slate-400 text-sm font-medium">Email Address</div>
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white">{profile?.email}</span>
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-6 border-b border-slate-700/50">
            <div className="text-slate-400 text-sm font-medium">First Name</div>
            <div className="sm:col-span-2 text-white">{profile?.firstName}</div>
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-6 border-b border-slate-700/50">
            <div className="text-slate-400 text-sm font-medium">Last Name</div>
            <div className="sm:col-span-2 text-white">{profile?.lastName}</div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-6 border-b border-slate-700/50">
            <div className="text-slate-400 text-sm font-medium">Phone Number</div>
            <div className="sm:col-span-2">
              {profile?.phone ? (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white">{profile.phone}</span>
                </div>
              ) : (
                <span className="text-slate-500 italic">Not provided</span>
              )}
            </div>
          </div>

          {/* Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-6 border-b border-slate-700/50">
            <div className="text-slate-400 text-sm font-medium">Nationality</div>
            <div className="sm:col-span-2">
              {profile?.nationality ? (
                <span className="text-white">{profile.nationality}</span>
              ) : (
                <span className="text-slate-500 italic">Not provided</span>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-6 border-b border-slate-700/50">
            <div className="text-slate-400 text-sm font-medium">Role</div>
            <div className="sm:col-span-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile?.role?.toUpperCase() === 'OWNER'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-violet-500/20 text-violet-400'
              }`}>
                {profile?.role?.toUpperCase() === 'OWNER' && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                )}
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="text-slate-400 text-sm font-medium">Member Since</div>
            <div className="sm:col-span-2">
              {profile?.createdAt ? (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 italic">Not available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-400">
            Admin profile information is read-only and can only be modified by the system owner.
            Contact the owner if you need to update your details.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfilePage;
