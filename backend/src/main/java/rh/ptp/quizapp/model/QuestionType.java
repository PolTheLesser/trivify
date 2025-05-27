package rh.ptp.quizapp.model;

/**
 * Enum zur Definition des Typs einer Frage.
 * <p>
 * Ermöglicht Unterscheidung zwischen verschiedenen Antwortformaten.
 * </p>
 */
public enum QuestionType {
    /**
     * Frage mit mehreren Antwortmöglichkeiten (eine oder mehrere korrekt).
     */
    MULTIPLE_CHOICE,

    /**
     * Freitextantwort durch den Benutzer.
     */
    TEXT_INPUT,

    /**
     * Wahr/Falsch-Fragen.
     */
    TRUE_FALSE
}