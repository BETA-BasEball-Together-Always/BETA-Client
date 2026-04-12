/**
 * 팀 로고 SVG — react-native-svg는 `<filter>`/FE 프리미티브를 제대로 지원하지 않아 iOS 등에서 SIGABRT 유발 가능.
 * 재최적화: `npx --yes svgo@3.3.2 --config svgo.teams.config.mjs --recursive src/shared/assets/svg/teams`
 */
export default {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
    {
      name: "removeAttrs",
      params: {
        attrs: ["*:filter", "*:color-interpolation-filters"],
      },
    },
  ],
};
