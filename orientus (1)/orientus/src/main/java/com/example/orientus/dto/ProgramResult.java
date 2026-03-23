package com.example.orientus.dto;

import com.example.orientus.entity.PartnerProgram;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResult {

    private Long id;
    private String university;
    private String country;
    private String program;
    private String level;
    private String tuition;
    private String intake;
    private String language;
    private String city;
    private String duration;
    private String websiteUrl;

    /**
     * Convertir PartnerProgram entity → ProgramResult DTO
     */
    public static ProgramResult fromEntity(PartnerProgram p) {
        return ProgramResult.builder()
                .id(p.getId())
                .university(p.getUniversityName())
                .country(p.getCountry())
                .program(p.getProgramName())
                .level(p.getStudyLevel())
                .tuition(p.getTuitionFeesRaw())
                .intake(p.getIntakes())
                .language(p.getLanguage())
                .city(p.getCity())
                .duration(p.getDuration())
                .websiteUrl(p.getWebsiteUrl())
                .build();
    }
}