class Characters
  constructor: (content) ->
    @_chars = []
    @insert content, 0

  _setModel: (model) ->
    del @_chars
    @_model = model

  _getModel: (Y, Operation) ->
    if (@_model != null)
      model = new Operation.ListManager(@).execute()
      _setModel model

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
  # @note: should we report the ending selections at character to the leftto this new character
  insert: (content, position) ->
    if content != null
      for char in content
        @_model.insert position, (@createChar char)

  val: (position) ->
    @_model.val position

  # Remove content at position and report the selections to the character to the left, if any
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



