const listKeys = (data) => {
  /* Lists the name of the keys from objects, returns an array
   * Useful for figuring out how many tables should be there
   */
  let keyList = []
  Object.keys(data).forEach(item => keyList.push(item))
  return keyList
}

const getBiggestInArray = (data) => {
  /* Figures out what is the biggest item in a given array.
   * Used to get the max table columns.
   */
  return data.reduce((max, current) => current > max ? current : max, data[0])
}

const getMaxCols = (data) => {
  /* Makes sure every table has the same number of columns
   * Checks the json data for the biggest number of keys
   */
  let tables = listKeys(data)

  return getBiggestInArray(tables.map(table => {
    return data[table].length
  }))
}


const keyify = (obj, prefix = '') =>
  /* get an array with all the keys from a given object
   * used to get table headers
   */
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
  /* Flattens the object into an array, including
   * nested properties.
   */
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object")
      Object.assign(acc, flattenObject(obj[k], pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});


const translateHeader = (item) => {
  /* Renames the headers according to this object.
   * Useful for making prettier header names
   */
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
  /* Makes the thead of the table
   */

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
  /* Print the moves of a given table
   * 
   */
  let moves = data.map(move => {
    return Object.values(flattenObject(move))
  })

  let headers = keyify(data[0])
  if (headers.length < maxCols) {
    headers = headers.concat(...Array(maxCols - headers.length).fill(''))
  }

  const handleTdClass = (index, headers) => {
    if(headers[index]) {
      return headers[index]
    } else {
      return ''
    }
  }
  
  if(moves.length < maxCols) {
    moves = moves.map(move => {
      return move.concat(Array(maxCols - move.length).fill(""));
    });
  }

  let string = '<tbody>';

  moves.map( (item) => {
    string += `<tr>\n${item.map((value, index) => `\t<td class="${handleTdClass(index, headers)}">${value}</td>\n`).join('')}</tr>\n`
  })

  return string + '</tbody>';
}

const advantageFormatting = () => {
  let adv = [].slice.call(document.querySelectorAll("td[class^='frameadvantage']"))

  adv.map(item => {
    let value = parseInt(item.innerText)

    if(value > 0) {
      item.classList.add('plus')
    } else if (value < 0) {
      item.classList.add('minus')
    } else if (value === 0) {
      item.classList.add('neutral')
    }

  })
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

  advantageFormatting();
}

document.addEventListener("DOMContentLoaded", function () {
  buildPage(data);
  
});