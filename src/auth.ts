import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Check if we're in demo mode (no Google credentials configured)
const isDemoMode = !process.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID === "your-google-client-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // Google OAuth (production)
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        // Backend Login
        Credentials({
            id: "credentials",
            name: "SharePlay Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@shareplay.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const res = await fetch(`${apiUrl}/auth/token`, {
                        method: "POST",
                        body: new URLSearchParams({
                            "username": email,
                            "password": password,
                        }),
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    });

                    if (!res.ok) {
                        return null;
                    }

                    const data = await res.json();

                    // Return user object
                    return {
                        id: email,
                        name: email.split("@")[0],
                        email: email,
                        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    };
                } catch (error) {
                    console.error("Login failed:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isLoggedIn && nextUrl.pathname === "/") {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
    },
});

export { isDemoMode };
