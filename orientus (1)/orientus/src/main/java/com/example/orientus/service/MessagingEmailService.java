package com.example.orientus.service;

import com.example.orientus.entity.Conversation;
import com.example.orientus.entity.EmailNotification;
import com.example.orientus.entity.User;
import com.example.orientus.enums.EmailNotificationStatus;
import com.example.orientus.enums.EmailNotificationType;
import com.example.orientus.repository.EmailNotificationRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingEmailService {

    private final JavaMailSender mailSender;
    private final EmailNotificationRepository emailNotificationRepository;
    private final ConnectedUserService connectedUserService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void scheduleNewMessageEmail(User student, Conversation conversation, String senderName, String messagePreview) {
        if (connectedUserService.isUserOnline(student.getId())) {
            log.info("Student {} is online, skipping email", student.getId());
            return;
        }

        Optional<EmailNotification> existing = emailNotificationRepository
            .findByRecipientIdAndConversationIdAndStatusAndType(
                student.getId(), conversation.getId(),
                EmailNotificationStatus.PENDING, EmailNotificationType.NEW_MESSAGE
            );

        if (existing.isPresent()) {
            EmailNotification notif = existing.get();
            notif.setPendingMessageCount(notif.getPendingMessageCount() + 1);
            notif.setLastMessagePreview(messagePreview.length() > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview);
            notif.setSenderName(senderName);
            emailNotificationRepository.save(notif);
            log.info("Email notification updated: {} messages grouped", notif.getPendingMessageCount());
        } else {
            EmailNotification notif = new EmailNotification();
            notif.setRecipient(student);
            notif.setRecipientEmail(student.getEmail());
            notif.setConversation(conversation);
            notif.setType(EmailNotificationType.NEW_MESSAGE);
            notif.setStatus(EmailNotificationStatus.PENDING);
            notif.setPendingMessageCount(1);
            notif.setLastMessagePreview(messagePreview.length() > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview);
            notif.setSenderName(senderName);
            notif.setScheduledAt(LocalDateTime.now().plusMinutes(5));
            emailNotificationRepository.save(notif);
            log.info("Email notification scheduled for student {} in 5 min", student.getId());
        }
    }

    public void sendImmediateEmail(User student, Conversation conversation, EmailNotificationType type, String adminName) {
        if (connectedUserService.isUserOnline(student.getId())) {
            return;
        }

        EmailNotification notif = new EmailNotification();
        notif.setRecipient(student);
        notif.setRecipientEmail(student.getEmail());
        notif.setConversation(conversation);
        notif.setType(type);
        notif.setStatus(EmailNotificationStatus.PENDING);
        notif.setPendingMessageCount(0);
        notif.setSenderName(adminName);
        notif.setScheduledAt(LocalDateTime.now());
        emailNotificationRepository.save(notif);
    }

    @Async
    public void sendEmail(EmailNotification notification) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(notification.getRecipientEmail());

            String conversationUrl = frontendUrl + "/messages/" + notification.getConversation().getId();

            switch (notification.getType()) {
                case CONVERSATION_ACCEPTED:
                    helper.setSubject("Un conseiller Orientus a accepte votre demande");
                    helper.setText(buildAcceptedEmailHtml(notification, conversationUrl), true);
                    break;
                case NEW_MESSAGE:
                    helper.setSubject("Nouveau message de votre conseiller - Orientus");
                    helper.setText(buildNewMessageEmailHtml(notification, conversationUrl), true);
                    break;
                case CONVERSATION_REJECTED:
                    helper.setSubject("Votre demande de conversation - Orientus");
                    helper.setText(buildRejectedEmailHtml(notification), true);
                    break;
                case CONVERSATION_CLOSED:
                    helper.setSubject("Votre conversation a ete cloturee - Orientus");
                    helper.setText(buildClosedEmailHtml(notification, conversationUrl), true);
                    break;
            }

            mailSender.send(mimeMessage);
            notification.setStatus(EmailNotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Email sent to {}", notification.getRecipientEmail());

        } catch (Exception e) {
            notification.setStatus(EmailNotificationStatus.FAILED);
            log.error("Failed to send email to {}: {}", notification.getRecipientEmail(), e.getMessage());
        }

        emailNotificationRepository.save(notification);
    }

    private String buildAcceptedEmailHtml(EmailNotification n, String url) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; color: white; border-radius: 12px; overflow: hidden;\">"
            + "<div style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 24px; text-align: center;\">"
            + "<h1 style=\"margin: 0; font-size: 24px;\">Orientus</h1>"
            + "</div>"
            + "<div style=\"padding: 32px;\">"
            + "<h2 style=\"color: #22c55e;\">Bonne nouvelle !</h2>"
            + "<p>Bonjour " + n.getRecipient().getFirstName() + ",</p>"
            + "<p>Un conseiller a accepte votre demande de conversation.</p>"
            + "<p><strong>Conseiller :</strong> " + n.getSenderName() + "</p>"
            + "<p><strong>Sujet :</strong> " + n.getConversation().getSubject() + "</p>"
            + "<p>Vous pouvez maintenant echanger librement avec votre conseiller.</p>"
            + "<div style=\"text-align: center; margin: 32px 0;\">"
            + "<a href=\"" + url + "\" style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;\">Repondre</a>"
            + "</div>"
            + "</div>"
            + "<div style=\"padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #334155;\">"
            + "2026 Orientus - Tous droits reserves"
            + "</div>"
            + "</div>";
    }

    private String buildNewMessageEmailHtml(EmailNotification n, String url) {
        String plural = n.getPendingMessageCount() > 1 ? "s" : "";
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; color: white; border-radius: 12px; overflow: hidden;\">"
            + "<div style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 24px; text-align: center;\">"
            + "<h1 style=\"margin: 0; font-size: 24px;\">Orientus</h1>"
            + "</div>"
            + "<div style=\"padding: 32px;\">"
            + "<p>Bonjour " + n.getRecipient().getFirstName() + ",</p>"
            + "<p>Vous avez <strong>" + n.getPendingMessageCount() + " nouveau" + plural + " message" + plural + "</strong> sur votre espace Orientus.</p>"
            + "<p><strong>Sujet :</strong> " + n.getConversation().getSubject() + "</p>"
            + "<p><strong>Conseiller :</strong> " + n.getSenderName() + "</p>"
            + "<div style=\"background: #334155; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #7c3aed;\">"
            + "<p style=\"margin: 0; color: #cbd5e1;\">\"" + n.getLastMessagePreview() + "\"</p>"
            + "</div>"
            + "<div style=\"text-align: center; margin: 32px 0;\">"
            + "<a href=\"" + url + "\" style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;\">Voir mes messages</a>"
            + "</div>"
            + "</div>"
            + "<div style=\"padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #334155;\">"
            + "2026 Orientus - Tous droits reserves"
            + "</div>"
            + "</div>";
    }

    private String buildRejectedEmailHtml(EmailNotification n) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; color: white; border-radius: 12px; overflow: hidden;\">"
            + "<div style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 24px; text-align: center;\">"
            + "<h1 style=\"margin: 0; font-size: 24px;\">Orientus</h1>"
            + "</div>"
            + "<div style=\"padding: 32px;\">"
            + "<p>Bonjour " + n.getRecipient().getFirstName() + ",</p>"
            + "<p>Votre demande de conversation <strong>\"" + n.getConversation().getSubject() + "\"</strong> n'a pas pu etre traitee pour le moment.</p>"
            + "<p>N'hesitez pas a ouvrir une nouvelle conversation avec plus de details.</p>"
            + "</div>"
            + "<div style=\"padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #334155;\">"
            + "2026 Orientus - Tous droits reserves"
            + "</div>"
            + "</div>";
    }

    private String buildClosedEmailHtml(EmailNotification n, String url) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1e293b; color: white; border-radius: 12px; overflow: hidden;\">"
            + "<div style=\"background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 24px; text-align: center;\">"
            + "<h1 style=\"margin: 0; font-size: 24px;\">Orientus</h1>"
            + "</div>"
            + "<div style=\"padding: 32px;\">"
            + "<p>Bonjour " + n.getRecipient().getFirstName() + ",</p>"
            + "<p>Votre conversation <strong>\"" + n.getConversation().getSubject() + "\"</strong> a ete cloturee.</p>"
            + "<p>Vous pouvez consulter l'historique des messages.</p>"
            + "<div style=\"text-align: center; margin: 32px 0;\">"
            + "<a href=\"" + url + "\" style=\"background: #334155; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none;\">Voir l'historique</a>"
            + "</div>"
            + "</div>"
            + "<div style=\"padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #334155;\">"
            + "2026 Orientus - Tous droits reserves"
            + "</div>"
            + "</div>";
    }
}

