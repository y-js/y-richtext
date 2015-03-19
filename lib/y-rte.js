var PostSpacesRegExp, PreSpacesRegExp, Rte, Selection, Word, WordRegExp, _;

_ = require('underscore');

WordRegExp = /\S+\s*/g;

PreSpacesRegExp = /^\s+/;

PostSpacesRegExp = /\s+$/;

Word = (function() {
  Word.word = '';

  Word.left = [];

  Word.right = [];

  function Word(word1) {
    this.word = word1;
  }

  Word.prototype.removeSel = function(selToRemove) {
    return this.selections.forEach(sel, index, array(function() {
      if (sel.equals(selToRemove)) {
        return array.splice(index, 1);
      }
    }));
  };

  return Word;

})();

Selection = (function() {
  Selection.left = null;

  Selection.right = null;

  function Selection(start, end, rte, style) {
    if (!_.isUndefined(start) && !_.isUndefined(end) && !_.isUndefined(rte)) {
      if (!(_.isNumber(start) && _.isNumber(end))) {
        throw new Error("Expecting numbers as arguments");
      }
      if (!(rte.constructor !== "Rte")) {
        throw new Error("Expecting an rte as third argument");
      }
      this.startPos = this._relativeFromAbsolute(start, rte);
      this.endPos = this._relativeFromAbsolute(end, rte);
      this.style = style;
      this.left = rte.getWord(this.startPos.word);
      this.right = rte.getWord(this.endPos.word);
    } else {
      throw new Error("Wrong set of parameters " + [start, end, rte, style]);
    }
    if (attr != null) {
      this.attr = attr;
    }
    this.startPos.lt = this.endPos.lt = function(s) {
      return this.word < s.word || (this.word === s.word && this.pos <= s.pos);
    };
    this.startPos.gt = this.endPos.gt = function(s) {
      return this.word > s.word || (this.word === s.word && this.pos >= s.pos);
    };
  }

  Selection.prototype.relativeFromAbsolute = function(untilStart, untilEnd, rte) {
    var epp, epw, i, j, l, ref, spp, spw, words;
    spw = spp = epw = epp = 0;
    words = rte._rte.words;
    for (i = j = 0, ref = words.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      l = words[i].length;
      if (l >= untilStart) {
        spp = untilStart;
        untilStart = 0;
      } else {
        spw += 1;
        untilStart -= l;
      }
      if (l >= untilEnd) {
        epp = untilEnd;
        untilEnd = 0;
      } else {
        epw += 1;
        untilEnd -= l;
      }
      if ((untilStart === untilEnd && untilEnd === 0)) {
        break;
      }
    }
    return [
      {
        word: spw,
        pos: spp
      }, {
        word: epw,
        pos: epp
      }
    ];
  };

  Selection.prototype.equals = function(s) {
    return this.startPos.word === s.startPos.word && this.startPos.pos === s.startPos.pos && this.endPos.word === s.endPos.word && this.endPos.pos === s.endPos.pos;
  };

  Selection.prototype["in"] = function(s) {
    return this.startPos.lt(s) && this.endPos.gt(s);
  };

  Selection.prototype.contains = function(s) {
    return s["in"](this);
  };

  Selection.prototype.overlaps = function(s) {
    return this.startPos.lt(s.endPos) || this.endPos.gt(s.startPos);
  };

  Selection.prototype.setAttr = function(attr1) {
    this.attr = attr1;
  };

  Selection.prototype.isValid = function() {
    return this.startPos.lt(this.endPos);
  };

  return Selection;

})();

