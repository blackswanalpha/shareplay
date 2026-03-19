"use client";

import { useState } from "react";
import { Bug, Lightbulb, ChatCircleDots, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import type { FeedbackType } from "@/lib/types";

const feedbackTypes: { value: FeedbackType; label: string; description: string; icon: typeof Bug }[] = [
  { value: "bug", label: "Bug Report", description: "Something isn't working", icon: Bug },
  { value: "feature", label: "Feature Request", description: "Suggest an improvement", icon: Lightbulb },
  { value: "general", label: "General", description: "Share your thoughts", icon: ChatCircleDots },
];

export function FeedbackSection() {
  const { user } = useAuth();
  const [type, setType] = useState<FeedbackType>("general");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isValid = message.trim().length >= 10;

  function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    console.log("Feedback submitted:", { type, rating, message, email });
    setTimeout(() => {
      toast.success("Thank you for your feedback!");
      setType("general");
      setRating(0);
      setMessage("");
      setSubmitting(false);
    }, 500);
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f5f5f5",
          marginBottom: 8,
        }}
      >
        Feedback
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#888",
          fontFamily: "var(--font-inter), sans-serif",
          marginBottom: 24,
        }}
      >
        Help us improve SharePlay by sharing your experience
      </p>

      {/* Feedback type cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {feedbackTypes.map((ft) => {
          const isActive = type === ft.value;
          const Icon = ft.icon;
          return (
            <button
              key={ft.value}
              onClick={() => setType(ft.value)}
              style={{
                padding: 16,
                background: isActive ? "rgba(255,59,59,0.08)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(255,59,59,0.3)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} color={isActive ? "#ff3b3b" : "#888"} />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? "#f5f5f5" : "#aaa",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {ft.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#666",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {ft.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Rating */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 8,
          }}
        >
          Rating
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  transition: "transform 0.1s ease",
                }}
              >
                <Star
                  size={28}
                  weight={filled ? "fill" : "regular"}
                  color={filled ? "#f59e0b" : "#555"}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 8,
          }}
        >
          Message <span style={{ color: "#ff3b3b" }}>*</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind (minimum 10 characters)..."
          rows={5}
          style={{
            width: "100%",
            padding: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#f5f5f5",
            fontSize: 13,
            fontFamily: "var(--font-inter), sans-serif",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        {message.length > 0 && message.trim().length < 10 && (
          <div
            style={{
              fontSize: 11,
              color: "#ff3b3b",
              fontFamily: "var(--font-inter), sans-serif",
              marginTop: 4,
            }}
          >
            Message must be at least 10 characters
          </div>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 8,
          }}
        >
          Email (optional)
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#f5f5f5",
            fontSize: 13,
            fontFamily: "var(--font-inter), sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || submitting}
        style={{
          padding: "12px 28px",
          background: isValid ? "#ff3b3b" : "rgba(255,59,59,0.3)",
          border: "none",
          borderRadius: 10,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "var(--font-inter), sans-serif",
          cursor: isValid && !submitting ? "pointer" : "not-allowed",
          opacity: submitting ? 0.7 : 1,
          transition: "all 0.15s ease",
        }}
      >
        {submitting ? "Sending..." : "Submit Feedback"}
      </button>
    </div>
  );
}
