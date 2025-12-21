"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, User } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Loader2, Camera } from "lucide-react";
import styles from "./page.module.css";
import { gsap, Power3 } from "gsap"; // Import GSAP

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
    });

    // Refs for animations
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const cardRef = useRef(null);
    const avatarSectionRef = useRef(null);
    const formGroup1Ref = useRef(null);
    const formGroup2Ref = useRef(null);
    const saveButtonRef = useRef(null);

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/");
        } else if (isLoaded && user && user.primaryEmailAddress?.emailAddress) {
            fetchProfile();
        }
    }, [isLoaded, user, router]);

    // GSAP Animation
    useEffect(() => {
        if (!loading && isLoaded && user) {
            const tl = gsap.timeline({ defaults: { ease: Power3.easeOut, duration: 0.8 } });

            tl.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
              .fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
              .fromTo(cardRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6 }, "-=0.3")
              .fromTo(avatarSectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
              .fromTo(formGroup1Ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
              .fromTo(formGroup2Ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
              .fromTo(saveButtonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
        }
    }, [loading, isLoaded, user]);

    const fetchProfile = async () => {
        try {
            if (!user?.primaryEmailAddress?.emailAddress) return;
            const token = await api.getTokenForEmail(user.primaryEmailAddress.emailAddress);
            const profile = await api.getUserProfileWithToken(token);
            setUserProfile(profile);
            setFormData({
                full_name: profile.full_name || "",
                email: profile.email,
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!user?.primaryEmailAddress?.emailAddress) return;
            const token = await api.getTokenForEmail(user.primaryEmailAddress.emailAddress);
            const updated = await api.updateUserProfile(token, {
                full_name: formData.full_name,
            });
            setUserProfile(updated);
            // Note: Updating Clerk user name would be a separate call if we wanted to sync it back to Clerk
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header} ref={headerRef}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 text-white/70 hover:text-white hover:bg-white/10 w-fit"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.subtitle}>Manage your profile information and preferences.</p>
            </div>

            <div className={styles.card} ref={cardRef}>
                <h2 className={styles.sectionTitle}>Personal Information</h2>
                <div className={styles.avatarSection} ref={avatarSectionRef}>
                    <div className={styles.avatarContainer}>
                        <Image
                            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`}
                            alt="Avatar"
                            width={120}
                            height={120}
                            className={styles.avatar}
                            unoptimized
                        />
                        {/* Placeholder for future avatar upload functionality */}
                        <button className={styles.editAvatarButton} title="Change Photo">
                            <Camera size={18} />
                        </button>
                    </div>
                    <div className={styles.avatarInfo}>
                        <h3>{userProfile?.full_name || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0]}</h3>
                        <p>{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <div className={styles.form}>
                    <div className={styles.formGroup} ref={formGroup1Ref}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <Input
                            id="fullName"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                    </div>

                    <div className={styles.formGroup} ref={formGroup2Ref}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <Input
                            id="email"
                            value={formData.email}
                            disabled
                            className="bg-white/5 border-white/10 text-white/70 placeholder:text-white/30 cursor-not-allowed"
                        />

                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving || !formData.full_name}
                        className={styles.saveButton}
                        ref={saveButtonRef}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
