import React from "react";
import { FormControlLabel } from "@mui/material";

/** CustomFormControlLabel
 * Eine angepasste Version der MUI `FormControlLabel`-Komponente, die zusätzlich spezielles Verhalten
 * für bestimmte Tastatureingaben wie Enter und Leertaste (Spacebar) implementiert.
 * Diese Erweiterung dient der verbesserten Tastaturnavigation und verhindert ungewollte Aktionen
 * beim Drücken dieser Tasten.
 *
 * Funktionalitäten:
 * - Stoppt die Event-Propagation bei Enter- oder Leertaste zur Vermeidung unerwünschter Effekte
 * - Unterstützt das Weiterreichen eines benutzerdefinierten `onKeyDown`-Handlers
 * - Volle Kompatibilität mit allen Standardprops von `FormControlLabel`
 */
const CustomFormControlLabel = (props) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" ||  event.key === ' ' || event.key === "Spacebar") {
            event.stopPropagation();
        }
        props.onKeyDown?.(event);
    };

    return <FormControlLabel {...props} onKeyDown={handleKeyDown} />;
};

export default CustomFormControlLabel;
