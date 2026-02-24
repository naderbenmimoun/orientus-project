import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ContactCard from './ContactCard';
import GoogleMapComponent from './GoogleMapComponent';
import { countryContacts, defaultContact } from '../data/countryContacts';
import type { CountryContact } from '../data/countryContacts';

const Contact = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryContact>(defaultContact);

  const handleCountryClick = (countryId: string) => {
    const country = countryContacts.find(c => c.id === countryId);
    if (country) {
      setSelectedCountry(country);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Global Presence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a country on the map to view our local office contact information
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Interactive World Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 border-2 border-blue-200 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Our Offices</h3>
                  <p className="text-sm text-gray-600">Click on a country marker to see contact details</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
            
              {/* Google Maps - Real Interactive Map */}
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <GoogleMapComponent
                  countryContacts={countryContacts}
                  selectedCountry={selectedCountry}
                  onCountryClick={handleCountryClick}
                />
              </div>

              {/* Legend with improved design */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-300 rounded-lg shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Hover</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-lg shadow-sm border-2 border-yellow-900"></div>
                  <span className="text-gray-700 font-medium">Available</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <ContactCard key={selectedCountry.id} contact={selectedCountry} />
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Quick Contact List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Quick Access to Our Offices</h3>
            <p className="text-gray-600">Select any location to view detailed contact information</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {countryContacts.map((country, index) => (
              <motion.button
                key={country.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCountryClick(country.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                  selectedCountry.id === country.id
                    ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-blue-800 shadow-2xl'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-xl'
                }`}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-opacity ${
                  selectedCountry.id === country.id ? 'bg-white opacity-10' : 'bg-blue-200 opacity-0 group-hover:opacity-30'
                }`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedCountry.id === country.id 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <svg className={`w-6 h-6 ${selectedCountry.id === country.id ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    
                    {selectedCountry.id === country.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold"
                      >
                        Active
                      </motion.div>
                    )}
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2">{country.name}</h4>
                  <p className={`text-sm mb-4 ${selectedCountry.id === country.id ? 'text-blue-100' : 'text-gray-600'}`}>
                    {country.address.split(',')[0]}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${selectedCountry.id === country.id ? 'text-blue-100' : 'text-blue-600'}`}>
                      View Details
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${selectedCountry.id === country.id ? '' : 'group-hover:translate-x-1'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
