import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET || "",
      authorization: {
        url: "https://www.facebook.com/v19.0/dialog/oauth",
        params: {
          scope: process.env.FACEBOOK_SCOPE || "public_profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || (account.provider !== "google" && account.provider !== "facebook")) {
        return true;
      }

      try {
        const fallbackEmail =
          user.email ||
          (account.provider === "facebook"
            ? `fb_${account.providerAccountId}@facebook.user`
            : "");

        const payload = {
          provider: account.provider,
          providerId: account.providerAccountId,
          email: fallbackEmail,
          name: user.name || (account.provider === "facebook" ? "Facebook User" : "User"),
          image: user.image || undefined,
          accessToken: account.access_token,
          idToken: (account as any).id_token,
        };

        const res = await fetch(`${API_BASE}/auth/oauth/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Social login sync to backend failed:", errData);
          return false;
        }

        const data = await res.json();
        // Attach Go JWT token and User to user object for the jwt callback
        (user as any).backendToken = data.token;
        (user as any).backendUser = data.user;
        return true;
      } catch (err) {
        console.error("Error connecting to backend during social login:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        if ((user as any).backendToken) {
          token.backendToken = (user as any).backendToken;
        }
        if ((user as any).backendUser) {
          token.backendUser = (user as any).backendUser;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken;
      }
      if (token.backendUser) {
        (session as any).backendUser = token.backendUser;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "selftest_super_secure_authjs_session_secret_32bytes",
});
