import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'dist', 'licenses')

const packages = [
  { name: 'nunito', out: 'nunito-LICENSE.txt' },
  { name: 'roboto-mono', out: 'roboto-mono-LICENSE.txt' },
]

mkdirSync(outDir, { recursive: true })

for (const pkg of packages) {
  const src = join(root, 'node_modules', '@fontsource', pkg.name, 'LICENSE')
  if (!existsSync(src)) {
    throw new Error(`Missing license file: ${src}`)
  }
  const text = readFileSync(src, 'utf8')
  if (!text.includes('SIL Open Font License')) {
    throw new Error(`Expected OFL text in ${src}`)
  }
  copyFileSync(src, join(outDir, pkg.out))
  console.log(`dist/licenses/${pkg.out} <- @fontsource/${pkg.name}`)
}
