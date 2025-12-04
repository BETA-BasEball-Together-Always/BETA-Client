// app.config.js
import "dotenv/config";

export default ({config}) => ({
  ...config,
  extra: {
    ...config.extra,
    backendUrl: process.env.BACKEND_URL,
    naverClientId: process.env.NAVER_CLIENT_ID,
    naverClientSecret: process.env.NAVER_CLIENT_SECRET,
    naverAppName: process.env.NAVER_APP_NAME,
    naverIosUrlScheme: process.env.NAVER_IOS_URL_SCHEME,
  },
  plugins: [
    ...(config.plugins || []),
    [
      "@react-native-seoul/naver-login",
      {
        urlScheme: process.env.NAVER_IOS_URL_SCHEME,
      },
    ],
  ],
});
