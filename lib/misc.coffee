_ = require 'underscore'

# Function that translates an index from start (absolute position) into a
# relative position in word index and offset
#
# @param [Integer] position the position
# @param [Y.RichText] RichText a richText instance
# @return [Object] options returning object
# @option options [Integer] word the index of the word
# @option options [Integer] position the offset in this word
relativeFromAbsolute = (position, richText)->
  index = 0
  while position > 0
    if index >= richText.getWords(0).length
      index-- #position = 0
      break
    if richText.getWord(index).word.length > position
      break
    else
      position -= richText.getWord(index).word.length
      index++

  return {word: index, pos: position}

# Function that translates an index from start (absolute position) into a
# relative position in word index and offset
#
# @param [Option] relative the position
# @param [Y.RichText] richText an richText instance
# @return [Integer] the absolute index
absoluteFromRelative = (index, offset, richText) ->
  absolute = offset
  if index > 0
    for i in [0..(index-1)]
      absolute += richText.getWord(i).word.length

  absolute

# Initialize an Yjs list and add commont array operations
# over it
customList = (Operation, self) ->
  ret = new Operation.ListManager(@).execute()

  # Another name for delete is slice
  # TODO: remove all occurences of slice!
  ret.slice = (start, end) ->
    @delete start, end
  ret.splice = (start, end, insert...) ->
    @delete start, end
    @insert start, insert
  ret.indexOf = (element) ->
    @val().indexOf(element)

  ret.observe = (e) ->
    console.log e

  return ret

# a basic class with generic getter / setter funciton
class BaseClass
  constructor: ->

  # Try to find the property in @_model, else return the
  # own property
  _get: (prop) ->
    if @hasOwnProperty(prop)
      @[prop]
    else
      @_model.val(prop)
  # Try to set the property in @_model, else set the
  # own property
  _set: (prop, val) ->
    if @hasOwnProperty(prop)
      @[prop] = val
    else
      @_model.val(prop, val)

# Simple class that contains a word and links to the selections pointing
# to it
#
class Word extends BaseClass
    # Attribute containing the string
  @word = ''
  # Selections that have this word as left bound
  @left = []
  # Selections that have this word as right bound
  @right = []

  _name: "Word"

  _getModel: (Y, Operation) ->
    if @_model == null
      @_model = new Operation.MapManager(@).execute()
      left = customList(Operation, @, @left)
      right = customList(Operation, @, @right)
      @_model.val("left", @left)
      @_model.val("right", @right)
      @_model.val("word", @word)
      @_model.val("richText", @richText)

      delete @left
      delete @right
      delete @richText

    return @_model

  _setModel: (model) ->
    delete @left
    delete @right
    delete @word
    delete @richText

    @_model = model

  # Construct a new list of words
  #
  # @param [String] word The initial string value
  # @return [Word] a word instance
  #
  constructor: (@word, @richText) ->
    # Selections that have this word as left bound
    @left = []
    # Selections that have this word as right bound
    @right = []

  # Remove a selection from left or right array
  #
  # @param [Selection] selection the selection to remove
  # @param [Option] side the side where to remove the selection
  # @option side [String] left left side
  # @option side [String] right right side
  #
  removeSel: (selection, side)->
    if side == "left"
      array = @_get("left")
    else if side == "right"
      array = @_get("right")
    else
      throw new Error "Invalid argument #{side}, expected 'left' or 'right'"
    index = 0
    for sel, index in array
      if sel.equals selection
        array.splice index, 1
        break

  # Get index of word in the list of words
  #
  # @return [Integer] the index of the word
  index: ->
    index = @richText._richText.words.indexOf @
    if index == -1
      9e99
    else
      index

  # @overload getSelections()
  #   Return all the selections
  #   @return [Array<Selection>] an array of selection
  #
  # @overload getSelections(filter)
  #   Return all the selections and filter using fun
  #   @param [Function] filter the function to use for filtering
  #   @return [Array<Selection>] an array of selection
  #
  getSelections: (filter = null)->
    # console.log "Word.getSelections", @left, @right
    tmp = (if _.isFunction(filter)
      @_get("left").concat(@_get("right")).filter(filter) or []
    else
      @_get("left").concat(@_get("right")) or [])
    # console.log "returning", _.uniq tmp
    _.uniq tmp

