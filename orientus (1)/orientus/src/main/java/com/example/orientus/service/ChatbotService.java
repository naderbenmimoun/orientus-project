package com.example.orientus.service;

import com.example.orientus.dto.ChatbotResponse;
import com.example.orientus.dto.ProgramResult;
import com.example.orientus.dto.SearchCriteria;
import com.example.orientus.entity.PartnerProgram;
import com.example.orientus.repository.PartnerProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final GroqLLMService llmService;
    private final ChatbotSearchService searchService;
    private final PartnerProgramRepository programRepository;

    /**
     * Traiter une question de l'étudiant
     */
    public ChatbotResponse handleQuestion(String question) {

        log.info("Handling question: {}", question);

        // 1. Récupérer pays disponibles
        List<String> availableCountries = programRepository.findDistinctCountries();

        // 2. Extraire critères avec LLM
        SearchCriteria criteria = llmService.extractCriteria(question, availableCountries);

        log.info("Extracted criteria: {}", criteria);

        // 3. Vérifier si in-domain
        if (criteria.getInDomain() == null || !criteria.getInDomain()) {
            return ChatbotResponse.builder()
                    .inDomain(false)
                    .message("Désolé, je suis un assistant spécialisé dans les études à l'étranger et les universités partenaires de l'agence Orientus. Je ne peux pas répondre à cette question.")
                    .build();
        }

        // 4. Rechercher programmes
        List<PartnerProgram> results = searchService.search(criteria);

        // 5. Générer réponse naturelle avec LLM
        String naturalResponse = llmService.generateNaturalResponse(question, results, criteria);

        // 6. Construire réponse finale
        return ChatbotResponse.builder()
                .inDomain(true)
                .message(naturalResponse)
                .results(results.stream()
                        .map(ProgramResult::fromEntity)
                        .limit(10)
                        .collect(Collectors.toList()))
                .appliedCriteria(criteria)
                .build();
    }
}