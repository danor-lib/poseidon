import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

import EscapeStringRegexp from 'escape-string-regexp';

import { RichError } from '@danor-lib/error';

/** @import { PoseidonOption, AbsolutizePathOption, SaveOption, EditHandle } from '../types.ts' */



/**
 * Check whether a value is a non-null object
 * @param {any} value
 * @returns {boolean}
 */
const isObject = (value) => value != null && typeof value == 'object';


/**
 * Deep freeze an object recursively
 * @param {object} object
 * @returns {object} The frozen object
 */
const deepFreeze = object => {
	Object.getOwnPropertyNames(object)
		.forEach(name => {
			const prop = object[name];

			if(isObject(prop)) {
				deepFreeze(prop);
			}
		});

	return Object.freeze(object);
};



/** @template DataType */
export class Poseidon {
	/**
	 * Instance reference
	 * @type {Poseidon<DataType>}
	 */
	$ = this;


	/**
	 * The prefix of config/data file
	 * @type {string}
	 */
	prefixFile = 'config';

	/**
	 * Directory of configs/datas
	 * @type {string}
	 */
	dirnData = process.cwd();


	/**
	 * Whether to prefer default config/data when getting
	 * @type {boolean}
	 */
	preferDefault = true;

	/**
	 * Whether to freeze config/data
	 * @type {boolean}
	 */
	willFreeze = true;


	/** @type {AbsolutizePathOption} */
	optionsPathAbsolutize = {
		/** Whether to convert relative paths to absolute paths */
		enable: true,

		/** The prefix of keys to absolutize */
		prefix: '_',

		/** Whether to overwrite config/data */
		overwrite: true,

		/** The path between the config/data directory and the resolved absolute path */
		path: '',
	};


	/**
	 * Behavior when setting
	 * @type {'throw' | 'ignore'}
	 */
	howAssign = 'throw';



	/**
	 * Raw loaded config/data
	 * @type {Record<string, Buffer>}
	 */
	buffers$type = {};

	/**
	 * Loaded config/data
	 * @type {Record<string, DataType>}
	 */
	datas$type = {};



	/** @type {Poseidon<DataType>} */
	proxy;


	/**
	 * Mapping of config/data file extensions
	 * @type {Record<string, string>}
	 */
	extensions$type = {};

	/** @type {Record<string, { hidden: string, ext: string }>} */
	infos$type = {};


	/** @type {(buffer: Buffer, poseidon: Poseidon<DataType>) => DataType} */
	parser = (buffer) => JSON.parse(buffer.toString());
	/** @type {(data: DataType, poseidon: Poseidon<DataType>) => string | ArrayBufferView} */
	packer = (data) => JSON.stringify(data, null, '\t');

	/** @type {string[]} */
	extensions = ['.json'];


