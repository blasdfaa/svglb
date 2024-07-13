#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import pkg from '../package.json' assert { type: 'json' }

const main = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  },
  subCommands: {
    init: () => import('./commands/init').then(r => r.default),
    import: () => import('./commands/import').then(r => r.default),
    sync: () => import('./commands/sync').then(r => r.default),
  },
})

runMain(main)
