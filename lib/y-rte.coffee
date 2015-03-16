class Word
  @word = ''
  @selections = []
  constructor: (@word) ->
  removeSel: (selToRemove) ->
    @selections.forEach sel, index, array ->
      if sel.equals(selToRemove)
        array.splice(index, 1)



class Selection
  constructor: (a, b, c, d, e)->
    if a? and b? and c? and d?
      if !( typeof a is "number" and
            typeof b is "number" and
            typeof c is "number" and
            typeof d is "number")
        throw new Error "Expecting numbers as arguments"
      @startPos = {word: a, pos: b}
      @endPos = {word: c, pos: d}

      style = e

    else if a? and b? and c?
      if !( typeof a is "number" and
            typeof b is "number")
        throw new Error "Expecting numbers as arguments"
      c.constructor is "Rte"

      [@startPos, @endPos] = @_relativeFromAbsolute(a, b, c)
      style = d

    else if a? and b? and a.pos? and a.word? and b.pos? and b.word?
      @startPos = a
      @endPos = b

      style = c

    else throw new Error "Wrong set of parameters #{[a, b, c, d, e]}"

    if style?
      @style = style

    @startPos.lt = @endPos.lt = (s) ->
      @word < s.word or (@word == s.word and @pos <= s.pos)

    @startPos.gt = @endPos.gt = (s) ->
      @word > s.word or (@word == s.word and @pos >= s.pos)

  relativeFromAbsolute: (untilStart, untilEnd, rte)->
    # Convert absolute coordinates to relatives
    spw = spp = epw = epp = 0

    words = rte._rte.words
    for i in [0..words.length-1]
      l = rte.getWord(i).length
      if l >= untilStart
        spp = untilStart
        untilStart = 0
      else
        spw += 1
        untilStart -= l

      if l >= untilEnd
        # throw new Error(untilEnd)
        epp = untilEnd
        untilEnd = 0
      else
        epw += 1
        untilEnd -= l
      if untilStart == untilEnd == 0
        break

    [{word: spw, pos: spp}, {word: epw, pos: epp}]

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  equals: (s)->
    @startPos.word == s.startPos.word and
    @startPos.pos == s.startPos.pos and
    @endPos.word == s.endPos.word and
    @endPos.pos == s.endPos.pos

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  notEquals: (s) ->
    not equals(s)

  # Returns true if the given selection is in the current selection
  #
  # @param [Selection] s the selection to compare to this
  #
  in: (s) ->
    @startPos.lt(s) and @endPos.gt(s)

  contains: (s) ->
    s.in(@)

  overlaps: (s) ->
    @startPos.lt(s.endPos) or @endPos.gt(s.startPos)

  #TODO
  setStyle: (@style) ->

  clone: ->
    new Selection(@startPos, @endPos)

  isValid: ->
    @startPos.lt(@endPos)


  # Try to merge this selection with the one given in argument
  #
  merge: (s, rte) ->
    # Check if their contiguous
    if s.endPos.word == @startPos.word or
       (s.endPos.word == @startPos.word -1 and
        s.endPos.loc == rte.getWord(s.endPos.word).length() and
        @startPos.loc == 0)
      # boundaries of new selection
      start = s.startPos
      end = @endPos
      # remove link of middle words to selection
      rte.getWord(s.endPos.word).removeSel(s)
      rte.getWord(@startPos.word).removeSel(@)
    else if @endPos.word == s.startPos.word or
       (@endPos.word == s.startPos.word -1 and
        @endPos.loc == rte.getWord(@endPos.word).length() and
        s.startPos.loc == 0)
      start = @startPos
      end = s.endPos
      rte.getWord(@endPos.word).removeSel(@)
      rte.getWord(s.endPos.word).removeSel(s)
    else
      return

    nSelec = new Selection start, end, s.style
    rte.getWord()


