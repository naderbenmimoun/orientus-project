package com.example.orientus.controller;

import com.example.orientus.dto.ChatbotResponse;
import com.example.orientus.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * Endpoint principal du chatbot
     * POST /api/chatbot/ask
     * Body: { "question": "Je veux un master en IA en Espagne" }
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(@RequestBody Map<String, String> request) {

        String question = request.get("question");

        // Validation
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(
                    ChatbotResponse.builder()
                            .inDomain(false)
                            .message("Veuillez poser une question.")
                            .build()
            );
        }

        // Traiter la question
        ChatbotResponse response = chatbotService.handleQuestion(question);

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de test
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Chatbot",
                "message", "Chatbot is ready!"
        ));
    }
}