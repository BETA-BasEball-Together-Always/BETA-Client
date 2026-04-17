import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import GlassSurface from "./GlassSurface";

const TeamCard = ({ item, isSelected, onPress }) => {
  const Logo = item.Icon;
  const logoSize = 88;

  return (
    <View style={styles.itemWrap}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onPress(item)}
        style={styles.touch}
      >
        <GlassSurface
          selected={isSelected}
          borderRadius={16}
          style={styles.glass}
          contentStyle={styles.glassInner}
        >
          {Logo ? (
            <Logo width={logoSize} height={logoSize} />
          ) : (
            <Image
              source={item.logo}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          )}
        </GlassSurface>
      </TouchableOpacity>
      <AppText variant="medium" style={styles.itemLabel} numberOfLines={1}>
        {item.name}
      </AppText>
    </View>
  );
};

export default TeamCard;

const styles = StyleSheet.create({
  itemWrap: {
    alignItems: "center",
    marginRight: 12,
  },
  touch: {
    borderRadius: 16,
  },
  glass: {
    width: 128,
    height: 128,
  },
  glassInner: {
    flex: 1,
    width: "100%",
    maxHeight: 128,
  },
  teamLogo: { width: 88, height: 88 },
  itemLabel: {
    marginTop: 6,
    color: "#F9F9F9",
    maxWidth: 96,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21.8,
  },
});