Rte = (function() {
  function Rte(content) {
    if (content == null) {
      content = '';
    }
    if (content.constructor === String) {
      this._rte = {};
      this._rte.align = 'left';
      this._rte.style = [];
      this._rte.selections = [];
      this._rte.cursorInformation = {};
      this._rte.words = [];
      this.push(content);
    } else {
      throw new Error("Only accepts strings.");
    }
  }

  Rte.prototype._name = "Rich Text Editor";

  Rte.prototype.val = function(content) {
    var e;
    if (content != null) {
      this._rte.words = [];
      this._rte.style = [];
      return this.push(content);
    } else {
      return ((function() {
        var j, len, ref, results;
        ref = this._rte.words;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          e = ref[j];
          results.push(e);
        }
        return results;
      }).call(this)).join(' ');
    }
  };

  Rte.prototype.push = function(content) {
    var j, len, ref, results, w;
    ref = content.split(' ');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      w = ref[j];
      results.push(this._rte.words.push(w));
    }
    return results;
  };

  Rte.prototype.insertWords = function(position, words) {
    var after, before;
    if (typeof position !== "number") {
      throw new Error('Expected a number as first parameter');
    }
    if (words.constructor !== Array) {
      throw new Error('Expected a string array as second parameter');
    }
    if ((0 <= position && position <= this._rte.words.length)) {
      if (position === 0) {
        before = [];
      } else {
        before = this._rte.words.slice(0, +(position - 1) + 1 || 9e9);
      }
      after = this._rte.words.slice(position);
      this._rte.words = before.concat(words).concat(after);
      return this.updateInsertWords(position, words.length);
    } else {
      throw new Error('Index #{position} out of bound in word list');
    }
  };

  Rte.prototype.updateInsertWords = function(wNum, n) {
    var j, len, pt, ref, results;
    if (typeof wNum !== "number") {
      throw new Error("Expected a number as first parameter");
    }
    if (typeof n !== "number") {
      throw new Error("Expected a number as second parameter");
    }
    ref = this._rte.selections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      pt = ref[j];
      if (!(pt.endPos.word >= wNum)) {
        continue;
      }
      if (pt.startPos.word >= wNum) {
        pt.startPos.word += n;
      }
      results.push(pt.endPos.word += n);
    }
    return results;
  };

  Rte.prototype.updateInsert = function(wNum, pos, n) {
    var j, len, pt, ref, results;
    if (typeof wNum !== "number") {
      throw new Error("Expected a number as first parameter");
    }
    if (typeof pos !== "number") {
      throw new Error("Expected a number as second parameter");
    }
    if (typeof n !== "number") {
      throw new Error("Expected a number as third parameter");
    }
    ref = this._rte.selections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      pt = ref[j];
      if (pt.startPos.word === wNum && pt.startPos.pos >= pos) {
        pt.startPos.pos += n;
      }
      if (pt.endPos.word === wNum && pt.endPos.pos >= pos) {
        results.push(pt.endPos.pos += n);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Rte.prototype.deleteWords = function(start, end) {
    var before;
    if (end == null) {
      end = start + 1;
    }
    if (start <= end) {
      if (start - 1 < 0) {
        before = [];
      } else {
        before = this._rte.words.slice(0, +(start - 1) + 1 || 9e9);
      }
      this._rte.words = before.concat(this._rte.words.slice(end));
    }
    return this._rte.words;
  };

  Rte.prototype.merge = function(n) {
    var w;
    if ((0 <= n && n < this._rte.words.length)) {
      w = this._rte.words[n];
      this.deleteWords(n);
      return this.insert({
        startPos: {
          word: n,
          pos: 0
        }
      }, w);
    } else {
      throw new Error("Impossible to merge");
    }
  };

  Rte.prototype.deleteSel = function(sel) {
    var e, newLeft, newRight, ref, ref1, s;
    if (!sel.isValid()) {
      throw new Error("Invalid selection");
    }
    if ((!0 <= (ref = sel.startPos.loc) && ref <= this._rte.words[sel.startPos.word].length)) {
      throw new Error("Invalid selection");
    }
    if ((!0 <= (ref1 = sel.endPos.loc) && ref1 <= this._rte.words[sel.endPos.word].length)) {
      throw new Error("Invalid selection");
    }
    s = sel.startPos.word;
    e = sel.endPos.word;
    newLeft = this._rte.words[s].substring(0, sel.startPos.pos);
    newRight = this._rte.words[e].substring(sel.endPos.pos);
    if (s === e) {
      this._rte.words[s] = newLeft + newRight;
      return this.deleteWords(s + 1, e);
    } else {
      this._rte.words[s] = newLeft;
      this._rte.words[e] = newRight;
      this.deleteWords(s + 1, e);
      return this.merge(s);
    }
  };

  Rte.prototype.insert = function(sel, content) {
    var n, pos, word;
    if (sel.startPos == null) {
      throw new Error("Expected a location object as first argument");
    }
    if (typeof content !== "string") {
      throw new Error("Expected a string as second argument");
    }
    n = sel.startPos.word;
    pos = sel.startPos.pos;
    word = this._rte.words[n];
    return this._rte.words[n] = word.substring(0, pos) + content + word.substring(pos);
  };

  Rte.prototype._jump = function(position, relJump) {
    var delta, jump, pos, word;
    word = position.word;
    pos = position.pos;
    if (jump < 0) {
      jump = Math.abs(jump);
      while (jump > 0) {
        if (pos < jump) {
          word -= 1;
          jump -= pos;
          pos = this._rte.words[word].length - 1;
          if (word < 0) {
            return null;
          }
        } else {
          pos -= jump;
        }
      }
    } else if (jump > 0) {
      while (jump > 0) {
        delta = pos + jump - this._rte.word[word].length + 1;
        if (delta > 0) {
          word += 1;
          jump -= delta;
          pos = 0;
          if (word >= this._rte.words.length) {
            return null;
          }
        } else {
          pos += jump;
        }
      }
    } else {
      word = word;
      pos = pos;
    }
    return {
      word: word,
      pos: pos
    };
  };

  Rte.prototype._getSel = function(location, rightOrLeft) {
    var j, k, len, len1, ret, sel, selList;
    ret = [];
    if (rightOrLeft === 'right') {
      selList = this._rte.words[location.word].refRight;
      for (j = 0, len = selList.length; j < len; j++) {
        sel = selList[j];
        if (sel.endPos.pos === location.pos) {
          ret.push(sel);
        }
      }
    } else if (rightOrLeft === 'left') {
      selList = this._rte.words[location.word].refLeft;
      for (k = 0, len1 = selList.length; k < len1; k++) {
        sel = selList[k];
        if (sel.startPos.pos === location.pos) {
          ret.push(sel);
        }
      }
    } else {
      throw new Error("Error in second argument of _getSel");
    }
    return ret;
  };

  Rte.prototype.setAttr = function(thisSel) {
    var doLeft, doRight, leftPos, rightPos, s, w;
    if (!thisSel.isValid()) {
      throw new Error("Invalid selection");
    }
    leftPos = _jump(thisSel.startPos, -1.);
    if (leftPos !== null) {
      w = this._rte.words[leftPos.word];
      doLeft = true;
      while (s = w.refRight.pop()) {
        if (s.type === thisSel.type && s.endPos.pos === leftPos.pos) {
          doLeft = false;
        } else {
          w.push(s);
        }
      }
      if (doLeft) {
        this._rte.words[thisSel.startPos.word].refLeft.push(thisSel);
      }
    }
    rightPos = _jump(thisSel.startPos, 1);
    if (rightPos !== null) {
      w = this._rte.words[rightPos.word];
      doRight = true;
      while (s = w.refRight.pop()) {
        if (s.type === thisSel.type && s.startPos.pos === rightPos.pos) {
          doRight = false;
        } else {
          w.push(s);
        }
      }
      if (doRight) {
        return this._rte.words[rightPos.left].refRight.push(thisSel);
      }
    }
  };

  Rte.prototype.apply = function(deltas) {
    var attr, delta, j, len, position, ref, results, selection;
    position = 0;
    ref = deltas.ops;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      delta = ref[j];
      if (delta.retain != null) {
        selection = new Selection(position((position += delta.retain)));
      } else if (delta["delete"] != null) {
        selection = new Selection(position((position += delta.retain)));
        this["delete"](selection);
      } else if (delta.insert != null) {
        selection = new Selection(position((position += delta.insert.length)));
        this.insert(selection, delta.insert);
      }
      if (delta.attributes != null) {
        results.push((function() {
          var k, len1, ref1, results1;
          ref1 = delta.attributes;
          results1 = [];
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            attr = ref1[k];
            results1.push(this.setAttr(selection.clone().attr = attr));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Rte;

})();

if (typeof window !== "undefined" && window !== null) {
  window.Rte = Rte;
  window.Selection = Selection;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = [Rte, Selection];
}
