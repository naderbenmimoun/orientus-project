import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
            onClick={goToHome}
          >
            <img 
              src="/black.png" 
              alt="Orientus Logo" 
              className="h-16 md:h-20 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </motion.button>
            </Link>
            <Link to="/programs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Programs
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </motion.button>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Sign Up
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
