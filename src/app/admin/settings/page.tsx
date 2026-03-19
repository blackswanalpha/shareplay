"use client";

import { useState } from "react";
import { useAdminSettings, useAdminUpdateSetting, useAdminFeatureFlags, useAdminUpdateFeatureFlags, useAdminToggleMaintenance } from "@/hooks/useAdminApi";

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const { data: featureFlags } = useAdminFeatureFlags();
  const updateSetting = useAdminUpdateSetting();
  const updateFlags = useAdminUpdateFeatureFlags();
  const toggleMaintenance = useAdminToggleMaintenance();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSave = (key: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(editValue);
    } catch {
      parsed = editValue;
    }
    updateSetting.mutate({ key, data: { value: parsed } });
    setEditingKey(null);
  };

  const categories = settings
    ? [...new Set(settings.map((s) => s.category))]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>System Settings</h1>

      {/* Maintenance Mode Toggle */}
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#fff" }}>Maintenance Mode</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>Take the platform offline for maintenance</p>
        </div>
        <button
          onClick={() => toggleMaintenance.mutate()}
          style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid rgba(255,59,59,0.4)", background: "rgba(255,59,59,0.15)", color: "#ff3b3b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Toggle Maintenance
        </button>
      </div>

      {/* Feature Flags */}
      {featureFlags && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Feature Flags</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <button
                  onClick={() => updateFlags.mutate({ [key]: !enabled })}
                  style={{
                    padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                    background: enabled ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                    color: enabled ? "#4ade80" : "#f87171",
                  }}
                >
                  {enabled ? "ON" : "OFF"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings by Category */}
      {isLoading ? (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: 40 }}>Loading settings...</div>
      ) : (
        categories.filter((c) => c !== "features").map((cat) => (
          <div key={cat} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#fff", textTransform: "capitalize" }}>{cat}</h3>
            {settings!
              .filter((s) => s.category === cat && s.key !== "feature_flags")
              .map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{s.key}</div>
                    {s.description && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.description}</div>}
                  </div>
                  {editingKey === s.key ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, width: 200, outline: "none" }}
                      />
                      <button onClick={() => handleSave(s.key)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#ff3b3b", color: "#fff", fontSize: 12, cursor: "pointer" }}>Save</button>
                      <button onClick={() => setEditingKey(null)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                        {JSON.stringify(s.value)}
                      </span>
                      <button
                        onClick={() => { setEditingKey(s.key); setEditValue(JSON.stringify(s.value)); }}
                        style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))
      )}
    </div>
  );
}
