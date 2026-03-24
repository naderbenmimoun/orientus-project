package com.example.orientus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Amélioration 7 : Entity pour stocker les feedbacks utilisateurs sur les réponses du chatbot
 * Permet d'analyser la satisfaction et d'améliorer le chatbot
 */
@Entity
@Table(name = "chat_feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID unique de la réponse du chatbot (lié à ChatbotResponse.messageId) */
    @Column(name = "message_id", nullable = false)
    private String messageId;

    /** Note de satisfaction : 1 = 👎, 5 = 👍 */
    @Column(nullable = false)
    private int rating;

    /** Commentaire optionnel de l'utilisateur */
    @Column(length = 1000)
    private String comment;

    /** Date et heure du feedback */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

