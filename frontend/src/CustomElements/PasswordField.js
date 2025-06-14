import React, { useState } from 'react';
import {
    TextField,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/** PasswordField
 * Ein anpassbares Passwort-Eingabefeld basierend auf der MUI `TextField`-Komponente,
 * das die Sichtbarkeit des Passworts per IconButton umschaltbar macht.
 * Ideal für Login- oder Registrierungsformulare mit verbessertem Nutzerkomfort.
 *
 * Funktionalitäten:
 * - Umschalten zwischen sichtbarem Text und Passwort (Maskierung) über ein Icon
 * - Anzeige von `Visibility` bzw. `VisibilityOff` Symbol je nach Sichtbarkeitsstatus
 * - Übergabe externer Props (`value`, `onChange`, etc.) zur flexiblen Wiederverwendbarkeit
 * - Integrierte ARIA-Beschriftung zur Unterstützung von Screenreadern
 */
export default function PasswordField({ value, onChange, ...props }) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((show) => !show);
    };

    return (
        <TextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            aria-label="toggle password visibility"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
}