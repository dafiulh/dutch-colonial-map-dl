/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    ["@snowpack/plugin-build-script", {
      cmd: "postcss",
      input: [".css"],
      output: [".css"]
    }],
    // plugin to optimize assets
    ["@snowpack/plugin-optimize"]
  ],
  devOptions: {
    port: 4000,
    open: "none"
  },
  buildOptions: {
    // remove previous build folder before build
    clean: true
  }
};