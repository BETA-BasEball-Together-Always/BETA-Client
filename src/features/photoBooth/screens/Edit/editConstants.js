import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

/** 스티커 팔레트: 4열 — 좌우 동일 패딩으로 오른쪽 여백만 커 보이는 현상 완화 */
export const STICKER_PALETTE_H_PAD = 16;
export const STICKER_GAP = 12;
export const STICKER_COLS = 4;
export const stickerPaletteCellSize =
  (width - STICKER_PALETTE_H_PAD * 2 - STICKER_GAP * (STICKER_COLS - 1)) /
  STICKER_COLS;

/**
 * 수정 시 참고 사항!!
 * 오버레이 배경 모드 (EditOverlayBackdrop / EditScreen overlayWrap 스타일과 쌍으로 봄)
 * - glass: 사진/프레임 탭
 * - sticker: 스티커 탭
 * - none: 텍스트 탭에서 텍스트 추가만 — 뒤 블러/딤 없음
 * - textStyleGlass: 폰트/색 패널 — 프레임과 동일 글라스(라이트 블러) + 틴트 rgba(18,18,18,0.20)
 */
export function getOverlayBackdropMode(activeTool, isTextStylePanel) {
  if (activeTool === "text" && !isTextStylePanel) return "none";
  if (isTextStylePanel) return "textStyleGlass";
  if (activeTool === "sticker") return "sticker";
  return "glass";
}

export const SNAP_THRESHOLD = 48;

export const FRAME_OPTIONS = [
  { id: "2x2", label: "2 × 2" },
  { id: "1x4", label: "1 x 4" },
];

export const FONT_FAMILY_OPTIONS = [
  {
    key: "NotoSansKR_Regular",
    label: "Noto Sans KR",
    family: "NotoSansKR_Regular",
  },
  { key: "Surround_Bold", label: "Surround", family: "Surround_Bold" },
  { key: "Dohyeon_Regular", label: "Do Hyeon", family: "Dohyeon_Regular" },
  { key: "Myungjo_Medium", label: "Myungjo", family: "Myungjo_Medium" },
  { key: "MeetMe_Regular", label: "Meet Me", family: "MeetMe_Regular" },
];

export const TEXT_COLORS = [
  "#FFFFFF",
  "#C1C1C1",
  "#000000",
  "#E84A5F",
  "#FFF280",
  "#9ED4FF",
  "#C6A3FF",
  "#FFC8D8",
];

export const getOverlayHeight = (tool) =>
  tool === "photo" || tool === "frame"
    ? 185
      : tool === "text"
        ? 142
        : tool === "sticker"
          ? 280
          : 154;

/**
 * 폰트/색 패널일 때 하단 오버레이 세로 높이
 */
export const TEXT_STYLE_PANEL_HEIGHT = 158;

/**
 * EDIT_TOP_BAR_HEIGHT_ESTIMATE: 실제 EditTopBar 높이와 다르면 피그마와 세로 정렬이 틀어짐!!!
 * editStyles.topBar 변경 시 여기도 맞출 것
 */
export const FIGMA_EDIT_2X2_FRAME_TOP_FROM_WINDOW = 134;
export const FIGMA_EDIT_2X2_FRAME_BOTTOM_TO_SCREEN = 216;
export const FIGMA_EDIT_2X2_PAD_LEFT = 22;
export const FIGMA_EDIT_2X2_PAD_RIGHT = 22.2;

/** 1x4 전용  */
export const FIGMA_EDIT_1X4_FRAME_TOP_FROM_WINDOW = 134;
export const FIGMA_EDIT_1X4_FRAME_BOTTOM_TO_SCREEN = 216;
export const FIGMA_EDIT_1X4_PAD_LEFT = 22;
export const FIGMA_EDIT_1X4_PAD_RIGHT = 22.2;

export const EDIT_TOP_BAR_HEIGHT_ESTIMATE = 62;

export function computeEditFrameLayout({
  frameKey,
  windowWidth,
  windowHeight,
  safeTopInset,
}) {
  const is14 = frameKey === "1x4";
  const topOff = is14
    ? FIGMA_EDIT_1X4_FRAME_TOP_FROM_WINDOW
    : FIGMA_EDIT_2X2_FRAME_TOP_FROM_WINDOW;
  const botReserved = is14
    ? FIGMA_EDIT_1X4_FRAME_BOTTOM_TO_SCREEN
    : FIGMA_EDIT_2X2_FRAME_BOTTOM_TO_SCREEN;
  const padL = is14 ? FIGMA_EDIT_1X4_PAD_LEFT : FIGMA_EDIT_2X2_PAD_LEFT;
  const padR = is14 ? FIGMA_EDIT_1X4_PAD_RIGHT : FIGMA_EDIT_2X2_PAD_RIGHT;
  const aspect = is14 ? 1 / 3 : 2 / 3;

  const maxW = windowWidth - padL - padR;
  const maxH = Math.max(120, windowHeight - topOff - botReserved);

  let h = maxW / aspect;
  let w = maxW;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }

  const marginTop = Math.max(
    0,
    topOff - safeTopInset - EDIT_TOP_BAR_HEIGHT_ESTIMATE,
  );

  return {
    frameStyle: { width: w, height: h },
    marginTop,
    padL,
    padR,
  };
}
