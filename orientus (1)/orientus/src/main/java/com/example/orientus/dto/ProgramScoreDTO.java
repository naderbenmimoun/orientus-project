package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgramScoreDTO {
    private Long programId;
    private String title;
    private Double matchScore;
    private Integer matchPercentage;
}

