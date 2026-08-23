#!/usr/bin/env node
/**
 * Kivágás egy teljes oldalas képernyőképből.
 *
 *   node scripts/crop.mjs <kép> <név>:<felső>:<magasság> [...]
 *
 * A `shots.mjs` teljes oldalas képe több ezer képpont magas; egy szekció
 * megnézéséhez ebből kell kivágni a sávot.
 */
import sharp from 'sharp';
const [file, ...rest] = process.argv.slice(2);
const out = 'C:/Users/mate/AppData/Local/Temp/klivo-shots';
for (const spec of rest) {
  const [name, top, height] = spec.split(':');
  const img = sharp(file);
  const meta = await img.metadata();
  await img
    .extract({
      left: 0,
      top: Number(top),
      width: meta.width,
      height: Math.min(Number(height), meta.height - Number(top)),
    })
    .toFile(`${out}/crop-${name}.png`);
  console.log(`${out}/crop-${name}.png`);
}
