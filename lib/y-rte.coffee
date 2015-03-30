_ = require 'underscore'
# Function that translates an index from start (absolute position) into a
# relative position in word index and offset
#
# @param [Integer] position the position
# @param [Rte] rte an rte instance
relativeFromAbsolute = (position, rte)->
    index = 0
    while position > 0
      if index >= rte._rte.words.length
        index -= 1 #position = 0
        break
      if rte.getWord(index).word.length > position
        break
      else
        position -= rte.getWord(index).word.length
        index += 1

    return {word: index, pos: position}

# Function that translates an index from start (absolute position) into a
# relative position in word index and offset
#
# @param [Option] relative the position
# @param [Rte] rte an rte instance
absoluteFromRelative = (index, offset, rte) ->
  absolute = offset
  if index > 0
    for i in [0..(index-1)]
      absolute += rte.getWord(i).word.length

  absolute

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
  constructor: (@word, @rte) ->
    # Selections that have this word as left bound
    @left = []
    # Selections that have this word as right bound
    @right = []

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
  #   @param [Option] option options to pass to the constructor
  #   @option option [Object] style the style of the selection
  #   @option option [Bool] bind whether or not to bind the selection
  constructor: (start, end, rte, options={})->
    if not _.isUndefined(start) and not _.isUndefined(end) and not _.isUndefined(rte)
      if !( _.isNumber(start) and
            _.isNumber(end))
        throw new Error "Expecting numbers as arguments"
      if not (rte instanceof Rte)
        throw new Error "Expecting an rte instance as third argument, got #{rte}"

      if _.isUndefined(options.bind)
        options.bind = true

      @rte = rte

      retStart = @_relativeFromAbsolute start
      retEnd = @_relativeFromAbsolute end

      @setStyle (options.style or {})

      @left = @rte.getWord retStart.word
      @leftPos = retStart.pos
      @right = @rte.getWord retEnd.word
      @rightPos = retEnd.pos

      if options.bind
        @bind @left, @right
        @rte.pushSel @


    else throw new Error "Wrong set of parameters
      #{start}, #{end}, #{rte}, #{style}"

  # Print a string representation of string
  print: () ->
    r = @.right or {word: 'rightmost'};
    l = @.left or {word: 'leftmost'};
    console.log "From '" + l.word + "':" + @leftPos +
                " to '" + r.word + "':" + @rightPos +
                " with style", @style

  # Returns true if the selection is empty (it has no length)
  isEmpty: () ->
    (@left == @right and @leftPos == @rightPos)

  # Returns true when the "side" side of the selection is less than the
  # position given as parameters.
  # @param word2 [Word] a word instance
  # @param pos2 [Integer] the offset in this word
  # @param side [String] either "left" or "right"
  lt: (word2, pos2, side)->
    if not (_.isString side)
      throw new Error "Expected a string as first argument, got #{side}"

    if side == "left"
      word1 = @left
      pos1 = @leftPos
    else if side == "right"
      word1 = @right
      pos1 = @rightPos
    index1 = word1.index @rte
    index2 = word2.index @rte
    (index1 == index2 and pos1 <= pos2) or
      (index1 < index2)

  # Returns true when the "side" side of the selection is greater than the
  # position given as parameters.
  # @param word2 [Word] a word instance
  # @param pos2 [Integer] the offset in this word
  # @param side [String] either "left" or "right"
  gt: (word2, pos2, side)->
    if not (_.isString side)
      throw new Error "Expected a string as first argument, got #{side}"

    if side == "left"
      word1 = @left
      pos1 = @leftPos
    else if side == "right"
      word1 = @right
      pos1 = @rightPos

    (word1 == word2 and pos1 >= pos2) or
    ((word1.index @rte) > (word2.index @rte))


  # Convert indexes from beginning of text to coordinates expressed in word and
  # position within word
  #
  # @param [Integer] position index of position to find
  _relativeFromAbsolute: (position)->
    relativeFromAbsolute position, @rte

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  equals: (selection)->
    @left == selection.left and
    @leftPos == selection.leftPos and
    @right == selection.right and
    @rightPos == selection.rightPos

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  #
  notEquals: (selection) ->
    not @equals(selection)

  # Returns true if the given selection is in the current selection
  #
  # @param [Selection] selection the selection to compare to this
  #
  in: (selection) ->
    @gt(selection.left, selection.leftPos, "left") and
    @lt(selection.right, selection.rightPos, "right")

  # Returns true if the current selection is in the given selection
  #
  # @param [Selection] selection the selection to compare to this
  #
  contains: (selection) ->
    selection.in(@)


  # Returns true if the given selection and this selection overlap
  # and this selection is at left of the given one
  #
  # @param [Selection] s the selection to compare to this
  #
  overlaps: (selection) ->
    @startPos.lt(selection.endPos) or @endPos.gt(selection.startPos)

  #TODO
  setStyle: (@style) ->

  # Validate a selection if the start is before the end of the selection
  isValid: ->
    @lt(@right, @rightPos, "left")

  # Split the outer selection into a left part and a right part and
  # insert selection within
  #
  # @param [Selection] selection the selection to split
  split: (selection) ->
    if !selection or selection == @
      return

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
    @pushString content

  _name: "Rich Text Editor"

  # _getModel:
  # _setModel:
  # observe:
  # unobserve:

  # @overload val()
  #   Return the value of the Rte instance as a non formatted string
  #
  # @overload val(content)
  #   Set the content of the Rte instance
  #   @param content [String] Set the strings of the Rte to this content
  val: (content)->
    if not _.isUndefined(content)
      # reset styles when replacing content
      @_rte.words = []
      @_rte.style = []
      @pushString content
    else
      # TODO: support breaks (br, new paragraph, …)
      (e.word for e in @_rte.words).join('')

  # Returns the word object of a word.
  # @param index [Integer] the index of the word to return
  getWord: (index) ->
    if @_rte.words.length == 0 or index == @_rte.words.length
      return ""

    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds #{index}"
    @_rte.words[index]

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
      @_rte.words.push(new Word content, @)
    if not (0 <= index < @_rte.words.length)
      throw new Error "Index out of bounds"

    @_rte.words[index].word = content

  # Append new words at the end of the word list
  # @param [String] content the string to append
  pushString: (content) ->
    preSpaces = content.match PreSpacesRegExp
    if preSpaces isnt null
      @_rte.words.push(new Word (preSpaces[0]), @)
    words = content.match WordRegExp
    if _.isArray(words)
      for w in words
        @_rte.words.push (new Word w, @)

  # Insert words at position
  #
  # @param [Integer] position the position where to insert words
  # @param [Array<String>] words the words to insert at position
  #
  insertWords: (position, words)->
    if not _.isNumber position
      throw new Error "Expected a number as first parameter, got #{position}"
    if not _.isArray words
      throw new Error "Expected a string array as second parameter, got #{words}"

    length = @_rte.words.length
    if 0 <= position <= length
      wordsObj = ((new Word w, @) for w in words)
      left = @_rte.words.slice(0, position)
      right = @_rte.words.slice(position)
      @_rte.words = left.concat(wordsObj).concat(right)

    else
      throw new Error 'Index #{position} out of bound in word list'


  # @overload deleteWords (start, end)
  #   Delete all the words between start and end
  #
  #   @param [Integer] start position of first word to delete
  #   @param [Integer] end position of last word to delete
  #
  # @overload deleteWords (position)
  #   Delete the word at position
  #
  #   @param [Integer] position position the word to delete
  deleteWords: (start, end) ->
    if _.isUndefined(end)
      end = start+1

    if start <= end
      @_rte.words.splice(start, end-start)

      # delete all the selections within
      indexStart = absoluteFromRelative start, 0, @
      length = (@getWords 0).length
      while end >= length
        end -= 1
      endPos = (@getWord end).word.length-1
      indexEnd = absoluteFromRelative end, endPos, @
      opts = {bind: false}
      selection = new Selection indexStart, indexEnd, @, opts

      for sel in @getSelections((s) -> s.in(selection))
        sel.unbind()
        @removeSel sel

  # Merge two words at position
  #
  # @param [Integer] n position of word where to perform merge. The merge will
  #  be done with the word at right (if any)
  #
  merge: (index) ->
    if 0 <= index < @_rte.words.length
      word = @getWord(index).trimRight()
      @deleteWords index
      pos = absoluteFromRelative index, 0, @
      @insert pos, word
    else
      throw new Error "Impossible to merge"

  # Delete text under selection
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

    left = selection.left
    right = selection.right

    newLeft = @getWord(start).substring(0, selection.startPos.pos)
    newRight = @getWord(end).substring(selection.endPos.pos)

    newLeft = left.word.substring 0, selection.leftPos
    newRight = right.word.substring selection.rightPos

    if left == right
      @setWord leftIndex, (newLeft + newRight)

      # delete the words in between
      @deleteWords leftIndex+1, rightIndex
    else
      @setWord leftIndex, newLeft
      @setWord rightIndex, newRight

      # delete the words in between
      @deleteWords leftIndex+1, rightIndex
      # merge
      @merge leftIndex

  # Insert text at position
  #
  # @param [Option] position The position where to insert text
  # @param [String] content the content to insert
  #
  insert: (position, content)->
    if not (_.isNumber position)
      throw new Error "Expected an integer as first argument"
    if not (_.isString content)
      throw new Error "Expected a string as second argument"

    if content.length == 0
      return

    ret = relativeFromAbsolute position, @

    index = ret.word   #position to work from
    pos = ret.pos

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
    newWords = currWord.match WordRegExp or []
    tmp = currWord.match PreSpacesRegExp or ""
    if tmp isnt null
      newWords[0] = tmp + (newWords[0] or "")
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
          pos = @getWord(word).word.length - 1

          if word < 0
            return null
        else
          pos -= jump
    else if jump > 0
      while jump > 0
        delta = pos + jump - @getWord(word).word.length + 1
        if delta > 0
          word += 1
          jump -= delta
          pos = 0

          if word >= @getWords(0).length
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
        opts = {bind: false}
        if delta.attributes?
          opts.bind = true
          opts.style = delta.attributes
        selection = new Selection position, (position + delta.retain), @, opts
        position += delta.retain

      else if delta.delete?
        opts = {bind: false}
        selection = new Selection position, (position + delta.delete), @, opts
        @deleteSel selection

      else if delta.insert?
        opts = {bind: false}
        @insert position, delta.insert
        if delta.attributes?
          opts = {style: delta.attributes, bind: true}
          end = position + delta.insert.length
          selection = new Selection position, end, @, opts
        position += delta.insert.length

      else
        throw new Error "Unknown operation"

      if delta.attributes?
        selectionList = @getSelections((s) -> s!=selection and s)
        for sel in selectionList
          selection.merge sel
          if sel.left and sel.right # sel might have been unbound in previous merge
            selection.split sel

  # Add a  selection to the selection list
  pushSel: (selection)->
    @_rte.selections.push selection

  # @overload getSelections()
  #   Return all the selections
  #   @return [Array<Selection>] an array of selection
  #
  # @overload getSelections(filter)
  #   Return all the selections and filter using filter
  #   @param [Function] filter the function to use for filtering
  #   @return [Array<Selection>] an array of selection
  getSelections: (filter = null)->
    if _.isFunction(filter)
      @_rte.selections.filter(filter) or []
    else
      @_rte.selections or []

  # Remove a selection from selection list
  #
  # @param [Selection] selection the selection to remove
  removeSel: (selection) ->
    index = 0
    array = @_rte.selections
    for index in [0..array.length-1]
      if (array[index] == selection)
        array.splice index, 1
        break

  # Only for manual use, so no efficiency research
  garbageCollect: ->
    sels = @_rte.selections
    for index in [0..sels.length-1]
      for key, value of sels[index]
        if value == null or value == ""
          sels[index].unbind()
          @removeSel sels[index]


if window?
  window.Rte = Rte
  window.Selection = Selection
  window.Word = Word

if module?
  module.exports = [Rte, Selection]
