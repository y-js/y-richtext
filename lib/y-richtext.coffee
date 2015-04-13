# All dependencies (like Y.Selections) to other types (that have its own
# repository) should  be included by the user (in order to reduce the amount of
# downloaded content).
# With html5 imports, we can include it automatically too. But with the old
# script tags this is the best solution that came to my mind.

# A class holding the information about rich text
class RichText
  # @param content [String] an initial string
  # @param editor [Editor] an editor instance
  # @param author [String] the name of the local author
  constructor: () ->
    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    @author = author

  #
  # Bind the RichText type to an rich text editor (e.g. quilljs)
  #
  bindEditor: (@editor)->
    # TODO: bind to multiple editors
    # TODO: accept instance of quill, not an editor abstraction
    @editor.observeLocalText @passDelta
    @editor.observeLocalCursor @updateCursorPosition

  _getModel: (Y, Operation) ->
    if not @_model?
      super
      @_selections = new Y.Selections()
      @_characters = new Characters content, @_selections
      @setCursor @editor.getCursorPosition()
      @_setModel model

      # listen to events on the model using the function propagateToEditor
      @_model.observe @propagateToEditor
    return @_model

  _setModel: (model) ->
    super

    noneFound = true
    for cursor in (@_get "cursors").val()
      if cursor.author == @author
        @updateCursorPosition(cursor.position)
        noneFound = false
        break

    if noneFound
      @_setCursor @editor.getCursorPosition()
    else

    delete @_characters
    delete @_selections

  # insert our own cursor in the cursors list
  # @param position [Integer] the position where to insert it
  setCursor = (position) ->
    word = (@_get "characters").val(position)
    selfCursor =
      author: @author
      position: word
      color: "grey" # FIXME
    (@_get "cursors").insert 0, selfCursor
    @selfCursor = (@_get "cursors").ref 0

  # pass a delta to the character instance
  # @param delta [Object] a delta (see ot-types for more info)
  passDelta = (delta) ->
    (@_get "characters").delta delta

  # @override updateCursorPosition(index)
  #   update the position of our cursor to the new one using an index
  #   @param index [Integer] the new index
  # @override updateCursorPosition(character)
  #   update the position of our cursor to the new one using a character
  #   @param character [Character] the new character
  updateCursorPosition = (obj) ->
    if typeof obj == "number"
      char = (@_get "characters").val(obj)
    else
      char = obj
    selfCursor = @selfCursor.val()
    selfCursor.position = char

  # describe how to propagate yjs events to the editor
  propagateToEditor = (events) ->
    for event in events
      switch event.name
        when "cursors"
          id = event.object.author
          index = (@_get "characters").indexOf event.object.char
          text = event.object.author
          color = "grey" # FIXME

          if event.type == "update" or event.type == "add"
            @editor.setCursor id, index, text, color

        when "characters"
          charPos = (@_get "characters").indexOf event.object
          delta = {ops: [{retain: charPos}]}
          del = {delete: 1}
          ins = {insert: event.object.char, attributes: event.object.attributes}
          if event.type == "update"
            #TODO: inherit attributes
            delta.ops.push del
            delta.ops.push ins

          else if event.type == "add"
            delta.ops.push ins

          else if event.type == "delete"
            delta.ops.push del

          @editor.setContents delta

        when "selections"
          left = (event.object.left or event.oldValue.left)
          right = (event.object.right or event.oldValue.right)
          selectionStart = (@_get "characters").indexOf left
          selectionEnd = (@_get "characters").indexOf right
          attributes = event.object.attributes
          if event.type == "update" or event.type == "insert"
            delta = {ops: [{retain: selectionStart},
              {retain: selectionEnd-selectionStart, attributes: attributes}
            ]}
            @editor.setContents delta
          else if event.type == "delete"
            #FIXME: depending on how it is implemented, selections can be
            # overridden by negating their values (set them to null) or they
            # can just be deleted
            console.log "Ohow… what am I supposed to do there?"
