package com.example.orientus.config;

import com.example.orientus.entity.PartnerProgram;
import com.example.orientus.repository.PartnerProgramRepository;
import com.example.orientus.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements ApplicationRunner {

    private final PartnerProgramRepository partnerProgramRepository;
    private final ExcelImportService excelImportService;
    private final ResourceLoader resourceLoader;

    @Value("${excel.import.path}")
    private String excelPath;

    @Value("${excel.import.enabled}")
    private boolean importEnabled;

    @Override
    public void run(ApplicationArguments args) throws Exception {

        if (!importEnabled) {
            log.info("ℹ️ Excel import is disabled");
            return;
        }

        log.info("🚀 Starting Excel import...");

        // Vérifier si base déjà remplie
        long existingCount = partnerProgramRepository.count();
        if (existingCount > 0) {
            log.info("✅ Database already contains {} programs. Skipping import.", existingCount);
            return;
        }

        // Charger fichier Excel
        Resource resource = resourceLoader.getResource(excelPath);
        if (!resource.exists()) {
            log.error("❌ Excel file not found at: {}", excelPath);
            return;
        }

        try {
            // Import
            List<PartnerProgram> programs = excelImportService.importExcel(resource.getInputStream());

            // Sauvegarder en batch
            log.info("💾 Saving {} programs to database...", programs.size());
            partnerProgramRepository.saveAll(programs);

            // Statistiques
            long totalCountries = programs.stream()
                    .map(PartnerProgram::getCountry)
                    .distinct()
                    .count();

            log.info("✅ Import successful!");
            log.info("   Total programs: {}", programs.size());
            log.info("   Total countries: {}", totalCountries);

            // Détails par pays
            programs.stream()
                    .collect(Collectors.groupingBy(PartnerProgram::getCountry, Collectors.counting()))
                    .forEach((country, count) -> log.info("   - {}: {} programs", country, count));

            log.info("🤖 Chatbot ready!");

        } catch (Exception e) {
            log.error("❌ Failed to import Excel: {}", e.getMessage(), e);
        }
    }
}