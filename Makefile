.PHONY: all
all: link templates

.PHONY: html
html: README.html

.PHONY: link
link:
	@yarn install
	@npm link court_api

.PHONY: clean
clean:
	rm -rf node_modules

.PHONY: templates
templates:
	./node_modules/.bin/handlebars -f templates.js ./templates/ -c handlebars/runtime

README.html: README.md
	cmark --to html $< > $@
