install: 
		npm ci
publish:
		npm publish --dry-run
lint:
	npx eslint .
webpack:
	npx webpack serve