import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      university: 'Harvard University',
      country: 'USA',
      image: '👩‍🎓',
      text: 'Orientus made my dream of studying at Harvard a reality. Their guidance through the application process was invaluable, and the visa support was exceptional.',
      rating: 5,
    },
    {
      name: 'Mohammed Al-Rahman',
      university: 'University of Oxford',
      country: 'UK',
      image: '👨‍🎓',
      text: 'I cannot thank Orientus enough for their support. From finding the right program to securing accommodation in Oxford, they handled everything professionally.',
      rating: 5,
    },
    {
      name: 'Li Wei',
      university: 'MIT',
      country: 'USA',
      image: '👨‍💼',
      text: 'The team at Orientus helped me navigate the complex application process for MIT. Their expertise in scholarship applications saved me thousands of dollars.',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      university: 'University of Toronto',
      country: 'Canada',
      image: '👩‍💻',
      text: 'Orientus was there for me every step of the way. Their post-arrival support helped me integrate quickly into student life in Toronto.',
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Our Students
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from students who achieved their study abroad dreams with Orientus
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white via-yellow-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-yellow-300 p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-6xl">
                      {testimonials[currentIndex].image}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Stars */}
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-6 h-6 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                      "{testimonials[currentIndex].text}"
                    </p>

                    {/* Student Info */}
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-gray-600">
                        {testimonials[currentIndex].university} • {testimonials[currentIndex].country}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
