"use client";

import * as React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "hero" | "glass" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "xl";
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "md", children, ...props }, ref) => {
        const classes = [
            styles.button,
            styles[variant],
            styles[size],
            className,
        ].filter(Boolean).join(" ");

        return (
            <button ref={ref} className={classes} {...props}>
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
