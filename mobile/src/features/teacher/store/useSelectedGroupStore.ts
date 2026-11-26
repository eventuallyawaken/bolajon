import { create } from 'zustand';

interface SelectedGroupState {
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string) => void;
}

export const useSelectedGroupStore = create<SelectedGroupState>((set) => ({
  selectedGroupId: null,
  setSelectedGroupId: (id: string) => set({ selectedGroupId: id }),
}));
