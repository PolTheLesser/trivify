package rh.ptp.quizapp.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String dailyQuizReminder;
} 