buildWord = (word, prepend='', append='') ->
  tmp = word.split ' '
  tmp2 = []

  if tmp.length == 1
    tmp2.push (new Word (prepend+tmp.pop()+append))
  else
    tmp2.push (new Word (prepend+tmp.pop(0)))
    while tmp.length > 1
      tmp2.push (new Word (tmp.pop(0) + ' '))

    tmp2.push (new Word (tmp.pop() + append + ' '))

  tmp2.reverse()

# Simple class that contains a word and links to the selections pointing
# to it
class Word
  @word = ''
  @selections = []

  # Construct a new list of words
  # @param [String] word The initial string value
  # @return [Word] a word instance
  constructor: (@word) ->
  removeSel: (selToRemove) ->
    @selections.forEach sel, index, array ->
      if sel.equals(selToRemove)
        array.splice(index, 1)


class Selection
  # Construct a new selection
  #
  # @overload constructor(startAtN, startAtPosition, endAtN, endAtPosition, [style])
  #   Construct a new selection using the position in a word for start and end
  #   positions
  #   @param [Integer] startAtN position of the first word of selection
  #   @param [Integer] startAtPosition position in this first word
  #   @param [Integer] endAtN position of the last word of selection
  #   @param [Integer] endAtPosition position in this last word
  #   @option options [Object] style the style of the selection
  #
  # @overload constructor(start, end, rte, [style])
  #   Construct a new selection using the index of the first and last character.
  #   Retrieves the position in (word, position) using an instance of rte
  #   @param [Integer] start index of the first character
  #   @param [Integer] end index of the last character
  #   @param [Rte] rte a rich-text editor (Rte) instance
  #   @option options [Object] style the style of the selection
  #
  # @overload constructor(startPos, endPos, [style])
  #   Construct a new selection using two position objects
  #   @param [Object] startPos the position of the start
  #   @option startPos [Integer] word first word of selection
  #   @option startPos [Integer] pos position in first word of selection
  #   @param [Object] endPos the position of the end
  #   @option endPos [Integer] word last word of selection
  #   @option endPos [Integer] pos position in last word of selection
  #   @option options [Object] style the style of the selection
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
      attr = d

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

  # Convert indexes from beginning of text to coordinates expressed in word and
  # position within word
  #
  # @param [Integer] untilStart index from first character
  # @param [Integer] untilEnd index from first character
  # @param [Rte] rte a rich text editor instance
  _relativeFromAbsolute: (untilStart, untilEnd, rte)->
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

  # Compares the bounds of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  equals: (s)->
    @startPos.word == s.startPos.word and
    @startPos.pos == s.startPos.pos and
    @endPos.word == s.endPos.word and
    @endPos.pos == s.endPos.pos

  # Returns true if the given selection is in the current selection
  #
  # @param [Selection] s the selection to compare to this
  #
  in: (s) ->
    @startPos.lt(s) and @endPos.gt(s)

  # Returns true if the current selection is in the given selection
  #
  # @param [Selection] s the selection to compare to this
  #
  contains: (s) ->
    s.in(@)

  # Returns true if the given selection overlaps the current selection
  #
  # @param [Selection] s the selection to compare to this
  #
  overlaps: (s) ->
    @startPos.lt(s.endPos) or @endPos.gt(s.startPos)

  #TODO
  setAttr: (@attr) ->

  # Create a copy of the selection
  #
  clone: ->
    new Selection(@startPos, @endPos, @style)

  # Validate a selection if the start is before the end of the selection
  #
  isValid: ->
    @startPos.lt(@endPos)


