import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import css from "rollup-plugin-css-only"
import sveltePreprocess from 'svelte-preprocess';
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name },
		{ file: pkg.main.replace('.js','.min.js'), format: 'iife', name, plugins: [terser()]}
	],
	plugins: [
		resolve({
			extensions: ['.js', '.ts', '.svelte']
		}),
		css(),
		svelte({
			preprocess: sveltePreprocess()
		}),
		typescript()
		
	]
};
