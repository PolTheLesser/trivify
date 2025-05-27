package rh.ptp.quizapp.dto;

/**
 * Datenübertragungsobjekt für eine gegebene Antwort auf eine Frage.
 * Enthält die ID der Frage und die Antwort des Benutzers.
 */
public class AnswerDTO {
    private Long questionId;
    private String answer;

    /**
     * Standardkonstruktor.
     */
    public AnswerDTO() {
    }

    /**
     * Konstruktor mit Parametern.
     *
     * @param questionId ID der Frage
     * @param answer     Benutzerantwort zur Frage
     */
    public AnswerDTO(Long questionId, String answer) {
        this.questionId = questionId;
        this.answer = answer;
    }

    /**
     * Gibt die ID der Frage zurück.
     *
     * @return Frage-ID
     */
    public Long getQuestionId() {
        return questionId;
    }

    /**
     * Setzt die ID der Frage.
     *
     * @param questionId Frage-ID
     */
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    /**
     * Gibt die Antwort des Benutzers zurück.
     *
     * @return Antwort
     */
    public String getAnswer() {
        return answer;
    }

    /**
     * Setzt die Antwort des Benutzers.
     *
     * @param answer Antwort
     */
    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
