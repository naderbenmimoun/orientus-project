import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  const goToContact = () => {
    navigate('/contact');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start Your Study Abroad Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of successful students who trusted Orientus with their future. Let's make your dreams a reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={goToContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
            >
              Get Started Now
            </motion.button>
            <motion.button
              onClick={goToContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Schedule a Consultation
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free Consultation</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