	/**
	 * Create a Poseidon instance
	 * @param {PoseidonOption<DataType>} [options]
	 */
	constructor(options) {
		if(options != null) {
			if(!isObject(options)) {
				throw new RichError({
					code: 'invalid-options', at: 'poseidon/Poseidon#constructor(options)',
					data: { options },
				});
			}
		}
		else { options = {}; }



		const prefixFile = options.prefix;
		if(prefixFile != null) {
			if(typeof prefixFile != 'string') {
				throw new RichError({
					code: 'invalid-prefix-file', at: 'poseidon/Poseidon#constructor(options.prefix)',
					data: { prefix: prefixFile },
				});
			}


			this.prefixFile = prefixFile.trim();
		}



		const dirnData = options.dirn;
		if(dirnData != null) {
			if(typeof dirnData != 'string') {
				throw new RichError({
					code: 'invalid-dirn-data', at: 'poseidon/Poseidon#constructor(options.dirn)',
					data: { dirn: dirnData },
				});
			}


			this.dirnData = dirnData.trim();
		}



		let typesPreload = options.preloads;
		if(typesPreload != null) {
			const typeOption = typeof typesPreload;

			if(typeOption != 'string' && !Array.isArray(typesPreload)) {
				throw new RichError({
					code: 'invalid-preload', at: 'poseidon/Poseidon#constructor(options.preload)',
					data: { types: typesPreload },
				});
			}


			if(typeOption == 'string') {
				typesPreload = typesPreload.trim().split(',');
			}
		}
		else { typesPreload = []; }

		typesPreload = typesPreload.map((type, index) => {
			const typeType = typeof type;

			if(typeType == 'string') { return type.trim(); }

			if(typeType == 'number' && !Number.isNaN(typeType)) { return String(type); }

			if(type == null) { return null; }


			throw new RichError({
				code: 'invalid-preload-type', at: 'poseidon/Poseidon#constructor(options.preload)',
				data: { type, types: typesPreload, index }
			});
		}).filter(Boolean);



		const parser = options.parser;
		if(parser != null) {
			if(typeof parser != 'function') {
				throw new RichError({
					code: 'invalid-parser', at: 'poseidon/Poseidon#constructor(options.parser)',
					data: { parser },
				});
			}


			this.parser = parser;
		}



		const packer = options.packer;
		if(packer != null) {
			if(typeof packer != 'function') {
				throw new RichError({
					code: 'invalid-packer', at: 'poseidon/Poseidon#constructor(options.packer)',
					data: { packer },
				});
			}


			this.packer = packer;
		}



		const extensions = options.exts;
		if(extensions != null) {
			if(typeof extensions != 'function') {
				throw new RichError({
					code: 'invalid-extensions', at: 'poseidon/Poseidon#constructor(options.exts)',
					data: { extensions },
				});
			}


			this.extensions = extensions;
		}



		const preferDefault = options.preferDefault;
		if(preferDefault != null) {
			if(typeof preferDefault != 'boolean') {
				throw new RichError({
					code: 'invalid-prefer-default', at: 'poseidon/Poseidon#constructor(options.preferDefault)',
					data: { preferDefault },
				});
			}


			this.preferDefault = preferDefault;
		}



		const willFreeze = options.willFreeze;
		if(willFreeze != null) {
			if(typeof willFreeze != 'boolean') {
				throw new RichError({
					code: 'invalid-will-freeze', at: 'poseidon/Poseidon#constructor(options.willFreeze)',
					data: { willFreeze },
				});
			}


			this.willFreeze = willFreeze;
		}


		const absolutize = options.absolutize;
		if(absolutize != null) {
			if(!isObject(absolutize)) {
				throw new RichError({
					code: 'invalid-absolutize-option', at: 'poseidon/Poseidon#constructor(options.absolutize)',
					data: { absolutize },
				});
			}

			const enable = absolutize.enable;
			if(enable != null) {
				if(typeof enable != 'boolean') {
					throw new RichError({
						code: 'invalid-absolutize-option-enable', at: 'poseidon/Poseidon#constructor(options.absolutize.enable)',
						data: { enable },
					});
				}


				this.optionsPathAbsolutize.enable = enable;
			}

			const prefix = absolutize.prefix;
			if(prefix != null) {
				if(typeof prefix != 'string') {
					throw new RichError({
						code: 'invalid-absolutize-option-prefix', at: 'poseidon/Poseidon#constructor(options.absolutize.prefix)',
						data: { prefix },
					});
				}


				this.optionsPathAbsolutize.prefix = prefix.trim();
			}

			const overwrite = absolutize.overwrite;
			if(overwrite != null) {
				if(typeof overwrite != 'boolean') {
					throw new RichError({
						code: 'invalid-absolutize-option-overwrite', at: 'poseidon/Poseidon#constructor(options.absolutize.overwrite)',
						data: { overwrite },
					});
				}


				this.optionsPathAbsolutize.overwrite = overwrite;
			}


			const path = absolutize.path;
			if(path != null) {
				if(typeof path != 'string') {
					throw new RichError({
						code: 'invalid-absolutize-option-path', at: 'poseidon/Poseidon#constructor(options.absolutize.path)',
						data: { path },
					});
				}


				this.optionsPathAbsolutize.path = path.trim();
			}
		}



		const howAssign = options.howAssign;
		if(howAssign != null) {
			if(typeof howAssign != 'string' || !['ignore', 'throw'].includes(howAssign)) {
				throw new RichError({
					code: 'invalid-how-assign', at: 'poseidon/Poseidon#constructor(options.howAssign)',
					data: { howAssign },
				});
			}


			this.howAssign = howAssign;
		}



		this.proxy = new Proxy(this,
			{
				get(self, key) {
					if(key == '$') { return self; }
					if(key == 'constructor') { return self.constructor; }


					const datas = self.datas$type;
					const dataDefault = '_' in datas ? datas._ : self.load('_');
					if(self.preferDefault) {
						if(isObject(dataDefault) && key in dataDefault) { return dataDefault[key]; }

						if(key in datas) { return datas[key]; }
					}
					else {
						if(key in datas) { return datas[key]; }

						if(isObject(dataDefault) && key in dataDefault) { return dataDefault[key]; }
					}

					return self.load(key);
				},
				set(self, key, value) {
					if(self.howAssign == 'throw') {
						throw new RichError({
							code: 'forbidden-set', at: 'poseidon/Poseidon#proxy.set',
							data: { key, value },
						});
					}
				}
			}
		);


		for(const type of typesPreload) {
			this.load(type);
		}


		return this.proxy;
	}



