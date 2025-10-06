import pngToIco from 'png-to-ico';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = 'public/icons-src';
const OUT = 'public/favicon.ico';

const files = [
  'favicon-16.png',
  'favicon-32.png',
  'favicon-48.png',
  'favicon-256.png',
].map(name => resolve(SRC, name));

const buf = await pngToIco(files);
writeFileSync(resolve(OUT), buf);
console.log('Done', OUT);
