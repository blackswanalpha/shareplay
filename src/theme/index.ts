import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff0f0" },
          100: { value: "#ffe0e0" },
          200: { value: "#ffc0c0" },
          300: { value: "#ff9090" },
          400: { value: "#ff6b6b" },
          500: { value: "#ff3b3b" },
          600: { value: "#e63535" },
          700: { value: "#cc2f2f" },
          800: { value: "#992323" },
          900: { value: "#661717" },
          950: { value: "#330c0c" },
        },
        surface: {
          DEFAULT: { value: "#000000" },
          raised: { value: "#0a0a0a" },
          overlay: { value: "#111111" },
        },
        glass: {
          bg: { value: "rgba(255,255,255,0.04)" },
          border: { value: "rgba(255,255,255,0.08)" },
          hover: { value: "rgba(255,255,255,0.06)" },
        },
        text: {
          primary: { value: "#f5f5f5" },
          secondary: { value: "#888888" },
          muted: { value: "#555555" },
        },
        status: {
          success: { value: "#22c55e" },
          warning: { value: "#eab308" },
          error: { value: "#ef4444" },
          info: { value: "#3b82f6" },
        },
      },
      fonts: {
        heading: { value: "var(--font-space-grotesk), sans-serif" },
        body: { value: "var(--font-inter), sans-serif" },
        mono: { value: "var(--font-jetbrains-mono), monospace" },
      },
      radii: {
        sm: { value: "6px" },
        md: { value: "10px" },
        lg: { value: "14px" },
        xl: { value: "20px" },
        "2xl": { value: "28px" },
      },
      shadows: {
        glow: { value: "0 0 20px rgba(255,59,59,0.15)" },
        glowLg: { value: "0 0 40px rgba(255,59,59,0.2)" },
        glowXl: { value: "0 0 60px rgba(255,59,59,0.25)" },
        card: {
          value:
            "0 0 30px rgba(255,59,59,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        },
        cardHover: {
          value:
            "0 0 40px rgba(255,59,59,0.12), 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        },
        inner: { value: "inset 0 1px 0 rgba(255,255,255,0.05)" },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: "600",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        },
        variants: {
          variant: {
            brand: {
              bg: "#ff3b3b",
              color: "#fff",
              _hover: {
                bg: "#e63535",
                boxShadow: "0 0 30px rgba(255,59,59,0.4)",
                transform: "translateY(-1px)",
              },
              _active: {
                transform: "translateY(0) scale(0.98)",
              },
            },
            glass: {
              bg: "rgba(255,255,255,0.04)",
              color: "#f5f5f5",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              _hover: {
                bg: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.12)",
              },
            },
            ghost: {
              bg: "transparent",
              color: "#f5f5f5",
              _hover: {
                bg: "rgba(255,255,255,0.04)",
              },
            },
          },
        },
      },
      input: {
        base: {
          borderRadius: "10px",
        },
        variants: {
          variant: {
            glass: {
              bg: "rgba(255,255,255,0.04)",
              color: "#f5f5f5",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              _placeholder: { color: "#555" },
              _hover: {
                borderColor: "rgba(255,255,255,0.12)",
              },
              _focus: {
                borderColor: "rgba(255,59,59,0.4)",
                boxShadow: "0 0 0 1px rgba(255,59,59,0.4)",
              },
            },
          },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: "#000",
      color: "#f5f5f5",
      fontFamily: "var(--font-inter), sans-serif",
    },
  },
});

export const system = createSystem(defaultConfig, config);
