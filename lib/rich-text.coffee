Characters = require 'characters'
Selections = require '../../y-selections'

# A class holding the information about rich text
class RichText
  # @param content [String] an initial string
  # @param editor [Editor] an editor instance
  # @param author [String] the name of the local author
  constructor: (content, editor, author) ->
    # TODO: generate a UID
    @_selections = new Selections()
    @_characters = new Characters content, @_selections
    @author = author

    @editor = editor
    @editor.observeLocalText @passDelta
    @editor.observeLocalCursor @updateCursorPosition

  _getModel: (Y, Operation) ->
    console.log "getting model"
    if not @_model?
      # call the _getModel for each
      sels = @_selections._getModel(Y, Operation)
      chars = @_characters._getModel(Y, Operation)
      cursors = new Operation.ListManager(@).execute()

      model = new Operation.MapManager(@).execute()
      model.val "selections", @_selections
      model.val "characters", @_characters
      model.val "cursors", cursors

      @setCursor @editor.getCursorPosition()
      @_setModel model

      # listen to events on the model using the function propagateToEditor
      @_model.observe @propagateToEditor
    return @_model

  _setModel: (model) ->
    @_model = model

    noneFound = true
    for cursor in (@get "cursors").val()
      if cursor.author == @author
        @updateCursorPosition(cursor.position)
        noneFound = false
        break

    if noneFound
      @setCursor @editor.getCursorPosition()
    else

    delete @_characters
    delete @_selections

  set: (key, val) ->
    @_model.val key, val
  get: (key) ->
    @_model.val key
  delete: (key) ->
    @_model.delete key

  # insert our own cursor in the cursors list
  # @param position [Integer] the position where to insert it
  setCursor = (position) ->
    word = (@get "characters").val(position)
    selfCursor =
      author: @author
      position: word
      color: "grey" # FIXME
    (@get "cursors").insert 0, selfCursor
    @selfCursor = (@get "cursors").ref 0

  # pass a delta to the character instance
  # @param delta [Object] a delta (see ot-types for more info)
  passDelta = (delta) ->
    (@get "characters").delta delta

  # @override updateCursorPosition(index)
  #   update the position of our cursor to the new one using an index
  #   @param index [Integer] the new index
  # @override updateCursorPosition(character)
  #   update the position of our cursor to the new one using a character
  #   @param character [Character] the new character
  updateCursorPosition = (obj) ->
    if typeof obj == "number"
      char = (@get "characters").val(obj)
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
          index = (@get "characters").indexOf event.object.char
          text = event.object.author
          color = "grey" # FIXME

          if event.type == "update" or event.type == "add"
            @editor.setCursor id, index, text, color

        when "characters"
          charPos = (@get "characters").indexOf event.object
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
          selectionStart = (@get "characters").indexOf (event.object.left or event.oldValue.left)
          selectionEnd = (@get "characters").indexOf (event.object.right or event.oldValue.right)
          attributes = event.object.attributes
          if event.type == "update" or event.type == "insert"
            delta = {ops: [{retain: selectionStart},
              {retain: selectionEnd-selectionStart, attributes: attributes}
            ]}
            @editor.setContents delta
          else if event.type == "delete"
            #FIXME: depending on how it is implemented, selections can be overriden by negating
            #their values (set them to null) or the can just be deleted, let's see then…
            console.log "Ohow… what am I supposed to do there?"
