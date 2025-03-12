import { describe, expect, it } from 'vitest';
import parse from './index';


describe('/index', () => {
	describe('parse function', () => {
		it('should handle multiple entry points', () => {
			const manifest = {
				'app/main.tsx': {
					file: 'assets/main-abc123.js',
					isEntry: true,
					css: ['assets/main-styles-def456.css'],
					src: 'app/main.tsx'
				},
				'app/admin.tsx': {
					file: 'assets/admin-ghi789.js',
					isEntry: true,
					css: ['assets/admin-styles-jkl012.css'],
					src: 'app/admin.tsx'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: ['assets/main-styles-def456.css', 'assets/admin-styles-jkl012.css'],
				preloads: [],
				scripts: ['assets/main-abc123.js', 'assets/admin-ghi789.js']
			});
		});

		it('should handle chunks with multiple CSS files', () => {
			const manifest = {
				'app/styles.tsx': {
					file: 'assets/styles-mno345.js',
					isEntry: true,
					css: ['assets/base-pqr678.css', 'assets/components-stu901.css', 'assets/utilities-vwx234.css'],
					src: 'app/styles.tsx'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: ['assets/base-pqr678.css', 'assets/components-stu901.css', 'assets/utilities-vwx234.css'],
				preloads: [],
				scripts: ['assets/styles-mno345.js']
			});
		});

		it('should handle complex import chains', () => {
			const manifest = {
				'app/entry.tsx': {
					file: 'assets/entry-abc123.js',
					isEntry: true,
					imports: ['app/utils.ts', 'app/components.tsx'],
					src: 'app/entry.tsx'
				},
				'app/utils.ts': {
					file: 'assets/utils-def456.js',
					imports: ['app/helpers.ts'],
					src: 'app/utils.ts'
				},
				'app/helpers.ts': {
					file: 'assets/helpers-ghi789.js',
					src: 'app/helpers.ts'
				},
				'app/components.tsx': {
					file: 'assets/components-jkl012.js',
					css: ['assets/components-mno345.css'],
					src: 'app/components.tsx'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: ['assets/components-mno345.css'],
				preloads: ['assets/utils-def456.js', 'assets/components-jkl012.js', 'assets/helpers-ghi789.js'],
				scripts: ['assets/entry-abc123.js', 'assets/utils-def456.js', 'assets/components-jkl012.js', 'assets/helpers-ghi789.js']
			});
		});

		it('should handle dynamic imports correctly', () => {
			const manifest = {
				'app/main.tsx': {
					file: 'assets/main-abc123.js',
					isEntry: true,
					dynamicImports: ['app/lazy1.tsx', 'app/lazy2.tsx'],
					src: 'app/main.tsx'
				},
				'app/lazy1.tsx': {
					file: 'assets/lazy1-def456.js',
					isDynamicEntry: true,
					css: ['assets/lazy1-ghi789.css'],
					src: 'app/lazy1.tsx'
				},
				'app/lazy2.tsx': {
					file: 'assets/lazy2-jkl012.js',
					isDynamicEntry: true,
					css: ['assets/lazy2-mno345.css'],
					imports: ['app/shared.ts'],
					src: 'app/lazy2.tsx'
				},
				'app/shared.ts': {
					file: 'assets/shared-pqr678.js',
					src: 'app/shared.ts'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: ['assets/lazy1-ghi789.css', 'assets/lazy2-mno345.css'],
				preloads: ['assets/lazy1-def456.js', 'assets/lazy2-jkl012.js', 'assets/shared-pqr678.js'],
				scripts: ['assets/main-abc123.js', 'assets/lazy1-def456.js', 'assets/lazy2-jkl012.js', 'assets/shared-pqr678.js']
			});
		});

		it('should handle missing optional properties', () => {
			const manifest = {
				'app/minimal.js': {
					file: 'assets/minimal-abc123.js',
					isEntry: true,
					src: 'app/minimal.js'
				},
				'app/noentry.js': {
					file: 'assets/noentry-def456.js',
					src: 'app/noentry.js'
				},
				'app/onlycss.js': {
					file: 'assets/onlycss-ghi789.js',
					css: ['assets/styles-jkl012.css'],
					src: 'app/onlycss.js'
				},
				'app/onlyassets.js': {
					file: 'assets/onlyassets-mno345.js',
					assets: ['assets/image-pqr678.png'],
					src: 'app/onlyassets.js'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: ['assets/styles-jkl012.css'],
				preloads: [],
				scripts: ['assets/minimal-abc123.js']
			});
		});

		it('should handle chunks with circular dependencies', () => {
			const manifest = {
				'app/circular1.js': {
					file: 'assets/circular1-abc123.js',
					isEntry: true,
					imports: ['app/circular2.js'],
					src: 'app/circular1.js'
				},
				'app/circular2.js': {
					file: 'assets/circular2-def456.js',
					imports: ['app/circular1.js'],
					src: 'app/circular2.js'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: [],
				preloads: ['assets/circular2-def456.js', 'assets/circular1-abc123.js'],
				scripts: ['assets/circular1-abc123.js', 'assets/circular2-def456.js']
			});
		});

		it('should handle missing chunk references', () => {
			const manifest = {
				'app/broken.js': {
					file: 'assets/broken-abc123.js',
					isEntry: true,
					imports: ['app/missing.js'],
					dynamicImports: ['app/alsomissing.js'],
					src: 'app/broken.js'
				}
			};

			const res = parse(manifest);
			expect(res).toEqual({
				links: [],
				preloads: [],
				scripts: ['assets/broken-abc123.js']
			});
		});
	});
});
