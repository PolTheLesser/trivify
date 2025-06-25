package rh.ptp.quizapp.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.EmailService;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CreateAiRequestTest {

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpClient httpClient;

    @Mock
    private HttpResponse<String> httpResponse;

    @InjectMocks
    private CreateAiRequest createAiRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(createAiRequest, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(createAiRequest, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(createAiRequest, "apiUrl", "https://api.example.com/");
        ReflectionTestUtils.setField(createAiRequest, "frontendUrl", "https://frontend.example.com");
    }

    @Test
    void fetchQuizFromAPI_SuccessfulRequest_ReturnsQuizList() throws Exception {
        String category = "Science";
        String validResponse = createValidApiResponse();

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);
        JSONArray expectedQuizList = new JSONArray("[{\"Frage\":\"Test Question\",\"Antworten\":[\"A\",\"B\",\"C\",\"D\"],\"RichtigeAntwort\":\"A\"}]");
        doReturn(expectedQuizList).when(spyCreateAiRequest).fetchQuizFromAPI(any(HttpClient.class), anyString());

        JSONArray result = spyCreateAiRequest.fetchQuizFromAPI(category);

        assertNotNull(result);
        assertEquals(expectedQuizList.toString(), result.toString());
        verify(spyCreateAiRequest, times(1)).fetchQuizFromAPI(any(HttpClient.class), anyString());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString(), anyMap());
    }

    @Test
    void fetchQuizFromAPI_FailsAfterRetries_SendsEmailToAdmins() throws Exception {
        String category = "Science";
        String errorMessage = "API connection error";

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);
        doThrow(new RuntimeException(errorMessage)).when(spyCreateAiRequest).fetchQuizFromAPI(any(HttpClient.class), anyString());

        User admin1 = new User();
        admin1.setName("admin1");
        admin1.setEmail("admin1@example.com");
        User admin2 = new User();
        admin2.setName("admin2");
        admin2.setEmail("admin2@example.com");
        when(userRepository.findAllByRole(UserRole.ROLE_ADMIN)).thenReturn(List.of(admin1, admin2));

        Exception exception = assertThrows(RuntimeException.class, () -> spyCreateAiRequest.fetchQuizFromAPI(category));
        assertEquals("Fehler beim Abrufen des Quiz von der API nach 5 Versuchen", exception.getMessage());

        verify(userRepository, times(1)).findAllByRole(UserRole.ROLE_ADMIN);
        verify(emailService, times(2)).sendEmail(eq("admin@example.com"), eq("Fehler bei der Generierung des täglichen Quizzes!"), eq("failed-generation-daily"), any(Map.class));
    }

    @Test
    void fetchQuizFromAPI_RetriesBeforeSuccess_ReturnsQuizList() throws Exception {
        String category = "Science";
        JSONArray expectedQuizList = new JSONArray("[{\"Frage\":\"Test Question\",\"Antworten\":[\"A\",\"B\",\"C\",\"D\"],\"RichtigeAntwort\":\"A\"}]");

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);
        doThrow(new RuntimeException("First failure"))
            .doThrow(new RuntimeException("Second failure"))
            .doReturn(expectedQuizList)
            .when(spyCreateAiRequest).fetchQuizFromAPI(any(HttpClient.class), anyString());

        JSONArray result = spyCreateAiRequest.fetchQuizFromAPI(category);

        assertNotNull(result);
        assertEquals(expectedQuizList.toString(), result.toString());
        verify(spyCreateAiRequest, times(3)).fetchQuizFromAPI(any(HttpClient.class), anyString());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString(), anyMap());
    }

    @Test
    void fetchQuizFromAPIWithHttpClient_SuccessfulRequest_ReturnsQuizList() throws Exception {
        String prompt = "Generate quiz questions";
        String validResponse = createValidApiResponse();

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);

        doAnswer(invocation -> {
            HttpResponse<String> mockResponse = mock(HttpResponse.class);
            when(mockResponse.body()).thenReturn(validResponse);
            return mockResponse;
        }).when(httpClient).send(any(), any());

        JSONArray result = spyCreateAiRequest.fetchQuizFromAPI(httpClient, prompt);

        assertNotNull(result);
        assertEquals(1, result.length());
        JSONObject question = result.getJSONObject(0);
        assertEquals("Test Question", question.getString("Frage"));
    }

    @Test
    void fetchQuizFromAPIWithHttpClient_MalformedResponse_ThrowsException() throws Exception {
        String prompt = "Generate quiz questions";
        String invalidResponse = createInvalidApiResponse();

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);

        doAnswer(invocation -> {
            HttpResponse<String> mockResponse = mock(HttpResponse.class);
            when(mockResponse.body()).thenReturn(invalidResponse);
            return mockResponse;
        }).when(httpClient).send(any(), any());

        Exception exception = assertThrows(RuntimeException.class,
            () -> spyCreateAiRequest.fetchQuizFromAPI(httpClient, prompt));
        assertTrue(exception.getMessage().contains("JSON content does not start with '['"));
    }

    @Test
    void fetchQuizFromAPIWithHttpClient_IOExceptionDuringRequest_PropagatesException() throws Exception {
        String prompt = "Generate quiz questions";
        IOException ioException = new IOException("Network error");

        CreateAiRequest spyCreateAiRequest = spy(createAiRequest);

        doThrow(ioException).when(httpClient).send(any(), any());

        Exception exception = assertThrows(IOException.class,
            () -> spyCreateAiRequest.fetchQuizFromAPI(httpClient, prompt));
        assertEquals("Network error", exception.getMessage());
    }

    private String createValidApiResponse() {
        JSONObject responseJson = new JSONObject();
        JSONArray candidates = new JSONArray();
        JSONObject candidate = new JSONObject();
        JSONObject content = new JSONObject();
        JSONArray parts = new JSONArray();
        JSONObject part = new JSONObject();

        part.put("text", "[{\"Frage\":\"Test Question\",\"Antworten\":[\"A\",\"B\",\"C\",\"D\"],\"RichtigeAntwort\":\"A\"}]");
        parts.put(part);
        content.put("parts", parts);
        candidate.put("content", content);
        candidates.put(candidate);
        responseJson.put("candidates", candidates);

        return responseJson.toString();
    }

    private String createInvalidApiResponse() {
        JSONObject responseJson = new JSONObject();
        JSONArray candidates = new JSONArray();
        JSONObject candidate = new JSONObject();
        JSONObject content = new JSONObject();
        JSONArray parts = new JSONArray();
        JSONObject part = new JSONObject();

        part.put("text", "This is not a valid JSON array");
        parts.put(part);
        content.put("parts", parts);
        candidate.put("content", content);
        candidates.put(candidate);
        responseJson.put("candidates", candidates);

        return responseJson.toString();
    }
}
