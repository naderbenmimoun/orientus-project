import { motion } from 'framer-motion';

const TrustedUniversities = () => {
  const logos = [
    // Austria
    { name: 'Management Center Innsbruck', logo: '/logos/Austria/Management Center Innsbruck.svg' },
    // Dubai
    { name: 'GBS Dubai', logo: '/logos/Dubai/gbs dubai.jpg' },
    // France
    { name: 'Aivancity', logo: '/logos/france/aivancity.png' },
    { name: 'Collège de Paris', logo: '/logos/france/college de Paris.jpg' },
    { name: 'ECE', logo: '/logos/france/ECE.png' },
    { name: 'EM Normandie', logo: '/logos/france/EM Normandie.jpg' },
    { name: 'ESCE', logo: '/logos/france/ESCE.png' },
    { name: 'ICN Business School', logo: '/logos/france/ICN Business School.png' },
    { name: 'INSEEC', logo: '/logos/france/INSEEC.png' },
    { name: 'Junia University', logo: '/logos/france/Junia university.jpg' },
    { name: 'Schiller International University', logo: '/logos/france/Schiller International University.jpg' },
    { name: 'École de Management Appliqué', logo: '/logos/france/École de Management Appliqué.jpg' },
    // Germany
    { name: 'Constructor University', logo: '/logos/germany/Constructor University.png' },
    { name: 'ICN Business School', logo: '/logos/germany/ICN Business School.png' },
    { name: 'Munich Business School', logo: '/logos/germany/Munich Business School.jpg' },
    { name: 'Schiller International University', logo: '/logos/germany/Schiller International University.jpg' },
    { name: 'XU Exponential University', logo: '/logos/germany/XU Exponential University.png' },
    // Italy
    { name: 'Accademia del Lusso', logo: '/logos/italy/Accademia del lusso.png' },
    { name: 'Link Campus University', logo: '/logos/italy/Link Campus University.png' },
    // Latvia
    { name: 'EKA', logo: '/logos/latvia/EKA.jpeg' },
    { name: 'LBTU', logo: '/logos/latvia/LBTU.png' },
    { name: 'RISEBA', logo: '/logos/latvia/riseba.png' },
    { name: 'RSU', logo: '/logos/latvia/RSU.png' },
    { name: 'TSI University', logo: '/logos/latvia/tsi university.png' },
    { name: 'Turiba University', logo: '/logos/latvia/Turiba University.png' },
    { name: 'University of Latvia', logo: '/logos/latvia/University of Latvia.png' },
    { name: 'Valmiera University', logo: '/logos/latvia/valmiera university.png' },
    { name: 'Ventspils University', logo: '/logos/latvia/Ventspils University of Applied Sciences.png' },
    // Lithuania
    { name: 'Klaipeda University', logo: '/logos/lithuania/klaipeda university.jpg' },
    { name: 'Vilnius University', logo: '/logos/lithuania/vilnius university.png' },
    // Malta
    { name: 'GBS Malta', logo: '/logos/Malta/gbs malta.jpg' },
    // Netherlands
    { name: 'Wittenborg University', logo: '/logos/Netherlands/Wittenborg University of Applied Sciences.png' },
    // Poland
    { name: 'Medical University of Silesia', logo: '/logos/poland/medical university of silesia.png' },
    { name: 'University of Economics Warsaw', logo: '/logos/poland/University of Economics and Humanities in Warsaw.jpg' },
    { name: 'University of Life Sciences Lublin', logo: '/logos/poland/University of Life Sciences in Lublin.png' },
    // Spain
    { name: 'EADA University', logo: '/logos/spain/Eada University.png' },
    { name: 'IHMGS', logo: '/logos/spain/IHMGS.png' },
    { name: 'INSA Barcelona', logo: '/logos/spain/INSA BARCELONA.png' },
    { name: 'MIUC', logo: '/logos/spain/MIUC.png' },
    { name: 'Schiller International University', logo: '/logos/spain/Schiller International University.jpg' },
    { name: 'UCAM', logo: '/logos/spain/UCAM San Antonio Catholic University of Murcia.png' },
    { name: 'Universidad Europea', logo: '/logos/spain/Universidad Europea.png' },
    // Turkey
    { name: 'Altinbas University', logo: '/logos/turkey/Altinbas University.png' },
    { name: 'Bahcesehir University', logo: '/logos/turkey/Bahcesehir istanbul university.png' },
    { name: 'Istanbul Aydin University', logo: '/logos/turkey/Istanbul Aydin University.png' },
    { name: 'Istanbul Medipol University', logo: '/logos/turkey/Istanbul Medipol University.png' },
    { name: 'Istinye University', logo: '/logos/turkey/Istinye University.png' },
    { name: 'Sabanci University', logo: '/logos/turkey/sabanci university.png' },
    { name: 'Uskudar University', logo: '/logos/turkey/Uskudar University.png' },
    // UK
    { name: 'MLA College', logo: '/logos/UK/mla college.jpg' },
    // US
    { name: 'Schiller International University', logo: '/logos/US/Schiller International University.jpg' },
  ];

  const duplicatedLogos = [...logos, ...logos, ...logos];

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
        <div className="relative overflow-x-hidden pb-8">
          <div 
            className="flex gap-16 items-center"
            style={{
              animation: 'scroll 120s linear infinite',
              width: 'max-content',
            }}
            onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
            onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
          >
            {duplicatedLogos.map((uni, index) => (
              <div
                key={index}
                className="flex-shrink-0"
              >
                <div className="w-40 h-32 bg-gradient-to-br from-white via-yellow-50 to-blue-50 rounded-xl shadow-lg border-2 border-yellow-300 flex items-center justify-center p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 hover:from-blue-50 hover:via-yellow-100 hover:to-red-50">
                  <img 
                    src={uni.logo} 
                    alt={`${uni.name} Logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="text-center"><div class="text-sm font-bold text-gray-400">${uni.name}</div></div>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedUniversities;
