// app.config.js
import { withDangerousMod, withEntitlementsPlist } from "@expo/config-plugins";
import "dotenv/config";
import fs from "fs";
import path from "path";

const IOS_BUNDLE_IDENTIFIER_FALLBACK = "com.beta.baseballapp";

const getResolvedIosBundleIdentifier = (config) =>
  process.env.IOS_BUNDLE_IDENTIFIER ||
  config.ios?.bundleIdentifier ||
  IOS_BUNDLE_IDENTIFIER_FALLBACK;

const resolveIosGoogleServicesFile = (bundleIdentifier) => {
  if (bundleIdentifier === "com.beta.ohs") {
    return "./fcm-ios-com-beta-ohs.plist";
  }

  return "./fcm-ios-com-beta-baseballapp.plist";
};

const withoutExpoAppleAuthenticationPlugin = (plugins = []) =>
  plugins.filter((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] !== "expo-apple-authentication";
    }

    return plugin !== "expo-apple-authentication";
  });

const withLocalOhsEntitlementsFix = (config, { isLocalOhsBuild }) =>
  withEntitlementsPlist(config, (modConfig) => {
    if (isLocalOhsBuild) {
      delete modConfig.modResults["com.apple.developer.applesignin"];
    }

    return modConfig;
  });

const withRnFirebaseIosNativeFixes = (config) =>
  withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const iosRoot = modConfig.modRequest.platformProjectRoot;
      const podfilePath = path.join(iosRoot, "Podfile");

      let podfileContents = fs.readFileSync(podfilePath, "utf8");

      if (!podfileContents.includes("$RNFirebaseAsStaticFramework = true")) {
        podfileContents = podfileContents.replace(
          "prepare_react_native_project!\n\n",
          "prepare_react_native_project!\n\n$RNFirebaseAsStaticFramework = true\n\n",
        );
      }

      if (
        !podfileContents.includes(
          "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES",
        )
      ) {
        podfileContents = podfileContents.replace(
          `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
  end
end
`,
          `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )

    installer.pods_project.targets.each do |target|
      next unless target.name.start_with?('RNFB')

      target.build_configurations.each do |build_configuration|
        build_configuration.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
  end
end
`,
        );
      }

      fs.writeFileSync(podfilePath, podfileContents);
      return modConfig;
    },
  ]);

export default ({ config }) => {
  const resolvedIosBundleIdentifier = getResolvedIosBundleIdentifier(config);
  const isLocalOhsBuild = resolvedIosBundleIdentifier === "com.beta.ohs";
  const basePlugins = isLocalOhsBuild
    ? withoutExpoAppleAuthenticationPlugin(config.plugins || [])
    : config.plugins || [];

  const baseConfig = withLocalOhsEntitlementsFix({
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: resolvedIosBundleIdentifier,
      usesAppleSignIn: !isLocalOhsBuild,
      googleServicesFile: resolveIosGoogleServicesFile(
        resolvedIosBundleIdentifier,
      ),
    },
    android: {
      ...config.android,
      googleServicesFile: "./fcm-android-com-beta-baseballapp.json",
    },
    extra: {
      ...config.extra,
      backendUrl:
        process.env.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL,
      naverClientId: process.env.NAVER_CLIENT_ID,
      naverClientSecret: process.env.NAVER_CLIENT_SECRET,
      naverAppName: process.env.NAVER_APP_NAME,
      naverIosUrlScheme: process.env.NAVER_IOS_URL_SCHEME,
    },
    plugins: [
      ...basePlugins,
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      "expo-secure-store",
      [
        "@react-native-seoul/naver-login",
        {
          urlScheme: process.env.NAVER_IOS_URL_SCHEME,
        },
      ],
    ],
  }, { isLocalOhsBuild });

  return withRnFirebaseIosNativeFixes(baseConfig);
};
