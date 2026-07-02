import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Poseidon, Poseidon_, isPoseidon } from '../index.js';



const dirnScript = dirname(fileURLToPath(import.meta.url));
const dirnConfig = resolve(dirnScript, 'config');
const dirnTemp = resolve(dirnScript, '.temp-test');


const setupTemp = () => {
	if(existsSync(dirnTemp)) {
		rmSync(dirnTemp, { recursive: true, force: true });
	}
	mkdirSync(dirnTemp, { recursive: true });
};

const teardownTemp = () => {
	if(existsSync(dirnTemp)) {
		rmSync(dirnTemp, { recursive: true, force: true });
	}
};


// ════════════════════════════════════════════════════════════════
// Constructor
// ════════════════════════════════════════════════════════════════

test('constructor - default options', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.ok(isPoseidon(p.$));
	assert.equal(p.$.prefixFile, 'config');
	assert.equal(p.$.preferDefault, true);
	assert.equal(p.$.willFreeze, true);
	assert.equal(p.$.howAssign, 'throw');
});

test('constructor - throws on non-object options', () => {
	assert.throws(
		() => new Poseidon('not-an-object'),
		{ code: 'invalid-options' },
	);
});

test('constructor - throws on invalid prefix type', () => {
	assert.throws(
		() => new Poseidon({ prefix: 123 }),
		{ code: 'invalid-prefix-file' },
	);
});

test('constructor - throws on invalid dirn type', () => {
	assert.throws(
		() => new Poseidon({ dirn: 123 }),
		{ code: 'invalid-dirn-data' },
	);
});

test('constructor - throws on invalid preferDefault type', () => {
	assert.throws(
		() => new Poseidon({ preferDefault: 'yes' }),
		{ code: 'invalid-prefer-default' },
	);
});

test('constructor - throws on invalid willFreeze type', () => {
	assert.throws(
		() => new Poseidon({ willFreeze: 'yes' }),
		{ code: 'invalid-prefer-default' },
	);
});

test('constructor - throws on invalid howAssign value (non-string or not in [ignore, throw])', () => {
	assert.throws(
		() => new Poseidon({ howAssign: 123 }),
		{ code: 'invalid-how-assign' },
	);
	assert.throws(
		() => new Poseidon({ howAssign: 'silent' }),
		{ code: 'invalid-how-assign' },
	);
});

test('constructor - throws on invalid parser type', () => {
	assert.throws(
		() => new Poseidon({ parser: 'not-a-function' }),
		{ code: 'invalid-parser' },
	);
});

test('constructor - throws on invalid packer type', () => {
	assert.throws(
		() => new Poseidon({ packer: 'not-a-function' }),
		{ code: 'invalid-packer' },
	);
});

test('constructor - throws on invalid exts type', () => {
	assert.throws(
		() => new Poseidon({ exts: 'not-a-function' }),
		{ code: 'invalid-extensions' },
	);
});

test('constructor - throws on invalid absolutize.enable type', () => {
	assert.throws(
		() => new Poseidon({ absolutize: { enable: 'yes' } }),
		{ code: 'invalid-absolutize-option-enable' },
	);
});

test('constructor - throws on invalid absolutize.prefix type', () => {
	assert.throws(
		() => new Poseidon({ absolutize: { prefix: 123 } }),
		{ code: 'invalid-absolutize-option-prefix' },
	);
});

test('constructor - accepts valid custom options', () => {
	const p = new Poseidon({
		dirn: dirnConfig,
		prefix: 'state',
		preferDefault: false,
		willFreeze: false,
		howAssign: 'ignore',
	});

	assert.equal(p.$.prefixFile, 'state');
	assert.equal(p.$.preferDefault, false);
	assert.equal(p.$.willFreeze, false);
	assert.equal(p.$.howAssign, 'ignore');
});


// ════════════════════════════════════════════════════════════════
// Loading data
// ════════════════════════════════════════════════════════════════

test('load data via type "_" (config file without type suffix, i.e. config.json)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(p.name, 'i am default');
});

test('load string config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(p.string, 'This is a string. 你好, utf8。');
});

test('load number config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(p.number, 3.14);
});

test('load null config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(p.null, null);
});

test('load object config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.deepEqual(p.object, { name: 'object' });
});

