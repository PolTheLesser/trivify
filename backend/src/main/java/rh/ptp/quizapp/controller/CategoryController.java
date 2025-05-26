package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.service.QuizService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private QuizService quizService;

    @GetMapping
    public ResponseEntity<QuizCategory[]> getCategories() {
        return ResponseEntity.ok(QuizCategory.class.getEnumConstants());
    }

    @GetMapping("/values")
    public ResponseEntity<List<String>> getCategoryValues() {
        return ResponseEntity.ok(quizService.getCategoryValues());
    }
}