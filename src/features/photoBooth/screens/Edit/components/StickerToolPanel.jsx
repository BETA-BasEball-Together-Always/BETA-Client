import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { stickerPaletteCellSize } from "../editConstants";
import { SVG_STICKER_COMPONENTS } from "../stickerIcons";
import { editStyles } from "../editStyles";

export default function StickerToolPanel({
  selectedStickerPaletteIndex,
  onPickSticker,
}) {
  const iconPx = Math.min(
    56,
    Math.max(44, stickerPaletteCellSize * 0.78),
  );

  return (
    <View style={{ flex: 1, width: "100%", minHeight: 0 }}>
      <ScrollView
        style={editStyles.stickerScroll}
        contentContainerStyle={editStyles.stickerContainer}
        showsVerticalScrollIndicator={false}
      >
        {SVG_STICKER_COMPONENTS.map((SvgComp, idx) => {
          const selected = selectedStickerPaletteIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                editStyles.stickerItem,
                {
                  width: stickerPaletteCellSize,
                  height: stickerPaletteCellSize,
                },
                selected && editStyles.stickerItemSelected,
              ]}
              onPress={() => onPickSticker(SvgComp, idx)}
              activeOpacity={0.8}
            >
              <SvgComp
                width={iconPx}
                height={iconPx}
                preserveAspectRatio="xMidYMid meet"
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