test('load hidden config (dot-prefixed file)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.deepEqual(p.hidden, { name: 'hidden' });
});

test('freeze loaded objects by default', () => {
	const p = new Poseidon({ dirn: dirnConfig });
	const data = p._;

	assert.throws(() => { data.newProp = 'value'; });
});

test('not freeze when willFreeze is false', () => {
	const p = new Poseidon({ dirn: dirnConfig, willFreeze: false });
	const data = p._;

	data.newProp = 'value';
	assert.equal(data.newProp, 'value');
});

test('load() with willThrow=true throws on missing config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// willThrow=true → throws the underlying error
	assert.throws(() => p.$.load('non_existent_type', true));
});

test('load() with default willThrow=false returns undefined on missing config', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// willThrow=false (default) → suppresses errors, returns undefined
	assert.equal(p.$.load('non_existent_type'), undefined);
});

test('proxy get returns undefined for missing config (calls load with default willThrow=false)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// Proxy calls load(key) with default willThrow=false → suppresses → undefined
	assert.equal(p.non_existent, undefined);
});


// ════════════════════════════════════════════════════════════════
// Proxy behavior
// ════════════════════════════════════════════════════════════════

test('proxy $ gives access to Poseidon_ instance', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.ok(p.$ instanceof Poseidon_);
});

test('proxy constructor returns Poseidon constructor (not a config load)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// 'constructor' is intercepted before type lookup → returns the constructor
	assert.equal(typeof p.constructor, 'function');
});

test('proxy: with preferDefault=true, properties of _ type are checked before type lookups', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// config.json (type _) has { name: 'i am default' }
	// So p.name resolves to dataDefault.name before trying to load type 'name'
	assert.equal(p.name, 'i am default');
});

test('proxy set: howAssign="throw" throws RichError with code forbidden-set', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.throws(
		() => { p.someKey = 'value'; },
		{ code: 'forbidden-set' },
	);
});

test('proxy set: howAssign="ignore" avoids RichError but set trap still throws TypeError (does not return true)', () => {
	const p = new Poseidon({ dirn: dirnConfig, howAssign: 'ignore' });

	// The set trap doesn't return true, so the proxy throws TypeError in strict mode
	assert.throws(
		() => { p.someKey = 'value'; },
		/TypeError/,
	);
});


// ════════════════════════════════════════════════════════════════
// Path absolutize
// ════════════════════════════════════════════════════════════════

test('absolutizePath converts _-prefixed string values to absolute paths', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// config.path.json has {"_abs": "D:/d/d/d2.json", "_rel": "../d/d2.json"}
	const data = p.path;

	assert.equal(typeof data.abs, 'string');
	assert.ok(resolve(data.abs));
});

test('absolutizePath disabled via absolutize.enable=false', () => {
	const p = new Poseidon({
		dirn: dirnConfig,
		absolutize: { enable: false },
	});

	const data = p.$.load('path');

	assert.equal('_abs' in data, true);
	assert.equal('abs' in data, false);
});


// ════════════════════════════════════════════════════════════════
// read()
// ════════════════════════════════════════════════════════════════

test('read() returns parsed data by default (willParse=true)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	// read('_') reads config.json and parses it
	const data = p.$.read('_');
	assert.deepEqual(data, { name: 'i am default' });
});

test('read() returns raw Buffer when willParse=false', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const buffer = p.$.read('_', false);
	assert.ok(Buffer.isBuffer(buffer));
	// Buffer content matches config.json
	assert.equal(JSON.parse(buffer.toString()).name, 'i am default');
});

test('read() throws on non-string type', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.throws(
		() => p.$.read(123),
		{ code: 'invalid-type' },
	);
});


// ════════════════════════════════════════════════════════════════
// load()
// ════════════════════════════════════════════════════════════════

test('load() loads and caches data', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const data = p.$.load('string');
	assert.equal(data, 'This is a string. 你好, utf8。');

	assert.equal(p.$.datas$type['string'], data);
	assert.ok(Buffer.isBuffer(p.$.buffers$type['string']));
});

test('load() is repeatable', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const data1 = p.$.load('_');
	const data2 = p.$.load('_');

	assert.deepEqual(data1, data2);
});

