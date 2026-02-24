import { motion } from 'framer-motion';

const Footer = () => {
  const footerSections = [
    {
      title: 'Programs',
      links: ['Undergraduate', 'Graduate', 'PhD', 'Language Courses', 'Summer Programs'],
    },
    {
      title: 'Destinations',
      links: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Europe'],
    },
    {
      title: 'Resources',
      links: ['Blog', 'Study Guides', 'Scholarship Database', 'Country Guides', 'FAQ'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Our Team', 'Careers', 'Partners', 'Contact'],
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/Orientus22',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/orient_us/?hl=fr',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: 'https://tn.linkedin.com/company/orient-us',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@orientusorientus',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 border-t-4 border-yellow-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="/black.png" 
                  alt="Orientus Logo" 
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 mb-6">
                Your trusted partner in making study abroad dreams come true. Guiding students to global success since 2022.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Call Us</p>
                <a href="tel:+37120278823" className="text-white font-semibold hover:text-blue-400 transition-colors">+371 20 278 823</a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Us</p>
                <a href="mailto:contact@orient-us.com" className="text-white font-semibold hover:text-yellow-400 transition-colors">contact@orient-us.com</a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Visit Us</p>
                <p className="text-white font-semibold text-sm">Kugu iela 26-2, Riga, Latvia</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 text-center md:flex md:justify-between md:text-left"
        >
          <p className="text-gray-400">
            © {new Date().getFullYear()} Orientus. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
