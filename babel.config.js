module.exports = function (api) {
  api.cache(true);

  const alias = {
    "@app": "./src/app",
    "@features": "./src/features",
    "@shared": "./src/shared",
  };

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias,
          extensions: [".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};