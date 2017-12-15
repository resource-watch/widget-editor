import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

export default {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  external: ['leaflet', 'prop-types', 'react', 'react-dom', 'react-redux', 'redux-thunk', 'vega'],
  plugins: [
    babel({
      runtimeHelpers: true,
      exclude: ['node_modules/**', 'src/css/**/*', 'src/images/**/*']
    }),
    json(),
    resolve({
      preferBuiltins: true
    }),
    commonjs({
      namedExports: {
        'react-dnd/lib/index.js': ['DragDropContext', 'DropTarget', 'DragSource']
      }
    }),
    uglify(),
    filesize()
  ]
};
