"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, GearSix, SignOut } from "@phosphor-icons/react";
import type { User } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const menuItems = [
    { icon: <UserIcon size={16} />, label: "Profile", href: "/dashboard/settings" },
    { icon: <GearSix size={16} />, label: "Settings", href: "/dashboard/settings" },
    { icon: <SignOut size={16} />, label: "Logout" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.12)",
          background: "#222",
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }}
      >
        <img
          src={user.avatar_url}
          alt={user.username}
          width={32}
          height={32}
          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            background: "rgba(17,17,17,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            padding: "4px",
            zIndex: 100,
          }}
        >
          {menuItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  color: "#f5f5f5",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 6,
                  transition: "background 0.15s ease",
                  fontFamily: "var(--font-inter), sans-serif",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => {
                  if (item.label === "Logout") logout();
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 6,
                  transition: "background 0.15s ease",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
