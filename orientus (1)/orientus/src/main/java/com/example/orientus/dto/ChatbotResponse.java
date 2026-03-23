package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {

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
}