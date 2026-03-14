import { create } from 'zustand';

const photoBoothStore = create((set) => ({
  selectedTeam: null,
  selectedFrame: null,
  capturedPhotos: [], 
  exportedFrameUri: null,

  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  setCapturedPhotos: (uris) => set({ capturedPhotos: uris }),
  resetCaptured: () => set({ capturedPhotos: [] }),

  resetSelection: () => set({ selectedTeam: null, selectedFrame: null }),

  setExportedFrameUri: (uri) => set({ exportedFrameUri: uri }),
}));

export default photoBoothStore;
