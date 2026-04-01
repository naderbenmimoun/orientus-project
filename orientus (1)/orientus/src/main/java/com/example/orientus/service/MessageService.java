package com.example.orientus.service;

import com.example.orientus.dto.ConversationDTO;
import com.example.orientus.dto.CreateConversationRequest;
import com.example.orientus.dto.MessageDTO;
import com.example.orientus.dto.SendMessageRequest;
import com.example.orientus.entity.Conversation;
import com.example.orientus.entity.Message;
import com.example.orientus.entity.User;
import com.example.orientus.enums.ConversationStatus;
import com.example.orientus.enums.EmailNotificationType;
import com.example.orientus.enums.MessageType;
import com.example.orientus.repository.ConversationRepository;
import com.example.orientus.repository.MessageRepository;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessagingEmailService messagingEmailService;

    private static final int MAX_INITIAL_MESSAGES = 2;
    private static final int MAX_PENDING_CONVERSATIONS = 1;
    private static final int MAX_ACTIVE_CONVERSATIONS = 3;

    public ConversationDTO createConversation(Long studentId, CreateConversationRequest request) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        Long pendingCount = conversationRepository.countByStudentIdAndStatus(studentId, ConversationStatus.PENDING);
        if (pendingCount >= MAX_PENDING_CONVERSATIONS) {
            throw new RuntimeException("Vous avez deja une conversation en attente. Attendez qu'un conseiller la prenne en charge.");
        }

        Long activeCount = conversationRepository.countByStudentIdAndStatusIn(studentId, List.of(ConversationStatus.PENDING, ConversationStatus.ACTIVE));
        if (activeCount >= MAX_ACTIVE_CONVERSATIONS) {
            throw new RuntimeException("Vous avez atteint la limite de 3 conversations actives.");
        }

        Conversation conversation = new Conversation();
        conversation.setStudent(student);
        conversation.setSubject(request.getSubject());
        conversation.setStatus(ConversationStatus.PENDING);
        conversation.setInitialMessageCount(1);
        conversation = conversationRepository.save(conversation);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(student);
        message.setContent(request.getFirstMessage());
        message.setMessageType(MessageType.TEXT);
        messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/admin/new-conversation",
            ConversationDTO.fromEntity(conversation, 1L));

        log.info("New conversation created by student {} : {}", studentId, request.getSubject());

        return ConversationDTO.fromEntity(conversation, 0L);
    }

    public MessageDTO sendMessage(Long conversationId, Long senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        validateMessageSending(conversation, sender);

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new RuntimeException("Le message ne peut pas etre vide.");
        }
        if (request.getContent().length() > 2000) {
            throw new RuntimeException("Le message ne peut pas depasser 2000 caracteres.");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent().trim());
        message.setMessageType(MessageType.TEXT);
        message = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        if (conversation.getStatus() == ConversationStatus.PENDING && sender.getId().equals(conversation.getStudent().getId())) {
            conversation.setInitialMessageCount(conversation.getInitialMessageCount() + 1);
        }
        conversationRepository.save(conversation);

        MessageDTO messageDTO = MessageDTO.fromEntity(message);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, messageDTO);

        if (!sender.getId().equals(conversation.getStudent().getId())) {
            String senderName = sender.getFirstName() + " " + sender.getLastName();
            messagingEmailService.scheduleNewMessageEmail(
                conversation.getStudent(), conversation, senderName, request.getContent()
            );
        }

        log.info("Message sent in conversation {} by user {}", conversationId, senderId);

        return messageDTO;
    }

    public ConversationDTO acceptConversation(Long conversationId, Long adminId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (conversation.getStatus() != ConversationStatus.PENDING) {
            throw new RuntimeException("Cette conversation n'est pas en attente.");
        }

        conversation.setAssignedAdmin(admin);
        conversation.setStatus(ConversationStatus.ACTIVE);
        conversation.setAcceptedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message systemMsg = new Message();
        systemMsg.setConversation(conversation);
        systemMsg.setSender(admin);
        systemMsg.setContent("Conversation acceptee par " + admin.getFirstName());
        systemMsg.setMessageType(MessageType.SYSTEM);
        messageRepository.save(systemMsg);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, MessageDTO.fromEntity(systemMsg));
        messagingTemplate.convertAndSend("/topic/student/" + conversation.getStudent().getId() + "/conversation-update",
            ConversationDTO.fromEntity(conversation, 0L));

        messagingEmailService.sendImmediateEmail(conversation.getStudent(), conversation,
            EmailNotificationType.CONVERSATION_ACCEPTED, admin.getFirstName());

        log.info("Conversation {} accepted by admin {}", conversationId, adminId);

        return ConversationDTO.fromEntity(conversation, 0L);
    }

    public ConversationDTO rejectConversation(Long conversationId, Long adminId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (conversation.getStatus() != ConversationStatus.PENDING) {
            throw new RuntimeException("Cette conversation n'est pas en attente.");
        }

        conversation.setStatus(ConversationStatus.REJECTED);
        conversation.setClosedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message systemMsg = new Message();
        systemMsg.setConversation(conversation);
        systemMsg.setSender(admin);
        systemMsg.setContent("Conversation refusee");
        systemMsg.setMessageType(MessageType.SYSTEM);
        messageRepository.save(systemMsg);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, MessageDTO.fromEntity(systemMsg));

        messagingEmailService.sendImmediateEmail(conversation.getStudent(), conversation,
            EmailNotificationType.CONVERSATION_REJECTED, admin.getFirstName());

        log.info("Conversation {} rejected by admin {}", conversationId, adminId);

        return ConversationDTO.fromEntity(conversation, 0L);
    }

    public ConversationDTO closeConversation(Long conversationId, Long adminId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User admin = userRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        conversation.setStatus(ConversationStatus.CLOSED);
        conversation.setClosedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message systemMsg = new Message();
        systemMsg.setConversation(conversation);
        systemMsg.setSender(admin);
        systemMsg.setContent("Conversation fermee par " + admin.getFirstName());
        systemMsg.setMessageType(MessageType.SYSTEM);
        messageRepository.save(systemMsg);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, MessageDTO.fromEntity(systemMsg));

        messagingEmailService.sendImmediateEmail(conversation.getStudent(), conversation,
            EmailNotificationType.CONVERSATION_CLOSED, admin.getFirstName());

        log.info("Conversation {} closed by admin {}", conversationId, adminId);

        return ConversationDTO.fromEntity(conversation, 0L);
    }

    public ConversationDTO transferConversation(Long conversationId, Long currentAdminId, Long newAdminId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User newAdmin = userRepository.findById(newAdminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        conversation.setAssignedAdmin(newAdmin);
        conversationRepository.save(conversation);

        Message systemMsg = new Message();
        systemMsg.setConversation(conversation);
        systemMsg.setSender(newAdmin);
        systemMsg.setContent("Conversation transferee a " + newAdmin.getFirstName());
        systemMsg.setMessageType(MessageType.SYSTEM);
        messageRepository.save(systemMsg);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, MessageDTO.fromEntity(systemMsg));

        log.info("Conversation {} transferred to admin {}", conversationId, newAdminId);

        return ConversationDTO.fromEntity(conversation, 0L);
    }

    public List<MessageDTO> getMessages(Long conversationId, Long userId) {
        messageRepository.markAsRead(conversationId, userId);

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream().map(MessageDTO::fromEntity).toList();
    }

    public List<ConversationDTO> getStudentConversations(Long studentId) {
        List<Conversation> conversations = conversationRepository.findByStudentIdOrderByLastMessageAtDesc(studentId);
        return conversations.stream()
            .map(c -> {
                Long unread = messageRepository.countByConversationIdAndIsReadFalseAndSenderIdNot(c.getId(), studentId);
                return ConversationDTO.fromEntity(c, unread);
            })
            .toList();
    }

    public List<ConversationDTO> getAdminConversations(Long adminId) {
        List<Conversation> conversations = conversationRepository.findByAssignedAdminIdOrderByLastMessageAtDesc(adminId);
        return conversations.stream()
            .map(c -> {
                Long unread = messageRepository.countByConversationIdAndIsReadFalseAndSenderIdNot(c.getId(), adminId);
                return ConversationDTO.fromEntity(c, unread);
            })
            .toList();
    }

    public List<ConversationDTO> getPendingConversations() {
        List<Conversation> conversations = conversationRepository
            .findByStatusAndAssignedAdminIsNullOrderByCreatedAtAsc(ConversationStatus.PENDING);
        return conversations.stream()
            .map(c -> ConversationDTO.fromEntity(c, (long) c.getInitialMessageCount()))
            .toList();
    }

    public List<ConversationDTO> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAllByOrderByLastMessageAtDesc();
        return conversations.stream()
            .map(c -> ConversationDTO.fromEntity(c, 0L))
            .toList();
    }

    public Long getUnreadCountForStudent(Long studentId) {
        return messageRepository.countUnreadForStudent(studentId);
    }

    public Long getUnreadCountForAdmin(Long adminId) {
        return messageRepository.countUnreadForAdmin(adminId);
    }

    private void validateMessageSending(Conversation conversation, User sender) {
        boolean isStudent = sender.getId().equals(conversation.getStudent().getId());
        boolean isAdmin = conversation.getAssignedAdmin() != null && sender.getId().equals(conversation.getAssignedAdmin().getId());
        boolean isOwner = sender.getRole().name().equals("OWNER");

        if (!isStudent && !isAdmin && !isOwner) {
            throw new RuntimeException("Vous n'avez pas acces a cette conversation.");
        }

        if (conversation.getStatus() == ConversationStatus.CLOSED || conversation.getStatus() == ConversationStatus.REJECTED) {
            throw new RuntimeException("Cette conversation est fermee.");
        }

        if (isStudent && conversation.getStatus() == ConversationStatus.PENDING) {
            if (conversation.getInitialMessageCount() >= MAX_INITIAL_MESSAGES) {
                throw new RuntimeException("Vous avez atteint la limite de 2 messages. Attendez qu'un conseiller accepte votre conversation.");
            }
        }
    }
}

