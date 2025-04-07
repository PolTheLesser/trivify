package rh.ptp.wrap.trivify.model.response;

import java.time.OffsetDateTime;

public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private OffsetDateTime timestamp;

    public ErrorResponse(String error, String message, int status) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.timestamp = OffsetDateTime.now();
    }
}
