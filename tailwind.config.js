/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",   // BETA가 src 구조라면
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1E90FF",  // BETA 메인 컬러
        secondary: "#FFD700",
      },
      borderRadius: {
        md: 8,
        lg: 16,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
      },
      // Noto Sans 폰트 패밀리      
      fontFamily: {
        "noto-regular": ["NotoSans-Regular"],
        "noto-medium": ["NotoSans-Medium"],
        "noto-semibold": ["NotoSans-SemiBold"],
        "noto-light": ["NotoSans-Light"],
      },

      // Typography 사이즈
      fontSize: {
        // Uncategorized
        heading: 18,
        "timer-num": 35,

        // Display
        "display-title": 24,
        "display-title2": 21,
        "display-title-light": 22,

        // Body
        "body-regular": 16,
        "body-medium": 16,

        // Text
        caption: 14,
        spaced: 13,
        "text-small-regular": 9,
        middle: 13,

        "text-semi-16": 16,
        "text-semi-18": 18,
        "text-semi-14": 14,
        "text-semi-13": 13,

        // Label
        "label-small": 12,

        // Number
        "num-small-regular": 8,
        "num-medium-regular": 10,
      },
    },
  },
  plugins: [],
};