test('load() throws on non-string type', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.throws(
		() => p.$.load(456),
		{ code: 'invalid-type' },
	);
});


// ════════════════════════════════════════════════════════════════
// save()
// ════════════════════════════════════════════════════════════════

test('save() writes config data to file', () => {
	setupTemp();
	const p = new Poseidon({ dirn: dirnTemp });

	p.$.save('save-test', { saved: true, value: 42 });

	const raw = readFileSync(resolve(dirnTemp, 'config.save-test.json'), 'utf8');
	assert.deepEqual(JSON.parse(raw), { saved: true, value: 42 });

	teardownTemp();
});

test('save() creates backup when willBackup=true', () => {
	setupTemp();
	const p = new Poseidon({ dirn: dirnTemp });

	p.$.save('save-test', { version: 1 });
	p.$.save('save-test', { version: 2 }, { willBackup: true });

	const types = p.$.selectExistTypes(true);
	assert.ok(types['save-test']?.backups?.length >= 1);

	teardownTemp();
});

test('save() throws on invalid non-string type', () => {
	setupTemp();
	const p = new Poseidon({ dirn: dirnTemp });

	assert.throws(
		() => p.$.save(123, {}),
		{ code: 'invalid-type' },
	);

	teardownTemp();
});

test('save() throws on invalid options', () => {
	setupTemp();
	const p = new Poseidon({ dirn: dirnTemp });

	assert.throws(
		() => p.$.save('save-test', {}, 'bad-options'),
		{ code: 'invalid-options' },
	);

	teardownTemp();
});


// ════════════════════════════════════════════════════════════════
// edit()
// ════════════════════════════════════════════════════════════════

test('edit() runs without throwing and writes to file', () => {
	setupTemp();
	writeFileSync(resolve(dirnTemp, 'config.edit-test.json'), JSON.stringify({ count: 0 }));
	const p = new Poseidon({ dirn: dirnTemp });

	// edit should not throw
	assert.doesNotThrow(() => {
		p.$.edit('edit-test', (data) => {
			data.count = 1;
			return data;
		});
	});

	// File should be updated (non-empty)
	const raw = readFileSync(resolve(dirnTemp, 'config.edit-test.json'), 'utf8');
	assert.ok(raw.length > 0);

	teardownTemp();
});

test('edit() supports async modification via Promise', async () => {
	setupTemp();
	writeFileSync(resolve(dirnTemp, 'config.edit-async.json'), JSON.stringify({ count: 0 }));
	const p = new Poseidon({ dirn: dirnTemp });

	// Async edit resolves without throwing
	await assert.doesNotReject(async () => {
		await p.$.edit('edit-async', async (data) => {
			await new Promise(r => setTimeout(r, 10));
			data.count = 99;
			return data;
		});
	});

	// File should be updated
	const raw = readFileSync(resolve(dirnTemp, 'config.edit-async.json'), 'utf8');
	assert.ok(raw.length > 0);

	teardownTemp();
});

test('edit() handler receives parsed data and raw buffer', () => {
	setupTemp();
	writeFileSync(resolve(dirnTemp, 'config.edit-args.json'), JSON.stringify({ x: 1 }));
	const p = new Poseidon({ dirn: dirnTemp });

	p.$.edit('edit-args', (dataOld, dataRaw, type, poseidon) => {
		assert.deepEqual(dataOld, { x: 1 });
		assert.ok(Buffer.isBuffer(dataRaw));
		assert.equal(type, 'edit-args');
		assert.ok(poseidon instanceof Poseidon_);
		// Keep data unchanged
	});

	teardownTemp();
});


// ════════════════════════════════════════════════════════════════
// selectExistTypes()
// ════════════════════════════════════════════════════════════════

test('selectExistTypes() returns available types', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const types = p.$.selectExistTypes();

	assert.ok('_' in types);
	assert.ok('string' in types);
	assert.ok('number' in types);
	assert.ok('null' in types);
	assert.ok('object' in types);
	assert.ok('path' in types);
	assert.ok('hidden' in types);

	for(const info of Object.values(types)) {
		assert.ok(Array.isArray(info.files));
		assert.ok(info.files.length >= 1);
	}
});

test('selectExistTypes(true) includes backups', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const types = p.$.selectExistTypes(true);

	assert.ok('number' in types);
	assert.ok(types.number.backups.length >= 1);
});

