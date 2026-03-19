"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  label: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    label: "Getting Started",
    items: [
      { question: "What is SharePlay?", answer: "SharePlay is a real-time collaboration platform that lets you watch videos, listen to music, and hang out with friends together — all synchronized in real-time." },
      { question: "How do I create an account?", answer: "Click 'Sign Up' on the homepage, enter your username, email, and password. You'll receive a verification email to confirm your account before you can start using SharePlay." },
      { question: "Is SharePlay free to use?", answer: "Yes! SharePlay is completely free to use. We may introduce optional premium features in the future, but the core experience will always be free." },
      { question: "What browsers are supported?", answer: "SharePlay works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend using Chrome or Firefox for the best experience." },
    ],
  },
  {
    label: "Rooms",
    items: [
      { question: "How do I create a room?", answer: "From your dashboard, click the 'Create Room' button. Choose between a Watch or Music room, give it a name, set the participant limit, and share the room code with your friends." },
      { question: "What's the maximum number of participants?", answer: "Each room can hold up to 50 participants by default. You can set a custom limit when creating the room." },
      { question: "Can I invite friends to my room?", answer: "Yes! You can invite friends by sharing the room code, or by sending them a direct invite through the friends panel. They'll receive a notification to join." },
      { question: "What happens when the host leaves?", answer: "If the host leaves, co-hosts can continue managing the room. If there are no co-hosts, the room will remain active until all participants leave." },
    ],
  },
  {
    label: "Audio & Video",
    items: [
      { question: "Why can't others hear me?", answer: "Make sure your microphone is not muted (check the mic icon), your browser has granted microphone permissions, and the correct input device is selected in Audio settings." },
      { question: "How do I share my screen?", answer: "Click the screen share button in the room controls bar. You can choose to share your entire screen, a specific window, or a browser tab." },
      { question: "Can I change my camera or microphone?", answer: "Yes! Go to Settings > Audio or Settings > Video to select different input and output devices." },
    ],
  },
  {
    label: "Account",
    items: [
      { question: "How do I change my password?", answer: "Go to Settings > Profile and click 'Change Password'. You'll need to enter your current password and then your new password twice to confirm." },
      { question: "Can I change my username?", answer: "Yes, you can update your username in Settings > Profile. Note that your username must be unique across SharePlay." },
      { question: "How do I delete my account?", answer: "Please contact our support team to request account deletion. We'll process your request and remove all associated data within 30 days." },
    ],
  },
];

export function FAQSection({ onNavigateToSection }: { onNavigateToSection?: (key: string) => void }) {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    if (!search.trim()) return faqData;
    const q = search.toLowerCase();
    return faqData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  function toggleItem(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
        Frequently Asked Questions
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "#888",
          fontFamily: "var(--font-inter), sans-serif",
          marginBottom: 24,
        }}
      >
        Quick answers to common questions
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <MagnifyingGlass
          size={16}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#666",
          }}
        />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
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

      {/* FAQ Categories */}
      {filteredData.map((cat) => (
        <div key={cat.label} style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#888",
              fontFamily: "var(--font-inter), sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            {cat.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cat.items.map((item, i) => {
              const key = `${cat.label}-${i}`;
              const isOpen = openItems.has(key);
              return (
                <div
                  key={key}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggleItem(key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "none",
                      border: "none",
                      color: "#f5f5f5",
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "var(--font-inter), sans-serif",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {item.question}
                    <CaretDown
                      size={16}
                      color="#888"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            padding: "0 16px 14px",
                            fontSize: 13,
                            color: "#aaa",
                            fontFamily: "var(--font-inter), sans-serif",
                            lineHeight: 1.6,
                          }}
                        >
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredData.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#555",
            fontSize: 14,
            fontFamily: "var(--font-inter), sans-serif",
            padding: 32,
          }}
        >
          No questions match your search
        </div>
      )}

      {/* Still need help CTA */}
      <div
        style={{
          marginTop: 8,
          padding: 24,
          background: "rgba(255,59,59,0.04)",
          border: "1px solid rgba(255,59,59,0.15)",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#f5f5f5",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 6,
          }}
        >
          Still need help?
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#888",
            fontFamily: "var(--font-inter), sans-serif",
            marginBottom: 14,
          }}
        >
          Our support team is here to assist you
        </p>
        <button
          onClick={() => onNavigateToSection?.("help")}
          style={{
            padding: "10px 24px",
            background: "#ff3b3b",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-inter), sans-serif",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Get Support
        </button>
      </div>
    </div>
  );
}