# A class describing a selection with a style (bold, italic, …)
class Selection extends BaseClass
  _name = "Selection"

  _getModel: (Y, Operation) ->
    if @_model == null
      @_model = new Operation.MapManager(@).execute()
      @_model.val("left", @left)
      @_model.val("leftPos", @leftPos)
      @_model.val("right", @right)
      @_model.val("rightPos", @leftPos)
      @_model.val("style", @style)

      delete @left
      delete @leftPos
      delete @right
      delete @rightPos
      delete @style

    return @_model

  _setModel: (model) ->
    delete @left
    delete @left
    delete @leftPos
    delete @right
    delete @rightPos
    delete @style

    @_model = model
  # Construct a new selection using the index of the first and last character.
  #
  # @param [Integer] start index of the first character
  # @param [Integer] end index of the last character
  # @param [Y.RichText] rt a richText editor (Y.RichText) instance
  # @param [Object] option options to pass to the constructor
  # @option option [Bool] bind whether or not to bind the selection
  #
  constructor: (start, end, richText, options={})->
    if not _.isUndefined(start) and not _.isUndefined(end) and not _.isUndefined(richText)
      if !( _.isNumber(start) and
            _.isNumber(end))
        throw new Error "Expecting numbers as arguments"

      if _.isUndefined(options.bind)
        options.bind = true

      @richText = richText

      retStart = @_relativeFromAbsolute start
      retEnd = @_relativeFromAbsolute end

      @setStyle (options.style or {})

      @left = @richText.getWord retStart.word
      @leftPos = retStart.pos
      @right = @richText.getWord retEnd.word
      @rightPos = retEnd.pos

      if options.bind
        @bind @left, @right
        @richText.pushSel @


    else
      throw new Error "Wrong set of parameters #{start}, #{end}, #{richText}, #{style}"

  # Return a string representation of the selection
  #
  # @return [String] a representation of the selection
  print: () ->
    r = @right or {word: 'none'}
    l = @left or {word: 'none'}
    "From '" + l.word + "':" + @leftPos +
      " to '" + r.word + "':" + @rightPos +
      ", style {" + (@style.k+":"+v for k, v of @style).join(',') + "}"

  # Returns true if the selection is empty (it has no length)
  #
  # @return [Bool] true if the selection is empty
  isEmpty: () ->
    (@left == @right and @leftPos == @rightPos)

  # Returns true when the "side" side of the selection is less than the
  # position given as parameters.
  #
  # @param word2 [Word] a word instance
  # @param pos2 [Integer] the offset in this word
  # @param side [String] either "left" or "right"
  #
  # @return [Bool] true if the position given in the param is ≤ than the side given
  lt: (word2, pos2, side)->
    if not (_.isString side)
      throw new Error "Expected a string as first argument, got #{side}"

    if side == "left"
      word1 = @left
      pos1 = @leftPos
    else if side == "right"
      word1 = @right
      pos1 = @rightPos
    index1 = word1.index @richText
    index2 = word2.index @richText
    (index1 == index2 and pos1 <= pos2) or
      (index1 < index2)

  # Returns true when the "side" side of the selection is greater than the
  # position given as parameters.
  #
  # @param word2 [Word] a word instance
  # @param pos2 [Integer] the offset in this word
  # @param side [String] either "left" or "right"
  #
  # @return [Bool] true if the position given in the param is ≥ than the side given
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
    ((word1.index @richText) > (word2.index @richText))


  # Convert indexes from beginning of text to coordinates expressed in word and
  # position within word
  #
  # @param [Integer] position index of position to find
  # @return [Object] options returning object
  # @option options [Integer] word the index of the word
  # @option options [Integer] position the offset in this word
  _relativeFromAbsolute: (position)->
    relativeFromAbsolute position, @richText

  # Compares the bounds of two selections
  #
  # @param [Selection] s the selection to compare to this
  # @return [Bool] true if the selections have the same bounds
  equals: (selection)->
    @left == selection._get("left") and
    @leftPos == selection._get("leftPos") and
    @right == selection._get("right") and
    @rightPos == selection._get("rightPos")

  # Compares *the bounds* of two selections
  #
  # @param [Selection] s the selection to compare to this
  # @return [Bool] false if the selections have the same bounds
  notEquals: (selection) ->
    not @equals(selection)

  # Returns true if the given selection is in the current selection
  #
  # @param [Selection] selection the selection to compare to this
  # @return [Bool] true if the given selection is within this selection
  in: (selection) ->
    @gt(selection._get("left"), selection._get("leftPos"), "left") and
    @lt(selection._get("right"), selection._get("rightPos"), "right")

  # Returns true if the current selection is in the given selection
  #
  # @param [Selection] selection the selection to compare to this
  # @return [Bool] false if the given selection is within this selection
  contains: (selection) ->
    selection.in(@)


  # Returns true if the given selection and this selection overlap
  # and this selection is at left of the given one
  #
  # @param [Selection] selection the selection to compare to this
  # @return [Bool] true if the given selection is located on the left of this selection
  atLeftOf: (selection) ->
    (@gt(selection._get("left"), selection._get("leftPos"), "right") and
    @lt(selection._get("right"), selection._get("rightPos"), "right"))


  # Set the style to style
  #
  # @param [Object] style A style represented as an object
  setStyle: (@style) ->

  # Validate a selection if the start is before the end of the selection
  # @return [Bool] true if the selection's left side is on the left of its right side
  isValid: ->
    @lt(@right, @rightPos, "left")

  # Split the outer selection into a left part and a right part and
  # insert selection within
  #
  # @param [Selection] selection the selection to split
  split: (selection) ->
    if !selection or selection == @
      return

    # Check that they have all keys in common (but not necessarily same value!)
    keys = _.keys(@style)
    # console.log "keys", keys
    for key in keys
      if not(_.has(selection.style, key))
        return
    # console.log "same keys, going forward", @, selection

    if @in(selection)
      outSelLeft = selection
      outSelRight = selection.clone()

      # console.log "~~~~~~~~~~~~~~",outSelRight,"~~~~~~~~~~~~~~",
      #   "~~~~~~~~~~~~~~", @rte._rte.selections

      # joke here, because Insel means island in German
      inSel = @

      # order is important because outSelLeft == selection
      # outSelRight has to be updated first
      outSelRight._set("leftPos",  inSel._get("rightPos"))
      outSelRight.rightPos = selection._get("rightPos")
      outSelRight.bind inSel.right, selection._get("right")

      outSelLeft._set("leftPos",  selection._get("leftPos"))
      outSelLeft._set("rightPos", inSel._get("leftPos"))
      outSelLeft.bind selection._get("left"), inSel._get("left")

      # Remove empty selections
      [outSelRight, inSel, outSelLeft].forEach (sel) ->
        if sel.isEmpty()
          sel.unbind()
          # console.log "Removing", sel
          @richText.removeSel sel

  # Try to merge the given selection with this selection, keeping this selection
  #
  # @param [Selection] selection the selection to merge to
  #
  # @note
  #   1                 2                   3
  #   [  left selection ][  right selection ]
  #    becomes
  #   [           right selection           ]
  merge: (selection) ->
    if !selection
      return
    if @ == selection
      return

    # if they have two styles that differ
    if not (_.isEqual(@style, selection.style))
      return
    selToRemove = selection
    selToKeep = @

    if @atLeftOf selection
      left = @left
      leftPos = @leftPos
      right = selection._get("right")
      rightPos = selection._get("rightPos")
    else if selection.atLeftOf @
      left = selection._get("left")
      leftPos = selection._get("leftPos")
      right = @right
      rightPos = @rightPos
    else if @in selection
      left = selection._get("left")
      leftPos = selection._get("leftPos")
      right = selection._get("right")
      rightPos = selection._get("rightPos")
    else if @equals selection
      left = @left
      leftPos = @leftPos
      right = @right
      rightPos = @rightPos
    else if selection.in @
      left = @left
      leftPos = @leftPos
      right = @right
      rightPos = @rightPos
    else
      return

    selToRemove.unbind()
    selToKeep.unbind()

    selToKeep._set("leftPos",  leftPos)
    selToKeep._set("rightPos", rightPos)

    selToKeep.bind left, right

    @richText.removeSel selToRemove

  # Unbind selection from word
  #
  # @return [Array<Word>] an array containing the old value of left and right
  unbind: ->
    @left.removeSel @, "left"
    @right.removeSel @, "right"

    left = @left
    right = @right

    @_set("left", null)
    @_set("right", null)

    [left, right]

  # Bind selection to word
  # @param [Word] left a word instance to bind at left
  # @param [Word] right a word instance to bind at right
  bind: (left, right) ->
    if _.isUndefined left
      throw new Error "Missing argument left"
    if _.isUndefined right
      throw new Error "Missing argument right"

    @_set("left", left)
    @_set("right", right)
    if !(@ in left._get("left"))
      @left.left.push @
    if !(@ in right._get("right"))
      @right.right.push @


  # Unbind from old selection and rebind it
  # @param [Word] left a word instance to bind at left, or null to keep previous
  # @param [Word] right a word instance to bind at right, or null to keep previous
  rebind: (left, right) ->
    left = left or @left
    right = right or @right

    @left.removeSel @, "left"
    @right.removeSel @, "right"

    @_set("left", left)
    @_set("right", right)

    @bind @left, @right


  # Clone the current selection and apply style
  # @param [String] style the new style
  # @return [Selection] a clone of this selection
  clone: (style) ->
    newSel = new Selection 0, 0, @richText, {style: style, bind: false}

    newSel._set("leftPos",  @leftPos)
    newSel._set("rightPos", @rightPos)

    newSel.setStyle _.clone(@style)

    newSel.bind @left, @right
    newSel.richText.pushSel newSel

    newSel

  # Delete all selections within this selection and update all selections
  # that overlap with this one to point to the word passed as argument, position
  # 0
  # @param [Word] wordToBoundTo the word to bound overlapping selections to
  deleteHelper: (wordToBound, posToBound=0) ->
    thisSel = @
    selections = @richText.getSelections((s) -> s != thisSel)

    tmpSelections = []
    # delete selection contained in deleted selection
    for sel, index in selections
      if not (sel.in thisSel)
        tmpSelections.push sel
        continue
      # console.log sel.print()+" in "+thisSel.print()
      sel.unbind()
      @richText.removeSel sel

    selections = tmpSelections
    tmpSelections = []
    # update selections at left of deleted selection
    for sel, index in selections
      if not (sel.atLeftOf thisSel)
        tmpSelections.push sel
        continue
      # console.log sel.print()+" at left of "+thisSel.print()
      [left, right] = sel.unbind()
      sel.rightPos = posToBound
      sel.bind left, wordToBound

      if sel.isEmpty()
        sel.unbind()
        @richText.removeSel sel

    selections = tmpSelections
    tmpSelections = []
    # update selections at right of deleted selection
    for sel, index in selections
      if not (thisSel.atLeftOf sel)
        continue
      # console.log thisSel.print()+" at left of "+sel.print()
      [left, right] = sel.unbind()
      sel._set("leftPos",  posToBound)
      sel.bind wordToBound, right

      if sel.isEmpty()
        sel.unbind()
        @richText.removeSel sel

if module?
  module.exports.relativeFromAbsolute = relativeFromAbsolute
  module.exports.absoluteFromRelative =absoluteFromRelative
  module.exports.Selection = Selection
  module.exports.Word = Word
  module.exports.customList = customList
  module.exports.BaseClass = BaseClass

if window?
  window.relativeFromAbsolute = relativeFromAbsolute
  window.absoluteFromRelative =absoluteFromRelative
  window.Selection = Selection
  window.Word = Word
