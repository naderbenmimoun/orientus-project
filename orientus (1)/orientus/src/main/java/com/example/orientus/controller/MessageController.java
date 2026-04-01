package com.example.orientus.controller;

import com.example.orientus.dto.ConversationDTO;
import com.example.orientus.dto.CreateConversationRequest;
import com.example.orientus.dto.MessageDTO;
import com.example.orientus.dto.SendMessageRequest;
import com.example.orientus.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    // ===== ÉTUDIANT =====

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestParam Long studentId, @RequestBody CreateConversationRequest request) {
        try {
            ConversationDTO dto = messageService.createConversation(studentId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/conversations/student/{studentId}")
    public ResponseEntity<?> getStudentConversations(@PathVariable Long studentId) {
        return ResponseEntity.ok(messageService.getStudentConversations(studentId));
    }

    @GetMapping("/conversations/student/{studentId}/unread")
    public ResponseEntity<?> getStudentUnreadCount(@PathVariable Long studentId) {
        return ResponseEntity.ok(Map.of("unreadCount", messageService.getUnreadCountForStudent(studentId)));
    }

    // ===== ADMIN =====

    @GetMapping("/conversations/pending")
    public ResponseEntity<?> getPendingConversations() {
        return ResponseEntity.ok(messageService.getPendingConversations());
    }

    @GetMapping("/conversations/admin/{adminId}")
    public ResponseEntity<?> getAdminConversations(@PathVariable Long adminId) {
        return ResponseEntity.ok(messageService.getAdminConversations(adminId));
    }

    @GetMapping("/conversations/all")
    public ResponseEntity<?> getAllConversations() {
        return ResponseEntity.ok(messageService.getAllConversations());
    }

    @GetMapping("/conversations/admin/{adminId}/unread")
    public ResponseEntity<?> getAdminUnreadCount(@PathVariable Long adminId) {
        return ResponseEntity.ok(Map.of("unreadCount", messageService.getUnreadCountForAdmin(adminId)));
    }

    @PostMapping("/conversations/{conversationId}/accept")
    public ResponseEntity<?> acceptConversation(@PathVariable Long conversationId, @RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(messageService.acceptConversation(conversationId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/conversations/{conversationId}/reject")
    public ResponseEntity<?> rejectConversation(@PathVariable Long conversationId, @RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(messageService.rejectConversation(conversationId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<?> closeConversation(@PathVariable Long conversationId, @RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(messageService.closeConversation(conversationId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/conversations/{conversationId}/transfer")
    public ResponseEntity<?> transferConversation(@PathVariable Long conversationId, @RequestParam Long currentAdminId, @RequestParam Long newAdminId) {
        try {
            return ResponseEntity.ok(messageService.transferConversation(conversationId, currentAdminId, newAdminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ===== MESSAGES =====

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long conversationId, @RequestParam Long userId) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, userId));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long conversationId, @RequestParam Long senderId, @RequestBody SendMessageRequest request) {
        try {
            MessageDTO dto = messageService.sendMessage(conversationId, senderId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

