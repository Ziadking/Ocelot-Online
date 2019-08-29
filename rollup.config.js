import { terser } from "rollup-plugin-terser";
import { string } from "rollup-plugin-string";

module.exports = {
  input: 'src/js/ocelot.js',
  output: {
    file: 'static/js/ocelot.js',
    format: 'iife'
  },
  plugins: [
    terser(),
    string({ include: ["**/*.glslv", "**/*.glslf"] })
  ]
};
