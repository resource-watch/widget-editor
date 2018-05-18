import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const config = {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  external: ['prop-types', 'react', 'react-dom', 'react-redux', 'redux-thunk', 'vega'],
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
        'react-dnd/lib/index.js': ['DragDropContext', 'DropTarget', 'DragSource'],
        'wri-api-components': ['Legend', 'LegendItemTypes', 'Icons']
      }
    }),
    filesize()
  ]
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(uglify());
}

export default config;
