"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Settings, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import styles from "./UserMenu.module.css"; // Create this CSS module

export default function UserMenu() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({ redirectUrl: "/" });
    };

    if (!isLoaded || !user) {
        return null; // Or a skeleton loader
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className={styles.userMenuContainer} onMouseLeave={() => setIsOpen(false)}>
            <button className={styles.userMenuButton} onClick={toggleMenu}>
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