# Class describing the Rich Text Editor type
#
class Rte
  # @property [Options] _rte the RTE object
  # @param [String] content the initial content to set
  # @option _rte [Array<Selection>] selections array containing all the current selections
  # @option _rte [Array<String>] words array containing all the words of the text
  #
  constructor: (content = '')->
    if content.constructor isnt String
      throw new Error "Only accepts strings."
    @_rte = {}
    @_rte.styles = []
    @_rte.selections = []
    @_rte.cursorInformation = {}
    @_rte.words = []
    @push(content)

  _name: "Rich Text Editor"

  val: (content)->
    if content?
      # reset styles when replacing content
      @_rte.words = []
      @_rte.style = []
      @push(content)
    else
      # TODO: support breaks (br, new paragraph, …)
      (e.word for e in @_rte.words).join(' ')

  # Split the content around ' ' and append all the words created to the object
  #
  getWord: (index) ->
    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds"
    @_rte.words[index].word

  getWords: (begin, end) ->
    if not end?
      end = @_rte.words.length
    out = wObj for wObj in @_rte.words[begin..end]

  setWord: (index, content="") ->
    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds"
    @_rte.words[index].word = content

  push: (content) ->
    for w in content.split(' ')
      wObj = new Word(w)

      @_rte.words.push(wObj)


  insertWords: (position, words)->
    # TODO: update selections
    if typeof position isnt "number"
      throw new Error 'Expected a number as first parameter'
    if words.constructor isnt Array
      throw new Error 'Expected a string array as second parameter'
    if 0 <= position <= @_rte.words.length
      if position == 0
        before = []
      else
        before = @getWords(0, position-1)
      wordsObj = (new Word w for w in words)
      after = @getWords(position)
      @_rte.words = before.concat(wordsObj).concat(after)

    else
      throw new Error 'Index #{position} out of bound in word list'

  # insert l words at pos wNum
  updateInsertWords: (wNum, n)->
    # TODO: check that we don't get negative positions
    if typeof wNum isnt "number"
      throw new Error "Expected a number as first parameter"
    if typeof n isnt "number"
      throw new Error "Expected a number as second parameter"

    for pt in @_rte.selections when pt.endPos.word >= wNum
      if pt.startPos.word >= wNum
        pt.startPos.word += n
      pt.endPos.word += n

  # insert n caracters in word wNum at position pos
  updateInsert: (wNum, pos, n)->
    # TODO: check that we don't get negative positions
    if typeof wNum isnt "number"
      throw new Error "Expected a number as first parameter"
    if typeof pos isnt "number"
      throw new Error "Expected a number as second parameter"
    if typeof n isnt "number"
      throw new Error "Expected a number as third parameter"

    for pt in @_rte.selections
      if pt.startPos.word == wNum and pt.startPos.pos >= pos
        pt.startPos.pos += n
      if pt.endPos.word == wNum and pt.endPos.pos >= pos
        pt.endPos.pos += n


  deleteWords: (start, end) ->
    if not end?
      end = start+1

    if start <= end
      if start - 1 < 0
        before = []
      else
        before = @getWords(0, start-1)

      @_rte.words = before.concat(@getWords(end))
    @_rte.words

  merge: (n) ->
    if 0 <= n < @_rte.words.length
      w = @getWord(n)
      @deleteWords(n)
      @insert({startPos: {word: n, pos:0}}, w)
    else
      throw new Error "Impossible to merge"

  deleteSel: (sel) ->
    if not sel.isValid()
      throw new Error "Invalid selection"
    if not 0 <= sel.startPos.loc <= @getWord(sel.startPos.word).length
      throw new Error "Invalid selection"
    if not 0 <= sel.endPos.loc <= @getWord(sel.endPos.word).length
      throw new Error "Invalid selection"

    s = sel.startPos.word
    e = sel.endPos.word

    newLeft = @getWord(s).substring(0, sel.startPos.pos)
    newRight = @getWord(e).substring(sel.endPos.pos)

    if s == e
      @setWord(s, newLeft + newRight)

      # delete the words in between
      @deleteWords(s+1, e)
    else
      @setWord(s, newLeft)
      @setWord(e, newRight)

      # delete the words in between
      @deleteWords(s+1, e)
      # merge
      @merge(s)



  insert: (sel, content)->
    if not sel.startPos?
      throw new Error "Expected a location object as first argument"
    if typeof content isnt "string"
      throw new Error "Expected a string as second argument"

    #TODO: check boundaries
    n = sel.startPos.word
    pos = sel.startPos.pos
    word = @getWord(n)
    @setWord(n, word.substring(0, pos) + content + word.substring(pos))

  # relative jump from position
  _jump: (position, relJump) ->
    word = position.word
    pos = position.pos

    if jump < 0
      jump = Math.abs(jump)
      while jump > 0
        if pos < jump
          word -= 1
          jump -= pos
          pos = @getWord(word).length - 1

          if word < 0
            return null
        else
          pos -= jump
    else if jump > 0
      while jump > 0
        delta = pos + jump - @_rte.word[word].length + 1
        if delta > 0
          word += 1
          jump -= delta
          pos = 0

          if word >= @_rte.words.length
            return null
        else
          pos += jump
    else
      word = word
      pos = pos
    {word: word, pos: pos}

  # Set the style of the selection and try to extend as much
  # as possible existing ones
  #
  setStyle: (selection, style)->
    if not thisSel.isValid()
      throw new Error "Invalid selection"

    # Try to merge with previous / next contiguous selection
    {prevWord, position} = @_jump(s.startPos, -1)
    {nextWord, position} = @_jump(s.endPos,   +1)
    for s in prevWord.selections when selection.style == s.style
      s.merge selection, @
    for s in nextWord.selections when selection.style == s.style
      s.merge selection, @

  # Apply a delta to the object
  # @see http://quilljs.com/docs/deltas/
  #
  delta: (deltas) ->
    position = 0
    for delta in deltas.ops
      if delta.retain?
        selection = new Selection position (position+=delta.retain)
      else if delta.delete?
        selection = new Selection position (position+=delta.retain)
        @delete(selection)
      else if delta.insert?
        selection = new Selection position (position+=delta.insert.length)
        @insert(selection, delta.insert)

      if delta.attributes?
        for attr in delta.attributes
          @setAttr(selection.clone().style = attr)

if window?
  window.Rte = Rte
  window.Selection = Selection

if module?
  module.exports = [Rte, Selection]
