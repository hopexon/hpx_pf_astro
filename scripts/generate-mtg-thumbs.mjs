// Pre-generates lightweight AVIF thumbnails for MTG grid views (TOP / Sets>TOP).
// Source: public/collections/mtg/{art_*,card_*}.avif -> public/collections/mtg/thumbs/<same filename>
import { mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const dataModule = await import(path.join(root, 'src/pages/collections/mtg/data.ts'))
const { mtgCards } = dataModule

const SRC_DIR = path.join(root, 'public/collections/mtg')
const OUT_DIR = path.join(SRC_DIR, 'thumbs')
const THUMB_WIDTH = 480
const AVIF_QUALITY = 60

const usedFiles = new Set(
  mtgCards
    .map(card => card.imgFull || card.imgCard)
    .filter((file) => typeof file === 'string' && file.length > 0)
)

await mkdir(OUT_DIR, { recursive: true })

let processed = 0
let skipped = 0

for (const file of usedFiles) {
  const srcPath = path.join(SRC_DIR, file)
  const outPath = path.join(OUT_DIR, file)

  if (!existsSync(srcPath)) {
    console.warn(`[skip] source not found: ${file}`)
    skipped++
    continue
  }

  await sharp(srcPath)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .avif({ quality: AVIF_QUALITY })
    .toFile(outPath)

  processed++
}

console.log(`Generated ${processed} thumbnails into ${path.relative(root, OUT_DIR)} (${skipped} skipped)`)
