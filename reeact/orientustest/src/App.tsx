import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './admin/contexts/AdminAuthContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProgramsPage from './pages/ProgramsPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import Footer from './components/Footer';

// Admin imports
import AdminLayout from './admin/components/AdminLayout';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProfilePage from './admin/pages/AdminProfilePage';
import AdminManagementPage from './admin/pages/AdminManagementPage';
import AdminProgramsPage from './admin/pages/AdminProgramsPage';
import ApplicationsManagementPage from './admin/pages/ApplicationsManagementPage';
import ApplicationDetailsPage from './admin/pages/ApplicationDetailsPage';
import StudentApplicationsPage from './pages/StudentApplicationsPage';
import ProtectedRoute from './components/ProtectedRoute';

function YellowBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToContact = () => {
    navigate('/contact');
  };

  // Don't show banner on auth pages or admin pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button 
      onClick={goToContact}
      className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-gray-900 py-3 px-4 text-center font-semibold shadow-lg fixed top-0 left-0 right-0 z-40 mt-20 md:mt-24 w-full hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-500 transition-all cursor-pointer"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
        <span>🎓 Your Study Abroad Journey Starts Here - Click to Contact Us!</span>
      </div>
    </button>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes - Separate from public site */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="applications" element={<ApplicationsManagementPage />} />
              <Route path="applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route
                path="manage-admins"
                element={
                  <AdminProtectedRoute requireOwner>
                    <AdminManagementPage />
                  </AdminProtectedRoute>
                }
              />
            </Route>

            {/* Public Routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen">
                  <Navbar />
                  <YellowBanner />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/programs" element={<ProgramsPage />} />
                    <Route path="/programs/:id" element={<ProgramDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/my-applications" element={
                      <ProtectedRoute requiredRole="STUDENT">
                        <StudentApplicationsPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
