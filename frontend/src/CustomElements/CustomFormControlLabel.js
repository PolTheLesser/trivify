import React from "react";
import { FormControlLabel } from "@mui/material";

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
