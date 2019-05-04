export function buildEntry(data) {
  let entry = `@${data.entryType}{${data.entryKey}`;
  for(let item in data) {
    switch(item) {
      case 'entryType': continue;
      case 'entryKey': continue;
      //case 'author':
      //break;
      default:
        entry += `,\n\t${item} = {${data[item].rawValue}}`;
    }

  }
  entry += `\n}`;
  return entry;
}

export function buildEntries(entries) {
  let result = [];
  for(let key in entries) {
    result.push(buildEntry(entries[key]));
  }
  return result;
}