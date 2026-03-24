package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Amélioration 7 : DTO pour le feedback utilisateur sur les réponses du chatbot
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    /** Identifiant unique du message (UUID généré par le backend) */
    private String messageId;

    /** Note de satisfaction : 1 = 👎, 5 = 👍 */
    private int rating;

    /** Commentaire optionnel de l'utilisateur */
    private String comment;
}

