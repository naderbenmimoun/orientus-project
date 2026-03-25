-- ==========================================
-- AMÉLIORATION 7 : Index DB pour le futur
-- À exécuter dans pgAdmin quand on aura 500+ programmes
-- NE PAS exécuter maintenant (inutile pour 19 programmes)
-- ==========================================

-- Index simples sur les colonnes les plus filtrées
CREATE INDEX IF NOT EXISTS idx_programs_country ON programs(country);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_degree ON programs(degree);
CREATE INDEX IF NOT EXISTS idx_programs_language ON programs(language);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured);

-- Index sur les colonnes de recherche textuelle (LOWER pour recherche insensible à la casse)
CREATE INDEX IF NOT EXISTS idx_programs_title_lower ON programs(LOWER(title));
CREATE INDEX IF NOT EXISTS idx_programs_university_lower ON programs(LOWER(university));

-- Index composite pour les filtres combinés les plus fréquents
CREATE INDEX IF NOT EXISTS idx_programs_composite ON programs(country, category, degree);

-- Index pour la recherche par ville
CREATE INDEX IF NOT EXISTS idx_programs_city_lower ON programs(LOWER(city));

