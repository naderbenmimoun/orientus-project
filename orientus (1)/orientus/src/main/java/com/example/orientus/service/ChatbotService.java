package com.example.orientus.service;

import com.example.orientus.dto.*;
import com.example.orientus.entity.PartnerProgram;
import com.example.orientus.repository.PartnerProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service principal du chatbot
 * Amélioré avec :
 * - Amélioration 2 : Anti-hallucination (approche RAG)
 * - Amélioration 3 : Mémoire de conversation (historique)
 * - Amélioration 4 : Fallback intelligent (alternatives)
 * - Amélioration 6 : Clarification automatique
 * - Amélioration 7 : messageId pour feedback
 * - Amélioration 8 : Cache réponses fréquentes
 * - Amélioration 10 : Statistiques dans la réponse
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final GroqLLMService llmService;
    private final ChatbotSearchService searchService;
    private final ChatbotCacheService cacheService;
    private final PartnerProgramRepository programRepository;

    /**
     * Traiter une question de l'étudiant (méthode originale, rétrocompatible)
     * Si appelée sans historique, fonctionne comme avant
     */
    public ChatbotResponse handleQuestion(String question) {
        return handleQuestion(question, null);
    }

    /**
     * Amélioration 3 : Traiter une question avec historique de conversation
     * @param question La question de l'utilisateur
     * @param history L'historique de conversation (peut être null)
     * @return La réponse complète du chatbot
     */
    public ChatbotResponse handleQuestion(String question, List<ChatMessage> history) {

        log.info("💬 Question reçue : {}", question);

        // Amélioration 7 : Générer un messageId unique pour cette réponse
        String messageId = UUID.randomUUID().toString();

        // 1. Récupérer pays disponibles
        List<String> availableCountries = programRepository.findDistinctCountries();

        // 2. Extraire critères avec LLM
        SearchCriteria criteria = llmService.extractCriteria(question, availableCountries);
        log.info("📋 Critères extraits : {}", criteria);

        // 3. Vérifier si in-domain
        if (criteria.getInDomain() == null || !criteria.getInDomain()) {
            return ChatbotResponse.builder()
                    .messageId(messageId)
                    .inDomain(false)
                    .message("Désolé, je suis un assistant spécialisé dans les études à l'étranger et les universités partenaires de l'agence Orientus. Je ne peux pas répondre à cette question.")
                    .needsClarification(false)
                    .build();
        }

        // Amélioration 6 : Vérifier si la question nécessite une clarification
        if (llmService.needsClarification(criteria)) {
            log.info("❓ Question vague détectée — demande de clarification");

            // Générer une réponse de clarification via le LLM
            String clarificationResponse = llmService.generateNaturalResponse(question, List.of(), criteria, history);

            return ChatbotResponse.builder()
                    .messageId(messageId)
                    .inDomain(true)
                    .message(clarificationResponse)
                    .needsClarification(true)
                    .appliedCriteria(criteria)
                    .build();
        }

        // Amélioration 8 : Vérifier le cache avant de faire la recherche + appel LLM
        ChatbotResponse cachedResponse = cacheService.getOrCompute(criteria, () -> {
            return computeResponse(question, criteria, history, messageId);
        });

        // S'assurer que le messageId est unique même pour les réponses en cache
        cachedResponse.setMessageId(messageId);

        return cachedResponse;
    }

    /**
     * Calculer la réponse (appelé par le cache en cas de cache miss)
     */
    private ChatbotResponse computeResponse(String question, SearchCriteria criteria,
                                             List<ChatMessage> history, String messageId) {

        // 4. Rechercher programmes
        List<PartnerProgram> results = searchService.search(criteria);

        // Amélioration 4 : Si 0 résultat, chercher des alternatives
        List<PartnerProgram> alternatives = null;
        if (results.isEmpty()) {
            log.info("🔄 Aucun résultat — recherche d'alternatives...");
            alternatives = searchService.findAlternatives(criteria);
        }

        // Amélioration 2 + 3 : Générer réponse naturelle avec données réelles + historique
        List<PartnerProgram> programsForLLM = results.isEmpty() && alternatives != null && !alternatives.isEmpty()
                ? alternatives : results;

        String naturalResponse = llmService.generateNaturalResponse(question, programsForLLM, criteria, history);

        // Si on utilise des alternatives, ajouter un message explicatif
        if (results.isEmpty() && alternatives != null && !alternatives.isEmpty()) {
            naturalResponse = naturalResponse + "\n\n💡 *Ces résultats sont des suggestions alternatives basées sur des critères élargis.*";
        }

        // Amélioration 10 : Calculer les statistiques
        SearchStats stats = searchService.computeStats(programsForLLM);

        // 6. Construire réponse finale
        return ChatbotResponse.builder()
                .messageId(messageId)
                .inDomain(true)
                .message(naturalResponse)
                .results(programsForLLM.stream()
                        .map(ProgramResult::fromEntity)
                        .limit(10)
                        .collect(Collectors.toList()))
                .appliedCriteria(criteria)
                .needsClarification(false)
                .stats(stats)
                .build();
    }
}