	/**
	 * Read a config/data file
	 *
	 * @overload
	 * @param {string} type
	 * @param {true} willParse When `true`, parse buffer as config/data
	 * @returns {DataType}
	 *
	 * @overload
	 * @param {string} type
	 * @param {false} willParse When `false`, return raw Buffer
	 * @returns {Buffer}
	 *
	 *
	 * @param {string} type
	 * @param {boolean} [willParse = true] When `true`, parse buffer as config/data; when `false`, return raw Buffer
	 */
	read(type, willParse = true) {
		if(typeof type != 'string') {
			throw new RichError({
				code: 'invalid-type', at: 'poseidon/Poseidon#read(1:type)',
				data: { type },
			});
		}

		type = type.trim();


		const prefixes = [`.${this.prefixFile}`, this.prefixFile];
		const extensions = this.extensions;


		/** @type {Buffer} */
		let buffer;
		let errorLast;
		for(const prefix of prefixes) {
			for(const extension of extensions) {
				try {
					const nameFile = `${prefix}${type == '_' ? '' : `.${type}`}${extension}`;

					buffer = readFileSync(resolvePath(this.dirnData, nameFile));

					this.infos$type[type] = { prefix, extension };

					break;
				}
				catch(error) {
					errorLast = error;
				}
			}
		}

		if(!buffer) { throw errorLast; }


		return willParse ? this.parser(buffer, this) : buffer;
	}


	/**
	 * Load a config/data file. The config/data will be frozen recursively
	 * All marked file path values are converted to absolute paths
	 * Reloading is repeatable
	 * @param {string} type
	 * @param {boolean} [willThrow = false] When `false`, suppress errors and return `undefined`
	 * @returns {DataType|undefined}
	 */
	load(type, willThrow = false) {
		if(typeof type != 'string') {
			throw new RichError({
				code: 'invalid-type', at: 'poseidon/Poseidon#load(type)',
				data: { type },
			});
		}

		type = type.trim();


		try {
			const buffer = this.read(type, false);

			let data = this.parser(buffer, this);
			if(isObject(data)) {
				if(this.optionsPathAbsolutize.enable) {
					data = this.absolutizePath(data);
				}

				if(this.willFreeze) {
					data = deepFreeze(data);
				}
			}

			this.buffers$type[type] = buffer;
			this.datas$type[type] = data;

			return data;
		}
		catch(error) {
			if(willThrow) { throw error; }

			return undefined;
		}
	}


	/**
	 * Save config/data to a file. Supports backup before saving
	 * @param {string} type
	 * @param {DataType} data The config/data
	 * @param {SaveOption} [options]
	 * @returns {Poseidon<DataType>}
	 */
	save(type, data, options) {
		if(typeof type != 'string') {
			throw new RichError({
				code: 'invalid-type', at: 'poseidon/Poseidon#save(1:type)',
				data: { type },
			});
		}

		type = type.trim();



		if(options != null) {
			if(!isObject(options)) {
				throw new RichError({
					code: 'invalid-options', at: 'poseidon/Poseidon#save(3:options)',
					data: { options },
				});
			}
		}
		else { options = {}; }


		let willBackup = options.willBackup;
		if(willBackup != null) {
			if(typeof willBackup != 'boolean') {
				throw new RichError({
					code: 'invalid-options-willBackup', at: 'poseidon/Poseidon#save(3:options.willBackup)',
					data: { willBackup },
				});
			}
		}
		else { willBackup = false; }

		let dirnBackup = options.dirnBackup;
		if(dirnBackup != null) {
			if(typeof dirnBackup != 'string') {
				throw new RichError({
					code: 'invalid-options-dirn-backup', at: 'poseidon/Poseidon#save(3:options.dirnBackup)',
					data: { dirnBackup },
				});
			}


			dirnBackup = dirnBackup.trim();
		}
		else { dirnBackup = this.dirnData; }

		let padStartBackup = options.padBackup;
		if(padStartBackup != null) {
			if(typeof padStartBackup != 'string') {
				throw new RichError({
					code: 'invalid-options-pad-start-backup', at: 'poseidon/Poseidon#save(3:options.padBackup)',
					data: { padBackup: padStartBackup },
				});
			}


			padStartBackup = Number(padStartBackup);
		}
		else { padStartBackup = 1; }


		let prefixOption = options.prefix;
		if(prefixOption != null) {
			if(typeof prefixOption != 'string') {
				throw new RichError({
					code: 'invalid-options-prefix', at: 'poseidon/Poseidon#save(3:options.prefix)',
					data: { prefix: prefixOption },
				});
			}


			prefixOption = prefixOption.trim();
		}


		let extensionOption = options.ext;
		if(extensionOption != null) {
			if(typeof extensionOption != 'string') {
				throw new RichError({
					code: 'invalid-options-ext', at: 'poseidon/Poseidon#save(3:options.ext)',
					data: { extension: extensionOption },
				});
			}


			extensionOption = extensionOption.trim();
		}



		const info = this.infos$type[type];


		// Options > Info > Default
		const prefix = prefixOption ?? info?.prefix ?? this.prefixFile;
		const extension = extensionOption ?? info?.extension ?? this.extensions[0];

		const nameFile = `${prefix}${type == '_' ? '' : `.${type}`}`;

		const fileSave = resolvePath(this.dirnData, `${nameFile}${extension}`);

		if(willBackup) {
			const regexBackup = new RegExp(`^${EscapeStringRegexp(nameFile)}\\.(\\d+)\\.backup\\${extension}$`);
			const idsBackup = readdirSync(dirnBackup)
				.map(name => (name.match(regexBackup) || [])[1]).filter(n => n);
			const idBackup = Math.max(0, ...idsBackup) + 1;

			copyFileSync(
				fileSave,
				resolvePath(dirnBackup, `${nameFile}.backup${String(idBackup).padStart(padStartBackup, '0')}${extension}`),
			);
		}


		writeFileSync(fileSave, this.packer(data, this));


		return this;
	}


