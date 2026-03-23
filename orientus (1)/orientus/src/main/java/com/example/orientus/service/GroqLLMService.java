package com.example.orientus.service;

import com.example.orientus.dto.SearchCriteria;
import com.example.orientus.entity.PartnerProgram;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    /**
     * Extraire critères de recherche depuis la question
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

            // AJOUTER CETTE LIGNE : Normaliser le pays
            if (criteria.getCountry() != null) {
                criteria.setCountry(normalizeCountryName(criteria.getCountry(), availableCountries));
            }

            return criteria;

        } catch (Exception e) {
            log.error("Error extracting criteria: {}", e.getMessage());

            SearchCriteria fallback = new SearchCriteria();
            fallback.setInDomain(containsStudyKeywords(userQuestion));
            return fallback;
        }
    }

    /**
     * Générer réponse naturelle avec résultats
     */
    public String generateNaturalResponse(String userQuestion, List<PartnerProgram> results, SearchCriteria criteria) {

        String systemPrompt = """
            Tu es un conseiller d'orientation universitaire sympathique pour l'agence Orientus.
            
            Format de réponse:
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

        String userPrompt;

        if (results.isEmpty()) {
            userPrompt = String.format("""
                Question: "%s"
                
                Critères détectés: %s
                
                Aucun programme trouvé.
                
                Écris une réponse polie expliquant qu'aucun programme ne correspond, 
                et propose de reformuler avec le pays, niveau ou domaine.
                """,
                    userQuestion,
                    formatCriteria(criteria)
            );
        } else {
            userPrompt = String.format("""
                Question: "%s"
                
                Programmes trouvés (%d résultats):
                
                %s
                
                Présente ces programmes de manière claire et engageante.
                """,
                    userQuestion,
                    results.size(),
                    formatProgramsForLLM(results)
            );
        }

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.7
        );

        try {
            String response = callGroq(request);
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("Error generating response: {}", e.getMessage());
            return "Désolé, une erreur s'est produite. Veuillez réessayer.";
        }
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
     * Formater programmes pour le LLM
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
                "visa", "tuition", "intake", "course", "courses"
        };

        for (String kw : keywords) {
            if (q.contains(kw)) return true;
        }
        return false;
    }
}