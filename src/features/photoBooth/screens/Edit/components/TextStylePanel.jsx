import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { FONT_FAMILY_OPTIONS, TEXT_COLORS } from "../editConstants";
import { editStyles } from "../editStyles";
import { AppText } from "../../../../../shared/theme/components/AppText";

export default function TextStylePanel({ selectedText, setTexts }) {
  if (!selectedText) return null;

  const onPickColor = (c) => {
    setTexts((prev) =>
      prev.map((x) => (x.id === selectedText.id ? { ...x, color: c } : x)),
    );
  };

  const onPickFamily = (family) => {
    setTexts((prev) =>
      prev.map((x) =>
        x.id === selectedText.id ? { ...x, fontFamily: family } : x,
      ),
    );
  };

  const nColors = TEXT_COLORS.length;

  return (
    <View style={editStyles.textPanelWrap}>
      <View style={[editStyles.textPanelRow, { marginBottom: 10 }]}>
        <AppText variant="semi13" style={editStyles.panelTitle}>
          폰트
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={editStyles.fontRow}
        >
          {FONT_FAMILY_OPTIONS.map((opt) => {
            const active = selectedText.fontFamily === opt.family;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => onPickFamily(opt.family)}
                activeOpacity={0.85}
                style={[
                  editStyles.fontChip,
                  active && editStyles.fontChipActive,
                ]}
              >
                <AppText
                  variant="caption"
                  style={[
                    editStyles.fontChipLabel,
                    active && editStyles.fontChipLabelActive,
                    { fontFamily: opt.family },
                  ]}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[editStyles.textPanelRow, { marginTop: 8 }]}>
        <AppText variant="semi13" style={editStyles.panelTitle}>
          색상
        </AppText>
        <View style={editStyles.colorRow}>
          {TEXT_COLORS.map((c, i) => {
            const active =
              selectedText.color?.toLowerCase() === c.toLowerCase();
            const isFirst = i === 0;
            const isLast = i === nColors - 1;

            return (
              <TouchableOpacity
                key={c}
                onPress={() => onPickColor(c)}
                activeOpacity={0.85}
                style={[
                  editStyles.swatchBase,
                  { backgroundColor: c },
                  isFirst && {
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                  },
                  isLast && {
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                  },
                  !isFirst && { marginLeft: -1 },
                  active
                    ? {
                        borderWidth: 1.5,
                        borderColor: "#FFFFFF",
                        zIndex: 10,
                      }
                    : {
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
