import { motion } from 'framer-motion';
import { useState } from 'react';
import studentImage from '../assets/mohamed.jpg';

const Hero = () => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const domains = [
    'Business & Management',
    'Engineering',
    'Medicine & Health',
    'Computer Science',
    'Arts & Design',
    'Law',
  ];

  const destinations = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Your Gateway to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Global Education
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-8"
            >
              Orientus guides ambitious students through every step of studying abroad—from choosing the perfect university to settling into your new home.
            </motion.p>

            {/* Search Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Domain Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select domain</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Destination
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select destination</option>
                    {destinations.map((destination) => (
                      <option key={destination} value={destination}>
                        {destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Search Programs
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Student Success Image */}
              <div className="w-full h-[500px] rounded-3xl shadow-2xl overflow-hidden">
                <img 
                  src={studentImage} 
                  alt="Student Success" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <span className="font-semibold">Visa Approved</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">13,000+</p>
                  <p className="text-sm text-gray-600">Partner Universities</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
