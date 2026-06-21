import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export function generateMusicNamesPlugin(): Plugin {
  const generate = () => {
    const musicDir = resolve(__dirname, '../static/music')
    const outDir = resolve(__dirname, '../src/.generated')
    const files = readdirSync(musicDir).filter((f) => f.endsWith('.mp3'))

    const entries = files
      .map((f) => `  ${JSON.stringify(f.replace(/\.mp3$/, ''))}: ${JSON.stringify('/music/' + f)}`)
      .join(',\n')

    const content = `export const musicNames = {\n${entries}\n} as const;\n`

    mkdirSync(outDir, { recursive: true })
    writeFileSync(resolve(outDir, 'music-names.ts'), content)
  }

  return {
    name: 'generate-music-names',
    buildStart() {
      generate()
    },
    configureServer(server) {
      server.watcher.add(resolve(__dirname, '../static/music'))
      server.watcher.on('all', (event, path) => {
        if (path.replace(/\\/g, '/').includes('/static/music/') && path.endsWith('.mp3')) {
          generate()
        }
      })
    },
  }
}
