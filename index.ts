import forEach from 'lodash/forEach';

namespace ViteManifestParser {
	export type Manifest = Record<string, ManifestChunk>;
	export type ManifestChunk = {
		assets?: string[];
		css?: string[];
		dynamicImports?: string[];
		file: string;
		imports?: string[];
		isDynamicEntry?: boolean;
		isEntry?: boolean;
		name?: string;
		src?: string;
	};
	
	export type Tags = {
		links: string[];
		preloads: string[];
		scripts: string[];
	};
}

const parse = (input: ViteManifestParser.Manifest): ViteManifestParser.Tags => {
	let links = new Set<string>();
	let preloads = new Set<string>();
	let scripts = new Set<string>();

	forEach(input, chunk => {
		// handle JavaScript entries
		if (chunk.isEntry || chunk.isDynamicEntry) {
			scripts.add(chunk.file);
		}

		// handle CSS files associated with the chunk
		if (chunk.css) {
			forEach(chunk.css, file => {
				links.add(file);
			});
		}

		// handle imports
		if (chunk.imports) {
			forEach(chunk.imports, key => {
				const chunk = input[key];

				if (chunk) {
					preloads.add(chunk.file);
					scripts.add(chunk.file);
				}
			});
		}

		// handle dynamic imports
		if (chunk.dynamicImports) {
			chunk.dynamicImports.forEach(key => {
				const chunk = input[key];

				if (chunk) {
					preloads.add(chunk.file);
					scripts.add(chunk.file);
				}
			});
		}
	});

	return {
		links: Array.from(links),
		preloads: Array.from(preloads),
		scripts: Array.from(scripts)
	};
};

export { ViteManifestParser };
export default parse;
