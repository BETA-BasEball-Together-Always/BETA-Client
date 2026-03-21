import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

/** 스티커 팔레트: 4열 — 좌우 동일 패딩으로 오른쪽 여백만 커 보이는 현상 완화 */
export const STICKER_PALETTE_H_PAD = 16;
export const STICKER_GAP = 12;
export const STICKER_COLS = 4;
export const stickerPaletteCellSize =
  (width - STICKER_PALETTE_H_PAD * 2 - STICKER_GAP * (STICKER_COLS - 1)) /
  STICKER_COLS;

/** 오버레이 배경: 사진·프레임=글래스, 스티커=반투명 검정, 텍스트=연한 검정+약한 블러 */
export function getOverlayBackdropMode(activeTool, isTextStylePanel) {
  if (isTextStylePanel || activeTool === "text") return "text";
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

/** 탭별 하단 패널 높이 */
export const getOverlayHeight = (tool) =>
  tool === "photo" || tool === "frame"
    ? 154
    : tool === "text"
      ? 142
      : tool === "sticker"
        ? 280
        : 154;

/** 텍스트 탭 / 텍스트 스타일 패널 공통 */
export const TEXT_STYLE_PANEL_HEIGHT = 142;
