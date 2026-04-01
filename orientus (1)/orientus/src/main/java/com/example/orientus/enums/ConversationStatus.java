package com.example.orientus.enums;

public enum ConversationStatus {
    PENDING,    // Étudiant a envoyé 1-2 msgs, en attente d'un admin
    ACTIVE,     // Admin a accepté, communication libre
    REJECTED,   // Admin a refusé
    CLOSED      // Conversation terminée
}

