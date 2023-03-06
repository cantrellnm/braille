"use strict";

var unicodeBase = 0x2800;
var numberFollows = 0b111100;
var capitalFollows = 0b100000;
// var unknown = 0b111111;
var letterIndicator = 0b000110;

var showOriginal = false;
var contractedSingle = false;
var contractedMultiple = false;

var characterTranslator = {
  // simple punctuation
  "'": [0b000100],
  '"': [0b100000, 0b110110],
  ',': [0b000010],
  '.': [0b110010],
  '?': [0b100110],
  '!': [0b010110],
  ';': [0b000110],
  ':': [0b010010],
  '-': [0b100100],

  // directional punctuation
  '‘': [0b100000, 0b100110],
  '’': [0b100000, 0b110100],
  '“': [0b011000, 0b100110],
  '”': [0b011000, 0b110100],
  '«': [0b111000, 0b100110],
  '»': [0b111000, 0b110100],
  '(': [0b010000, 0b100011],
  ')': [0b010000, 0b011100],
  '[': [0b101000, 0b100011],
  ']': [0b101000, 0b011100],
  '{': [0b111000, 0b100011],
  '}': [0b111000, 0b011100],
  '<': [0b001000, 0b100011],
  '>': [0b001000, 0b011100],
  '/': [0b111000, 0b001100],
  '\\': [0b111000, 0b100001],

  // weirder punctuation
  '~': [0b001000, 0b010100],
  '@': [0b001000, 0b000001],
  '#': [0b111000, 0b111001],
  '$': [0b001000, 0b001110],
  '¢': [0b001000, 0b001001],
  '€': [0b001000, 0b010001],
  '£': [0b001000, 0b000111],
  '¥': [0b001000, 0b111101],
  '%': [0b101000, 0b110100],
  '^': [0b001000, 0b100010],
  '&': [0b001000, 0b101111],
  '*': [0b010000, 0b010100],
  '—': [0b010000, 0b100000, 0b100100], // em-dash
  '–': [0b010000, 0b100100], // en-dash
  '_': [0b101000, 0b100100],
  '=': [0b010000, 0b110110],
  '+': [0b010000, 0b010110],
  '−': [0b010000, 0b100100], // minus
  '×': [0b010000, 0b100110], // multiply
  '÷': [0b010000, 0b001100],
  '|': [0b111000, 0b110011],
  '`': [0b101000, 0b100001],
  '°': [0b011000, 0b011010],
  '•': [0b111000, 0b110010],
  '…': [0b110010, 0b110010, 0b110010],
  '©': [0b011000, 0b001001],
  '®': [0b011000, 0b010111],
  '™': [0b011000, 0b011110],

  // digits
  '0': [0b011010], //⠚
  '1': [0b000001], //⠁
  '2': [0b000011], //⠃
  '3': [0b001001], //⠉
  '4': [0b011001], //⠙
  '5': [0b010001], //⠑
  '6': [0b001011], //⠋
  '7': [0b011011], //⠛
  '8': [0b010011], //⠓
  '9': [0b001010]  //⠊
};

// first 10 letters
characterTranslator['a'] = characterTranslator['1'];
characterTranslator['b'] = characterTranslator['2'];
characterTranslator['c'] = characterTranslator['3'];
characterTranslator['d'] = characterTranslator['4'];
characterTranslator['e'] = characterTranslator['5'];
characterTranslator['f'] = characterTranslator['6'];
characterTranslator['g'] = characterTranslator['7'];
characterTranslator['h'] = characterTranslator['8'];
characterTranslator['i'] = characterTranslator['9'];
characterTranslator['j'] = characterTranslator['0'];

// next 10 letters
characterTranslator['k'] = [characterTranslator['a'][0] | 0b000100];
characterTranslator['l'] = [characterTranslator['b'][0] | 0b000100];
characterTranslator['m'] = [characterTranslator['c'][0] | 0b000100];
characterTranslator['n'] = [characterTranslator['d'][0] | 0b000100];
characterTranslator['o'] = [characterTranslator['e'][0] | 0b000100];
characterTranslator['p'] = [characterTranslator['f'][0] | 0b000100];
characterTranslator['q'] = [characterTranslator['g'][0] | 0b000100];
characterTranslator['r'] = [characterTranslator['h'][0] | 0b000100];
characterTranslator['s'] = [characterTranslator['i'][0] | 0b000100];
characterTranslator['t'] = [characterTranslator['j'][0] | 0b000100];

