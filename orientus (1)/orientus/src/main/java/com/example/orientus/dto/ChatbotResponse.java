package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de réponse du chatbot
 * Amélioré avec : messageId (feedback), needsClarification (clarification), stats (statistiques)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {

    /**
     * Amélioration 7 : Identifiant unique de ce message (UUID)
     * Permet au frontend d'envoyer un feedback sur cette réponse précise
     */
    private String messageId;

    /**
     * true = question liée aux études
     * false = question hors-sujet
     */
    private Boolean inDomain;

    /**
     * Message texte du chatbot (réponse naturelle générée par le LLM)
     */
    private String message;

    /**
     * Liste des programmes trouvés
     */
    private List<ProgramResult> results;

    /**
     * Critères de recherche appliqués
     */
    private SearchCriteria appliedCriteria;

    /**
     * Amélioration 6 : true si le chatbot a besoin de plus d'informations
     * Le frontend peut afficher des boutons de clarification
     */
    private Boolean needsClarification;

    /**
     * Amélioration 10 : Statistiques sur les résultats de recherche
     */
    private SearchStats stats;
}