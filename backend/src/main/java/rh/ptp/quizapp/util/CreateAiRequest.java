package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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

    public JSONArray fetchQuizFromAPI() throws IOException, InterruptedException {
        String prompt = """
                Generiere 10 abwechslungsreiche Quizfragen in folgendem JSON-Format:
                [
                  {
                    "Frage": "Beispiel-Frage",
                    "Antworten": ["A", "B", "C", "D"],
                    "RichtigeAntwort": "A"
                  }
                ]

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
                .put("model", "qwen2.5-72b-instruct")
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

        content = content.replaceAll("(?s)```json|```", "").trim();
        logger.info("Antwort vom KI-Service: {}", content);

        if (content.startsWith("[")) {
            return new JSONArray(content);
        } else if (content.startsWith("{")) {
            JSONObject json = new JSONObject(content);
            return json.getJSONArray("Fragen");
        } else {
            throw new RuntimeException("Unerwartetes JSON-Format: " + content);
        }
    }
}
