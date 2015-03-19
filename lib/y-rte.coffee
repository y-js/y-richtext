_ = require 'underscore'

# XRegExp = require('xregexp').XRegExp
WordRegExp = /\S+\s*/g
PreSpacesRegExp = /^\s+/
PostSpacesRegExp = /\s+$/
# Simple class that contains a word and links to the selections pointing
# to it
class Word
  # Attribute containing the string
  @word = ''
  # Selections that have this word as left bound
  @left = []
  # Selections that have this word as right bound
  @right = []

  # Construct a new list of words
  # @param [String] word The initial string value
  # @return [Word] a word instance
  constructor: (@word) ->

  # Remove the selection from the selections bound to the word
  # @param [Selection] selToRemove the selection to remove from selections list
  removeSel: (selToRemove) ->
    @selections.forEach sel, index, array ->
      if sel.equals(selToRemove)
        array.splice(index, 1)

# A class describing a selection with a style (bold, italic, …)
class Selection
  # Word that is the left bound
  @left = null
  # Word that is the right bound
  @right = null
  #   Construct a new selection using the index of the first and last character.
  #   Retrieves the position in (word, position) using an instance of rte
  #   @param [Integer] start index of the first character
  #   @param [Integer] end index of the last character
  #   @param [Rte] rte a rich-text editor (Rte) instance
  #   @option options [Object] style the style of the selection
  constructor: (start, end, rte, style)->
    if not _.isUndefined(start) and not _.isUndefined(end) and not _.isUndefined(rte)
      if !( _.isNumber(start) and
            _.isNumber(end))
        throw new Error "Expecting numbers as arguments"
      if !(rte.constructor isnt "Rte")
        throw new Error "Expecting an rte as third argument"
      @startPos = @_relativeFromAbsolute start, rte
      @endPos = @_relativeFromAbsolute end, rte
      @style = style

      @left = rte.getWord @startPos.word
      @right = rte.getWord @endPos.word

    else throw new Error "Wrong set of parameters #{[start, end, rte, style]}"

    if not _.isUndefined(style)
      @style = style

    @startPos.lt = @endPos.lt = (selection) ->
      @word < selection.word or (@word == selection.word and @pos <= selection.pos)

    @startPos.gt = @endPos.gt = (selection) ->
      @word > selection.word or (@word == selection.word and @pos >= selection.pos)

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

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  equals: (selection)->
    @startPos.word == selection.startPos.word and
    @startPos.pos == selection.startPos.pos and
    @endPos.word == selection.endPos.word and
    @endPos.pos == selection.endPos.pos

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
  in: (selection) ->
    @startPos.lt(selection) and @endPos.gt(selection)

  # Returns true if the current selection is in the given selection
  #
  # @param [Selection] s the selection to compare to this
  #
  contains: (selection) ->
    selection.in(@)

  # Returns true if the given selection overlaps the current selection
  #
  # @param [Selection] s the selection to compare to this
  #
  overlaps: (selection) ->
    @startPos.lt(selection.endPos) or @endPos.gt(selection.startPos)

  #TODO
  setStyle: (@style) ->

  # Validate a selection if the start is before the end of the selection
  #
  isValid: ->
    @startPos.lt(@endPos)


  # Try to merge this selection with the one given in argument
  #
  # @param s [Selection] The selection to merge with
  # @param rte [Rte] The RTE instance
  merge: (selection, rte) ->
    # Check if they're contiguous
    if selection.endPos.word == @startPos.word or
       (selection.endPos.word == @startPos.word -1 and
        selection.endPos.loc == rte.getWord(selection.endPos.word).length() and
        @startPos.loc == 0)
      # boundaries of new selection
      start = selection.startPos
      end = @endPos
      # remove link of middle words to selection
      rte.getWord(selection.endPos.word).removeSel(selection)
      rte.getWord(@startPos.word).removeSel(@)
    else if @endPos.word == selection.startPos.word or
       (@endPos.word == selection.startPos.word -1 and
        @endPos.loc == rte.getWord(@endPos.word).length() and
        selection.startPos.loc == 0)
      start = @startPos
      end = selection.endPos
      rte.getWord(@endPos.word).removeSel(@)
      rte.getWord(selection.endPos.word).removeSel(selection)
    else
      return

    nSelec = new Selection start, end, selection.style
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
  #   Return the value of the Rte instance as a string
  #
  # @overload val(content)
  #   Set the content of the Rte instance
  #   @param content [String] Set the strings of the Rte to this content
  val: (content)->
    if not _.isUndefined(content)
      # reset styles when replacing content
      @_rte.words = []
      @_rte.style = []
      @push(content)
    else
      # TODO: support breaks (br, new paragraph, …)
      (e.word for e in @_rte.words).join('')

  # Returns the **string representation** of a word.
  # @param index [Integer] the index of the word to return
  getWord: (index) ->
    if @_rte.words.length == 0 or index == @_rte.words.length
      return ""

    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds #{index}"
    @_rte.words[index].word

  # Returns the *word objects* within boundaries
  # @param begin [Integer] the first word the return
  # @param end [Integer] the first word /not/ to return
  getWords: (begin, end) ->
    if _.isUndefined(end)
      end = @_rte.words.length
    if not (0 <= begin <= end <= @_rte.words.length)
      return []

    ret = @_rte.words[begin..end]
    if ret
      ret
    else
      []

  # Set the content of a word
  # @param index [Integer] the index of the word to modify
  # @param content [String] the content to set the word to
  setWord: (index, content) ->
    if index == @_rte.words.length
      @_rte.words.push(new Word content)
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
  merge: (index) ->
    if 0 <= index < @_rte.words.length
      word = @getWord(index).trimRight()
      @deleteWords index
      @insert {startPos: {word: index, pos:0}}, word
    else
      throw new Error "Impossible to merge"

  # Delete a selection
  #
  # @param [Selection] sel the selection to delete
  #
  deleteSel: (selection) ->
    if not selection.isValid()
      throw new Error "Invalid selection"
    if not 0 <= selection.startPos.loc <= @getWord(selection.startPos.word).length
      throw new Error "Invalid selection"
    if not 0 <= selection.endPos.loc <= @getWord(selection.endPos.word).length
      throw new Error "Invalid selection"

    start = selection.startPos.word
    end = selection.endPos.word

    newLeft = @getWord(s).substring(0, selection.startPos.pos)
    newRight = @getWord(e).substring(selection.endPos.pos)

    if start == end
      @setWord(start, newLeft + newRight)

      # delete the words in between
      @deleteWords(start+1, end)
    else
      @setWord(start, newLeft)
      @setWord(end, newRight)

      # delete the words in between
      @deleteWords(start+1, end)
      # merge
      @merge(start)

  # Insert text at position
  #
  # @param [Option] position The position where to insert text
  # @param [String] content the content to insert
  #
  insert: (selection, content)->
    if (_.isUndefined selection.startPos)
      throw new Error "Expected a location object as first argument"
    if not (_.isString content)
      throw new Error "Expected a string as second argument"

    if content.length == 0
      return
    index = selection.startPos.word   #position to work from
    pos = selection.startPos.pos

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

  # Set the style of the selection and try to extend as much
  # as possible existing ones
  #
  setStyle: (selection, style)->
    if not selection.isValid()
      throw new Error "Invalid selection"

    # Try to merge with previous / next contiguous selection
    {prevWord, position} = @_jump(selection.startPos, -1)
    {nextWord, position} = @_jump(selection.endPos,   +1)
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
