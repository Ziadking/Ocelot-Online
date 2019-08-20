import { terser } from "rollup-plugin-terser";

module.exports = {
  input: 'src/js/ocelot.js',
  output: {
    file: 'static/js/ocelot.js',
    format: 'iife'
  },
  plugins: [ terser() ]
};
