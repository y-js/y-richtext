Y = require "../../yjs"
Y.Test = require "../../y-test"
_ = require "./is.coffee"

class Characters
  constructor: (content, selections) ->
    @_chars = []
    if content?
      @insert 0, content
    else

    if not selections?
      throw new Error "Missing argument 'selections'"
    else
      @selections = selections

  _name: "Characters"

  _setModel: (model) ->
    console.log "being set dude"
    delete @_chars
    @_model = model

  _getModel: (Y, Operation) ->
    if not @_model?
      model = new Operation.ListManager(@).execute()
      console.log model
      model.insert 0, @_chars
      console.lg model
      @_setModel model
    return @_model

  # Function that creates a character object
  # @param char [String] the character
  # @param left [Array<Selection>] an array of selections starting at this char
  # @param right [Array<Selection>] an array of selections ending at this char
  createChar: (char, left, right) ->
    if not left?
      left = []
    if not right?
      right = []
    object =
      char: char
      left: left
      right: right
    object

  # Insert content at position
  #
  # @param [Integer] position the position where to insert
  # @param [String] content the content to insert
  #
  # @note if the _model hasn't been created, push it in  _chars
  insert: (position, content) ->
    pusher = (position, char) =>
      if @_model?
        @_model.insert position, char
      else
        @_chars.splice position, 0, char
      return position + 1

    if content != null
      for char in content
        position = pusher position, (@createChar char)

  # @override val (position)
  #   get the content at position
  #   @param position [Integer] the position where to get the value
  #   @return [Object] character object at position
  # @override val()
  #   get all the content as an array
  #   @return [Array<Object>] an array of all the characters
  val: (position) ->
    @_model.val position

  # Get a reference to the position
  # @param position [Integer] the position to reference
  ref: (position) ->
    @_model.ref position

  # Remove content at position and report the selections to the character to the left, if any
  # @param position [Integer] the first position where to delete the value
  # @param length [Integer] the number of characters to remove, defaults to 1
  # @return char [Object] the deleted character at position
  delete: (position, length) ->
    @_model.delete position, length

  # Updates the character value at position with new character
  # @param position [Integer] the position where to update the value
  # @parma newChar [String] the new character to put at position
  # @note this method does NOT change the selections bound to the character at position
  # @return char [Object] the character at position
  update: (position, newChar) ->
    #TODO: update with an update function
    old = @_model.delete position
    updated = old.char = newChar
    @_model.delete position
    @_model.insert position, updated

  # Bind a selection to a character
  # @param position [Integer] the position of the character to bind
  # @param selection [Selection] the selection to bind
  # @param side [String] the side to bind, either "left" or "right"
  # @return char [Object] the character at position
  bindSelection: (position, selection, side) ->
    if side == "left" or side == "right"
      char = @val position
      if not (selection in char[side])
        char[side].push selection
      return char

  # Unind a selectiocreateCharn from a character
  # @param position [Integer] the position of the character where to unbind
  # @param selection [Selection] the selection to unbind
  # @param side [String] the side to unbind, either "left" or "right"
  # @return char [Object] the character at position
  unbindSelection: (position, selection, side) ->
    if side == "left" or side == "right"
      char = @val position
      for sel, key in char[side]
        if sel == selection
          char[side].splice key, 1
      return char

  # Find the index of a character
  # parma
  indexOf: (character) ->
    for char, index in @_model.val()
      if char == character
        return index
    return -1
  # Apply a delta and return the new position
  # @param delta [Object] a delta (see ot-types for more info)
  # @param position [Integer] the position where to start applying the delta, defaults to 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  delta: (delta, position) ->
    if delta?
      if not position?
        position = 0

      arentNull = (el) ->
        el != null
      if _.all delta.attributes, arentNull
        operation = @_selections.select
      else
        operation = @_selections.unselect

      if delta.insert?
        @insert position, delta.insert
        from = @val position
        to = @val (position + delta.insert.length)
        operation from, to, delta.attributes
        return position + delta.insert.length

      else if delta.delete?
        @delete position, delta.delete
        return position

      else if delta.retain?
        from = @val position
        to = @val (position + delta.retain)

        operation from, to, delta.attributes
        return position + delta.retain

if module?
  module.exports = Characters
