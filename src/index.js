import BibTeXParser from './BibTeXParser';
import * as builder from './BibTeXBuilder';

const parseString = (string) => {
  const parser = new BibTeXParser(string);
  parser.bibtex();
  return parser.entries;
};

export default parseString;

export const parser = {
  parseString: parseString
};

export {builder};

