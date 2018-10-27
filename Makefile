RUNTIME_FILES := $(wildcard source/runtime/*.js)

.PHONY: all
all: build/fohm-runtime.js

build/fohm-runtime.js: $(RUNTIME_FILES)
	mkdir -p $(dir $@)
	./node_modules/.bin/browserify -s Fohm source/runtime/index.js > $@

.PHONY: clean
clean:
	rm -r build