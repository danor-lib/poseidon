import type { Poseidon } from './src/Poseidon.js';



/** Options used to convert relative paths to absolute paths */
export type AbsolutizePathOption = {
	/** Whether to convert relative paths to absolute paths. Default is `true` */
	enable?: boolean;

	/** The prefix of keys that need to be converted to absolute paths. Default is `_` */
	prefix?: string;

	/** Whether to overwrite existing config/data. Default is `false` */
	overwrite?: boolean;

	/** The intermediate path between the config/data directory and the relative path. Default is an empty string */
	path?: string;
};


/** Options used to construct a `Poseidon` */
export type PoseidonOption<DataType> = {
	/** The prefix of config/data files. Default is `config` */
	prefix?: string;

	/** The directory where config/data files are located. Default is `process.cwd()` */
	dirn?: string;

	/** Types for preloading. Split by `,`. `_` is default file */
	preloads?: string | string[];


	/** Config/data parsing function */
	parser?: (buffer: Buffer, poseidon: Poseidon<DataType>) => DataType;
	/** Config/data packing function */
	packer?: (data: DataType, poseidon: Poseidon<DataType>) => string | ArrayBufferView;

	/** The order of extensions for reading config/data files */
	exts?: string[];


	/** When the default config/data and a named config/data share the same key, prefer returning the value from the default config/data. Default is `true` */
	preferDefault?: boolean;

	/** Whether to freeze the object after parsing config/data. Default is `true` */
	willFreeze?: boolean;


	/** Whether to convert relative paths to absolute paths. Default is `true` */
	absolutize?: AbsolutizePathOption;


	/** The behavior when assigning config/data. Default is `throw` */
	howAssign: 'throw' | 'ignore';
};


/** Options used to save a config/data */
export type SaveOption = {
	/** Whether to backup the original config/data. Default is `false` */
	willBackup?: boolean;

	/** The directory where the backup file is located. Default is `this.dirnData` */
	dirnBackup?: string;

	/** The number of digits to pad the backup file name. Default is `1` */
	padBackup?: number;

	/** The prefix of config/data file. Default is `this.prefix` */
	prefix?: string;

	/** The extension of config/data file. Default is `this.extension` */
	ext?: string;
};



/**
 * Config/data editing handle
 * @param {DataType} data The config/data
 * @param {Buffer} dataRaw The raw config/data
 * @param {string} type The config/data type
 * @param {Poseidon<DataType>} self The Poseidon instance
 */
export type EditHandle<DataType> = (data: DataType, dataRaw: Buffer, type: string, self: Poseidon<DataType>) => any;
