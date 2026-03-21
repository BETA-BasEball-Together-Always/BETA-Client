import React from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import BackIcon from "../../../../../shared/assets/svg/chevrons/back.svg";
import { editStyles } from "../editStyles";

export default function EditTopBar({ onBack, onSave, title = "야구네컷 편집" }) {
  return (
    <View style={editStyles.topBar}>
      <TouchableOpacity
        onPress={onBack}
        style={editStyles.topBarBackBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <BackIcon width={12} height={18.5} />
      </TouchableOpacity>
      <View style={editStyles.topBarTitleWrap} pointerEvents="none">
        <AppText variant="heading" style={editStyles.topTitle}>
          {title}
        </AppText>
      </View>
      <TouchableOpacity
        onPress={onSave}
        style={editStyles.saveBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="저장"
      >
        <AppText variant="caption" style={editStyles.saveText}>
          저장
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
