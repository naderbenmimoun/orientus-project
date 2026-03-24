package com.example.orientus.controller;

import com.example.orientus.dto.*;
import com.example.orientus.entity.ChatFeedback;
import com.example.orientus.repository.ChatFeedbackRepository;
import com.example.orientus.service.ChatbotCacheService;
import com.example.orientus.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller du chatbot
 * Amélioré avec :
 * - Amélioration 1 : Endpoint de bienvenue + suggestions
 * - Amélioration 3 : Support de l'historique via ChatRequest
 * - Amélioration 7 : Endpoint feedback
 * - Amélioration 8 : Endpoint invalidation du cache
 */
@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatFeedbackRepository feedbackRepository;
    private final ChatbotCacheService cacheService;

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 1 : Endpoint de bienvenue + suggestions
    // ═══════════════════════════════════════════════════════════════

    /**
     * GET /api/chatbot/welcome
     * Retourne un message de bienvenue et des suggestions de questions
     */
    @GetMapping("/welcome")
    public ResponseEntity<WelcomeResponse> welcome() {
        WelcomeResponse response = WelcomeResponse.builder()
                .message("👋 Bonjour ! Je suis l'assistant Orientus. Je peux vous aider à trouver des programmes d'études à l'étranger parmi nos universités partenaires. Posez-moi une question !")
                .suggestions(List.of(
                        "Je veux étudier en France",
                        "Programmes Master en IT",
                        "Budget < 5000€/an",
                        "Quels pays sont disponibles ?",
                        "Bachelor en Business en Espagne",
                        "Programmes en anglais en Allemagne"
                ))
                .build();

        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 3 : Endpoint principal avec support historique
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /api/chatbot/ask
     * Endpoint principal du chatbot — accepte ChatRequest (avec historique optionnel)
     * RÉTROCOMPATIBLE : accepte aussi l'ancien format { "question": "..." }
     *
     * Body: { "message": "Je veux un master en IA en Espagne", "history": [...] }
     * OU (ancien format) : { "question": "Je veux un master en IA en Espagne" }
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(@RequestBody Map<String, Object> requestBody) {

        // Rétrocompatibilité : accepter "question" (ancien) ou "message" (nouveau)
        String question = null;
        if (requestBody.containsKey("message")) {
            question = (String) requestBody.get("message");
        } else if (requestBody.containsKey("question")) {
            question = (String) requestBody.get("question");
        }

        // Validation
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(
                    ChatbotResponse.builder()
                            .inDomain(false)
                            .message("Veuillez poser une question.")
                            .needsClarification(false)
                            .build()
            );
        }

        // Amélioration 3 : Extraire l'historique si présent
        List<ChatMessage> history = null;
        if (requestBody.containsKey("history") && requestBody.get("history") instanceof List) {
            try {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> rawHistory = (List<Map<String, String>>) requestBody.get("history");
                history = rawHistory.stream()
                        .map(m -> new ChatMessage(m.get("role"), m.get("content")))
                        .toList();
            } catch (Exception e) {
                log.warn("⚠️ Impossible de parser l'historique : {}", e.getMessage());
            }
        }

        // Traiter la question avec historique
        ChatbotResponse response = chatbotService.handleQuestion(question, history);

        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 7 : Endpoint feedback
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /api/chatbot/feedback
     * Enregistrer un feedback utilisateur sur une réponse du chatbot
     * Body: { "messageId": "uuid", "rating": 5, "comment": "Super !" }
     */
    @PostMapping("/feedback")
    public ResponseEntity<Map<String, String>> submitFeedback(@RequestBody FeedbackRequest request) {
        try {
            // Validation
            if (request.getMessageId() == null || request.getMessageId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "messageId is required"));
            }
            if (request.getRating() < 1 || request.getRating() > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5"));
            }

            // Sauvegarder le feedback
            ChatFeedback feedback = new ChatFeedback();
            feedback.setMessageId(request.getMessageId());
            feedback.setRating(request.getRating());
            feedback.setComment(request.getComment());
            feedbackRepository.save(feedback);

            log.info("📝 Feedback reçu : messageId={}, rating={}", request.getMessageId(), request.getRating());

            return ResponseEntity.ok(Map.of("message", "Feedback enregistré. Merci !"));

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'enregistrement du feedback : {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erreur lors de l'enregistrement du feedback"));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 8 : Endpoint invalidation du cache
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /api/chatbot/cache/invalidate
     * Invalider le cache du chatbot (à appeler après ajout de programmes)
     */
    @PostMapping("/cache/invalidate")
    public ResponseEntity<Map<String, String>> invalidateCache() {
        cacheService.invalidateCache();
        return ResponseEntity.ok(Map.of("message", "Cache invalidé avec succès"));
    }

    /**
     * GET /api/chatbot/cache/stats
     * Statistiques du cache (pour monitoring)
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<Map<String, Object>> cacheStats() {
        return ResponseEntity.ok(Map.of(
                "cacheSize", cacheService.getCacheSize(),
                "message", "Cache stats retrieved"
        ));
    }

    // ═══════════════════════════════════════════════════════════════
    // Endpoint de test (inchangé)
    // ═══════════════════════════════════════════════════════════════

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