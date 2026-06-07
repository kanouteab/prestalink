package com.prestalink.api.review;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long missionId;
    private Integer rating;
    private String comment;
}
