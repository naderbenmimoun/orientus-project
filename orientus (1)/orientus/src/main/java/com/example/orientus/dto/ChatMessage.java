package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Amélioration 3 : DTO pour un message de conversation (historique)
 * Utilisé pour la mémoire de conversation du chatbot
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /** Rôle de l'auteur du message : "user" ou "assistant" */
    private String role;

    /** Contenu textuel du message */
    private String content;
}

