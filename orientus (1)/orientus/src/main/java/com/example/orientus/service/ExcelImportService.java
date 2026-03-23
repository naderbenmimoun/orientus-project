package com.example.orientus.service;

import com.example.orientus.entity.PartnerProgram;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ExcelImportService {

    /**
     * Importer tous les sheets d'un fichier Excel
     */
    public List<PartnerProgram> importExcel(InputStream inputStream) throws Exception {
        List<PartnerProgram> programs = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            int totalSheets = workbook.getNumberOfSheets();
            log.info("📄 Found {} sheets in Excel file", totalSheets);

            for (int i = 0; i < totalSheets; i++) {
                Sheet sheet = workbook.getSheetAt(i);
                String country = sheet.getSheetName();

                log.info("📄 Reading sheet: {}", country);

                List<PartnerProgram> sheetPrograms = parseSheet(sheet, country);
                programs.addAll(sheetPrograms);

                log.info("   ✅ Imported {} programs from {}", sheetPrograms.size(), country);
            }
        }

        log.info("✅ Total programs imported: {}", programs.size());
        return programs;
    }

    /**
     * Parser un sheet spécifique
     */
    private List<PartnerProgram> parseSheet(Sheet sheet, String country) {
        List<PartnerProgram> programs = new ArrayList<>();

        // Détecter les colonnes
        Map<String, Integer> columnMap = detectColumns(sheet);

        if (columnMap.isEmpty()) {
            log.warn("⚠️ No valid headers found in sheet: {}", country);
            return programs;
        }

        // Boucler sur les lignes de données
        int lastRow = sheet.getLastRowNum();

        for (int rowNum = 1; rowNum <= lastRow; rowNum++) {
            Row row = sheet.getRow(rowNum);

            if (isRowEmpty(row)) {
                continue;
            }

            try {
                PartnerProgram program = parseRow(row, columnMap, country, sheet.getSheetName());

                if (program != null) {
                    programs.add(program);
                }

            } catch (Exception e) {
                log.warn("⚠️ Error parsing row {} in sheet {}: {}", rowNum, country, e.getMessage());
            }
        }

        return programs;
    }

    /**
     * Détecter les colonnes depuis la première ligne (headers)
     */
    private Map<String, Integer> detectColumns(Sheet sheet) {
        Map<String, Integer> columnMap = new HashMap<>();

        // Chercher headers dans row 0, 1 ou 2
        Row headerRow = null;

        for (int i = 0; i <= 2; i++) {
            Row row = sheet.getRow(i);
            if (row != null && hasValidHeaders(row)) {
                headerRow = row;
                break;
            }
        }

        if (headerRow == null) {
            return columnMap;
        }

        // Parser headers
        for (int colNum = 0; colNum < headerRow.getLastCellNum(); colNum++) {
            String headerValue = getCellValueAsString(headerRow.getCell(colNum));

            // Protection contre null
            if (headerValue == null || headerValue.isBlank()) {
                continue;
            }

            String header = headerValue.toLowerCase().trim();
            if (header.contains("universit") || header.equals("name")) {
                columnMap.put("university", colNum);
            }
            else if (header.contains("program")) {
                columnMap.put("program", colNum);
            }
            else if (header.contains("degree") || header.contains("level")) {
                columnMap.put("level", colNum);
            }
            else if (header.contains("tuition") || header.contains("fee") ||
                    header.contains("price") || header.contains("per year")) {
                columnMap.put("tuition", colNum);
            }
            else if (header.contains("intake")) {
                columnMap.put("intakes", colNum);
            }
            else if (header.contains("language")) {
                columnMap.put("language", colNum);
            }
            else if (header.contains("city") || header.contains("online")) {
                columnMap.put("city", colNum);
            }
            else if (header.contains("duration") || header.contains("period")) {
                columnMap.put("duration", colNum);
            }
            else if (header.contains("website")) {
                columnMap.put("website", colNum);
            }
        }

        return columnMap;
    }

    /**
     * Vérifier si row contient des headers valides
     */
    private boolean hasValidHeaders(Row row) {
        if (row == null) return false;

        for (Cell cell : row) {
            String value = getCellValueAsString(cell);

            // Protection contre null
            if (value == null || value.isBlank()) {
                continue;
            }

            String lowerValue = value.toLowerCase();
            if (lowerValue.contains("universit") || lowerValue.contains("program") ||
                    lowerValue.contains("degree") || lowerValue.contains("tuition")) {
                return true;
            }
        }
        return false;
    }

    /**
     * Parser une ligne de données
     */
    private PartnerProgram parseRow(Row row, Map<String, Integer> columnMap, String country, String sourceSheet) {

        String universityName = getCellValue(row, columnMap.get("university"));
        String programName = getCellValue(row, columnMap.get("program"));

        // Validation: champs obligatoires
        if (universityName == null || universityName.isBlank() ||
                programName == null || programName.isBlank()) {
            return null;
        }

        PartnerProgram program = new PartnerProgram();
        program.setCountry(country);
        program.setSourceSheet(sourceSheet);
        program.setUniversityName(universityName.trim());
        program.setProgramName(programName.trim());

        program.setStudyLevel(getCellValue(row, columnMap.get("level")));

        // Frais de scolarité
        String tuitionRaw = getCellValue(row, columnMap.get("tuition"));
        program.setTuitionFeesRaw(tuitionRaw);
        parseTuition(tuitionRaw, program);

        program.setIntakes(getCellValue(row, columnMap.get("intakes")));
        program.setLanguage(getCellValue(row, columnMap.get("language")));
        program.setCity(getCellValue(row, columnMap.get("city")));
        program.setDuration(getCellValue(row, columnMap.get("duration")));
        program.setWebsiteUrl(getCellValue(row, columnMap.get("website")));

        return program;
    }

    /**
     * Parser les frais de scolarité (montant + devise)
     */
    private void parseTuition(String raw, PartnerProgram program) {
        if (raw == null || raw.isBlank()) {
            return;
        }

        // Détecter devise
        if (raw.contains("€") || raw.toUpperCase().contains("EUR")) {
            program.setTuitionCurrency("EUR");
        } else if (raw.contains("$") || raw.toUpperCase().contains("USD")) {
            program.setTuitionCurrency("USD");
        } else if (raw.contains("£") || raw.toUpperCase().contains("GBP")) {
            program.setTuitionCurrency("GBP");
        } else {
            program.setTuitionCurrency("EUR");
        }

        // Extraire montant
        try {
            Pattern pattern = Pattern.compile("([0-9][0-9\\s,.-]*)");
            Matcher matcher = pattern.matcher(raw);

            if (matcher.find()) {
                String numberStr = matcher.group(1)
                        .replaceAll("\\s", "")
                        .replaceAll(",", "")
                        .split("-")[0];

                program.setTuitionAmount(Double.parseDouble(numberStr));
            }
        } catch (Exception e) {
            log.debug("Could not parse tuition amount: {}", raw);
        }
    }

    /**
     * Lire valeur de cellule
     */
    private String getCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null || row == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);
        return getCellValueAsString(cell);
    }

    /**
     * Convertir Cell en String
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    /**
     * Vérifier si row est vide
     */
    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }

        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            String value = getCellValueAsString(cell);
            if (value != null && !value.isBlank()) {
                return false;
            }
        }

        return true;
    }
}