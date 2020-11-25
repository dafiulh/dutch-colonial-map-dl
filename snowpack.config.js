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
    ["@snowpack/plugin-optimize"]
  ],
  devOptions: {
    port: 4000,
    open: "none"
  },
  buildOptions: {
    clean: true
  }
};