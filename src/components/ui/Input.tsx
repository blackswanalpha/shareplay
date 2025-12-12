"use client";

import * as React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, ...props }, ref) => {
        const classes = [
            styles.input,
            error ? styles.error : "",
            className,
        ].filter(Boolean).join(" ");

        return (
            <div className={styles.wrapper}>
                <input ref={ref} className={classes} {...props} />
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
