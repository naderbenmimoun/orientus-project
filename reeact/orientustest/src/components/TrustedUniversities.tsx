import { motion } from 'framer-motion';
import { useState } from 'react';

const TrustedUniversities = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // University logos with detailed information
  const universities = [
    { 
      name: 'Harvard University', 
      logo: '/logos/harvard.png',
      location: 'Cambridge, USA',
      ranking: '#1 World',
      price: '$54,000/year'
    },
    { 
      name: 'MIT', 
      logo: '/logos/mit.png',
      location: 'Massachusetts, USA',
      ranking: '#2 World',
      price: '$53,000/year'
    },
    { 
      name: 'Stanford University', 
      logo: '/logos/stanford.png',
      location: 'California, USA',
      ranking: '#3 World',
      price: '$56,000/year'
    },
    { 
      name: 'Oxford University', 
      logo: '/logos/oxford.png',
      location: 'Oxford, UK',
      ranking: '#4 World',
      price: '£9,250/year'
    },
    { 
      name: 'Cambridge University', 
      logo: '/logos/cambridge.png',
      location: 'Cambridge, UK',
      ranking: '#5 World',
      price: '£9,250/year'
    },
    { 
      name: 'Yale University', 
      logo: '/logos/yale.png',
      location: 'Connecticut, USA',
      ranking: '#9 World',
      price: '$59,000/year'
    },
    { 
      name: 'Princeton University', 
      logo: '/logos/princeton.png',
      location: 'New Jersey, USA',
      ranking: '#6 World',
      price: '$57,000/year'
    },
    { 
      name: 'Columbia University', 
      logo: '/logos/columbia.png',
      location: 'New York, USA',
      ranking: '#7 World',
      price: '$63,000/year'
    },
    { 
      name: 'UC Berkeley', 
      logo: '/logos/berkeley.png',
      location: 'California, USA',
      ranking: '#10 World',
      price: '$44,000/year'
    },
    { 
      name: 'University of Toronto', 
      logo: '/logos/toronto.png',
      location: 'Toronto, Canada',
      ranking: '#18 World',
      price: 'CA$58,000/year'
    },
    { 
      name: 'McGill University', 
      logo: '/logos/mcgill.png',
      location: 'Montreal, Canada',
      ranking: '#30 World',
      price: 'CA$45,000/year'
    },
    { 
      name: 'University of Melbourne', 
      logo: '/logos/melbourne.png',
      location: 'Melbourne, Australia',
      ranking: '#14 World',
      price: 'AU$44,000/year'
    },
  ];

  // Duplicate multiple times for seamless infinite scroll
  const duplicatedUniversities = [...universities, ...universities, ...universities];

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 via-blue-50 to-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Approved by more than{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              13,000 universities
            </span>{' '}
            worldwide
          </h2>
          <p className="text-gray-600 text-lg">
            Trusted partnerships with leading institutions across the globe
          </p>
        </motion.div>

        {/* Animated Scrolling Bar */}
        <div className="relative overflow-x-hidden overflow-y-visible pt-48 pb-8">
          <div 
            className="flex gap-16"
            style={{
              animation: 'scroll 40s linear infinite',
              width: 'max-content',
            }}
            onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
            onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
          >
            {duplicatedUniversities.map((uni, index) => (
              <div
                key={index}
                className="flex-shrink-0 group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-40 h-32 bg-gradient-to-br from-white via-yellow-50 to-blue-50 rounded-xl shadow-lg border-2 border-yellow-300 flex items-center justify-center p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 hover:from-blue-50 hover:via-yellow-100 hover:to-red-50">
                  <img 
                    src={uni.logo} 
                    alt={`${uni.name} Logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="text-center"><div class="text-2xl font-bold text-gray-400">${uni.name}</div></div>`;
                    }}
                  />
                </div>

                {/* Tooltip */}
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 w-64"
                  >
                    <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 border border-gray-700">
                      <h4 className="font-bold text-lg mb-3 text-blue-400">{uni.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-300">{uni.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-gray-300">{uni.ranking}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-300">{uni.price}</span>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedUniversities;
