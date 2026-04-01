package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MLRequestDTO {

    private MLStudentProfile student;
    private List<MLProgramInfo> programs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MLStudentProfile {
        private String interest_field;
        private String preferred_country;
        private String preferred_language;
        private String target_degree;
        private String current_degree;
        private Double gpa;
        private String language_level;
        private Double ielts_score;
        private Double max_budget;
        private String study_mode;
        private Boolean needs_scholarship;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MLProgramInfo {
        private Long id;
        private String title;
        private String category;
        private String country;
        private String degree;
        private Double tuition;
        private String language;
        private String study_mode;
        private Double min_gpa;
        private String min_language_level;
        private Double min_ielts;
        private Boolean scholarship_available;
    }
}

