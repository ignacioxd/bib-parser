import BibTeXParser, {parseString} from './BibTeXParser';
import * as builder from './BibTeXBuilder';

export const parse = parseString;
export default parse;
export const parser = {
  parseString: parseString
};

export {builder};
export const build = builder.buildEntries;
