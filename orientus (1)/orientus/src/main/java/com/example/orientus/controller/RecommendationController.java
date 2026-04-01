package com.example.orientus.controller;

import com.example.orientus.dto.ProgramScoreDTO;
import com.example.orientus.dto.StudentProfileDTO;
import com.example.orientus.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * POST /api/recommendations
     * Reçoit un profil étudiant, retourne les top 10 programmes recommandés
     */
    @PostMapping
    public ResponseEntity<?> getRecommendations(@RequestBody StudentProfileDTO studentProfile) {
        try {
            log.info("🎯 POST /api/recommendations — interest: {}, degree: {}",
                    studentProfile.getInterestField(), studentProfile.getTargetDegree());

            List<ProgramScoreDTO> recommendations = recommendationService.getRecommendations(studentProfile);

            Map<String, Object> response = new HashMap<>();
            response.put("recommendations", recommendations);
            response.put("totalRecommendations", recommendations.size());
            response.put("mlAvailable", recommendationService.isMLAvailable());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Recommendation error: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to get recommendations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/recommendations/health
     * Vérifier si le ML est disponible
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkMLHealth() {
        boolean available = recommendationService.isMLAvailable();
        Map<String, Object> response = new HashMap<>();
        response.put("mlAvailable", available);
        response.put("mlUrl", "http://localhost:5000");
        return ResponseEntity.ok(response);
    }
}

