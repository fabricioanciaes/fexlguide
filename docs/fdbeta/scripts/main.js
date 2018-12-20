const listKeys = (data) => {
  /* Lists the name of the keys from objects, returns an array
   * Useful for figuring out how many tables should be there
   */
  let keyList = []
  Object.keys(data).forEach(item => keyList.push(item))
  return keyList
}

const getBiggestInArray = (data) => {
  return data.reduce((max, current) => current > max ? current : max, data[0])
}

const getMaxCols = (data) => {
  let tables = listKeys(data)

  return getBiggestInArray(tables.map(table => {
    return data[table].length
  }))
}


const keyify = (obj, prefix = '') =>
  Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...keyify(obj[el], prefix + el + '.')];
    } else {
      return [...res, prefix + el];
    }
  }, []);

const flattenObject = (obj, prefix = "") =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object")
      Object.assign(acc, flattenObject(obj[k], pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});


const translateHeader = (item) => {
  const headerNames = {
    'name': 'Name',
    'startup': 'Startup',
    'hitstop': 'Hitstop',
    'total': 'Total',
    'damage': 'Damage',
    'metergain.whiff': 'M.Gain Whiff',
    'metergain.block': 'M.Gain Blk',
    'metergain.hit': 'M.Gain Hit',
    'frameadvantage.sBlock': 'on sBlk',
    'frameadvantage.cBlock': 'on cBlk',
    'frameadvantage.hit': 'on Hit',
    'stun.sBlock': 'sBlkstun',
    'stun.cBlock': 'cBlkstun',
    'stun.hit': 'Hitstun',
    'Startup.Beforefreeze': 'Before Freeze',
    'Startup.Afterfreeze': 'After Freeze'
  }
  if(headerNames[item]) {
    return headerNames[item];
  } else {
    return item;
  }
}

const buildHeader = (data, maxCols) => {
  let headers = keyify(data[0])
  if(headers.length < maxCols) {
    headers = headers.concat(...Array(maxCols - headers.length).fill(''))
  }
  
  let string = '<thead><tr class="header">\n'
  headers.map(item => {
    string += `\t<th>${translateHeader(item)}</th>\n`;
  }).join("")

  return string + '</tr></thead>'
}

const buildMoves = (data, maxCols) => {
  let moves = data.map(move => {
    return Object.values(flattenObject(move))
  })
  
  if(moves.length < maxCols) {
    moves = moves.map(move => {
      return move.concat(Array(maxCols - move.length).fill(""));
    });
  }

  let string = '<tbody>';

  moves.map(item => {
    string += `<tr>\n${item.map(value => `\t<td>${value}</td>\n`).join('')}</tr>\n`
  })

  return string + '</tbody>';
}

const buildTable = (data) => {
  let string = '<table>'

  string += buildHeader(data, maxCols);
  string += buildMoves(data, maxCols);

  return string + '</table>'
}

var maxCols = getMaxCols(data) + 1;


const buildPage = (data) => {
  document.querySelector('#framedata').innerHTML = Object.keys(data).map(table => buildTable(data[table])).join("");

  var tables = [].slice.call(document.querySelectorAll('#framedata table'));

  tables.map(table => sorttable.makeSortable(table));
}

document.addEventListener("DOMContentLoaded", function () {
  buildPage(data);
  
});