module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: ["last 2 versions"]
        },
        useBuiltIns: "usage",
        corejs: "2"
      }
    ]
  ],
  plugins: ["@babel/plugin-proposal-object-rest-spread", "ramda"]
};
