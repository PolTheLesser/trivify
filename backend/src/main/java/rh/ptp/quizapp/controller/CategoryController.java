package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.service.QuizService;

import java.util.List;

/**
 * Dieser Controller stellt Endpunkte zur Verfügung, um Quiz-Kategorien abzurufen.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private QuizService quizService;

    /**
     * Gibt alle verfügbaren Quiz-Kategorien als Enum zurück.
     *
     * @return Eine {@link ResponseEntity} mit einem Array aller {@link QuizCategory}-Enum-Werte.
     */
    @GetMapping
    public ResponseEntity<QuizCategory[]> getCategories() {
        return ResponseEntity.ok(QuizCategory.class.getEnumConstants());
    }

    /**
     * Gibt die Namen aller verfügbaren Quiz-Kategorien als Liste von Strings zurück.
     *
     * @return Eine {@link ResponseEntity} mit einer Liste der Kategorie-Namen.
     */
    @GetMapping("/values")
    public ResponseEntity<List<String>> getCategoryValues() {
        return ResponseEntity.ok(quizService.getCategoryValues());
    }
}