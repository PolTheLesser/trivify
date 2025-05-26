package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.EmailService;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    @Value("${ai.api.model}")
    private String model;
    @Value("${frontend.url}")
    private String frontendUrl;

    private static final Logger logger = LoggerFactory.getLogger(CreateAiRequest.class);
    @Autowired
    private UserRepository userRepository;

    public JSONArray fetchQuizFromAPI(String category){
        int invalidRetrys = 0;
        String errorMessage = "";
        JSONArray quizList = new JSONArray();
        while(invalidRetrys<5){
            try {
                String prompt =
                        "Generiere 10 abwechslungsreiche Quizfragen der Kategorie " + category + ", Allgemeinwissen " +
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

                quizList = fetchQuizFromAPI(HttpClient.newHttpClient(), prompt);
                return quizList;
            } catch (Exception e) {
                invalidRetrys++;
                errorMessage = e.getMessage();
            }
        }
        List<User> admins = userRepository.findAllByRole(UserRole.ROLE_ADMIN);
        Map<String, Object> variables = new HashMap<>();
        variables.put("logoUrl", frontendUrl+"/logo192.png");
        variables.put("adminName", "Admin");
        variables.put("generationDate", LocalDateTime.now());
        variables.put("errorMessage", errorMessage);

        for(User admin: admins) {
            variables.replace("adminName", admin.getUsername());
            variables.put("response", quizList.toString());
            emailService.sendEmail(adminEmail, "Fehler bei der Generierung des täglichen Quizzes!", "failed-generation-daily", variables);
        }
        throw new RuntimeException("Fehler beim Abrufen des Quiz von der API nach 5 Versuchen");
    }

    public JSONArray fetchQuizFromAPI(HttpClient httpClient, String prompt) throws IOException, InterruptedException {
        JSONObject requestBody = new JSONObject()
                .put("model", model)
                .put("messages", new JSONArray()
                        .put(new JSONObject()
                                .put("role", "user")
                                .put("content", prompt)));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JSONObject responseJson = new JSONObject(response.body());
        logger.info(responseJson.toString());

        String content = responseJson.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");

        // Remove JSON markdown formatting if any
        content = content.replaceAll("(?s)```json|```", "").trim();

        // Remove <think>...</think> section including trailing whitespace, so content starts with [
        content = content.replaceAll("(?s)<think>.*?</think>\\s*", "").trim();

        // Now content should start with [
        if (!content.startsWith("[")) {
            throw new RuntimeException("JSON content does not start with '[' after cleaning: " + content);
        }

        logger.info("Bereinigte Antwort vom KI-Service: {}", content);

        return new JSONArray(content);
    }
}
