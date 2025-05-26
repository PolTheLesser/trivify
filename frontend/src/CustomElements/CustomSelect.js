import React from "react";
import { Select } from "@mui/material";

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
