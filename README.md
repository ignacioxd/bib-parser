# bib-parser - A BibTeX JavaScript Parser

Parse BibTeX entries into JavaScript objects (and back) including processing of basic LaTeX in entry fields.

[![dependencies Status](https://david-dm.org/ignacioxd/bib-parser.svg)](https://david-dm.org/ignacioxd/bib-parser)
[![devDependencies Status](https://david-dm.org/ignacioxd/bib-parser/dev-status.svg)](https://david-dm.org/ignacioxd/bib-parser?type=dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Install

    npm install ignacioxd/bib-parser

## Usage

```javascript
import {parse, build} from 'bib-parser';
```

or

```javascript
const {parse, build} = require('bib-parser');
```

Then, give the `parse` function a BibTeX string and it will return an array of parsed entries.

```javascript
let parsedEntriesArray = parse(bibtexString);
```

If you prefer to recieve an object keyed on the BibTeX entries' keys, pass an additional `true` argument:

```javascript
let parsedEntriesObject = parse(bibtexString, true);
```

Parsed entries (objects or arrays) can be converted back to BibTeX strings using the `build` function:

```javascript
let bibtexSource = build(parsedEntries);
```

## Structure of Parsed Entries

Each BibTeX entry is returned as an object, with each attribute in the BibTeX entry becoming an all-lowercase attribute in its corresponding object. Each attribute will be returned in it's parsed and original formats. Additionally, authors will be further processed and returned as an array. An example of an attribute will help illustrate this.

```bibtex
@inproceedings{CiteMe1990:BetaPaper,
	Title={The \beta Effect},
	Author={Last Name, Jane and Jo\'{e} LastName},
	booktitle={Very Respectable Conference on {\beta} Examples},
	YEAR={1990}
}
```

will be parsed as an object with this structure:

```javascript
{
  entryType: 'inproceedings',
  entryKey: 'CiteMe1990:BetaPaper',
  title: {
    rawName: 'Title',
    value: 'The β Effect',
    rawValue: 'The \\beta Effect'
  },
  author: {
    rawName: 'Author',
    value: 'Last Name, Jane and Joé LastName',
    rawValue:  "Last Name, Jane and Jo\'{e} LastName",
    authors: [
      'Jane Last Name',
      'Joé LastName'
    ]
  },
  booktitle: {
    rawName: 'booktitle',
    value: 'Very Respectable Conference on β Examples',
    rawValue: 'Very Respectable Conference on {\beta} Examples'
  },
  year: {
    rawName: 'YEAR',
    value: '1990',
    rawValue: '1990'
  }
}
```

More formally, each entry will have two special attributes: `entryType` to indicate the type of BibTeX entry in lowercase (e.g., `inproceedings`), and `entryKey` with the key identifier for the entry preserving the source's casing. Each BibTeX attribute will become an attribute in the respective object with the following structure:

* `rawName`: Name of the BibTeX entry attribute as originally specified in the source string.
* `value`: Parsed value of the attribute, including processing of basic LaTeX converted into Unicode symbols. 
* `rawValue`: Value of the attribute as originally included in the BibTeX source string. Any LaTeX is returned as is.

Additionally, `author` entries will additionally contain an `authors` array with parsed author(s) name(s).

## Reconstructing BibTeX Source

Entries returned by this library can be converted back to BibTeX using the `build` function. This function expects an array of entry objects, or a keyed object of entry objects. The return value will be an array of BibTeX string entries.

```javascript
let bibtexSource = build(parsedEntries);
```