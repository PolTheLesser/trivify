package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Dienstkomponente zur Erstellung und Durchführung von API-Anfragen
 * an einen KI-Service zur Generierung von Quizfragen.
 */
@Component
public class CreateAiRequest {

    /** API-Schlüssel für die Authentifizierung beim externen KI-Service. */
    private final String apiKey = "ed2af303-0e50-4d21-bf72-04e54a20b7ad";

    /** Basis-URL der verwendeten KI-API. */
    private final String apiUrl = "https://api.ai.rh-koeln.de/v1/chat/completions";

    /** Logger zur Ausgabe von Debug- und Fehlerinformationen. */
    private static final Logger logger = LoggerFactory.getLogger(CreateAiRequest.class);

    /**
     * Erstellt und konfiguriert einen {@link HttpClient}, der automatisch Proxy-Einstellungen
     * aus System-Properties oder Umgebungsvariablen übernimmt.
     *
     * @return ein konfigurierter {@link HttpClient} mit oder ohne Proxy
     */
    public HttpClient getProxy() {
        HttpClient.Builder builder = HttpClient.newBuilder();

        // Erst System-Properties prüfen
        String proxyHost = System.getProperty("http.proxyHost");
        String proxyPort = System.getProperty("http.proxyPort");

        // Falls leer, Umgebungsvariablen prüfen (z. B. HTTP_PROXY)
        if ((proxyHost == null || proxyHost.isEmpty()) || (proxyPort == null || proxyPort.isEmpty())) {
            String proxyEnv = System.getenv("HTTP_PROXY");
            if (proxyEnv == null) proxyEnv = System.getenv("http_proxy");

            if (proxyEnv != null && proxyEnv.startsWith("http")) {
                try {
                    URI proxyUri = URI.create(proxyEnv);
                    proxyHost = proxyUri.getHost();
                    proxyPort = String.valueOf(proxyUri.getPort());
                } catch (Exception e) {
                    logger.warn("Konnte Proxy-URI aus Umgebungsvariable nicht parsen: {}", proxyEnv);
                }
            }
        }

        // Wenn jetzt gültig → verwenden
        if (proxyHost != null && !proxyHost.isEmpty() && proxyPort != null && !proxyPort.isEmpty()) {
            try {
                int port = Integer.parseInt(proxyPort);
                builder.proxy(ProxySelector.of(new InetSocketAddress(proxyHost, port)));
                logger.info("Proxy verwendet: {}:{}", proxyHost, port);
            } catch (NumberFormatException e) {
                logger.warn("Ungültiger Proxy-Port: {}", proxyPort);
            }
        } else {
            logger.info("Kein Proxy konfiguriert");
        }

        return builder.build();
    }

    /**
     * Sendet eine Anfrage mit einem Prompt an den KI-Service und extrahiert das Array von Quizfragen aus der Antwort.
     *
     * @param httpClient ein vorbereiteter {@link HttpClient}, z. B. mit Proxy-Konfiguration
     * @param prompt der Text, der an das KI-Modell gesendet wird, z. B. mit Anweisungen zur Quizgenerierung
     * @return ein {@link JSONArray} mit den generierten Quizfragen
     * @throws IOException bei Netzwerkfehlern
     * @throws InterruptedException wenn der Request unterbrochen wurde
     * @throws RuntimeException wenn das Antwortformat unerwartet ist
     */
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

        // Hol den echten Textinhalt der KI-Antwort
        String content = responseJson
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getString("content");

        // Entferne eventuelle Markdown-Wrapper
        content = content.replaceAll("(?s)```json|```", "").trim();
        logger.info("Antwort vom KI-Service: {}", content);

        // Jetzt prüfen, ob das eine Liste oder ein Objekt ist
        if (content.startsWith("[")) {
            return new JSONArray(content);
        } else if (content.startsWith("{")) {
            JSONObject json = new JSONObject(content);
            return json.getJSONArray("Fragen");
        } else {
            throw new RuntimeException("Unerwartetes JSON-Format: " + content);
        }
    }

    /**
     * Generiert ein tägliches Quiz mit 5 Fragen.
     *
     * @return ein JSONArray mit den generierten Quizfragen
     * @throws IOException bei Netzwerkfehlern
     * @throws InterruptedException wenn der Request unterbrochen wurde
     */
    public JSONArray fetchQuizFromAPI() throws IOException, InterruptedException {
        String prompt = "Generiere 10 Quizfragen mit steigender Schwierigkeit im folgenden JSON-Format:\n" +
                "[\n" +
                "  {\n" +
                "    \"Frage\": \"Die Frage hier\",\n" +
                "    \"Antworten\": [\"Antwort 1\", \"Antwort 2\", \"Antwort 3\", \"Antwort 4\"],\n" +
                "    \"RichtigeAntwort\": \"Die richtige Antwort hier\"\n" +
                "  }\n" +
                "]\n\n" +
                "Die Fragen sollten:\n" +
                "- Interessant und abwechslungsreich sein\n" +
                "- Verschiedene Schwierigkeitsgrade haben\n" +
                "- Aus verschiedenen Themenbereichen kommen\n" +
                "- Klar und verständlich formuliert sein\n" +
                "- Realistisch und korrekt sein"+
                "Gib mir ausschließlich das JSON-Array zurück, ohne zusätzliche Erklärungen oder Formatierungen.\n";

        return fetchQuizFromAPI(getProxy(), prompt);
    }
}