# Class describing the Rich Text Editor type
#
class Rte
  # @property [Options] _rte the RTE object
  # @param [String] content the initial content to set
  # @option _rte [Array<Selection>] selections array containing all the current selections
  # @option _rte [Array<String>] words array containing all the words of the text
  #
  constructor: (content = '')->
    if content.constructor is String
      @_rte = {}
      @_rte.styles = []
      @_rte.selections = []
      @_rte.cursorInformation = {}
      @_rte.words = []
      @push(content)
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

  # _getModel:
  # _setModel:
  # observe:
  # unobserve:

  # @overload val()
  #   Return a string representation of the object
  #
  # @overload val(content)
  #   Set the value of the object to content
  #   @param [String] content the initial content to set
  #
  val: (content)->
    if content?
      # reset styles when replacing content
      @_rte.words = []
      @_rte.style = []
      @_push(content)
    else
      # TODO: support breaks (br, new paragraph, …)
      (e.word for e in @_rte.words).join('')

  # Returns the string representation of a word.
  # @param index [Integer] the index of the word to return
  getWord: (index) ->
    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds"
    i = j = 0                   # i : index in array, j : index of word
    while j < index
      if (@_rte.words[i].word isnt '' and @_rte.words[i] isnt ' ')
        j += 1
      i += 1
    @_rte.words[i].word

  getWords: (begin, end) ->
    if not end?
      end = @_rte.words.length
    if not (0 <= begin <= end <= @_rte.words.length)
      throw new Error "Index out of bounds: #{[begin, end]}"

    ret = @_rte.words[begin..end]
    if ret?
      ret
    else
      []

  # Set the content of a word
  # @param index [Integer] the index of the word to modify
  # @param content [String] the content to set the word to
  setWord: (index, content) ->
    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds"
    @_rte.words[index].word = content

  # Split the content around ' ' and append all the words created to the object
  #
  _push: (content) ->
    for w in content.split(' ')
      @_rte.words.push(w)

  # Insert words at position
  #
  # @param [Integer] position the position where to insert words
  # @param [Array<String>] words the words to insert at position
  #
  insertWords: (position, words)->
    # TODO: update selections
    if typeof position isnt "number"
      throw new Error 'Expected a number as first parameter'
    if words.constructor isnt Array
      throw new Error 'Expected a string array as second parameter'
    if 0 <= position <= @_rte.words.length
      after = [new Word ' '].concat(@getWords(position))
      before = @getWords(0, Math.max(position-1, 0)).append(new Word ' ')
      if position == 0
        before = []
      else
        before = @_rte.words[..position-1]
      after = @_rte.words[position..]
      @_rte.words = before.concat(words).concat(after)
      # @updateInsertWords(position, words.length)
    else
      throw new Error 'Index #{position} out of bound in word list'

  # insert l words at pos wNum
  #
  updateInsertWords: (wNum, n)->
    # TODO

  # insert n caracters in word wNum at position pos
  #
  updateInsert: (wNum, pos, n)->
    # TODO


  # Delete all the words between start and end
  #
  # @param [Integer] start position of first word to delete
  # @param [Integer] end position of last word to delete
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

  # Merge two words at position
  #
  # @param [Integer] n position of word where to perform merge. The merge will be done with the word at right (if any)
  #
  merge: (n) ->
    if 0 <= n < @_rte.words.length
      w = @getWord(n).trimRight()
      @deleteWords(n)
      @insert({startPos: {word: n, pos:0}}, w)
    else
      throw new Error "Impossible to merge"

  # Delete a selection
  #
  # @param [Selection] sel the selection to delete
  #
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

  # Insert text at position
  #
  # @param [Option] position The position where to insert text
  # @param [String] content the content to insert
  #
  insert: (sel, content)->
    if not sel.startPos?
      throw new Error "Expected a location object as first argument"
    if typeof content isnt "string"
      throw new Error "Expected a string as second argument"

    n = sel.startPos.word
    pos = sel.startPos.pos
    word = @getWord(n)
    @setWord(n, word.substring(0, pos) + content + word.substring(pos))

  # Relative jump from position
  #
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

  # get all selections with right (or left end) at location
  _getSel: (location, rightOrLeft) ->
    ret = []
    if rightOrLeft == 'right'
      selList = @_rte.words[location.word].refRight
      for sel in selList
        if sel.endPos.pos == location.pos
          ret.push(sel)

    else if rightOrLeft == 'left'
      selList = @_rte.words[location.word].refLeft
      for sel in selList
        if sel.startPos.pos == location.pos
          ret.push(sel)

    else
      throw new Error "Error in second argument of _getSel"

    ret

  # Set the attribute to the selection and try to extend as much
  # as possible existing ones
  #
  setAttr: (thisSel)->
    if not thisSel.isValid()
      throw new Error "Invalid selection"

  # Apply a delta to the object
  # @see http://quilljs.com/docs/deltas/
  #
    position = 0
    for delta in deltas.ops
      if delta.retain?
        selection = new Selection position (position + delta.retain)
      else if delta.delete?
        selection = new Selection position (position + delta.retain)
        @delete(selection)
      else if delta.insert?
        end = position + delta.insert.length
        selection = new Selection position, end, @
        @insert(selection, delta.insert)
        position = end
      else
        throw new Error "Unknown operation"

      if delta.attributes?
        for attr in delta.attributes
          @setAttr(selection.clone().style = attr)

if window?
  window.Rte = Rte
  window.Selection = Selection
  window.buildWord = buildWord

if module?
  module.exports = [Rte, Selection]
