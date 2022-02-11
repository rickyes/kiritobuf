TESTS     = $(shell find test -type f -name "*.test.js")
BIN_AVA   = ./node_modules/.bin/ava

install:
	@npm i --registry https://registry.npmmirror.com
	
test:
	@NODE_ENV=test $(BIN_AVA) --verbose $(TESTS);

.PHONY: install test
