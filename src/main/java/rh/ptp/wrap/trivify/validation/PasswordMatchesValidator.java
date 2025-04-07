package rh.ptp.wrap.trivify.validation;

import rh.ptp.wrap.trivify.annotations.PasswordMatches;
import rh.ptp.wrap.trivify.model.request.RegisterRequest;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, Object> {

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        RegisterRequest user = (RegisterRequest) obj;
        return user.getPassword().equals(user.getMatchingPassword());
    }
}
