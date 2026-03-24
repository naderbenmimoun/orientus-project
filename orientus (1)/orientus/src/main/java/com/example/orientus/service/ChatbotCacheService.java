package com.example.orientus.service;

import com.example.orientus.dto.ChatbotResponse;
import com.example.orientus.dto.SearchCriteria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Amélioration 8 : Service de cache en mémoire pour les réponses fréquentes du chatbot
 * Évite de rappeler Groq pour des questions identiques dans un court laps de temps
 * TTL = 1 heure
 */
@Service
@Slf4j
public class ChatbotCacheService {

    /** Cache en mémoire : clé normalisée → réponse mise en cache */
    private final ConcurrentHashMap<String, CachedResponse> cache = new ConcurrentHashMap<>();

    /** Durée de vie du cache : 1 heure */
    private static final long TTL_MINUTES = 60;

    /**
     * Réponse mise en cache avec date d'expiration
     */
    @Data
    @AllArgsConstructor
    public static class CachedResponse {
        private ChatbotResponse response;
        private LocalDateTime expirationTime;

        /** Vérifie si la réponse en cache est encore valide */
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expirationTime);
        }
    }

    /**
     * Récupérer une réponse du cache ou la calculer si absente/expirée
     * @param criteria Critères de recherche (utilisés pour générer la clé)
     * @param supplier Fonction pour calculer la réponse si pas en cache
     * @return La réponse (depuis le cache ou fraîchement calculée)
     */
    public ChatbotResponse getOrCompute(SearchCriteria criteria, Supplier<ChatbotResponse> supplier) {
        String cacheKey = buildCacheKey(criteria);

        // Vérifier si une réponse en cache existe et est valide
        CachedResponse cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            log.info("🗃️ Cache HIT pour la clé : {}", cacheKey);
            return cached.getResponse();
        }

        // Calculer la réponse
        log.info("🔄 Cache MISS pour la clé : {}. Calcul en cours...", cacheKey);
        ChatbotResponse response = supplier.get();

        // Mettre en cache
        cache.put(cacheKey, new CachedResponse(
                response,
                LocalDateTime.now().plusMinutes(TTL_MINUTES)
        ));

        return response;
    }

    /**
     * Invalider tout le cache (à appeler quand on ajoute/modifie des programmes)
     */
    public void invalidateCache() {
        int size = cache.size();
        cache.clear();
        log.info("🧹 Cache invalidé ({} entrées supprimées)", size);
    }

    /**
     * Nettoyer les entrées expirées du cache
     */
    public void cleanExpiredEntries() {
        int before = cache.size();
        cache.entrySet().removeIf(entry -> entry.getValue().isExpired());
        int removed = before - cache.size();
        if (removed > 0) {
            log.info("🧹 {} entrées expirées supprimées du cache", removed);
        }
    }

    /**
     * Construire une clé de cache normalisée à partir des critères
     * Format : country_studyLevel_maxBudget_keywords
     */
    private String buildCacheKey(SearchCriteria criteria) {
        StringBuilder key = new StringBuilder();

        key.append(criteria.getCountry() != null ? criteria.getCountry().toLowerCase().trim() : "any");
        key.append("_");
        key.append(criteria.getStudyLevel() != null ? criteria.getStudyLevel().toLowerCase().trim() : "any");
        key.append("_");
        key.append(criteria.getMaxBudget() != null ? criteria.getMaxBudget().intValue() : "any");
        key.append("_");

        if (criteria.getProgramKeywords() != null && !criteria.getProgramKeywords().isEmpty()) {
            key.append(String.join("-", criteria.getProgramKeywords()).toLowerCase());
        } else {
            key.append("none");
        }

        return key.toString();
    }

    /**
     * Taille actuelle du cache (pour monitoring)
     */
    public int getCacheSize() {
        return cache.size();
    }
}

