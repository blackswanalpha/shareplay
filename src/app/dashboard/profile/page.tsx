"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, User } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import styles from "./page.module.css";

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

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/");
        } else if (isLoaded && user && user.primaryEmailAddress?.emailAddress) {
            fetchProfile();
        }
    }, [isLoaded, user, router]);

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
        <div className={styles.container}>
            <div className={styles.header}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.subtitle}>Manage your profile information</p>
            </div>

            <div className={styles.card}>
                <div className={styles.avatarSection}>
                    <Image
                        src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className={styles.avatar}
                        unoptimized
                    />
                    <div className={styles.avatarInfo}>
                        <h3>{userProfile?.full_name || user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0]}</h3>
                        <p>{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name</label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <Input
                            value={formData.email}
                            disabled
                            className="bg-white/5 opacity-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-white/40 mt-1">Email cannot be changed in this demo.</p>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className={styles.saveButton}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
