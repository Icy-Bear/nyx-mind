import { SelectUser } from "@/db/schema";
import { create } from "zustand";

interface UserState {
  user: SelectUser | null;
  setUser: (user: SelectUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
