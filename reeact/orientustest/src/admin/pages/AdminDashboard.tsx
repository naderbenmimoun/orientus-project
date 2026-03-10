import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import type { Admin } from '../../services/adminService';
import type { ApplicationStats } from '../../models/Application';

const AdminDashboard = () => {
  const { admin, isOwner } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [appStats, setAppStats] = useState<ApplicationStats | null>(null);

  // Stats (you can replace with real API calls later)
  const [stats] = useState([
    { label: 'Total Users', value: '1,234', icon: '👥', color: 'from-violet-500 to-purple-600' },
    { label: 'Active Sessions', value: '56', icon: '🔥', color: 'from-orange-500 to-red-600' },
    { label: 'New Registrations', value: '89', icon: '📈', color: 'from-emerald-500 to-teal-600' },
    { label: 'Pending Requests', value: '12', icon: '📋', color: 'from-blue-500 to-cyan-600' },
  ]);

  // Fetch admin count for OWNER and application stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await applicationService.getStats();
        setAppStats(statsData);
      } catch {
        // Stats may not be available, silently fail
      }

      if (!isOwner || !admin?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const adminList = await adminService.getAdminList(admin.email);
        setAdmins(adminList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOwner, admin?.email]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl p-6 border border-violet-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {admin?.firstName}! 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOwner 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
            }`}>
              {admin?.role}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Count Card (OWNER only) */}
      {isOwner && (
        <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Admin Overview</h2>
            <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">OWNER ACCESS</span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Admins</p>
                <p className="text-3xl font-bold text-white">{admins.length}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Your Role</p>
                <p className="text-xl font-bold text-amber-400">OWNER</p>
                <p className="text-xs text-slate-500 mt-1">Full access</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">System Status</p>
                <div className="flex items-center mt-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
                  <p className="text-lg font-semibold text-green-400">Operational</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Application Stats */}
      {appStats && (
        <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Candidatures</h2>
            <Link
              to="/admin/applications"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Voir tout &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-3xl font-bold text-white">{appStats.total}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">Non répondu</p>
              <p className="text-3xl font-bold text-red-400">{appStats.nonRepondu}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-orange-400 text-sm">En cours</p>
              <p className="text-3xl font-bold text-orange-400">{appStats.enCours}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm">Contacté</p>
              <p className="text-3xl font-bold text-green-400">{appStats.contacte}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">View Users</p>
              <p className="text-slate-400 text-sm">Manage all users</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Analytics</p>
              <p className="text-slate-400 text-sm">View reports</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Settings</p>
              <p className="text-slate-400 text-sm">Configure system</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New user registered', time: '5 minutes ago', icon: '👤' },
            { action: 'Profile updated', time: '15 minutes ago', icon: '✏️' },
            { action: 'System backup completed', time: '1 hour ago', icon: '💾' },
            { action: 'New contact request', time: '2 hours ago', icon: '📧' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-slate-700/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-slate-500 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
