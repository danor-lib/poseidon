import type { AbsolutizePathOption, PoseidonOption, SaveOption, EditHandle } from '../types.js';



/** Information about a loaded config/data file */
interface LoadedDataInfo {
	prefix: string;
	extension: string;
}

/** Information about a file found by `selectExistTypes` */
interface FileInfo {
	hidden: boolean;
	type: string;
	backup: number | false;
	ext: string;
	file: string;
}

/** Result of `selectExistTypes` */
type ExistTypesResult = Record<string, {
	files: FileInfo[];
	backups: FileInfo[];
}>;

export class Poseidon<DataType = any> {
	/** Instance reference */
	$: Poseidon<DataType>;

	/** The prefix of config/data file */
	prefixFile: string;

	/** Directory of configs/datas */
	dirnData: string;

	/** Whether to prefer default config/data when getting */
	preferDefault: boolean;

	/** Whether to freeze config/data */
	willFreeze: boolean;

	/** Options for path absolutization */
	optionsPathAbsolutize: AbsolutizePathOption;

	/** Behavior when setting */
	howAssign: 'throw' | 'ignore';

	/** Raw loaded config/data buffers */
	buffers$type: Record<string, Buffer>;

	/** Loaded config/data */
	datas$type: Record<string, DataType>;

	/** Proxy instance */
	proxy: Poseidon<DataType>;

	/** Mapping of config/data file extensions */
	extensions$type: Record<string, string>;

	/** Info of loaded types */
	infos$type: Record<string, LoadedDataInfo>;

	/** Config/data parsing function */
	parser: (buffer: Buffer, poseidon: Poseidon<DataType>) => DataType;

	/** Config/data packing function */
	packer: (data: DataType, poseidon: Poseidon<DataType>) => string | ArrayBufferView;

	/** File extensions for reading */
	extensions: string[];

	/**
	 * Create a Poseidon instance
	 */
	constructor(options?: PoseidonOption<DataType>);

	/**
	 * Read a config/data file, parsing it as config/data
	 */
	read(type: string, willParse?: true): DataType;
	/**
	 * Read a config/data file, returning the raw Buffer
	 */
	read(type: string, willParse: false): Buffer;

	/**
	 * Load a config/data file. The config/data will be frozen recursively.
	 * All marked file path values are converted to absolute paths.
	 * Reloading is repeatable.
	 * @param willThrow When `false`, suppress errors and return `undefined`
	 */
	load(type: string, willThrow?: boolean): DataType | undefined;

	/**
	 * Save config/data to a file. Supports backup before saving.
	 */
	save(type: string, data: DataType, options?: SaveOption): Poseidon<DataType>;

	/**
	 * Modify, save and reload a config/data.
	 * Supports returning a Promise for async modification.
	 */
	edit(type: string, handle: EditHandle<DataType>): Poseidon<DataType> | Promise<Poseidon<DataType>>;

	/**
	 * Resolve all `_`-prefixed key values in a config/data object to absolute paths
	 */
	absolutizePath(data: object): object;

	/**
	 * Get available types
	 */
	selectExistTypes(includeBackup?: boolean): ExistTypesResult;
}

export class PoseidonBox<DataType = any> {
	/** Instance reference */
	$: Poseidon<DataType>;

	/**
	 * Create a Poseidon instance
	 */
	constructor(options?: PoseidonOption<DataType>);
}

/**
 * Check whether the value is a Poseidon instance
 */
export function isPoseidon(value: any): value is Poseidon<any>;
