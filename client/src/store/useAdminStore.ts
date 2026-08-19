import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

interface AdminState {
  admin: AdminUser | null;
  isAdminAuthenticated: () => boolean;
  setAdmin: (admin: AdminUser | null) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAdminAuthenticated: () => !!get().admin,
      setAdmin: (admin) => set({ admin }),
      logout: () => set({ admin: null }),
    }),
    {
      name: "admin-storage",
    }
  )
);
