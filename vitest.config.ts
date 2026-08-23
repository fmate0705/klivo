import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // Ugyanaz a "@/*" alias, mint a tsconfig.json-ban, hogy a tesztek pontosan
    // úgy importáljanak, ahogy az alkalmazás.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    // Node környezet: a jsdom saját realm-jének TextEncodere olyan Uint8Array-t
    // ad vissza, amely a jose-ban megbukik az `instanceof Uint8Array` ellenőrzésen
    // — ez cross-realm műtermék, a produkcióban (Node és Edge runtime) nem létezik.
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
