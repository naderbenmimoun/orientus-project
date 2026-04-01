package com.example.orientus.repository;

import com.example.orientus.entity.EmailNotification;
import com.example.orientus.enums.EmailNotificationStatus;
import com.example.orientus.enums.EmailNotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailNotificationRepository extends JpaRepository<EmailNotification, Long> {

    // Notifications à envoyer (PENDING + scheduledAt passé)
    List<EmailNotification> findByStatusAndScheduledAtBefore(EmailNotificationStatus status, LocalDateTime now);

    // Chercher une notification PENDING existante pour la même conversation et le même destinataire (pour regrouper)
    Optional<EmailNotification> findByRecipientIdAndConversationIdAndStatusAndType(
            Long recipientId, Long conversationId, EmailNotificationStatus status, EmailNotificationType type
    );
}

