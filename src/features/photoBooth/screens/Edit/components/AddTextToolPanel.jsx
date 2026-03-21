import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { editStyles } from "../editStyles";
import PlusIcon from "../../../../community/assets/svg/plusIcon.svg";
import { AppText } from "../../../../../shared/theme/components/AppText";

import AddIcon from "../assets/tab/plus.svg";

const { width } = Dimensions.get("window");

export default function AddTextToolPanel({ onAddText }) {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: width * 0.06,
        justifyContent: "center",
        width: "100%",
      }}
    >
      <TouchableOpacity
        style={editStyles.addTextButton}
        onPress={onAddText}
        activeOpacity={0.85}
      >
        <AddIcon width={24} height={24} />
        <AppText variant="heading" style={editStyles.addTextLabel}>
          텍스트 추가
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
