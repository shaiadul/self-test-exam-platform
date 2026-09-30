"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  phone?: string;
  level?: string;
  batch?: string;
  board?: string;
  institution?: string;
  address?: string;
  examPackLimit?: number;
  examLimit?: number;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [user, setUserState] = useState<UserProfile | null>(initialUser);

  // Sync with cookie / localStorage on client mount if initialUser is missing
  useEffect(() => {
    if (initialUser) {
      setUserState(initialUser);
      return;
    }

    if (typeof window !== "undefined") {
      // Check user_profile cookie first
      const match = document.cookie.match(/(?:^|;\s*)user_profile=([^;]*)/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (parsed && typeof parsed === "object") {
            setUserState(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      // Fallback to localStorage
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("userRole");
      const email = localStorage.getItem("userEmail");
      const id = localStorage.getItem("userID");
      const image = localStorage.getItem("userImage");

      if (name || role || email || id) {
        setUserState({
          id: id ? parseInt(id, 10) : undefined,
          name: name || undefined,
          email: email || undefined,
          role: role || "student",
          image: image || undefined,
        });
      }
    }
  }, [initialUser]);

  // Listen for custom profile update events (e.g. from completeProfile)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setUserState((prev) => ({
          ...(prev || {}),
          ...e.detail,
        }));
      } else {
        setUserState(null);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const setUser = useCallback((newUser: UserProfile | null) => {
    setUserState(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        document.cookie = `user_profile=${encodeURIComponent(
          JSON.stringify(newUser)
        )}; path=/; max-age=86400; SameSite=Lax`;
        if (newUser.name) localStorage.setItem("userName", newUser.name);
        if (newUser.role) localStorage.setItem("userRole", newUser.role);
        if (newUser.email) localStorage.setItem("userEmail", newUser.email);
        if (newUser.id) localStorage.setItem("userID", newUser.id.toString());
        if (newUser.image) localStorage.setItem("userImage", newUser.image);
        else localStorage.removeItem("userImage");
      } else {
        document.cookie = "user_profile=; path=/; max-age=0; SameSite=Lax";
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userID");
        localStorage.removeItem("userImage");
      }
    }
  }, []);

  const updateUser = useCallback((partial: Partial<UserProfile>) => {
    setUserState((prev) => {
      const updated = { ...(prev || {}), ...partial };
      if (typeof window !== "undefined") {
        document.cookie = `user_profile=${encodeURIComponent(
          JSON.stringify(updated)
        )}; path=/; max-age=86400; SameSite=Lax`;
        if (updated.name) localStorage.setItem("userName", updated.name);
        if (updated.role) localStorage.setItem("userRole", updated.role);
        if (updated.email) localStorage.setItem("userEmail", updated.email);
        if (updated.id) localStorage.setItem("userID", updated.id.toString());
        if (updated.image) localStorage.setItem("userImage", updated.image);
      }
      return updated;
    });
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    if (typeof window !== "undefined") {
      document.cookie = "user_profile=; path=/; max-age=0; SameSite=Lax";
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userID");
      localStorage.removeItem("userImage");
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
