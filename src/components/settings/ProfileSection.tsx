"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/useApi";
import { adaptUser } from "@/lib/adapters";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ProfileSection() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    }
    if (showAvatarMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAvatarMenu]);

  function handleChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setIsDirty(true);
      setError("");
      setSuccess("");
    };
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setShowAvatarMenu(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Please select a JPEG, PNG, GIF, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be under 5 MB");
      return;
    }

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    uploadAvatar.mutate(file, {
      onSuccess: (apiUser) => {
        const adapted = adaptUser(apiUser);
        setAvatarUrl(adapted.avatar_url);
        setAvatarPreview(null);
        URL.revokeObjectURL(previewUrl);
        setSuccess("Avatar updated");
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: (err) => {
        setAvatarPreview(null);
        URL.revokeObjectURL(previewUrl);
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      },
    });

    // Reset the file input so re-selecting the same file triggers onChange
    e.target.value = "";
  }

  function handleRemoveAvatar() {
    setShowAvatarMenu(false);
    setUploadError("");

    deleteAvatar.mutate(undefined, {
      onSuccess: (apiUser) => {
        const adapted = adaptUser(apiUser);
        setAvatarUrl(adapted.avatar_url);
        setSuccess("Avatar removed");
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: (err) => {
        setUploadError(err instanceof Error ? err.message : "Failed to remove avatar");
      },
    });
  }

  function handleSave() {
    if (!isDirty) return;
    setError("");
    setSuccess("");

    updateProfile.mutate(
      {
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        avatar_url: avatarUrl.trim() || null,
      },
      {
        onSuccess: (apiUser) => {
          const adapted = adaptUser(apiUser);
          setUsername(adapted.username);
          setEmail(adapted.email);
          setAvatarUrl(adapted.avatar_url);
          setIsDirty(false);
          setSuccess("Profile updated successfully");
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to update profile");
        },
      }
    );
  }

  const displayAvatar = avatarPreview || avatarUrl || undefined;
  const isUploading = uploadAvatar.isPending || deleteAvatar.isPending;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: "var(--font-inter), sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const saving = updateProfile.isPending;

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 24,
        }}
      >
        Profile
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Avatar with edit functionality */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <div
            style={{
              position: "relative",
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "3px solid #ff3b3b",
              overflow: "hidden",
              flexShrink: 0,
              cursor: isUploading ? "wait" : "pointer",
              opacity: isUploading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
            onClick={() => {
              if (!isUploading) setShowAvatarMenu((v) => !v);
            }}
          >
            <img
              src={displayAvatar}
              alt={username}
              width={96}
              height={96}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s ease",
                gap: 2,
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            >
              {isUploading ? (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fff",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    Edit
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Dropdown menu */}
          {showAvatarMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: 4,
                minWidth: 180,
                zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  color: "#f5f5f5",
                  fontSize: 13,
                  fontFamily: "var(--font-inter), sans-serif",
                  cursor: "pointer",
                  borderRadius: 8,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload photo
              </button>
              <button
                onClick={handleRemoveAvatar}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: 13,
                  fontFamily: "var(--font-inter), sans-serif",
                  cursor: "pointer",
                  borderRadius: 8,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Remove photo
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#f5f5f5",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {username}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {email}
          </div>
          {uploadError && (
            <div
              style={{
                fontSize: 12,
                color: "#ef4444",
                fontFamily: "var(--font-inter), sans-serif",
                marginTop: 4,
              }}
            >
              {uploadError}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#888",
              marginBottom: 6,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={handleChange(setUsername)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#888",
              marginBottom: 6,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={handleChange(setEmail)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              color: "#ef4444",
              fontSize: 13,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 8,
              color: "#22c55e",
              fontSize: 13,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {success}
          </div>
        )}

        <button
          disabled={!isDirty || saving}
          onClick={handleSave}
          style={{
            alignSelf: "flex-start",
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            border: "none",
            borderRadius: 10,
            background: "#ff3b3b",
            color: "#fff",
            cursor: isDirty && !saving ? "pointer" : "not-allowed",
            opacity: isDirty && !saving ? 1 : 0.4,
            transition: "opacity 0.2s ease, box-shadow 0.2s ease",
            boxShadow: isDirty ? "0 0 20px rgba(255,59,59,0.3)" : "none",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