	/**
	 * Modify, save and reload a config/data
	 * @param {string} type
	 * @param {EditHandle<DataType>} handle Supports returning a Promise for async modification
	 * @returns {Poseidon<DataType>}
	 */
	edit(type, handle) {
		const dataRaw = this.read(type, false);
		const dataOld = this.parser(dataRaw, this);


		const result = handle(dataOld, dataRaw, type, this);

		if(result instanceof Promise) {
			return result.then(dataNew => {
				this.save(type, this.packer(dataNew ?? dataOld, this));
				this.load(type);


				return this;
			});
		}


		this.save(type, this.packer(result ?? dataOld, this));
		this.load(type);


		return this;
	}


	/**
	 * Resolve all `_`-prefixed key values in a config/data object to absolute paths
	 * @param {object} data
	 * @returns {object}
	 */
	absolutizePath(data) {
		const regexPrefix = new RegExp(`^${this.optionsPathAbsolutize.prefix}`);

		for(const [key, value] of Object.entries(data)) {
			if(isObject(value)) { this.absolutizePath(value); continue; }

			if(!regexPrefix.test(key) || typeof value != 'string') { continue; }

			const keyTarget = key.replace(regexPrefix, '');
			if(keyTarget in data && !this.optionsPathAbsolutize.overwrite) { continue; }


			data[keyTarget] = resolvePath(this.dirnData, this.optionsPathAbsolutize.path, value);
		}

		return data;
	}


	/**
	 * Get available types
	 * @param {boolean} [includeBackup = false]
	 * @returns {string[]}
	 */
	selectExistTypes(includeBackup = false) {
		const files = readdirSync(this.dirnData);


		const regexTest = new RegExp(`^(?<hidden>\\.?)${EscapeStringRegexp(this.prefixFile)}(?:\\.backup(?<backup1>\\d+)|\\.(?<type>[^.]+)(?:\\.backup(?<backup2>\\d+))?)?(?<ext>${this.extensions.join('|')})$`);


		const infos$type = {};

		for(const file of files) {
			const result = file.match(regexTest);

			if(result) {
				const backup = result.groups.backup1 ?? result.groups.backup2 ? Number(result.groups.backup1 ?? result.groups.backup2) : false;

				const info = infos$type[result.groups.type ?? '_'] ?? (infos$type[result.groups.type ?? '_'] = { files: [], backups: [] });

				info[backup ? 'backups' : 'files'].push({
					hidden: !!result.groups.hidden,
					type: result.groups.type ?? '_',
					backup,
					ext: result.groups.ext,
					file,
				});
			}
		}


		return infos$type;
	}
}


/** @template DataType */
export class PoseidonBox {
	/**
	 * Poseidon instance
	 * @type {Poseidon<DataType>}
	 */
	$;



	/**
	 * Create a Poseidon instance
	 * @param {PoseidonOption<DataType>} [options]
	 */
	constructor(options) { return new Poseidon(options); }
}


/**
 * Check whether the value is a Poseidon instance
 * @param {any} value
 * @returns {boolean}
 */
export function isPoseidon(value) { return value instanceof Poseidon; }