// next 5 letters (excluding w)
characterTranslator['u'] = [characterTranslator['a'][0] | 0b100100];
characterTranslator['v'] = [characterTranslator['b'][0] | 0b100100];
characterTranslator['x'] = [characterTranslator['c'][0] | 0b100100];
characterTranslator['y'] = [characterTranslator['d'][0] | 0b100100];
characterTranslator['z'] = [characterTranslator['e'][0] | 0b100100];

// w is not part of the original braille (due to not being a french letter)
characterTranslator['w'] = [0b111010];

var diacriticTranslator = {
  '́': [0b011000, 0b001100], // accute accent
  '̆': [0b001000, 0b101100], // breve
  '̌': [0b011000, 0b101100], // caron
  '̧': [0b011000, 0b101111], // cedilla
  '̂': [0b011000, 0b101001], // circumflex
  '̈': [0b011000, 0b010010], // diaeresis
  '̀': [0b011000, 0b100001], // grave accent
  '̄': [0b001000, 0b100100], // macron
  '̊': [0b011000, 0b101011], // ring
  '̃': [0b011000, 0b111011], // tilde
};

// groupsigns
var groupTranslator = {};
  // strong groupsigns
groupTranslator['ar'] = [0b011100];
groupTranslator['ch'] = [0b100001];
groupTranslator['ed'] = [0b101011];
groupTranslator['er'] = [0b111011];
groupTranslator['gh'] = [0b100011];
groupTranslator['ing'] = [0b101100];
groupTranslator['ou'] = [0b110011];
groupTranslator['ow'] = [0b101010];
groupTranslator['sh'] = [0b101001];
groupTranslator['st'] = [0b001100];
groupTranslator['th'] = [0b111001];
groupTranslator['wh'] = [0b110001];
// strong contractions
groupTranslator['and'] = [0b101111];
groupTranslator['for'] = [0b111111];
groupTranslator['of'] = [0b110111];
groupTranslator['the'] = [0b101110];
groupTranslator['with'] = [0b111110];
// lower groupsigns
groupTranslator['be'] = [0b000110]; // only first syllable, same as bb
groupTranslator['bb'] = [0b000110]; // only surrounded, dame as be
groupTranslator['cc'] = [0b010010]; // only surrounded, same as con
groupTranslator['con'] = [0b010010]; // only first syllable, same as cc
groupTranslator['dis'] = [0b110010]; // only first syllable
groupTranslator['ea'] = [0b000010]; // only surrounded
groupTranslator['en'] =  [0b100010];
groupTranslator['ff'] = [0b010110]; // only surrounded
groupTranslator['gg'] =  [0b110110]; // only surrounded
groupTranslator['in'] = [0b010100];
// final-letter, multi-cell
groupTranslator['ence'] = [0b110000, characterTranslator['e'][0]];
groupTranslator['ong'] = [0b110000, characterTranslator['g'][0]];
groupTranslator['ful'] = [0b110000, characterTranslator['l'][0]];
groupTranslator['tion'] = [0b110000, characterTranslator['n'][0]];
groupTranslator['ness'] = [0b110000, characterTranslator['s'][0]];
groupTranslator['ment'] = [0b110000, characterTranslator['t'][0]];
groupTranslator['ity'] = [0b110000, characterTranslator['y'][0]];
groupTranslator['ound'] = [0b101000, characterTranslator['d'][0]];
groupTranslator['ance'] = [0b101000, characterTranslator['e'][0]];
groupTranslator['sion'] = [0b101000, characterTranslator['n'][0]];
groupTranslator['less'] = [0b101000, characterTranslator['s'][0]];
groupTranslator['ount'] = [0b101000, characterTranslator['t'][0]];
// initial-letter, multi-cell
groupTranslator['cannot'] = [0b111000, characterTranslator['c'][0]];
groupTranslator['had'] = [0b111000, characterTranslator['h'][0]];
groupTranslator['many'] = [0b111000, characterTranslator['m'][0]];
groupTranslator['spirit'] = [0b111000, characterTranslator['s'][0]];
groupTranslator['their'] = [0b111000, groupTranslator['the'][0]];
groupTranslator['world'] = [0b111000, characterTranslator['w'][0]];
groupTranslator['character'] = [0b111000, groupTranslator['ch'][0]];
groupTranslator['day'] = [0b111000, characterTranslator['d'][0]];
groupTranslator['ever'] = [0b111000, characterTranslator['e'][0]];
groupTranslator['father'] = [0b111000, characterTranslator['f'][0]];
groupTranslator['here'] = [0b111000, characterTranslator['h'][0]];
groupTranslator['know'] = [0b111000, characterTranslator['k'][0]];
groupTranslator['lord'] = [0b111000, characterTranslator['l'][0]];
groupTranslator['mother'] = [0b111000, characterTranslator['m'][0]];
groupTranslator['name'] = [0b111000, characterTranslator['n'][0]];
groupTranslator['one'] = [0b111000, characterTranslator['o'][0]];
groupTranslator['ought'] = [0b111000, groupTranslator['ou'][0]];
groupTranslator['part'] = [0b111000, characterTranslator['p'][0]];
groupTranslator['question'] = [0b111000, characterTranslator['q'][0]];
groupTranslator['right'] = [0b111000, characterTranslator['r'][0]];
groupTranslator['some'] = [0b111000, characterTranslator['s'][0]];
groupTranslator['there'] = [0b111000, groupTranslator['the'][0]];
groupTranslator['time'] = [0b111000, characterTranslator['t'][0]];
groupTranslator['through'] = [0b111000, groupTranslator['th'][0]];
groupTranslator['under'] = [0b111000, characterTranslator['u'][0]];
groupTranslator['where'] = [0b111000, groupTranslator['wh'][0]];
groupTranslator['work'] = [0b111000, characterTranslator['w'][0]];
groupTranslator['young'] = [0b111000, characterTranslator['y'][0]];
groupTranslator['these'] = [0b011000, groupTranslator['the'][0]];
groupTranslator['those'] = [0b011000, groupTranslator['th'][0]];
groupTranslator['upon'] = [0b011000, characterTranslator['u'][0]];
groupTranslator['whose'] = [0b011000, groupTranslator['wh'][0]];
groupTranslator['word'] = [0b011000, characterTranslator['w'][0]];

