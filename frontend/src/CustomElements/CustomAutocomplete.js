import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

/** CustomAutocomplete
 * Eine erweiterte Autocomplete-Komponente basierend auf Material UI, die Mehrfachauswahl unterstützt
 * und benutzerdefiniertes Verhalten bei Tasteneingaben wie Enter und Leertaste implementiert.
 * Sie erlaubt die Auswahl mehrerer Optionen über die Tastatur, selbst wenn die Standardauswahl von MUI
 * nicht automatisch ausgelöst würde.
 *
 * Funktionalitäten:
 * - Unterstützung für Mehrfachauswahl (`multiple`)
 * - Benutzerdefiniertes Verhalten bei Enter- und Leertaste zum Hinzufügen von Optionen
 * - Verhindert das automatische Schließen des Auswahlmenüs bei Auswahl (`disableCloseOnSelect`)
 * - Hebt passende Optionen automatisch hervor (`autoHighlight`)
 * - Erlaubt die Auswahl durch Fokus (`selectOnFocus`)
 * - Beibehaltung des Werts beim Verlassen des Feldes (`clearOnBlur: false`)
 * - Flexible Weitergabe von Props und vollständige Kontrolle über `getOptionLabel`, `onChange` etc.
 */
const CustomAutocomplete = ({ options, value, onChange, getOptionLabel, ...props }) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ' ' || event.key === "Spacebar") {
            event.preventDefault();

            const active = document.activeElement;
            const listbox = document.querySelector('[role="listbox"]');
            if (listbox && active && listbox.contains(active)) {
                const selectedOption = active.innerText;
                const matchedOption = options.find(
                    (opt) => getOptionLabel(opt) === selectedOption
                );
                if (matchedOption) {
                    onChange(event, [...(value || []), matchedOption]);
                }
            }
        }
        props.onKeyDown?.(event);
    };

    return (
        <Autocomplete
            autoHighlight
            selectOnFocus
            clearOnBlur={false}
            handleHomeEndKeys
            disableCloseOnSelect
            multiple
            options={options}
            value={value}
            onChange={onChange}
            getOptionLabel={getOptionLabel}
            {...props}
            onKeyDown={handleKeyDown}
            renderInput={(params) => (
                <TextField {...params} label="Kategorien" placeholder="Wähle Kategorie" />
            )}
        />
    );
};

export default CustomAutocomplete;
