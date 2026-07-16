# CHANGELOG

## v10.0.3 - 2026.07.16 10
* improve: unify the import file extension for `types.ts` to `.ts` when it is imported
* regular: bump up dependencies


## v10.0.2 - 2026.07.08 15
* fix: correct the `code` definitions for some RichError errors
* docs: supplement the missing error code table
* regular: bump up dependencies


## v10.0.1 - 2026.07.02 15
* fix: fix package.json


## v10.0.0 - 2026.07.02 14
* refactor!: rename package from `@nuogz/poseidon` to `@danor-lib/poseidon`
* docs: **IMPORTANT!** update license to ***MIT***
* refactor!: rename `PoseidonProto` to `Poseidon`, but it is exported as `Poseidon_`
* refactor!: rename `Poseidon` to `PoseidonBox`, but it is exported as `Poseidon`
* refactor!: all parameters of `Poseidon`'s constructor are consolidated into an options object
* refactor!: absolutize path supports more options
* refactor!: backup filename format changes from `config.apple.1.backup.json` to `config.apple.backup1.json`
* refactor!: reading hidden files no longer requires prior declaration in preloads. Hidden files are now part of the load priority order
* refactor!: rename `#getTypesExist()` to `#selectExistTypes()`
* refactor!: remove `comment-json`. It can be reintroduced via options, see README for details
* refactor!: remove infrequently used `@nuogz/i18n`
* docs: add README and English version
* docs: improve types and export
* docs: add error code reference table
* refactor!: due to a change in design philosophy, remove all error message text
  * in my design philosophy, an error should only contain a code and associated data. Text-based message should be rendered by the terminal (including i18n and terminal highlighting)
* regular!: bump up Node.js requirement to `>=26`
  * this requirement does not mean the library cannot run on older versions of Node.js. It only indicates the major version I am currently using
* regular: update enviroment
* regular: bump up dependencies


## v9.0.1 - 2025.07.14 02
* fix: fixed an issue where `comment-json.parse()` was not called correctly in `$.read()`.
* chore: bump up dependencies
* chore: update environments


## v9.0.0 - 2024.12.13 14
* feat: use `comment-json` by default to support JSON with comments
* feat: support config files with `.jsonc` suffix:  
  now will try to read files with `.jsonc` suffix instead after failing to read files with `.json` suffix
* docs: renew types
* deps: bump up dependencies


## v8.3.0 - 2024.08.26 17
* refactor: renew codes to adapt to latest `@nuogz/i18n`
* docs: renew locale with latest `@nuogz/i18n`
* deps: bump up dependencies
* chore: renew develop environments


## v8.2.0 - 2024.03.06 01
* (break) manually refactor `index.d.ts`, for export extendable `PoseidonInterface`
* (break) change export content!
  * `Poseidon` no longer export as default
  * export extendable interface `PoseidonInterface` now


## v8.1.0 - 2023.12.07 11
* tweak enviroment
* bump up dependencies


## v8.0.1 - 2023.05.09 19
* fix `package.json`


## v8.0.0 - 2023.05.08 18
* bump up `@nuogz/i18n` to `v3.x` and renew related code
* add `d.ts` and renew related code
* bump up dependencies


## v7.0.3 - 2022.08.12 09
* fix translation function in proxy


## v7.0.2 - 2022.08.12 09
* improve `locale` keys and translations
* bump up `@nuogz/i18n` to `1.2.0` and update related code


## v7.0.0 - 2022.08.09 15
* tweak all files for publishing to npm
* start use `CHANGLOG.md` since version `v7.0.0`
* use library `@nuogz/i18n`instead inline i18n code
* translate all inline documents info english
