"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Settings, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null); // Ref for the menu container
    const buttonRef = useRef<HTMLButtonElement>(null); // Ref for the toggle button

    const handleSignOut = async () => {
        await signOut({ redirectUrl: "/" });
    };

    // Effect to handle clicks outside the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click originated from the button that toggles the menu
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                return; // Ignore clicks on the toggle button itself
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (!isLoaded || !user) {
        return null; // Or a skeleton loader
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className={styles.userMenuContainer} ref={menuRef}>
            <button className={styles.userMenuButton} onClick={toggleMenu} ref={buttonRef}>
                {user.imageUrl && (
                    <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        width={36}
                        height={36}
                        className={styles.avatar}
                        unoptimized
                    />
                )}
                <span className={styles.userName}>{user.fullName}</span>
                <ChevronDown size={16} className={`${styles.dropdownIcon} ${isOpen ? styles.open : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.menuItem} onClick={() => router.push("/dashboard/profile")}>
                        <UserIcon size={18} />
                        <span>Profile</span>
                    </button>
                    <button className={styles.menuItem} onClick={() => router.push("/dashboard/settings")}>
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                    <button className={styles.menuItem} onClick={handleSignOut}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