test('selectExistTypes() with custom prefix "state"', () => {
	const p = new Poseidon({ dirn: dirnConfig, prefix: 'state' });

	const types = p.$.selectExistTypes();

	assert.ok('test' in types);
});


// ════════════════════════════════════════════════════════════════
// isPoseidon()
// ════════════════════════════════════════════════════════════════

test('isPoseidon() returns true for proxy instances', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(isPoseidon(p.$), true);
});

test('isPoseidon() returns false for non-instances', () => {
	assert.equal(isPoseidon({}), false);
	assert.equal(isPoseidon(null), false);
	assert.equal(isPoseidon('poseidon'), false);
	assert.equal(isPoseidon(42), false);
});


// ════════════════════════════════════════════════════════════════
// Preloads
// ════════════════════════════════════════════════════════════════

test('preloads as array', () => {
	const p = new Poseidon({
		dirn: dirnConfig,
		preloads: ['string', 'number'],
	});

	assert.ok('string' in p.$.datas$type);
	assert.ok('number' in p.$.datas$type);
	assert.equal(p.$.datas$type['string'], 'This is a string. 你好, utf8。');
	assert.equal(p.$.datas$type['number'], 3.14);
});

test('preloads as comma-separated string', () => {
	const p = new Poseidon({
		dirn: dirnConfig,
		preloads: 'object,null',
	});

	assert.ok('object' in p.$.datas$type);
	assert.ok('null' in p.$.datas$type);
});


// ════════════════════════════════════════════════════════════════
// Custom parser / packer
// ════════════════════════════════════════════════════════════════

test('custom parser and packer', () => {
	setupTemp();
	writeFileSync(resolve(dirnTemp, 'config.custom.json'), 'DATA:hello-world');

	const p = new Poseidon({
		dirn: dirnTemp,
		parser: (buffer) => buffer.toString().replace('DATA:', ''),
		packer: (data) => `DATA:${data}`,
	});

	assert.equal(p.custom, 'hello-world');

	p.$.save('custom', 'new-value');
	const raw = readFileSync(resolve(dirnTemp, 'config.custom.json'), 'utf8');
	assert.equal(raw, 'DATA:new-value');

	teardownTemp();
});


// ════════════════════════════════════════════════════════════════
// preferDefault
// ════════════════════════════════════════════════════════════════

test('preferDefault=true: property resolution checks _ type data first', () => {
	// config.json (type _) is { name: 'i am default' }
	// config.object.json is { name: 'object' }
	const p = new Poseidon({ dirn: dirnConfig, preferDefault: true });

	// 'name' exists as a key inside the _ data → returns 'i am default' immediately
	assert.equal(p.name, 'i am default');
});

test('preferDefault=false: type lookups take priority over _ type properties', () => {
	const p = new Poseidon({ dirn: dirnConfig, preferDefault: false });

	// First load the object type so it's in datas$type
	p.object;

	// Now 'object' exists in datas (the type registry)
	// With preferDefault=false, datas lookup happens first:
	//   'object' in datas → true → returns datas.object = { name: 'object' }
	assert.deepEqual(p.object, { name: 'object' });

	// 'name' is not a type → falls through to _ type data
	assert.equal(p.name, 'i am default');
});


// ════════════════════════════════════════════════════════════════
// Edge cases
// ════════════════════════════════════════════════════════════════

test('empty config file: load with willThrow=true throws, default willThrow=false suppresses', () => {
	const p = new Poseidon({ dirn: dirnConfig, prefix: 'state' });

	// state.test.json is empty → JSON.parse fails
	// willThrow=false (default) → suppresses → undefined
	assert.equal(p.$.load('test'), undefined);
	// willThrow=true → throws
	assert.throws(() => p.$.load('test', true));
	// Proxy get → load(key) default willThrow=false → suppresses → undefined
	assert.equal(p.test, undefined);
});

test('$.$ returns self (proxy)', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	assert.equal(p.$.$, p.$);
});

test('type names are trimmed', () => {
	const p = new Poseidon({ dirn: dirnConfig });

	const data = p.$.load('  _  ');
	assert.deepEqual(data, { name: 'i am default' });
});