// wordsigns
var wordTranslator = {
  // alphabetic
  but: characterTranslator['b'],
  can: characterTranslator['c'],
  do: characterTranslator['d'],
  every: characterTranslator['e'],
  from: characterTranslator['f'],
  go: characterTranslator['g'],
  have: characterTranslator['h'],
  just: characterTranslator['j'],
  knowledge: characterTranslator['k'],
  like: characterTranslator['l'],
  more: characterTranslator['m'],
  not: characterTranslator['n'],
  people: characterTranslator['p'],
  quite: characterTranslator['q'],
  rather: characterTranslator['r'],
  so: characterTranslator['s'],
  that: characterTranslator['t'],
  us: characterTranslator['u'],
  very: characterTranslator['v'],
  will: characterTranslator['w'],
  it: characterTranslator['x'],
  you: characterTranslator['y'],
  as: characterTranslator['z'],
  // strong
  child: groupTranslator['ch'],
  out: groupTranslator['ou'],
  shall: groupTranslator['sh'],
  still: groupTranslator['st'],
  this: groupTranslator['th'],
  which: groupTranslator['wh'],
  // lower wordsigns
  be: groupTranslator['be'],
  enough: groupTranslator['en'],
  in: groupTranslator['in'],
  his: [0b100110],
  were: groupTranslator['gg'],
  was: [0b110100],
  // shortforms
  about: [characterTranslator['a'][0], characterTranslator['b'][0]],
  above: [characterTranslator['a'][0], characterTranslator['b'][0], characterTranslator['v'][0]],
  according: [characterTranslator['a'][0], characterTranslator['c'][0]],
  across: [characterTranslator['a'][0], characterTranslator['c'][0], characterTranslator['r'][0]],
  after: [characterTranslator['a'][0], characterTranslator['f'][0]],
  afternoon: [characterTranslator['a'][0], characterTranslator['f'][0], characterTranslator['n'][0]],
  afterward: [characterTranslator['a'][0], characterTranslator['f'][0], characterTranslator['w'][0]],
  again: [characterTranslator['a'][0], characterTranslator['g'][0]],
  against: [characterTranslator['a'][0], characterTranslator['g'][0], groupTranslator['st'][0]],
  almost: [characterTranslator['a'][0], characterTranslator['l'][0], characterTranslator['m'][0]],
  already: [characterTranslator['a'][0], characterTranslator['l'][0], characterTranslator['r'][0]],
  also: [characterTranslator['a'][0], characterTranslator['l'][0]],
  although: [characterTranslator['a'][0], characterTranslator['l'][0], groupTranslator['th'][0]],
  altogether: [characterTranslator['a'][0], characterTranslator['l'][0], characterTranslator['t'][0]],
  always: [characterTranslator['a'][0], characterTranslator['l'][0], characterTranslator['w'][0]],
  because: [characterTranslator['b'][0], characterTranslator['c'][0]],
  before: [characterTranslator['b'][0], characterTranslator['f'][0]],
  behind: [characterTranslator['b'][0], characterTranslator['h'][0]],
  below: [characterTranslator['b'][0], characterTranslator['l'][0]],
  beneath: [characterTranslator['b'][0], characterTranslator['n'][0]],
  beside: [characterTranslator['b'][0], characterTranslator['s'][0]],
  between: [characterTranslator['b'][0], characterTranslator['t'][0]],
  beyond: [characterTranslator['b'][0], characterTranslator['y'][0]],
  blind: [characterTranslator['b'][0], characterTranslator['l'][0]],
  braille: [characterTranslator['b'][0], characterTranslator['r'][0], characterTranslator['l'][0]],
  children: [groupTranslator['ch'][0], characterTranslator['n'][0]],
  conceive: [groupTranslator['con'][0], characterTranslator['c'][0], characterTranslator['v'][0]],
  conceiving: [groupTranslator['con'][0], characterTranslator['c'][0], characterTranslator['v'][0], characterTranslator['g'][0]],
  could: [characterTranslator['c'][0], characterTranslator['d'][0]],
  deceive: [characterTranslator['d'][0], characterTranslator['c'][0], characterTranslator['v'][0]],
  deceiving: [characterTranslator['d'][0], characterTranslator['c'][0], characterTranslator['v'][0], characterTranslator['g'][0]],
  declare: [characterTranslator['d'][0], characterTranslator['c'][0], characterTranslator['l'][0]],
  declaring: [characterTranslator['d'][0], characterTranslator['c'][0], characterTranslator['l'][0], characterTranslator['g'][0]],
  either: [characterTranslator['e'][0], characterTranslator['i'][0]],
  first: [characterTranslator['f'][0], groupTranslator['st'][0]],
  friend: [characterTranslator['f'][0], characterTranslator['r'][0]],
  good: [characterTranslator['g'][0], characterTranslator['d'][0]],
  great: [characterTranslator['g'][0], characterTranslator['r'][0], characterTranslator['t'][0]],
  herself: [characterTranslator['h'][0], groupTranslator['er'][0], characterTranslator['f'][0]],
  him: [characterTranslator['h'][0], characterTranslator['m'][0]],
  himself: [characterTranslator['h'][0], characterTranslator['m'][0], characterTranslator['f'][0]],
  immediate: [characterTranslator['i'][0], characterTranslator['m'][0], characterTranslator['m'][0]],
  its: [characterTranslator['x'][0], characterTranslator['s'][0]],
  itself: [characterTranslator['x'][0], characterTranslator['f'][0]],
  letter: [characterTranslator['l'][0], characterTranslator['r'][0]],
  little: [characterTranslator['l'][0], characterTranslator['l'][0]],
  much: [characterTranslator['m'][0], groupTranslator['ch'][0]],
  must: [characterTranslator['m'][0], groupTranslator['st'][0]],
  myself: [characterTranslator['m'][0], characterTranslator['y'][0], characterTranslator['f'][0]],
  necessary: [characterTranslator['n'][0], characterTranslator['e'][0], characterTranslator['c'][0]],
  neither: [characterTranslator['n'][0], characterTranslator['e'][0], characterTranslator['i'][0]],
  oneself: [groupTranslator['one'][0], characterTranslator['f'][0]],
  ourselves: [groupTranslator['ou'][0], characterTranslator['r'][0], characterTranslator['v'][0], characterTranslator['s'][0]],
  paid: [characterTranslator['p'][0], characterTranslator['d'][0]],
  perceive: [characterTranslator['p'][0], groupTranslator['er'][0], characterTranslator['c'][0], characterTranslator['v'][0]],
  perceiving: [characterTranslator['p'][0], groupTranslator['er'][0], characterTranslator['c'][0], characterTranslator['v'][0], characterTranslator['g'][0]],
  perhaps: [characterTranslator['p'][0], groupTranslator['er'][0], characterTranslator['h'][0]],
  quick: [characterTranslator['q'][0], characterTranslator['k'][0]],
  receive: [characterTranslator['r'][0], characterTranslator['c'][0], characterTranslator['v'][0]],
  receiving: [characterTranslator['r'][0], characterTranslator['c'][0], characterTranslator['v'][0], characterTranslator['g'][0]],
  rejoice: [characterTranslator['r'][0], characterTranslator['j'][0], characterTranslator['c'][0]],
  rejoicing: [characterTranslator['r'][0], characterTranslator['j'][0], characterTranslator['c'][0], characterTranslator['g'][0]],
  said: [characterTranslator['s'][0], characterTranslator['d'][0]],
  should: [groupTranslator['sh'][0], characterTranslator['d'][0]],
  such: [characterTranslator['s'][0], groupTranslator['ch'][0]],
  themselves: [groupTranslator['the'][0], characterTranslator['m'][0], characterTranslator['v'][0], characterTranslator['s'][0]],
  thyself: [groupTranslator['th'][0], characterTranslator['y'][0], characterTranslator['f'][0]],
  today: [characterTranslator['t'][0], characterTranslator['d'][0]],
  together: [characterTranslator['t'][0], characterTranslator['g'][0], characterTranslator['r'][0]],
  tomorrow: [characterTranslator['t'][0], characterTranslator['m'][0]],
  tonight: [characterTranslator['t'][0], characterTranslator['n'][0]],
  would: [characterTranslator['w'][0], characterTranslator['d'][0]],
  your: [characterTranslator['y'][0], characterTranslator['r'][0]],
  yourself: [characterTranslator['y'][0], characterTranslator['r'][0], characterTranslator['f'][0]],
  yourselves: [characterTranslator['y'][0], characterTranslator['r'][0], characterTranslator['v'][0], characterTranslator['s'][0]],
}



