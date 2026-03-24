package com.example.orientus.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service pour l'envoi d'emails
 * Utilise JavaMailSender (Spring Boot Mail)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Envoyer un email de vérification avec un code à 6 chiffres
     * @param toEmail Email du destinataire
     * @param code Code de vérification à 6 chiffres
     */
    public void sendVerificationEmail(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Orientus - Vérification de votre email");
            message.setText(
                    "Bonjour,\n\n"
                    + "Merci de vous être inscrit sur Orientus !\n\n"
                    + "Votre code de vérification est : " + code + "\n\n"
                    + "Ce code expire dans 15 minutes.\n\n"
                    + "Si vous n'avez pas créé de compte, veuillez ignorer cet email.\n\n"
                    + "Cordialement,\n"
                    + "L'équipe Orientus"
            );

            mailSender.send(message);
            log.info("✅ Email de vérification envoyé à : {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {} : {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }
}

