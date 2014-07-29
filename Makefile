TS_FILES=src/*.ts

ts:
	tsc ${TS_FILES} --outDir gen/ -m commonjs