var isInRange = function(character, bottom, top) {
  return bottom <= character && character <= top;
}

var countRangeWithMax = function(text, bottom, top, max) {
  var count = 0;
  for (var i = 0; i < text.length; i++) {
    var character = text[i];
    if (isInRange(character, bottom, top)) {
      if (++count == max) {
        return count;
      }
    }
  }
  return count;
}

var numToBraille = function(number) {
  return String.fromCharCode(unicodeBase + number);
};

var formatBrailleElement = function(numbers, eng) {
  var braille = numbers.map(numToBraille).join('');
  switch (showOriginal) {
    case 'above':
      return `<ruby>${braille}<rt>${eng}</rt></ruby>`;
    case 'hover':
      return `<span title="${eng}">${braille}</span>`;
    default:
      return braille;
  }
}

var toBrailleWord = function(word) {
  var result = [];
  var allCaps = false;

  // is the whole word uppercase and contains at least 2 upper case letters?
  if (word == word.toUpperCase() && countRangeWithMax(word, 'A', 'Z', 2) >= 2) {
    result.push(numToBraille(capitalFollows));
    result.push(numToBraille(capitalFollows));
    allCaps = true;
  }

  var numberMode = false;

  if (
    wordTranslator[word.toLowerCase()]
    && (
      contractedMultiple || (contractedSingle && wordTranslator[word.toLowerCase()].length === 1)
    )
  ) {
    // replace whole word
    if (!allCaps && isInRange(word[0], 'A', 'Z')) {
      result.push(numToBraille(capitalFollows));
    }
    result.push(formatBrailleElement(wordTranslator[word.toLowerCase()], word));
  } else {
    // loop through the word
    for (var i = 0; i < word.length; i++) {
      var character = word[i];

      // check to see if we should be in number mode or letter mode
      if (isInRange(character, '0', '9')) {
        if (!numberMode) {
          // when switching to number mode, output the number follows character
          result.push(numToBraille(numberFollows));
          numberMode = true;
        }
      } else if (isInRange(character, 'a', 'z') || isInRange(character, 'A', 'Z')) {
        if (numberMode) {
          // when switching out of number mode, output the letter indicator character
          result.push(numToBraille(letterIndicator));
          numberMode = false;
        }
      }

      // if the character is uppercase, mark it as a capital letter
      if (!allCaps && isInRange(character, 'A', 'Z')) {
        result.push(numToBraille(capitalFollows));
      }

      if (contractedSingle || contractedMultiple) {
        let contracted = false;
        let j = word.length;
        while (i < j - 1) {
          let segment = word.slice(i, j);
          let groupsign = groupTranslator[segment.toLowerCase()];
          if (groupsign && (contractedMultiple || groupsign.length === 1)) {
            contracted = true;
            result.push(formatBrailleElement(groupsign, segment));
            i = j - 1;
            break;
          }
          j--; // move from end of word to current character
        }
        if (contracted) {
          continue;
        }
      }

      // check for diacritics
      var [ch, d] = Array.from(character.normalize('NFD'));
      if (d && characterTranslator[ch.toLowerCase()] && diacriticTranslator[d]) {
        var translation = diacriticTranslator[d].concat(characterTranslator[ch.toLowerCase()]);
        result.push(formatBrailleElement(translation, character));
      } else {
        // get the translation, and add it to the result
        // if no translation, use unmodified character
        var translation = characterTranslator[character.toLowerCase()];
        result.push(translation ? formatBrailleElement(translation, character) : character);
      }

    }
  }

  return result.join('');
};

