package com.example.orientus.service;

import com.example.orientus.dto.ChatMessage;
import com.example.orientus.dto.SearchCriteria;
import com.example.orientus.entity.PartnerProgram;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service d'interaction avec l'API Groq (LLM Llama 3.3)
 * Amélioré avec :
 * - Amélioration 2 : Anti-hallucination (approche RAG stricte)
 * - Amélioration 3 : Support de l'historique de conversation
 * - Amélioration 5 : Multi-langue (FR/EN/AR) — détection automatique
 * - Amélioration 6 : Clarification automatique pour questions vagues
 */
@Service
@Slf4j
public class GroqLLMService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Nombre maximum de messages d'historique envoyés à Groq */
    private static final int MAX_HISTORY_SIZE = 10;

    /**
     * Extraire critères de recherche depuis la question
     * (inchangé dans la logique, amélioré dans le prompt)
     */
    public SearchCriteria extractCriteria(String userQuestion, List<String> availableCountries) {

        String systemPrompt = buildExtractionPrompt(availableCountries);

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userQuestion)
                ),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        try {
            String response = callGroq(request);

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            log.info("LLM extracted criteria: {}", content);

            SearchCriteria criteria = objectMapper.readValue(content, SearchCriteria.class);

            // Normaliser le nom du pays
            if (criteria.getCountry() != null) {
                criteria.setCountry(normalizeCountryName(criteria.getCountry(), availableCountries));
            }

            return criteria;

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'extraction des critères : {}", e.getMessage());

            SearchCriteria fallback = new SearchCriteria();
            fallback.setInDomain(containsStudyKeywords(userQuestion));
            return fallback;
        }
    }

    /**
     * Amélioration 2 + 3 + 5 + 6 : Générer réponse naturelle avec approche RAG stricte
     * - N'utilise QUE les données réelles de la BDD
     * - Supporte l'historique de conversation
     * - Répond dans la langue de l'utilisateur
     * - Pose des questions de clarification si nécessaire
     *
     * @param userQuestion La question de l'utilisateur
     * @param results Les programmes réels trouvés en BDD
     * @param criteria Les critères extraits
     * @param history L'historique de conversation (peut être null)
     * @return La réponse naturelle formatée
     */
    public String generateNaturalResponse(String userQuestion, List<PartnerProgram> results,
                                           SearchCriteria criteria, List<ChatMessage> history) {

        // Amélioration 2 : System prompt strict anti-hallucination + multi-langue + clarification
        String systemPrompt = buildResponseSystemPrompt();

        // Amélioration 2 : Construire le contexte de données réelles (RAG)
        String dataContext = buildDataContext(results, criteria);

        String userPrompt = buildUserPrompt(userQuestion, results, criteria, dataContext);

        // Amélioration 3 : Construire la liste de messages avec historique
        List<Map<String, String>> messages = buildMessagesWithHistory(systemPrompt, userPrompt, history);

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7
        );

        try {
            String response = callGroq(request);
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("❌ Erreur lors de la génération de la réponse : {}", e.getMessage());
            return "Désolé, une erreur s'est produite. Veuillez réessayer.";
        }
    }

    /**
     * Surcharge rétrocompatible (sans historique) pour ne pas casser l'existant
     */
    public String generateNaturalResponse(String userQuestion, List<PartnerProgram> results, SearchCriteria criteria) {
        return generateNaturalResponse(userQuestion, results, criteria, null);
    }

    /**
     * Amélioration 6 : Déterminer si la question nécessite une clarification
     * Une question est "vague" si elle ne spécifie ni pays, ni niveau, ni domaine
     */
    public boolean needsClarification(SearchCriteria criteria) {
        boolean noCountry = (criteria.getCountry() == null || criteria.getCountry().isBlank());
        boolean noLevel = (criteria.getStudyLevel() == null || criteria.getStudyLevel().isBlank());
        boolean noKeywords = (criteria.getProgramKeywords() == null || criteria.getProgramKeywords().isEmpty());
        boolean noBudget = (criteria.getMaxBudget() == null);

        // Si tous les critères sont absents mais que c'est in-domain → besoin de clarification
        return noCountry && noLevel && noKeywords && noBudget;
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTHODES PRIVÉES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Amélioration 2 + 5 + 6 : System prompt strict pour la réponse
     * Anti-hallucination + Multi-langue + Clarification
     */
    private String buildResponseSystemPrompt() {
        return """
            Tu es un conseiller d'orientation universitaire sympathique pour l'agence Orientus.
            
            === RÈGLES STRICTES (ANTI-HALLUCINATION) ===
            Tu ne dois JAMAIS mentionner un programme qui n'est pas dans les données fournies ci-dessous.
            Si aucun résultat n'est trouvé, dis-le clairement. N'invente RIEN.
            Présente UNIQUEMENT les programmes de la liste fournie dans le contexte de données.
            Ne génère PAS de faux noms d'universités, de pays ou de programmes.
            
            === MULTI-LANGUE ===
            Détecte automatiquement la langue du message de l'utilisateur.
            Réponds TOUJOURS dans la même langue que l'utilisateur :
            - Si l'utilisateur écrit en français → réponds en français
            - Si l'utilisateur écrit en anglais → réponds en anglais
            - Si l'utilisateur écrit en arabe → réponds en arabe
            
            === CLARIFICATION ===
            Si la question est trop vague (ex: "je veux étudier" sans préciser pays/niveau/domaine),
            pose des questions de clarification au lieu de deviner :
            - Dans quel pays souhaites-tu étudier ?
            - Quel niveau (Bachelor, Master, PhD) ?
            - Quel domaine t'intéresse ?
            - Quel est ton budget maximum par an ?
            
            === FORMAT DE RÉPONSE ===
            1. Phrase d'intro accueillante
            2. Pour chaque programme (max 10):
               🎓 **Université** : [nom]
               🌍 **Pays** : [pays]
               📚 **Programme** : [nom]
               🎯 **Niveau** : [Bachelor/Master/PhD]
               💰 **Frais** : [montant]
               📅 **Rentrée** : [intake]
            3. Phrase de conclusion invitant à postuler.
            
            Sois naturel, enthousiaste et professionnel.
            """;
    }

    /**
     * Amélioration 2 : Construire le contexte de données réelles (approche RAG)
     * Ce contexte est envoyé au LLM pour qu'il ne puisse utiliser QUE ces données
     */
    private String buildDataContext(List<PartnerProgram> results, SearchCriteria criteria) {
        StringBuilder context = new StringBuilder();
        context.append("=== DONNÉES RÉELLES DE LA BASE DE DONNÉES ===\n");
        context.append("Critères appliqués : ").append(formatCriteria(criteria)).append("\n\n");

        if (results.isEmpty()) {
            context.append("AUCUN PROGRAMME TROUVÉ dans la base de données pour ces critères.\n");
            context.append("Tu dois informer l'utilisateur qu'aucun résultat ne correspond.\n");
        } else {
            context.append("PROGRAMMES TROUVÉS (").append(results.size()).append(" résultats) :\n\n");
            for (int i = 0; i < results.size(); i++) {
                PartnerProgram p = results.get(i);
                context.append(String.format("[%d] Université: %s | Pays: %s | Programme: %s | Niveau: %s | Frais: %s | Rentrée: %s | Langue: %s | Ville: %s\n",
                        i + 1,
                        p.getUniversityName(),
                        p.getCountry(),
                        p.getProgramName(),
                        p.getStudyLevel() != null ? p.getStudyLevel() : "N/A",
                        p.getTuitionFeesRaw() != null ? p.getTuitionFeesRaw() : "N/A",
                        p.getIntakes() != null ? p.getIntakes() : "N/A",
                        p.getLanguage() != null ? p.getLanguage() : "N/A",
                        p.getCity() != null ? p.getCity() : "N/A"
                ));
            }
        }

        return context.toString();
    }

    /**
     * Construire le prompt utilisateur avec le contexte de données
     */
    private String buildUserPrompt(String userQuestion, List<PartnerProgram> results,
                                    SearchCriteria criteria, String dataContext) {
        if (results.isEmpty()) {
            return String.format("""
                Question de l'utilisateur: "%s"
                
                %s
                
                Écris une réponse polie expliquant qu'aucun programme ne correspond exactement,
                et propose de reformuler la recherche avec d'autres critères (pays, niveau, domaine).
                """,
                    userQuestion,
                    dataContext
            );
        } else {
            return String.format("""
                Question de l'utilisateur: "%s"
                
                %s
                
                IMPORTANT: Présente UNIQUEMENT les programmes listés ci-dessus. N'en invente aucun.
                """,
                    userQuestion,
                    dataContext
            );
        }
    }

    /**
     * Amélioration 3 : Construire la liste de messages incluant l'historique
     * Limite à MAX_HISTORY_SIZE derniers messages pour éviter de dépasser la fenêtre de contexte
     */
    private List<Map<String, String>> buildMessagesWithHistory(String systemPrompt, String userPrompt,
                                                                List<ChatMessage> history) {
        List<Map<String, String>> messages = new ArrayList<>();

        // Toujours commencer par le system prompt
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Ajouter l'historique (si présent, limité aux 10 derniers messages)
        if (history != null && !history.isEmpty()) {
            List<ChatMessage> limitedHistory = history.size() > MAX_HISTORY_SIZE
                    ? history.subList(history.size() - MAX_HISTORY_SIZE, history.size())
                    : history;

            for (ChatMessage msg : limitedHistory) {
                String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "assistant";
                messages.add(Map.of("role", role, "content", msg.getContent()));
            }
        }

        // Ajouter le nouveau message utilisateur (avec contexte de données)
        messages.add(Map.of("role", "user", "content", userPrompt));

        return messages;
    }

    /**
     * Appel API Groq
     */
    private String callGroq(Map<String, Object> request) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Groq API error: " + response.getStatusCode());
        }

        return response.getBody();
    }

    /**
     * Construire prompt d'extraction
     */
    private String buildExtractionPrompt(List<String> availableCountries) {
        return String.format("""
        Tu es un assistant d'extraction de critères pour une agence d'orientation universitaire.
        
        PAYS DISPONIBLES: %s
        
        TÂCHE: Analyser la question et extraire les critères de recherche.
        
        RÈGLES IMPORTANTES:
        - inDomain = true si la question mentionne : études, université, master, bachelor, pays, diplôme, programme, formation
        - inDomain = true même si la question est simple comme "France" ou "je veux étudier en Espagne"
        - inDomain = false UNIQUEMENT pour questions totalement hors-sujet (météo, sport, cuisine, etc.)
        
        FORMAT DE SORTIE (JSON obligatoire):
        {
          "inDomain": true/false,
          "country": "nom exact du pays" (doit être dans la liste ci-dessus, sinon null),
          "studyLevel": "Bachelor" | "Master" | "PhD" | "MBA" | null,
          "programKeywords": ["mot1", "mot2"],
          "maxBudget": nombre | null
        }
        
        EXEMPLES:
        
        Q: "Je veux étudier en France"
        R: {"inDomain":true,"country":"France","studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        Q: "France"
        R: {"inDomain":true,"country":"France","studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        Q: "Recommande-moi des universités en France"
        R: {"inDomain":true,"country":"France","studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        Q: "Master en IA en Espagne"
        R: {"inDomain":true,"country":"Spain","studyLevel":"Master","programKeywords":["AI","artificial intelligence","computer science"],"maxBudget":null}
        
        Q: "Bachelor business moins de 10000 euros"
        R: {"inDomain":true,"country":null,"studyLevel":"Bachelor","programKeywords":["business","management"],"maxBudget":10000}
        
        Q: "Programmes en ligne"
        R: {"inDomain":true,"country":"Online courses","studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        Q: "Qui est Messi ?"
        R: {"inDomain":false,"country":null,"studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        Q: "Météo à Paris"
        R: {"inDomain":false,"country":null,"studyLevel":null,"programKeywords":[],"maxBudget":null}
        
        IMPORTANT:
        - Le pays doit correspondre EXACTEMENT à un pays de la liste
        - "France" reste "France", "Espagne" devient "Spain", "Allemagne" devient "Germany"
        - Sois PERMISSIF: toute mention d'études = inDomain true
        - Réponds UNIQUEMENT avec du JSON valide, rien d'autre
        """,
                String.join(", ", availableCountries)
        );
    }

    /**
     * Normaliser le nom du pays (FR → EN)
     */
    private String normalizeCountryName(String country, List<String> availableCountries) {
        if (country == null || country.isBlank()) {
            return null;
        }

        // Mapping français → anglais
        Map<String, String> countryMapping = Map.of(
                "france", "France",
                "espagne", "Spain",
                "allemagne", "Germany",
                "italie", "Italy",
                "autriche", "Austria",
                "pologne", "Poland",
                "lituanie", "Lithuania",
                "pays-bas", "Netherlands",
                "en ligne", "Online courses"
        );

        String normalized = countryMapping.getOrDefault(country.toLowerCase(), country);

        // Vérifier si le pays existe dans la base
        for (String available : availableCountries) {
            if (available.equalsIgnoreCase(normalized)) {
                return available;
            }
        }

        return null;
    }

    /**
     * Formater programmes pour le LLM (utilisé par buildDataContext)
     */
    private String formatProgramsForLLM(List<PartnerProgram> programs) {
        return programs.stream()
                .limit(10)
                .map(p -> String.format(
                        "Université: %s | Pays: %s | Programme: %s | Niveau: %s | Frais: %s | Rentrée: %s",
                        p.getUniversityName(),
                        p.getCountry(),
                        p.getProgramName(),
                        p.getStudyLevel() != null ? p.getStudyLevel() : "N/A",
                        p.getTuitionFeesRaw() != null ? p.getTuitionFeesRaw() : "N/A",
                        p.getIntakes() != null ? p.getIntakes() : "N/A"
                ))
                .collect(Collectors.joining("\n"));
    }

    /**
     * Formater critères
     */
    private String formatCriteria(SearchCriteria criteria) {
        StringBuilder sb = new StringBuilder();
        if (criteria.getCountry() != null) sb.append("Pays: ").append(criteria.getCountry()).append(" | ");
        if (criteria.getStudyLevel() != null) sb.append("Niveau: ").append(criteria.getStudyLevel()).append(" | ");
        if (criteria.getProgramKeywords() != null && !criteria.getProgramKeywords().isEmpty()) {
            sb.append("Domaines: ").append(String.join(", ", criteria.getProgramKeywords()));
        }
        if (criteria.getMaxBudget() != null) sb.append(" | Budget max: ").append(criteria.getMaxBudget()).append("€");
        return sb.length() > 0 ? sb.toString() : "Aucun critère détecté";
    }

    /**
     * Fallback: détecter keywords études
     */
    private boolean containsStudyKeywords(String question) {
        String q = question.toLowerCase();

        String[] keywords = {
                // Français
                "université", "universités", "étude", "études", "étudier",
                "master", "bachelor", "licence", "doctorat", "phd", "mba",
                "programme", "programmes", "formation", "formations",
                "diplôme", "diplômes", "campus", "admission",
                "france", "espagne", "allemagne", "italie",

                // Anglais
                "university", "universities", "study", "studies",
                "program", "programs", "degree", "degrees",
                "visa", "tuition", "intake", "course", "courses",

                // Arabe (translittéré)
                "جامعة", "دراسة", "ماجستير", "بكالوريوس", "برنامج"
        };

        for (String kw : keywords) {
            if (q.contains(kw)) return true;
        }
        return false;
    }
}