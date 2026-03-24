package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Amélioration 1 : DTO pour le message de bienvenue du chatbot
 * Contient un message d'accueil et des suggestions de questions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WelcomeResponse {

    /** Message d'accueil du chatbot */
    private String message;

    /** Liste de suggestions de questions pour guider l'utilisateur */
    private List<String> suggestions;
}

