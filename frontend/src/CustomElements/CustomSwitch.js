import { Switch } from "@mui/material";
import React from "react";

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
