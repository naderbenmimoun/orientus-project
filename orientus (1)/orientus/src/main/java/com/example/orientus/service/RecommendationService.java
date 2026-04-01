package com.example.orientus.service;

import com.example.orientus.dto.*;
import com.example.orientus.entity.Program;
import com.example.orientus.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final ProgramRepository programRepository;

    @Value("${ml.api.url:http://localhost:5000}")
    private String mlApiUrl;

    /**
     * Appeler le modèle ML pour obtenir les recommandations
     */
    public List<ProgramScoreDTO> getRecommendations(StudentProfileDTO studentProfile) {
        log.info("🤖 ML Recommendation request for interest: {}", studentProfile.getInterestField());

        // 1. Récupérer tous les programmes de la DB
        List<Program> allPrograms = programRepository.findAll();
        log.info("📊 Total programs in DB: {}", allPrograms.size());

        if (allPrograms.isEmpty()) {
            log.warn("⚠️ No programs found in database");
            return new ArrayList<>();
        }

        // 2. Convertir le profil étudiant au format ML
        MLRequestDTO.MLStudentProfile mlStudent = new MLRequestDTO.MLStudentProfile();
        mlStudent.setInterest_field(studentProfile.getInterestField());
        mlStudent.setPreferred_country(studentProfile.getPreferredCountry() != null ? studentProfile.getPreferredCountry() : "ANY");
        mlStudent.setPreferred_language(studentProfile.getPreferredLanguage() != null ? studentProfile.getPreferredLanguage() : "ANY");
        mlStudent.setTarget_degree(studentProfile.getTargetDegree());
        mlStudent.setCurrent_degree(studentProfile.getCurrentDegree());
        mlStudent.setGpa(studentProfile.getGpa());
        mlStudent.setLanguage_level(studentProfile.getLanguageLevel() != null ? studentProfile.getLanguageLevel() : "B2");
        mlStudent.setIelts_score(studentProfile.getIeltsScore());
        mlStudent.setMax_budget(studentProfile.getMaxBudget() != null ? studentProfile.getMaxBudget() : 10000.0);
        mlStudent.setStudy_mode(studentProfile.getStudyMode() != null ? studentProfile.getStudyMode() : "ON_CAMPUS");
        mlStudent.setNeeds_scholarship(studentProfile.getNeedsScholarship() != null ? studentProfile.getNeedsScholarship() : false);

        // 3. Convertir les programmes au format ML
        List<MLRequestDTO.MLProgramInfo> mlPrograms = allPrograms.stream()
                .map(this::convertToMLProgram)
                .collect(Collectors.toList());

        // 4. Construire la requête
        MLRequestDTO mlRequest = new MLRequestDTO();
        mlRequest.setStudent(mlStudent);
        mlRequest.setPrograms(mlPrograms);

        // 5. Appeler le ML FastAPI
        try {
            String predictUrl = mlApiUrl + "/predict";
            log.info("🔗 Calling ML API: {}", predictUrl);

            ResponseEntity<MLResponseDTO> response = restTemplate.postForEntity(
                    predictUrl, mlRequest, MLResponseDTO.class
            );

            if (response.getBody() == null || response.getBody().getRecommendations() == null) {
                log.error("❌ ML API returned null response");
                return new ArrayList<>();
            }

            // 6. Convertir la réponse ML en DTOs
            List<ProgramScoreDTO> results = response.getBody().getRecommendations().stream()
                    .map(mlScore -> new ProgramScoreDTO(
                            mlScore.getProgram_id(),
                            mlScore.getTitle(),
                            mlScore.getMatch_score(),
                            mlScore.getMatch_percentage()
                    ))
                    .collect(Collectors.toList());

            log.info("✅ ML returned {} recommendations (top score: {}%)",
                    results.size(),
                    results.isEmpty() ? 0 : results.get(0).getMatchPercentage());

            return results;

        } catch (Exception e) {
            log.error("❌ ML API call failed: {}", e.getMessage());
            // Fallback : retourner les programmes triés par catégorie match simple
            return fallbackRecommendations(studentProfile, allPrograms);
        }
    }

    /**
     * Convertir un Program entity → MLProgramInfo
     */
    private MLRequestDTO.MLProgramInfo convertToMLProgram(Program program) {
        MLRequestDTO.MLProgramInfo mlProg = new MLRequestDTO.MLProgramInfo();
        mlProg.setId(program.getId());
        mlProg.setTitle(program.getTitle());
        mlProg.setCategory(program.getCategory() != null ? program.getCategory().name() : "OTHER");
        mlProg.setCountry(program.getCountry());
        mlProg.setDegree(program.getDegree() != null ? program.getDegree().name() : "BACHELOR");
        mlProg.setTuition(program.getTuition());
        mlProg.setLanguage(program.getLanguage() != null ? program.getLanguage() : "English");
        mlProg.setStudy_mode(program.getStudyMode() != null ? program.getStudyMode().name() : "ON_CAMPUS");
        mlProg.setMin_gpa(program.getMinGpa());
        mlProg.setMin_language_level(program.getMinLanguageLevel() != null ? program.getMinLanguageLevel() : "B2");
        mlProg.setMin_ielts(program.getMinIelts());
        mlProg.setScholarship_available(program.getScholarshipAvailable() != null ? program.getScholarshipAvailable() : false);
        return mlProg;
    }

    /**
     * Fallback si le ML est indisponible : tri simple par catégorie
     */
    private List<ProgramScoreDTO> fallbackRecommendations(StudentProfileDTO student, List<Program> programs) {
        log.warn("⚠️ Using fallback recommendations (ML unavailable)");
        return programs.stream()
                .filter(p -> p.getCategory() != null && p.getCategory().name().equals(student.getInterestField()))
                .limit(10)
                .map(p -> new ProgramScoreDTO(
                        p.getId(),
                        p.getTitle(),
                        0.5,
                        50
                ))
                .collect(Collectors.toList());
    }

    /**
     * Vérifier si le ML API est disponible
     */
    public boolean isMLAvailable() {
        try {
            String healthUrl = mlApiUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}

