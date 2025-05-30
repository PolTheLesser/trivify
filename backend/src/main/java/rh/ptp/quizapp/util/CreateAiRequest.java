package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.EmailService;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dienstklasse zur Erstellung von KI-gestützten Quizfragen über eine externe API.
 * Sie versucht, bis zu fünfmal ein valides JSON-Array mit Quizfragen abzurufen.
 * Im Fehlerfall wird eine E-Mail an Administratoren gesendet.
 */
@Component
public class CreateAiRequest {

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.from}")
    private String adminEmail;

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.base-url}")
    private String apiUrl;

    @Value("${frontend.url}")
    private String frontendUrl;

    private static final Logger logger = LoggerFactory.getLogger(CreateAiRequest.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Fordert von der KI-API ein Quiz im JSON-Format an. Es wird ein Retry-Mechanismus mit bis zu 5 Versuchen implementiert.
     * Im Fehlerfall wird eine E-Mail an alle Administratoren gesendet.
     *
     * @param category Die gewünschte Quiz-Kategorie (z.B. "Allgemeinwissen").
     * @return Ein JSONArray mit generierten Quizfragen.
     * @throws RuntimeException Wenn nach 5 Versuchen kein valides Ergebnis empfangen werden konnte.
     */
    public JSONArray fetchQuizFromAPI(String category) {
        int invalidRetrys = 0;
        String errorMessage = "";
        JSONArray quizList = new JSONArray();

        while (invalidRetrys < 5) {
            try {
                String prompt = "Generiere 10 abwechslungsreiche Quizfragen der Kategorie " + category + ", Allgemeinwissen " +
                        """
                        in folgendem JSON-Format:
                        [
                          {
                            "Frage": "Beispiel-Frage",
                            "Antworten": ["A", "B", "C", "D"],
                            "RichtigeAntwort": "A"
                          }
                        ]
                        Die Antworten:
                        - sollen nicht mit Labels, wie A, B, C, D oder ähnliches beginnen
                        - die korrekte Antwort soll exakt so in Liste der Antworten enthalten sein
                        
                        Die Fragen sollen:
                        - aus unterschiedlichen Kategorien stammen (z.B. Geschichte, Natur, Popkultur, Wissenschaft)
                        - einen ansteigenden Schwierigkeitsgrad haben
                        - verständlich formuliert sein
                        - keine Wiederholungen oder identische Antworten enthalten
                        - realistisch & aktuell sein
                        
                        Gib **nur** das JSON-Array zurück – ohne Markdown, Erläuterungen oder zusätzliche Zeichen.
                        """;

                HttpClient httpClient = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(30))
                        .build();

                quizList = fetchQuizFromAPI(httpClient, prompt);
                return quizList;
            } catch (Exception e) {
                invalidRetrys++;
                errorMessage = e.getMessage();
                logger.error("Fehler beim Versuch #" + invalidRetrys + ": " + errorMessage);
            }
        }

        List<User> admins = userRepository.findAllByRole(UserRole.ROLE_ADMIN);
        Map<String, Object> variables = new HashMap<>();
        variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
        variables.put("adminName", "Admin");
        variables.put("generationDate", LocalDateTime.now());
        variables.put("errorMessage", errorMessage);

        for (User admin : admins) {
            variables.replace("adminName", admin.getUsername());
            variables.put("response", quizList.toString());
            emailService.sendEmail(adminEmail, "Fehler bei der Generierung des täglichen Quizzes!", "failed-generation-daily", variables);
        }

        throw new RuntimeException("Fehler beim Abrufen des Quiz von der API nach 5 Versuchen");
    }

    /**
     * Führt den eigentlichen HTTP-Request an die KI-API aus und verarbeitet die Antwort.
     *
     * @param httpClient Der HTTP-Client zum Senden der Anfrage.
     * @param prompt     Der Text, der als Eingabeaufforderung an die KI gesendet wird.
     * @return Ein JSONArray mit den Quizfragen im erwarteten Format.
     * @throws IOException              Falls beim Netzwerkzugriff ein Fehler auftritt.
     * @throws InterruptedException     Falls die Anfrage unterbrochen wird.
     * @throws RuntimeException         Falls die API-Antwort kein valides JSON enthält.
     */
    public JSONArray fetchQuizFromAPI(HttpClient httpClient, String prompt) throws IOException, InterruptedException {
        JSONObject requestBody = new JSONObject()
                .put("contents", new JSONArray()
                        .put(new JSONObject()
                                .put("role", "user")
                                .put("parts", new JSONArray()
                                        .put(new JSONObject()
                                                .put("text", prompt)))));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + apiKey))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();
        logger.info("Antwort von der API: {}", responseBody);

        JSONObject responseJson = new JSONObject(responseBody);
        JSONArray candidates = responseJson.getJSONArray("candidates");
        JSONObject contentObj = candidates.getJSONObject(0).getJSONObject("content");
        JSONArray parts = contentObj.getJSONArray("parts");
        String content = parts.getJSONObject(0).getString("text");

        // Bereinigung der Antwort
        content = content.replaceAll("(?s)```json|```", "")
                .replace("\\n", "")
                .replace("\\\"", "\"")
                .replaceAll("\\\\", "")
                .trim();

        if (!content.startsWith("[")) {
            throw new RuntimeException("JSON content does not start with '[' nach Bereinigung: " + content);
        }

        logger.info("Bereinigte Antwort vom KI-Service: {}", content);
        return new JSONArray(content);
    }
}
