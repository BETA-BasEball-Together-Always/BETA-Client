import { StyleSheet } from "react-native";
import { STICKER_GAP, STICKER_PALETTE_H_PAD } from "./editConstants";

export const editStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#121212",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  topBarBackBtn: {
    zIndex: 1,
    paddingVertical: 4,
    paddingRight: 8,
    justifyContent: "center",
  },
  topBarTitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "#F9F9F9",
    textAlign: "center",
  },
  saveBtn: {
    zIndex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  saveText: {
    color: "#F9F9F9",
    lineHeight: 19.1,
  },

  canvasArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 0,
    overflow: "hidden",
  },
  frameBox: {
    position: "relative",
    overflow: "hidden",
  },
  photo: {
    position: "absolute",
  },

  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128,128,128,0.45)",
    borderRadius: 6,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: "black",
  },
  toolItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 56,
  },
  toolLabel: {
    color: "rgba(255,255,255,0.55)",
    lineHeight: 15,
  },
  toolLabelActive: {
    color: "#FFFFFF",
    lineHeight: 15,
  },

  overlayWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#FFFFFF4D",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },

  /** 사진/프레임 글래스 */
  overlayGlassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  overlayTextStyleGlassTint: {
    backgroundColor: "rgba(18, 18, 18, 0.20)",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  overlayWrapSticker: {
    borderWidth: 0,
    borderColor: "transparent",
  },
  overlayWrapTextAddOnly: {
    borderWidth: 0,
    borderColor: "transparent",
  },

  /** 스티커 탭 상단 드래그 바 */
  stickerTopHandleBar: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  stickerHandleHitArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    width: "100%",
  },
  overlayForeground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  photoListContent: {
    paddingLeft: 11,
    paddingRight: 14,
    alignItems: "center",
    paddingTop: 23,
    paddingBottom: 22,
  },
  photoListFooter: {
    marginLeft: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  photoFooterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingRight: 0,
  },
  photoActionCardOuter: {
    width: 92,
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoActionCardInner: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.42)",
  },
  photoActionFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(41, 41, 41, 0.20)",
  },
  photoActionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  photoActionLabel: {
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 16.3,
  },
  thumb: {
    width: 92,
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  thumbImg: { width: "100%", height: "100%", opacity: 1 },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: "#333",
  },

  frameOptionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: 12,
    flex: 1,
  },

  /**
   * 수정 시: FrameToolPanel의 frameCardIconWrap + frameCardImg와 함께 봐야 함!!
   */
  frameCard: {
    width: 152,
    minHeight: 156,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: 0,
    overflow: "hidden",
  },
  frameCardActive: {
    backgroundColor: "#FFFFFF",
  },

  frameCardIconWrap: {
    paddingTop: 10.574,
    paddingRight: 18.66,
    paddingBottom: 8.282,
    paddingLeft: 17.416,
    alignItems: "center",
    justifyContent: "center",
    height: 122,
    width: "100%",
  },
  frameCardImg: {
    width: "100%",
    height: "100%",
  },
  frameCardLabel: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    textAlign: "center",
    color: "rgba(228, 228, 228, 0.50)",
  },
  frameCardLabelActive: {
    color: "#000",
    fontWeight: "700",
  },

  stickerScroll: {
    flex: 1,
    width: "100%",
  },
  stickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignSelf: "stretch",
    width: "100%",
    paddingHorizontal: STICKER_PALETTE_H_PAD,
    rowGap: STICKER_GAP,
    columnGap: STICKER_GAP,
    paddingBottom: 12,
  },
  stickerItem: {
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  stickerItemSelected: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  stickerImg: {
    width: "80%",
    height: "80%",
  },
  stickerOutline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.2,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
  },
  handle: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  handleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  handleTL: {
    left: -11,
    top: -11,
  },
  handleBR: {
    right: -11,
    bottom: -11,
  },
  handleTR: {
    right: -11,
    top: -11,
  },

  actionSave: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderColor: "rgba(255,255,255,0.9)",
    width: 40,
    height: 25,
  },
  actionCancel: {
    backgroundColor: "rgba(108, 108, 108, 1)",
    borderColor: "rgba(255,255,255,0.9)",
    width: 40,
    height: 25,
  },
  addTextButton: {
    width: "100%",
    borderRadius: 6,
    height: 49,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addTextPlus: {
    color: "#111",
    fontSize: 20,
    fontWeight: "800",
  },
  addTextLabel: {
    color: "#1E1E1E",
  },
  textPanelWrap: {
    width: "100%",
    paddingHorizontal: 16,
  },
  textPanelRow: {
    width: "100%",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  panelTitle: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  fontRow: {
    alignItems: "center",
    gap: 8,
  },
  fontChip: {
    paddingHorizontal: 14,
    height: 49,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fontChipActive: {
    backgroundColor: "#FFFFFF",
  },
  fontChipLabel: {
    color: "#BDBDBD",
  },
  fontChipLabelActive: {
    color: "#000",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  /** TextStylePanel에서 첫/끝 radius와 겹침은 인라인으로 처리 */
  swatchBase: {
    width: 40,
    height: 40,
  },
});
