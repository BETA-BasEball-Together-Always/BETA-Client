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
      // 폰트 쓰면 여기에 등록 (예: NotoSansKR)
      fontFamily: {
        sans: ["NotoSansKR", "System"],
      },
    },
  },
  plugins: [],
};
