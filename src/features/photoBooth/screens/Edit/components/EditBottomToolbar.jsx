import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { editStyles } from "../editStyles";
import { AppText } from "../../../../../shared/theme/components/AppText";

function ToolItem({ label, active, onPress, Icon }) {
  const iconColor = active ? "#FFFFFF" : "#3E3E3E";
  return (
    <TouchableOpacity onPress={onPress} style={editStyles.toolItem}>
      <Icon width={28} height={28} color={iconColor} />
      <AppText
        variant="smallRegular"
        style={[editStyles.toolLabel, active && editStyles.toolLabelActive]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const TOOLS = [
  { key: "photo", label: "사진" },
  { key: "frame", label: "프레임" },
  { key: "sticker", label: "스티커" },
  { key: "text", label: "텍스트" },
];

export default function EditBottomToolbar({
  ImagesIcon,
  FramesIcon,
  StickersIcon,
  TextIcon,
  activeTool,
  onChangeTool,
  onLayout,
  paddingBottom,
}) {
  const icons = {
    photo: ImagesIcon,
    frame: FramesIcon,
    sticker: StickersIcon,
    text: TextIcon,
  };

  return (
    <View style={[editStyles.bottomBar, { paddingBottom }]} onLayout={onLayout}>
      {TOOLS.map(({ key, label }) => (
        <ToolItem
          key={key}
          label={label}
          Icon={icons[key]}
          active={activeTool === key}
          onPress={() => onChangeTool(key)}
        />
      ))}
    </View>
  );
}
