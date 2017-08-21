# fontoxml-localization-tools  [![Build Status](https://travis-ci.org/FontoXML/fontoxml-localization-tools.svg?branch=master)](https://travis-ci.org/FontoXML/fontoxml-localization-tools) [![devDependency Status](https://david-dm.org/FontoXML/fontoxml-localization-tools/dev-status.svg)](https://david-dm.org/FontoXML/fontoxml-localization-tools#info=devDependencies) [![devDependency Status](https://david-dm.org/FontoXML/fontoxml-localization-tools/status.svg)](https://david-dm.org/FontoXML/fontoxml-localization-tools#info=dependencies) [![NPM version](https://badge.fury.io/js/fontoxml-localization-tools.svg)](http://badge.fury.io/js/fontoxml-localization-tools)


Tools for working with FontoXML localization bundles.

## Installation

	npm i -g fontoxml-localization-tools

## Usage

	fontoxml-localization-tool help

prints this message

	fontoxml-localization-tool extract [path [path...]]

extract message bundle template from package(s) at the given path(s)

	fontoxml-localization-tool merge [path [path...]]

merge message bundles

	fontoxml-localization-tool update [--overwrite] <bundlePath> <templatePath>

update message bundle with new template, overwriting the source if --overwrite is passed

## Message bundles

Message bundles are JSON files, containing an array of Message objects. Each Message contains an `in` property with the
original message, and an `out` property set to the localized version. Optionally, messages may contain a `meta`
property with information about the location of the message in the source code. When merging messages with the same `in`
value but conflicting `out` values, a `conflicts` property is created to preserve the other localizations.

Messages in the `in` and `out` properties follow the ICU MessageFormat standard. Please refer to the
[messageformat.js documentation][messageformat-docs] for an overview of the syntax options.

Message bundles should be placed directly in the `src` folder of a FontoXML package. Message bundles should be named
`messages.${locale}.json`, where `${locale}` is the IETF language code for the locale the messages belong to. Make sure
to use the appropriate code from the [CLDR plural rules chart][cldr-plural-table]
in order for the correct plural forms to be used for your localization.

[messageformat-docs]: https://messageformat.github.io/guide/
[cldr-plural-table]: http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
