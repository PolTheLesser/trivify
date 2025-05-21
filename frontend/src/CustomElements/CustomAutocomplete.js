import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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
