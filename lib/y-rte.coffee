_ = require 'underscore'

# XRegExp = require('xregexp').XRegExp
WordRegExp = /\S+\s*/g
PreSpacesRegExp = /^\s+/
PostSpacesRegExp = /\s+$/
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

# A class describing a selection with a style (bold, italic, …)
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
    if not _.isUndefined(a) and not _.isUndefined(b) and not _.isUndefined(c) and not _.isUndefined(d)
      if !( _.isNumber(a) and
            _.isNumber(b) and
            _.isNumber(c) and
            _.isNumber(d))
        throw new Error "Expecting numbers as arguments"
      @startPos = {word: a, pos: b}
      @endPos = {word: c, pos: d}

      style = e

    else if not _.isUndefined(a) and not _.isUndefined(b) and not _.isUndefined(c)
      if !( _.isNumber(a) and
            _.isNumber(b))
        throw new Error "Expecting numbers as arguments"
      c.constructor is "Rte"

      @startPos = @_relativeFromAbsolute a, c
      @endPos = @_relativeFromAbsolute b, c
      style = d

    else if not _.isUndefined(a) and not _.isUndefined(b) and
      a.pos? and a.word? and
       b.pos? and b.word?
      @startPos = a
      @endPos = b

      style = c

    else throw new Error "Wrong set of parameters #{[a, b, c, d, e]}"

    if not _.isUndefined(style)
      @style = style

    @startPos.lt = @endPos.lt = (s) ->
      @word < s.word or (@word == s.word and @pos <= s.pos)

    @startPos.gt = @endPos.gt = (s) ->
      @word > s.word or (@word == s.word and @pos >= s.pos)

  # Convert indexes from beginning of text to coordinates expressed in word and
  # position within word
  #
  # @param [Integer] position index of position to find
  # @param [Rte] rte a rich text editor instance
  _relativeFromAbsolute: (position, rte)->
    index = 0

    while position > 0
      if index >= rte._rte.words.length
        return {word: index, pos: 0}
      if rte._rte.words[index].word.length > position
        return {word: index, pos: position}
      else
        position -= rte._rte.words[index].word.length
        index += 1
    return {word: index, pos: position}

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
    if not _.isUndefined(content)
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
    if _.isUndefined(end)
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

  # Append new words at the end of the word list
  # @param [String] content the string to append
  push: (content) ->
    preSpaces = content.match PreSpacesRegExp
    if preSpaces isnt null
      @_rte.words.push(new Word (preSpaces[0]))
    words = content.match WordRegExp
    if _.isArray(words)
      for w in words
        @_rte.words.push (new Word w)

  # Insert words at position
  #
  # @param [Integer] position the position where to insert words
  # @param [Array<String>] words the words to insert at position
  #
  insertWords: (position, words)->
    # TODO: update selections
    if not _.isNumber position
      throw new Error "Expected a number as first parameter, got #{position}"
    if not _.isArray words
      throw new Error "Expected a string array as second parameter, got #{words}"
    if 0 <= position <= @_rte.words.length
      wordsObj = (new Word w for w in words)

      left = @_rte.words.slice(0, position)
      right = @_rte.words.slice(position)
      @_rte.words = left.concat(wordsObj).concat(right)

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


  # @overload deleteWords (start, end)
  # Delete all the words between start and end
  #
  # @param [Integer] start position of first word to delete
  # @param [Integer] end position of last word to delete
  #
  # @overload deleteWords (position)
  # Delete the word at position
  #
  # @param [Integer] position position the word to delete
  deleteWords: (start, end) ->
    if _.isUndefined(end)
      end = start+1

    if start <= end
      @_rte.words.splice(start, end-start)

  # Merge two words at position
  #
  # @param [Integer] n position of word where to perform merge. The merge will be done with the word at right (if any)
  #
  merge: (n) ->
    if 0 <= n < @_rte.words.length
      w = @getWord(n).trimRight()
      @deleteWords n
      @insert {startPos: {word: n, pos:0}}, w
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
    if (_.isUndefined sel.startPos)
      throw new Error "Expected a location object as first argument"
    if not (_.isString content)
      throw new Error "Expected a string as second argument"

    if content.length == 0
      return
    index = sel.startPos.word   #position to work from
    pos = sel.startPos.pos

    preSpaces = content.match PreSpacesRegExp
    currWord = @getWord index

    # move the spaces to the previous word if a pos == 0
    if preSpaces isnt null
      if pos == 0
        if index == 0
          index += 1
          @insertWord 0, (new Word '')
        prevWord = @getWord (index-1)
        prevWord += preSpaces
        content = content.substring(preSpaces.length)
        @setWord (index-1), prevWord

    # insert the content at position
    currWord = currWord.substring(0, pos) + content + currWord.substring(pos)

    # cut the word
    newWords = currWord.match WordRegExp
    tmp = currWord.match PreSpacesRegExp
    if tmp isnt null
      newWords[0] = tmp + newWords[0]
    @setWord index, newWords[0]
    @insertWords index+1, newWords[1..]

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
        if delta.attributes?
          selection = new Selection position, (position + delta.retain), @
        position += delta.retain

      else if delta.delete?
        selection = new Selection position, (position + delta.delete), @
        @deleteSel selection

      else if delta.insert?
        end = position + delta.insert.length
        selection = new Selection position, end, @
        @insert selection, delta.insert
        position += delta.insert.length

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
