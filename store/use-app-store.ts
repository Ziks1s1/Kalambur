"use client";

import { create } from "zustand";

type AppState = {
  activeSubjectId: string | null;
  setActiveSubjectId: (subjectId: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeSubjectId: null,
  setActiveSubjectId: (activeSubjectId) => set({ activeSubjectId })
}));
