import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const srcDir = join(rootDir, 'src');
export const supportUrl = 'https://discord.gg/mKQzH89vP2';
export const tosUrl = 'https://github.com/vitoUwu/UnoSlash/wiki/Terms-of-Service';
export const ppUrl = 'https://github.com/vitoUwu/UnoSlash/wiki/Privacity-Policy';

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];