var toBraille = function(text) {
  // convert each word individually
  return text.split(/(\s+)/).map(function(word) {
    if (word.match(/\S/)) {
      return toBrailleWord(word);
    }
    return (!showOriginal || showOriginal === 'none') ? '\u2002' : '&ensp;'; // larger space for better readability
  }).join('');
};

var translateAll = function() {
  var n,
      textNodes = [],
      walk = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return !['SCRIPT','STYLE'].includes(node.parentNode.tagName) && node.textContent.trim().length > 0;
          },
        },
      );
  while (n = walk.nextNode()) textNodes.push(n);
  textNodes.forEach(textNode => {
    if (!showOriginal || showOriginal == 'none') {
      textNode.textContent = toBraille(textNode.textContent);
    } else {
      const fragment = document.createRange().createContextualFragment(toBraille(textNode.textContent));
      textNode.replaceWith(fragment);
    }
  });
};

chrome.storage.local.get(['brailleTranslate']).then((result) => {
  if (result.brailleTranslate) {
    chrome.storage.sync.get(['brailleOriginal', 'brailleContractedSingle', 'brailleContractedMultiple'], (res) => {
      showOriginal = res.brailleOriginal;
      contractedSingle = res.brailleContractedSingle;
      contractedMultiple = res.brailleContractedMultiple;
      translateAll();
      // Don't translate next page load, only current tab after button click & reload.
      chrome.storage.local.remove('brailleTranslate');
    });
  }
});


