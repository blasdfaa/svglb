import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  externals: ['react'],
  rollup: {
    emitCJS: true,
  },
})
