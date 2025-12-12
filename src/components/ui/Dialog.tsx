"use client";

import * as React from "react";
import { X } from "lucide-react";
import styles from "./Dialog.module.css";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={() => onOpenChange(false)}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={() => onOpenChange(false)}>
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
    return <div className={styles.header}>{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
    return <h2 className={styles.title}>{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
    return <p className={styles.description}>{children}</p>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
    return <div className={styles.body}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
    return <div className={styles.footer}>{children}</div>;
}
