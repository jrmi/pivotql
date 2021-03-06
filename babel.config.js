module.exports = {
  env: {
    esmUnbundled: {
      ignore: ["**/*.spec.js"],
    },
    cjs: {
      presets: ["@babel/preset-env"],
      ignore: ["**/*.spec.js"],
    },
    test: {
      presets: ["@babel/preset-env"],
    },
  },
};
