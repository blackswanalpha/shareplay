"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { LogOut, Shield, Bell, User, Palette, Plug, Edit, Badge, Mail, Eye, Monitor, Sun, Moon } from "lucide-react"; // Changed Extension to Plug
import styles from "./page.module.css";
import { useState } from "react";

export default function SettingsPage() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [theme, setTheme] = useState("system"); // Existing theme state
    const [profileVisibility, setProfileVisibility] = useState(true); // Mock state
    const [showOnlineStatus, setShowOnlineStatus] = useState(false); // Mock state
    const [activeSection, setActiveSection] = useState("account"); // State to manage active section

    // Mock data for user profile - replace with actual user data later
    const userProfile = {
        displayName: "Alex Doe",
        username: "alexdoe_creative",
        email: "alex.doe@example.com",
        bio: "Digital artist & content creator passionate about neon aesthetics and future tech.",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB21kZgryGgkQruapZZzi3GAF6ec8HbPDnSkoONY4Wf02B0rL90zQ1jvl8FCAR24Eg8xXCABP5R9fpNPlEaGzpmO4KkNQp0W4HCImII7YAbWYvpBKouRulCkQKzW9dDd3Kvlzq0Uz6hUxA38xUzXB9OW2riFSWmjLy64MfrWeua4m01I9auIMN-FC48pWCMaQ2_qbugr08EhwV9tkFlfY1mm0rRjKBJlNnf-ylA_bQEJKyTTSQweU6KJ_iMfFGithkaYVS0MsZ6OUibV"
    };

    const renderContent = () => {
        switch (activeSection) {
            case "account":
                return (
                    <>
                        {/* Profile Avatar Section */}
                        <div className={styles.profileAvatarSection}>
                            <div className={styles.profileAvatarContainer}>
                                <div className={styles.profileAvatarImage} style={{ backgroundImage: `url(${userProfile.avatarUrl})` }}></div>
                                <div className={styles.profileAvatarOverlay}>
                                    <Edit size={20} />
                                </div>
                            </div>
                            <div className={styles.profileAvatarInfo}>
                                <h3>Profile Photo</h3>
                                <p>Recommended 300x300px. JPG, PNG or GIF.</p>
                                <div className={styles.profileAvatarActions}>
                                    <button className={styles.profileAvatarActionButton}>Upload New</button>
                                    <button className={`${styles.profileAvatarActionButton} ${styles.remove}`}>Remove</button>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className={styles.formSection}>
                            {/* Personal Info Group */}
                            <div>
                                <h4 className={styles.formGroupTitle}>
                                    <Badge size={20} />
                                    Personal Information
                                </h4>
                                <div className={styles.formGrid}>
                                    <label className={styles.formGroup}>
                                        <span className={styles.formGroupLabel}>Display Name</span>
                                        <Input className={styles.glassInput} placeholder="Your name" defaultValue={userProfile.displayName} />
                                    </label>
                                    <label className={styles.formGroup}>
                                        <span className={styles.formGroupLabel}>Username</span>
                                        <div className={styles.formInputWrapper}>
                                            <span className={styles.formInputPrefix}>@</span>
                                            <Input className={`${styles.glassInput} pl-8`} placeholder="username" defaultValue={userProfile.username} />
                                        </div>
                                    </label>
                                    <label className={`${styles.formGroup} ${styles.formFieldSpan2}`}>
                                        <span className={styles.formGroupLabel}>Email Address</span>
                                        <div className={styles.formInputWrapper}>
                                            <Mail size={20} className={styles.formInputIcon} />
                                            <Input className={`${styles.glassInput} pl-11`} placeholder="email@address.com" defaultValue={userProfile.email} disabled />
                                        </div>
                                    </label>
                                    <label className={`${styles.formGroup} ${styles.formFieldSpan2}`}>
                                        <span className={styles.formGroupLabel}>Bio</span>
                                        <textarea className={`${styles.glassInput} ${styles.textareaField}`} placeholder="Tell us a little about yourself..." rows={3} defaultValue={userProfile.bio}></textarea>
                                    </label>
                                </div>
                            </div>
                            <div className={styles.divider}></div>
                            {/* Visibility */}
                            <div>
                                <h4 className={styles.formGroupTitle}>
                                    <Eye size={20} />
                                    Visibility
                                </h4>
                                <div className={styles.toggleContainer}>
                                    <div className={styles.toggleItem}>
                                        <div className={styles.toggleLabel}>
                                            <span className={styles.toggleTitle}>Profile Visibility</span>
                                            <span className={styles.toggleDescription}>Allow others to find your profile in search.</span>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                className={styles.srOnly}
                                                checked={profileVisibility}
                                                onChange={() => setProfileVisibility(!profileVisibility)}
                                            />
                                            <div className={styles.switchBackground}>
                                                <div className={styles.switchToggle}></div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className={styles.toggleItem}>
                                        <div className={styles.toggleLabel}>
                                            <span className={styles.toggleTitle}>Show Online Status</span>
                                            <span className={styles.toggleDescription}>Let followers see when you are active.</span>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                className={styles.srOnly}
                                                checked={showOnlineStatus}
                                                onChange={() => setShowOnlineStatus(!showOnlineStatus)}
                                            />
                                            <div className={styles.switchBackground}>
                                                <div className={styles.switchToggle}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case "privacy":
                return (
                    <div className={styles.formSection}>
                        <h4 className={styles.formGroupTitle}>
                            <Shield size={20} />
                            Privacy Settings
                        </h4>
                        <p className={styles.subtitle}>Manage your privacy settings here.</p>
                        {/* More privacy settings here */}
                    </div>
                );
            case "notifications":
                return (
                    <div className={styles.formSection}>
                        <h4 className={styles.formGroupTitle}>
                            <Bell size={20} />
                            Notification Settings
                        </h4>
                        <p className={styles.subtitle}>Configure your notification preferences.</p>
                        {/* More notification settings here */}
                    </div>
                );
            case "appearance":
                return (
                    <div className={styles.formSection}>
                        <h4 className={styles.formGroupTitle}>
                            <Palette size={20} />
                            Appearance Settings
                        </h4>
                        <div className={styles.grid}>
                            <div
                                className={`${styles.card} ${theme === 'light' ? styles.cardActive : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                <div className={styles.cardIcon}>
                                    <Sun />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>Light Mode</h3>
                                    <p>Clean and bright interface for daytime use.</p>
                                </div>
                            </div>

                            <div
                                className={`${styles.card} ${theme === 'dark' ? styles.cardActive : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                <div className={styles.cardIcon}>
                                    <Moon />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>Dark Mode</h3>
                                    <p>Easy on the eyes, perfect for low-light environments.</p>
                                </div>
                            </div>

                            <div
                                className={`${styles.card} ${theme === 'system' ? styles.cardActive : ''}`}
                                onClick={() => setTheme('system')}
                            >
                                <div className={styles.cardIcon}>
                                    <Monitor />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>System Default</h3>
                                    <p>Automatically syncs with your device's appearance settings.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "integrations":
                return (
                    <div className={styles.formSection}>
                        <h4 className={styles.formGroupTitle}>
                            <Plug size={20} />
                            Integrations Settings
                        </h4>
                        <p className={styles.subtitle}>Manage third-party application integrations.</p>
                        {/* More integration settings here */}
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className={styles.container}>
            {/* Abstract Background Blobs & Grid Pattern */}
            <div className={styles.backgroundBlob1} />
            <div className={styles.backgroundBlob2} />
            <div className={styles.backgroundBlob3} />
            <div className={styles.gridPattern} />

            {/* Main Layout */}
            <main className={styles.mainLayout}>
                {/* Main Content Panel */}
                <section className={styles.mainContentPanel}>
                    <div className={styles.contentHeader}>
                        <h1>Account Settings</h1>
                        <p>Manage your profile details and personal preferences.</p>
                    </div>
                    {/* Scrollable Content */}
                    <div className={styles.scrollableContent}>
                        {renderContent()}
                    </div>
                    {/* Spacer for bottom bar */}
                    <div className={styles.hSpacer}></div>
                </section>

                {/* Sidebar Navigation */}
                <aside className={styles.asideNav}>
                    {/* User Mini Profile */}
                    <div className={styles.userMiniProfile}>
                        <div className={styles.userMiniProfileAvatar} style={{ backgroundImage: `url(${userProfile.avatarUrl})` }}></div>
                        <div className={styles.userMiniProfileInfo}>
                            <h1>{userProfile.displayName}</h1>
                            <p>Pro Member</p>
                        </div>
                    </div>
                    {/* Nav Links */}
                    <nav className={styles.navLinks}>
                        <a
                            className={`${styles.navLink} ${activeSection === 'account' ? styles.navLinkActive : ''}`}
                            href="#"
                            onClick={() => setActiveSection("account")}
                        >
                            <User size={20} className={styles.navIcon} />
                            <p>Account</p>
                        </a>
                        <a
                            className={`${styles.navLink} ${activeSection === 'privacy' ? styles.navLinkActive : ''}`}
                            href="#"
                            onClick={() => setActiveSection("privacy")}
                        >
                            <Shield size={20} className={styles.navIcon} />
                            <p>Privacy & Security</p>
                        </a>
                        <a
                            className={`${styles.navLink} ${activeSection === 'notifications' ? styles.navLinkActive : ''}`}
                            href="#"
                            onClick={() => setActiveSection("notifications")}
                        >
                            <Bell size={20} className={styles.navIcon} />
                            <p>Notifications</p>
                        </a>
                        <a
                            className={`${styles.navLink} ${activeSection === 'appearance' ? styles.navLinkActive : ''}`}
                            href="#"
                            onClick={() => setActiveSection("appearance")}
                        >
                            <Palette size={20} className={styles.navIcon} />
                            <p>Appearance</p>
                        </a>
                        <a
                            className={`${styles.navLink} ${activeSection === 'integrations' ? styles.navLinkActive : ''}`}
                            href="#"
                            onClick={() => setActiveSection("integrations")}
                        >
                            <Plug size={20} className={styles.navIcon} />
                            <p>Integrations</p>
                        </a>
                    </nav>
                    {/* Sign Out */}
                    <div className={styles.sidebarBottomSection}>
                        <button className={styles.sidebarSignOutButton} onClick={() => signOut({ redirectUrl: "/" })}>
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </aside>
            </main>
            {/* Sticky Bottom Actions */}
            <div className={styles.stickyBottomActions}>
                <button className={styles.discardButton}>Discard Changes</button>
                <div className={styles.actionButtonsContainer}>
                    <button className={styles.glassBtnPrimary}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
