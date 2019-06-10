import config from './umd-base-profile.js';
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";

// use umd.min.js
config.output.file = config.output.file.replace(".umd.", ".umd.min.");

config.plugins.push(filesize())
config.plugins.push(terser({
  output: { comments: /@preserve/ }
}))

export default config;