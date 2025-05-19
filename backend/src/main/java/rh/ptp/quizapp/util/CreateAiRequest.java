package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import rh.ptp.quizapp.model.QuizCategory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class CreateAiRequest {

    private final String apiKey = "ed2af303-0e50-4d21-bf72-04e54a20b7ad";
    private final String apiUrl = "https://api.ai.rh-koeln.de/v1/chat/completions";
    private static final Logger logger = LoggerFactory.getLogger(CreateAiRequest.class);

    public JSONArray fetchQuizFromAPI(String category) throws IOException, InterruptedException {
        String prompt =
                "Generiere 10 abwechslungsreiche Quizfragen der Kategorie " + category + " " +
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

        return fetchQuizFromAPI(HttpClient.newHttpClient(), prompt);
    }

    public JSONArray fetchQuizFromAPI(HttpClient httpClient, String prompt) throws IOException, InterruptedException {
        JSONObject requestBody = new JSONObject()
                .put("model", "qwen3-235b-a22b")
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

        String content = responseJson
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content");

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
