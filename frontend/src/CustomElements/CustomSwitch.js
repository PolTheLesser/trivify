import { Switch } from "@mui/material";
import React from "react";

/** AccessibleSwitch
 * Eine barrierefreundliche Erweiterung der MUI `Switch`-Komponente, die die Tastaturnutzung verbessert.
 * Diese Komponente ermöglicht es Nutzer:innen, den Schalter gezielt mit Enter oder Leertaste zu toggeln –
 * eine wichtige Verbesserung für die Zugänglichkeit (Accessibility).
 *
 * Funktionalitäten:
 * - Ermöglicht das Umschalten des Schalters per Enter- oder Leertaste
 * - Setzt explizit ARIA-Attribute (`aria-checked`, `role`, `tabIndex`) zur Verbesserung der Screenreader-Kompatibilität
 * - Übernimmt und erweitert Standardverhalten der MUI `Switch`-Komponente
 * - Unterstützt externe `onChange`- und weitere Props
 */
const AccessibleSwitch = (props) => {
    const { checked, onChange, ...rest } = props;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' ||  e.key === ' ' || e.key === "Spacebar") {
            e.preventDefault();
            onChange?.(e, !checked);
        }
    };

    return (
        <Switch
            {...rest}
            checked={checked}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            inputProps={{
                'aria-checked': checked,
                role: 'switch',
                tabIndex: 0,
            }}
        />
    );
};

export default AccessibleSwitch;
