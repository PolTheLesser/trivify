package rh.ptp.wrap.trivify.annotations;

import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Retention(RUNTIME)
@Target({TYPE,FIELD,ANNOTATION_TYPE})
public @interface ValidEmail {
    String message() default "Invalid Email Address";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
