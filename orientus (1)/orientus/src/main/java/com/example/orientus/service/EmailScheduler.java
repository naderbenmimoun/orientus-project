package com.example.orientus.service;

import com.example.orientus.entity.EmailNotification;
import com.example.orientus.enums.EmailNotificationStatus;
import com.example.orientus.repository.EmailNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailScheduler {

    private final EmailNotificationRepository emailNotificationRepository;
    private final MessagingEmailService messagingEmailService;

    @Scheduled(fixedRate = 60000)
    public void processScheduledEmails() {
        List<EmailNotification> pendingEmails = emailNotificationRepository
            .findByStatusAndScheduledAtBefore(EmailNotificationStatus.PENDING, LocalDateTime.now());

        if (!pendingEmails.isEmpty()) {
            log.info("Processing {} scheduled emails", pendingEmails.size());
            for (EmailNotification notif : pendingEmails) {
                messagingEmailService.sendEmail(notif);
            }
        }
    }
}

