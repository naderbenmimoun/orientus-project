package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Amélioration 10 : DTO pour les statistiques de recherche
 * Fournit des méta-données sur les résultats trouvés
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchStats {

    /** Nombre total de résultats trouvés */
    private int totalResults;

    /** Frais de scolarité minimum parmi les résultats */
    private Double minTuition;

    /** Frais de scolarité maximum parmi les résultats */
    private Double maxTuition;

    /** Liste des niveaux d'études disponibles dans les résultats */
    private List<String> availableDegrees;

    /** Liste des pays disponibles dans les résultats */
    private List<String> availableCountries;
}

