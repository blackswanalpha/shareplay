"use client";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 24,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: isActive
                ? "2px solid #ff3b3b"
                : "2px solid transparent",
              color: isActive ? "#f5f5f5" : "#888",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              cursor: "pointer",
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "#bbb";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "#888";
            }}
          >
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        );
      })}
    </div>
  );
}
