package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Amélioration 3 : DTO pour la requête du chatbot
 * Remplace le simple Map<String, String> pour supporter l'historique de conversation
 * Rétrocompatible : si 'history' est null, le chatbot fonctionne normalement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    /** Message de l'utilisateur (obligatoire) */
    private String message;

    /**
     * Historique de la conversation (optionnel, max 10 derniers messages)
     * Permet au chatbot de maintenir le contexte de la discussion
     */
    private List<ChatMessage> history;
}

