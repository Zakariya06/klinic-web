import { create } from "zustand";
import type { AppRole } from "@/utils/roles";

type UserStoreState = {
  usersByRole: Partial<Record<AppRole, any>>;

  user: any | null;
  userToken: string | null;
  setUserForRole: (role: AppRole, user: any | null) => void;
  getUserForRole: (role: AppRole) => any | null;
  clearUserForRole: (role: AppRole) => void;

  setUser: (user: any | null) => void;
  setUserToken: (userToken: any | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStoreState>((set, get) => ({
  usersByRole: {},
  user: null,
  userToken: null,

  setUserForRole: (role, user) =>
    set((s) => ({
      usersByRole: { ...s.usersByRole, [role]: user },
    })),

  getUserForRole: (role) => get().usersByRole?.[role] ?? null,

  clearUserForRole: (role) =>
    set((s) => {
      const copy = { ...s.usersByRole };
      delete copy[role];
      return { usersByRole: copy };
    }),

  setUser: (user) => set({ user }),
 
  setUserToken: (userToken) => set({ userToken }),

  clearUser: () => set({ user: null, userToken: null }),
}));