import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FRAMES } from "@features/photoBooth/constants/framesMap";
import { FRAME_OPTIONS } from "../editConstants";
import { editStyles } from "../editStyles";
import { AppText } from "../../../../../shared/theme/components/AppText";

function FrameOptionCard({ id, label, teamKey, frameKey, onSelect }) {
  const src = (FRAMES[teamKey] || FRAMES.base)?.[id] || FRAMES.base[id];
  const active = frameKey === id;
  return (
    <TouchableOpacity
      onPress={() => onSelect({ id, name: id })}
      activeOpacity={0.9}
      style={[editStyles.frameCard, active && editStyles.frameCardActive]}
    >
      <Image
        source={src}
        style={editStyles.frameCardImg}
        resizeMode="contain"
      />
      <AppText
        variant="smallRegular"
        style={[
          editStyles.frameCardLabel,
          active && editStyles.frameCardLabelActive,
        ]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

export default function FrameToolPanel({ teamKey, frameKey, onSelectFrame }) {
  return (
    <View style={editStyles.frameOptionsRow}>
      {FRAME_OPTIONS.map((opt) => (
        <FrameOptionCard
          key={opt.id}
          id={opt.id}
          label={opt.label}
          teamKey={teamKey}
          frameKey={frameKey}
          onSelect={onSelectFrame}
        />
      ))}
    </View>
  );
}
