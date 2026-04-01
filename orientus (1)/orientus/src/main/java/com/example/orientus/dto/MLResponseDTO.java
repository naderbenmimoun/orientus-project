package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MLResponseDTO {
    private List<MLProgramScore> recommendations;
    private Integer total_analyzed;
    private String model_version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MLProgramScore {
        private Long program_id;
        private String title;
        private Double match_score;
        private Integer match_percentage;
    }
}

