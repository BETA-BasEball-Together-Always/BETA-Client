import { create } from 'zustand';

const photoBoothStore = create((set) => ({
  selectedTeam: null,
  selectedFrame: null,
  capturedPhotos: [], 

  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  setCapturedPhotos: (uris) => set({ capturedPhotos: uris }),
  resetCaptured: () => set({ capturedPhotos: [] }),

  resetSelection: () => set({ selectedTeam: null, selectedFrame: null }),
}));

export default photoBoothStore;
