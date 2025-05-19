package rh.ptp.quizapp.model;

public enum QuizCategory {
    DAILY_QUIZ("Tägliches Quiz"),
    GENERAL_KNOWLEDGE("Allgemeinwissen"),
    SCIENCE("Wissenschaft"),
    HISTORY("Geschichte"),
    GEOGRAPHY("Geographie"),
    ENTERTAINMENT("Unterhaltung"),
    ART_AND_LITERATURE("Kunst und Literatur"),
    SPORTS("Sport"),
    MUSIC("Musik"),
    FILM_AND_TELEVISION("Film und Fernsehen"),
    TECHNOLOGY("Technologie");
    private final String displayName;

    QuizCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
