import React from "react";
import { TouchableOpacity, Image, View, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import GlassSurface from "./GlassSurface";

const FrameCard = ({ item, source, isSelected, onPress }) => {
  return (
    <View style={[styles.itemWrap, { width: "48%" }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item)}
        style={styles.touch}
      >
        <GlassSurface
          selected={isSelected}
          borderRadius={20}
          style={styles.glass}
          contentStyle={styles.glassInner}
        >
          <View style={styles.frameThumb}>
            <Image
              source={source}
              style={styles.frameImage}
              resizeMode="contain"
            />
          </View>
          <AppText
            variant="spaced"
            style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
          >
            {item.name}
          </AppText>
        </GlassSurface>
      </TouchableOpacity>
    </View>
  );
};

export default FrameCard;

const styles = StyleSheet.create({
  itemWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 21,
  },
  touch: {
    borderRadius: 20,
    width: "100%",
  },
  glass: {
    width: "100%",
    minWidth: 140,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  glassInner: {
    width: "100%",
    alignItems: "center",
  },
  frameThumb: {
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  frameImage: {
    width: 110,
    height: 156,
  },
  itemLabel: {
    marginTop: 10,
    color: "#F9F9F9",
    textAlign: "center",
    lineHeight: 17.7,
  },
  itemLabelSelected: {
    color: "#1A1A1A",
  },
});
