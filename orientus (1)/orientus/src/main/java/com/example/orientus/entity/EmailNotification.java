package com.example.orientus.entity;

import com.example.orientus.enums.EmailNotificationStatus;
import com.example.orientus.enums.EmailNotificationType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // L'étudiant qui recevra l'email
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String recipientEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailNotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailNotificationStatus status;

    // Nombre de messages à regrouper dans un seul email
    @Column(nullable = false)
    private Integer pendingMessageCount = 1;

    // Aperçu du dernier message (50 premiers caractères)
    @Column(length = 255)
    private String lastMessagePreview;

    // Nom de l'admin qui a envoyé le dernier message
    private String senderName;

    // Quand envoyer l'email (NOW + délai)
    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = EmailNotificationStatus.PENDING;
        }
    }
}

