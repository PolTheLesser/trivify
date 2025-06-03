import React from "react";
import { Select } from "@mui/material";

/** CustomSelect
 * Eine angepasste Version der MUI `Select`-Komponente mit erweitertem Tastaturverhalten.
 * Diese Komponente verhindert das unbeabsichtigte Auslösen von Aktionen bei der Betätigung
 * von Enter oder Leertaste, was insbesondere bei eingebetteten Formularen oder speziellen
 * Interaktionen nützlich ist.
 *
 * Funktionalitäten:
 * - Stoppt die Event-Propagation bei Enter- oder Leertaste zur Vermeidung unerwünschter Nebeneffekte
 * - Ermöglicht die Übergabe eines eigenen `onKeyDown`-Handlers zur weiteren Individualisierung
 * - Unterstützt alle Standard-Eigenschaften der MUI `Select`-Komponente
 */
const CustomSelect = (props) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ' ' || event.key === "Spacebar") {
            event.stopPropagation();
        }
        props.onKeyDown?.(event);
    };

    return <Select {...props} onKeyDown={handleKeyDown} />;
};

export default CustomSelect;
