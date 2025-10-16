import { create } from 'zustand';

const photoBoothStore = create((set) => ({
  selectedTeam: null,
  selectedFrame: null,
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),
  resetSelection: () => set({ selectedTeam: null, selectedFrame: null }),
}));

export default photoBoothStore;