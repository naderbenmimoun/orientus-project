import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const WhyChooseUs = () => {
  const stats = [
    { value: 13000, suffix: '+', label: 'Partner Universities', duration: 2 },
    { value: 50000, suffix: '+', label: 'Students Placed', duration: 2.5 },
    { value: 150, suffix: '+', label: 'Countries', duration: 2 },
    { value: 98, suffix: '%', label: 'Success Rate', duration: 1.5 },
  ];

  const features = [
    {
      title: 'Expert Counselors',
      description: 'Our team of experienced advisors has helped thousands of students achieve their dreams.',
      icon: '🎓',
    },
    {
      title: 'Global Network',
      description: 'Access to partnerships with top universities and institutions worldwide.',
      icon: '🌍',
    },
    {
      title: 'End-to-End Support',
      description: 'From initial consultation to post-arrival assistance, we are with you every step.',
      icon: '🤝',
    },
    {
      title: 'Proven Track Record',
      description: 'Years of experience and countless success stories speak to our commitment.',
      icon: '⭐',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute transform rotate-45 -right-20 -top-20 w-96 h-96 bg-white rounded-full"></div>
        <div className="absolute transform -rotate-45 -left-20 -bottom-20 w-96 h-96 bg-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose Orientus?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of successful students who trusted us with their future
          </p>
        </motion.div>

        {/* Stats Counter */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <StatCounter key={index} {...stat} index={index} />
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-blue-100">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Animated Counter Component
const StatCounter = ({ value, suffix, label, duration, index }: {
  value: number;
  suffix: string;
  label: string;
  duration: number;
  index: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      const increment = value / (duration * 60);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [hasAnimated, value, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => setHasAnimated(true)}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8"
    >
      <div className="text-4xl sm:text-5xl font-bold mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-100 text-lg">{label}</div>
    </motion.div>
  );
};

export default WhyChooseUs;
