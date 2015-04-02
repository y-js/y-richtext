class Characters
  constructor: (content) ->
    @_chars = []
    @insert content, 0

  _name: "Characters"
  _setModel: (model) ->
    del @_chars
    @_model = model

  _getModel: (Y, Operation) ->
    if (@_model == null)
      model = new Operation.ListManager(@).execute()
      _setModel model
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
  # @param [Integer] position the position where to insert
  # @param [String] content the content to insert
  insert: (position, content) ->
    if content != null
      for char in content
        @_model.insert position, (@createChar char)

  # @override val (position)
  #   get the content at position
  #   @param position [Integer] the position where to get the value
  #   @return [Object] character object at position
  # @override val()
  #   get all the content as an array
  #   @return [Array<Object>] an array of all the characters
  val: (position) ->
    @_model.val position

  # Remove content at position and report the selections to the character to the left, if any
  # @param position [Integer] the first position where to delete the value
  # @param length [Integer] the number of characters to remove, defaults to 1
  # @return char [Object] the deleted character at position
  delete: (position, length) ->
    char = @val position
    # remove any selection over this character
    delta =
      action: "remove"
      from: char
      to: char
    for selection in char.left
      selection.pushDelta delta
    # TODO: check that we do not apply twice the same delta
    for selection in char.right
      selection.pushDelta delta

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

  # Unind a selection from a character
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

  # Apply a delta and return the new position
  delta: (delta, position) ->
    if delta?
      if not position?
        position = 0
      if delta.insert?
        deltaSelection =
          from: position
          to: position + delta.insert.length
          action: "set"
        @insert position, delta.insert
        return position + delta.insert.length
      else if delta.delete?
        deltaSelection =
          from: position
          to: position + delta.delete
          action: "delete"
        @delete position, delta.delete
        return position
      else if delta.retain?
        deltaSelection =
          from: position
          to: position + delta.retain
          action: "set"

        return position + delta.retain

      # FIXME: their may be a problem here if selections are updated *after* the words are updated
      # because the new indexes of the word may have changed
      # do something in case there's a style
      if delta.attributes?
        # create the transformation to apply to the selections
        deltaSelection.attributes = attributes