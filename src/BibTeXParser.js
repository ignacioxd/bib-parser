// Based on bibtex-js by Henrik Muehe (c) 2010
// https://code.google.com/archive/p/bibtex-js/source/default/source
//

// Issues:
//  no comment handling within strings
//  no string concatenation
//  no variable values yet

// Grammar implemented here:
//  bibtex -> (string | preamble | comment | entry)*;
//  string -> '@STRING' '{' key_equals_value '}';
//  preamble -> '@PREAMBLE' '{' value '}';
//  comment -> '@COMMENT' '{' value '}';
//  entry -> '@' key '{' key ',' key_value_list '}';
//  key_value_list -> key_equals_value (',' key_equals_value)*;
//  key_equals_value -> key '=' value;
//  value -> value_quotes | value_braces | key;
//  value_quotes -> '"' .*? '"'; // not quite
//  value_braces -> '{' .*? '"'; // not quite

import {convertLaTeXToUnicode} from 'latex-to-unicode-converter';


export default class BibTeXParser {
  constructor(input) {
    this.pos = 0;
    this.input = input ? input : "";
    
    this.entries = {};
    this.comments = [];
    this.strings = {
        JAN: "January",
        FEB: "February",
        MAR: "March",      
        APR: "April",
        MAY: "May",
        JUN: "June",
        JUL: "July",
        AUG: "August",
        SEP: "September",
        OCT: "October",
        NOV: "November",
        DEC: "December"
    };
    this.currentKey = "";
    this.currentEntry = "";
  }
  
  setInput(t) {
    this.input = t;
  }
  
  getEntries() {
      return this.entries;
  }

  isWhitespace(s) {
    return (s === ' ' || s === '\r' || s === '\t' || s === '\n');
  }

  match(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) === s) {
      this.pos += s.length;
    } else {
      throw Error("Token mismatch, expected " + s + ", found " + this.input.substring(this.pos));
    }
    this.skipWhitespace();
  }

  tryMatch(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) === s) {
      return true;
    } else {
      return false;
    }
  }

  skipWhitespace() {
    while (this.isWhitespace(this.input[this.pos])) {
      this.pos++;
    }
    if (this.input[this.pos] === "%") {
      while(this.input[this.pos] !== "\n") {
        this.pos++;
      }
      this.skipWhitespace();
    }
  }

  value_braces() {
    let bracecount = 0;
    this.match("{");
    let start = this.pos;
    while(true) {
      if (this.input[this.pos] === '}' && this.input[this.pos-1] !== '\\') {
        if (bracecount > 0) {
          bracecount--;
        } else {
          let end = this.pos;
          this.match("}");
          return this.input.substring(start, end);
        }
      } else if (this.input[this.pos] === '{' && this.input[this.pos-1] !== '\\') {
        bracecount++;
      } else if (this.pos === this.input.length-1) {
        throw Error("Unterminated value");
      }
      this.pos++;
    }
  }

  value_quotes() {
    this.match('"');
    let start = this.pos;
    while(true) {
      if (this.input[this.pos] === '"' && this.input[this.pos-1] !== '\\') {
          let end = this.pos;
          this.match('"');
          return this.input.substring(start, end);
      } else if (this.pos === this.input.length-1) {
        throw Error("Unterminated value:" + this.input.substring(start));
      }
      this.pos++;
    }
  }
  
  single_value() {
    let start = this.pos;
    if (this.tryMatch("{")) {
      return this.value_braces();
    } else if (this.tryMatch('"')) {
      return this.value_quotes();
    } else {
      let k = this.key();
      if (this.strings[k.toUpperCase()]) {
        return this.strings[k];
      } else if (k.match("^[0-9]+$")) {
        return k;
      } else {
        throw Error("Value expected:" + this.input.substring(start));
      }
    }
  }
  
  value() {
    let values = [];
    values.push(this.single_value());
    while (this.tryMatch("#")) {
      this.match("#");
      values.push(this.single_value());
    }
    return values.join("");
  }

  key() {
    let start = this.pos;
    while(true) {
      if (this.pos === this.input.length) {
        throw Error("Runaway key");
      }
    
      if (this.input[this.pos].match("[a-zA-Z0-9_:\\./-]")) {
        this.pos++
      } else {
        return this.input.substring(start, this.pos);//ignacioxd.toUpperCase();
      }
    }
  }

  key_equals_value() {
    let key = this.key();
    if (this.tryMatch("=")) {
      this.match("=");
      let val = this.value();
      return [ key, val ];
    } else {
      throw Error("... = value expected, equals sign missing:" + this.input.substring(this.pos));
    }
  }

  key_value_list() {
    let kv = this.key_equals_value();
    this.entries[this.currentEntry][kv[0].toLowerCase()] = this.process_value(kv);
    while (this.tryMatch(",")) {
      this.match(",");
      // fixes problems with commas at the end of a list
      if (this.tryMatch("}")) {
        break;
      }
      kv = this.key_equals_value();
      this.entries[this.currentEntry][kv[0].toLowerCase()] = this.process_value(kv);
    }
  }

  process_value(kv) {
    let processedValue = kv[1];
    try {
      processedValue = convertLaTeXToUnicode( kv[1] );
    }
    catch(e) {
      console.warn(`${e.message} when parsing field '${kv[0].toLowerCase()}' in entry '${this.currentEntry}'. I will still return this value, but it may contain unprocessed LaTeX.`);
    }

    let result = {
      rawName: kv[0],
      value: processedValue,
      rawValue: kv[1]
    };

    if(kv[0].toLowerCase() === "author") {
      let authorList = [];
      let authors = processedValue.split(" and ");
      for(let i = 0; i < authors.length; i++) {
        if(authors[i].indexOf(",") === -1) {
          authorList.push( authors[i].trim() );
        }
        else {
          let currentAuthor = authors[i].split(",");
          let name = currentAuthor[1].trim() + " " + currentAuthor[0].trim();
          authorList.push( name );
        }
      }
      result["authors"] = authorList;
    }
    
    return result;
  }

  entry_body(d) {
    this.currentEntry = this.key();
    this.entries[this.currentEntry] = { entryType: d.substring(1), entryKey: this.currentEntry };
    this.match(",");
    this.key_value_list();
  }

  directive () {
    this.match("@");
    return "@"+this.key();
  }

  string () {
    let kv = this.key_equals_value();
    this.strings[kv[0].toUpperCase()] = kv[1];
  }

  preamble() {
    this.value();
  }

  comment() {
    let start = this.pos;
    while(true) {
      if (this.pos === this.input.length) {
        throw Error("Runaway comment");
      }
    
      if (this.input[this.pos] !== '}') {
        this.pos++
      } else {
        this.comments.push(this.input.substring(start, this.pos));
        return;
      }
    }
  }

  entry(d) {
    this.entry_body(d);
  }

  bibtex() {
    while(this.tryMatch("@")) {
      let d = this.directive().toLowerCase();
      this.match("{");
      if (d === "@string") {
        this.string();
      } else if (d === "@preamble") {
        this.preamble();
      } else if (d === "@comment") {
        this.comment();
      } else {
        this.entry(d);
      }
      this.match("}");
    }

    this.entries['@comments'] = this.comments;
  }
}

export const parseString = (string, asObject = false) => {
  const parser = new BibTeXParser(string);
  parser.bibtex();
  delete parser.entries["@comments"];
  return asObject ? parser.entries : Object.keys(parser.entries).map(key => parser.entries[key]);
};