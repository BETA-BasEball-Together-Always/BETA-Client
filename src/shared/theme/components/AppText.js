// src/components/common/AppText.js
import React from "react";
import { Text } from "react-native";
import { cn } from "../../../utils/cn";

// variant → nativewind 클래스 매핑
const variantClassNameMap = {
  // Uncategorized
  heading: "font-noto-semibold text-heading",
  timerNum: "font-noto-regular text-timer-num",

  // Display
  displayTitle: "font-noto-semibold text-display-title",
  displayTitle2: "font-noto-semibold text-display-title2",
  displayTitleLight: "font-noto-light text-display-title-light",

  // Body
  bodyRegular: "font-noto-regular text-body-regular",
  bodyMedium: "font-noto-medium text-body-medium",

  // Text
  caption: "font-noto-regular text-caption",
  spaced: "font-noto-regular text-spaced",
  smallRegular: "font-noto-regular text-text-small-regular",
  middle: "font-noto-regular text-middle",

  semi16: "font-noto-semibold text-text-semi-16",
  semi18: "font-noto-semibold text-text-semi-18",
  semi14: "font-noto-semibold text-text-semi-14",
  semi13: "font-noto-semibold text-text-semi-13",

  // Label
  labelSmall: "font-noto-medium text-label-small",

  // Number
  numSmallRegular: "font-noto-regular text-num-small-regular",
  numMediumRegular: "font-noto-regular text-num-medium-regular",
};

export function AppText({ variant = "bodyRegular", className, children, ...rest }) {
  const baseClass = variantClassNameMap[variant] || "";

  return (
    <Text
      {...rest}
      className={cn(baseClass, className)}
    >
      {children}
    </Text>
  );
}
