_ = require 'underscore'
misc = require './misc'
relativeFromAbsolute = misc.relativeFromAbsolute
absoluteFromRelative = misc.absoluteFromRelative
Word = misc.Word
Selection = misc.Selection

# XRegExp = require('xregexp').XRegExp
WordRegExp = /\S+\s*/g
PreSpacesRegExp = /^\s+/
PostSpacesRegExp = /\s+$/

# Class describing the Rich Text Editor type
#
class Rt
  # @property [Options] _rt the RTE object
  # @param [String] content the initial content to set
  constructor: (content = '')->
    if content.constructor isnt String
      throw new Error "Only accepts strings."
    @_rt = {}
    @_rt.selections = []
    @_rt.words = []
    @pushString content

  _name: "Rich Text Editor"

  _getModel: (Y, Operation) ->
    if @_model == null
      @_model = new Operation.MapManager(@).execute()
      @_model.val(words, @_rt.words)
      @_model.val(selections, @_rt.selections)

  # _setModel:
  # observe:
  # unobserve:

  # @overload val()
  #   Return the value of the Rt instance as a non formatted string
  #
  # @overload val(content)
  #   Set the content of the Rt instance
  #   @param content [String] Set the strings of the Rt to this content
  val: (content)->
    if not _.isUndefined(content)
      # reset styles when replacing content
      @_rt.words = []
      @_rt.style = []
      @pushString content
    else
      # TODO: support breaks (br, new paragraph, …)
      (e.word for e in @_rt.words).join('')

  # Returns the word object of a word.
  # @param index [Integer] the index of the word to return
  getWord: (index) ->
    if @_rt.words.length == 0 or index == @_rt.words.length
      return (new Word '', @)

    if not (0 <= index < @_rt.words.length)
      throw new Error "Index out of bounds #{index}"
    @_rt.words[index]

  # Returns the *word objects* within boundaries
  # @param begin [Integer] the first word the return
  # @param end [Integer] the first word /not/ to return
  getWords: (begin, end) ->
    if _.isUndefined(end)
      end = @_rt.words.length
    if not (0 <= begin <= end <= @_rt.words.length)
      return []

    ret = @_rt.words[begin..end]
    if ret
      ret
    else
      []

  # Set the content of a word
  # @param index [Integer] the index of the word to modify
  # @param content [String] the content to set the word to
  # @note it pushes all selection to the end of the word
  setWord: (index, content) ->
    if index == @_rt.words.length
      @_rt.words.push(new Word content, @)
    if not (0 <= index < @_rt.words.length)
      throw new Error "Index out of bounds"

    word = @getWord(index)
    word.word = content

    return word

  # Append new words at the end of the word list
  # @param [String] content the string to append
  pushString: (content) ->
    preSpaces = content.match PreSpacesRegExp
    if preSpaces isnt null
      @_rt.words.push (new Word (preSpaces[0]), @)
    words = content.match WordRegExp
    if _.isArray(words)
      for w in words
        @_rt.words.push (new Word w, @)

  # Insert words at position
  #
  # @param [Integer] position the position where to insert words
  # @param [Array<String>] words the words to insert at position
  #
  # @return [Array<Word>] an array of word objects insertd
  insertWords: (position, words)->
    if not _.isNumber position
      throw new Error "Expected a number as first parameter, got #{position}"
    if not _.isArray words
      throw new Error "Expected a string array as second parameter, got #{words}"

    length = @_rt.words.length
    if 0 <= position <= length
      wordsObj = ((new Word w, @) for w in words)
      Array.prototype.splice.apply(@_rt.words, [position, 0].concat(wordsObj))
      # left = @_rt.words.slice(0, position)
      # right = @_rt.words.slice(position)
      # @_rt.words = left.concat(wordsObj).concat(right)

      return wordsObj or []

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
  #
  # @note selections that where bound to any of the deleted word
  # are moved to the beginning of the first word not deleted
  deleteWords: (start, end) ->
    if _.isUndefined(end)
      end = start+1

    if start <= end
      indexStart = absoluteFromRelative start, 0, @
      length = (@getWords 0).length

      endPos = (@getWord (end-1)).word.length-1
      indexEnd = absoluteFromRelative (end-1), endPos, @

      # remove all the selections within deleted area
      # and change the extremities of those overlapping
      opts = {bind: false}
      selection = new Selection indexStart, indexEnd, @, opts

      selection.deleteHelper (@getWord (end))

      # remove words
      @_rt.words.splice start, (end-start)


  # Merge two words at position
  #
  # @param [Integer] n position of word where to perform merge. The merge will
  # be done with the word at right (if any)
  merge: (index) ->
    if 0 <= index < @getWords(0).length
      word = @getWord index
      # use slice to force copy of array
      [selLeft, selRight] = [word.left.slice(), word.right.slice()]
      for selection in  _.uniq(selLeft.concat(selRight))
        # console.log "Merge — unbinding " + selection.print()
        #selection.unbind()
        @removeSel selection

      word.left = word.right = []
      # remove word at position index
      @deleteWords index
      # insert its content at position where is used to be
      pos = absoluteFromRelative index, 0, @

      @insert pos, word.word.trimRight()

      # the new word is here
      newWord = @getWord index

      # console.log "Merge — before selLeft", selLeft
      for selection in selLeft
        # console.log "Merge — rebinding " + selection.print()
        selection.rebind newWord, null
        @pushSel selection
      # # console.log "Merge — before selRight", selRight
      for selection in selRight
        # console.log "Merge — rebinding " + selection.print()
        selection.rebind null, newWord
        @pushSel selection
    else
      throw new Error "Impossible to merge"

  # Delete text under selection
  #
  # @param [Selection] sel the selection to delete
  #
  deleteSel: (selection) ->
    if not selection.isValid()
      throw new Error "Invalid selection, got", selection

    left = selection.left
    right = selection.right

    leftIndex = left.index @
    rightIndex = right.index @

    newLeft = left.word.substring 0, selection.leftPos
    newRight = right.word.substring selection.rightPos

    # delete selections inside
    if left == right
      wordToBound = @setWord leftIndex, (newLeft + newRight)
      posToBound = selection.leftPos

    else
      @setWord leftIndex, newLeft
      wordToBound = @setWord rightIndex, newRight

      # delete the words in between
      @deleteWords leftIndex+1, rightIndex
      # merge
      @merge leftIndex

      posToBound = 0

    selection.deleteHelper wordToBound, posToBound

  # Insert text at position
  #
  # @param [Integer] position The position where to insert text
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
    currWordObj = @getWord(index)
    currWord = currWordObj.word

    # selections at right of insertion point
    selAtRight = currWordObj.getSelections((s) -> s.leftPos >= pos or s.rightPos >= pos)
    oldLength = currWord.length
    selAtLeft = currWordObj.getSelections((s) -> s.leftPos < pos or s.rightPos < pos)

    # move the spaces to the previous word if a pos == 0
    if preSpaces isnt null
      if pos == 0
        if index == 0
          index++
          @insertWord 0, (new Word '', @)
        prevWord = @getWord(index-1).word
        prevWord += preSpaces
        content = content.substring(preSpaces.length)
        @setWord (index-1), prevWord

    # insert the content at position
    currWord = currWord.substring(0, pos) + content + currWord.substring(pos)

    # cut the word
    newWords = currWord.match WordRegExp or []
    # get the pre spaces
    tmp = currWord.match PreSpacesRegExp or ""
    if tmp isnt null
      newWords[0] = tmp + (newWords[0] or "")

    # get the new words inserted as an array
    tmp1 = [@setWord index, newWords[0]]
    tmp2 = @insertWords index+1, newWords[1..]
    wordsInserted = tmp1.concat(tmp2)

    # update the positions of all selections
    lastWord = _.last wordsInserted
    newLength = lastWord.word.length
    for sel in selAtRight
      if sel.left == currWordObj
        sel.left = lastWord
        sel.leftPos = sel.leftPos + newLength - oldLength
      if sel.right == currWordObj
        sel.right = lastWord
        sel.rightPos = sel.rightPos + newLength - oldLength
      sel.bind sel.left, sel.right


  # Relative jump from position
  #
  _jump: (position, relJump) ->
    word = position.word
    pos = position.pos

    if jump < 0
      jump = Math.abs(jump)
      while jump > 0
        if pos < jump
          word--
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
          word++
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
    # console.log "Pushing", selection, "in", @_rt.selections
    selections = @_rt.selections
    if !(selection in selections)
      @_rt.selections.push selection

  # @overload getSelections()
  #   Return all the selections
  #   @return [Array<Selection>] an array of selection
  #
  # @overload getSelections(filter)
  #   Return all the selections and filter using filter
  #   @param [Function] filter the function to use for filtering
  #   @return [Array<Selection>] an array of selection
  getSelections: (filter = null)->
    # console.log "Rt.getSelections", @_rt.selections
    tmp = (if _.isFunction(filter)
      @_rt.selections.filter(filter) or []
    else
      @_rt.selections or [])
    _.uniq tmp


  # Remove a selection from selection list
  #
  # @param [Selection] selection the selection to remove
  removeSel: (selection) ->
    index = 0
    array = @_rt.selections
    for el, index in array
      if (array[index] == selection)
        array.splice index, 1
        break

  # Only for manual use, so no efficiency research
  garbageCollect: ->
    sels = @_rt.selections
    for sel, index in sels
      for key, value of sel
        if value == null or value == ""
          sel.unbind()
          @removeSel sel


if window?
  window.Rt = Rt
  window.Selection = Selection
  window.Word = Word
  window.relativeFromAbsolute = relativeFromAbsolute
  window.absoluteFromRelative = absoluteFromRelative

if module?
  module.exports.Rt = Rt
  module.exports.Selection = Selection
  module.exports.Word = Word
  module.exports.relativeFromAbsolute = relativeFromAbsolute
  module.exports.absoluteFromRelative = absoluteFromRelative
