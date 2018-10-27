fohm := ../../source/bin/fohm.js
webpack := ../../node_modules/.bin/webpack

FSHARP_SOURCE := src/Grammar.fs src/Program.fs src/Syntax.fs src/Lisp.fsproj src/paket.references

.PHONY: all
all: build-to-js

.PHONY: clean
clean:
	rm -r build dist


src/Grammar.fs: grammar/lisp.ohm
	node $(fohm) compile $< > $@

.PHONY: install-packages
install-packages: paket.dependencies NuGet.Config paket.lock
	mono .paket/paket.exe install

.PHONY: restore-src-packages
restore-src-packages: install-packages src/paket.references
	cd src && dotnet restore

.PHONY: build-fsharp
build-fsharp: $(FSHARP_SOURCE)
	cd src && dotnet fable npm-build

.PHONY: build-to-js
build-to-js: build-fsharp
	cp ../../build/fohm-runtime.js build
	$(webpack)


# Force-rebuilding
rebuild-grammar:
	touch grammar/lisp.ohm
	$(MAKE) src/Grammar.fs
