import React from "react";
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import ImageDeleteIcon from "../../assets/svg/CommunityPost/imageDeleteIcon.svg";

const ImagePreviewList = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.previewRow}
    >
      {images.map((asset, idx) => {
        const aspectRatio =
          asset?.width && asset?.height ? asset.width / asset.height : 1;
        const itemKey = asset?.key ?? `${asset?.uri ?? "image"}-${idx}`;
        return (
          <View key={itemKey} style={styles.previewWrap}>
            <View style={styles.previewImageClip}>
              <Image
                key={itemKey}
                source={{ uri: asset.uri }}
                style={[styles.previewImage, { aspectRatio }]}
                resizeMode="cover"
              />
            </View>
            <Pressable
              onPress={() => onRemove(idx)}
              style={styles.previewRemove}
              hitSlop={8}
            >
              <ImageDeleteIcon width={30} height={30} />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ImagePreviewList;

const styles = StyleSheet.create({
  previewRow: {
    marginTop: 8,
    paddingBottom: 4,
    gap: 18.4,
  },
  previewWrap: {
    position: "relative",
  },
  previewImageClip: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
  },
  previewImage: {
    height: 180,
  },
  previewRemove: {
    position: "absolute",
    top: 6,
    right: 6,
  },
});
