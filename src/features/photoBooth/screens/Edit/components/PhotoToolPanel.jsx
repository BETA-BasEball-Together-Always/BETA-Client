/**
 * 사진 탭: 썸네일 리스트 + 촬영/갤러리 카드
 * 높이·너비는 대부분 ../editStyles 의 thumb, photoActionCardOuter (둘 다 맞출 것)
 * 썸네일 사이 간격은 아래 ItemSeparatorComponent 의 width
 */
import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { AppText } from "../../../../../shared/theme/components/AppText";
import CameraPickerIcon from "../../../../community/assets/svg/CommunityPost/camera.svg";
import GalleryPickerIcon from "../../../../community/assets/svg/CommunityPost/image.svg";
import { editStyles } from "../editStyles";

export default function PhotoToolPanel({
  photosLocal,
  onPressThumb,
  onReplaceFromCamera,
  onReplaceFromGallery,
}) {
  const photoFooter = (
    <View style={editStyles.photoFooterActions}>
      <TouchableOpacity
        style={editStyles.photoActionCardOuter}
        onPress={onReplaceFromCamera}
        activeOpacity={0.85}
      >
        <View style={editStyles.photoActionCardInner}>
          <BlurView
            intensity={Platform.select({ ios: 28, android: 22, default: 26 })}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[editStyles.photoActionFrost, { borderRadius: 10 }]}
          />
          <View style={editStyles.photoActionContent}>
            <CameraPickerIcon width={28} height={28} />
            <AppText
              variant="labelSmall"
              style={editStyles.photoActionLabel}
              numberOfLines={2}
            >
              사진{"\n"}촬영하기
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={editStyles.photoActionCardOuter}
        onPress={onReplaceFromGallery}
        activeOpacity={0.85}
      >
        <View style={editStyles.photoActionCardInner}>
          <BlurView
            intensity={Platform.select({ ios: 28, android: 22, default: 26 })}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[editStyles.photoActionFrost, { borderRadius: 10 }]}
          />
          <View style={editStyles.photoActionContent}>
            <GalleryPickerIcon width={28} height={28} />
            <AppText
              variant="labelSmall"
              style={editStyles.photoActionLabel}
              numberOfLines={2}
            >
              갤러리에서{"\n"}추가하기
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      horizontal
      data={photosLocal}
      extraData={photosLocal}
      keyExtractor={(u, idx) => `thumb-${idx}-${u ?? "empty"}`}
      contentContainerStyle={editStyles.photoListContent}
      ItemSeparatorComponent={() => <View style={{ width: 11 }} />}
      ListFooterComponent={photoFooter}
      ListFooterComponentStyle={editStyles.photoListFooter}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onPressThumb(item)}
          activeOpacity={0.8}
        >
          <View style={editStyles.thumb}>
            {item ? (
              <Image
                source={{ uri: item }}
                style={editStyles.thumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={editStyles.thumbPlaceholder} />
            )}
          </View>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}
