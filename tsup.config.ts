import { defineConfig } from 'tsup';

export default defineConfig({
	clean: true,
	bundle: false,
	dts: false,
	entry: ['src/**/*.ts', '!src/**/*.d.ts'],
	format: ['esm'],
	minify: false,
	tsconfig: 'tsconfig.json',
	target: 'es2020',
	splitting: false,
	skipNodeModulesBundle: true,
	shims: false,
	keepNames: true
});
