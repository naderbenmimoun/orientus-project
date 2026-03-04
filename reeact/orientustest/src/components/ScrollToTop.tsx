import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📜 Composant pour scroller automatiquement en haut lors d'un changement de page
 * Ce composant ne rend rien, il écoute juste les changements de route
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroller en haut de la page à chaque changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
