import { create } from "zustand";

const photoBoothStore = create((set) => ({
  selectedTeam: null,
  selectedFrame: null,
  capturedPhotos: [],
  exportedFrameUri: null,
  /** PhotoToolPanel에서 선택 가능한 이미지 풀(슬롯과 분리), added는 최대 2장 제한 */
  imagePool: [],

  setSelectedTeam: (team) => set({ selectedTeam: team }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  setCapturedPhotos: (uris) => set({ capturedPhotos: uris }),
  resetCaptured: () => set({ capturedPhotos: [], imagePool: [] }),
  setImagePool: (items) =>
    set({ imagePool: Array.isArray(items) ? items : [] }),
  addImagePoolItem: (item) =>
    set((s) => ({
      imagePool: [...(s.imagePool ?? []), item].filter(Boolean),
    })),
  removeImagePoolItem: (id) =>
    set((s) => ({
      imagePool: (s.imagePool ?? []).map((x) => {
        if (x?.id !== id) return x;
        // slot 아이템은 프레임엔 남아야 하므로 리스트에서만 숨김(soft delete)
        if (x?.kind === "slot") return { ...x, deleted: true };
        return null;
      }).filter(Boolean),
    })),

  resetSelection: () => set({ selectedTeam: null, selectedFrame: null }),

  setExportedFrameUri: (uri) => set({ exportedFrameUri: uri }),
}));

export default photoBoothStore;
