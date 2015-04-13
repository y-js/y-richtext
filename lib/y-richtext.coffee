BaseClass = (require "./misc.coffee").BaseClass
Y = require '../../yjs/lib/y.coffee'
Y.List = require '../../y-list/lib/y-list.coffee'
Y.Selections = require '../../y-selections/lib/y-selections.coffee'


# All dependencies (like Y.Selections) to other types (that have its own
# repository) should  be included by the user (in order to reduce the amount of
# downloaded content).
# With html5 imports, we can include it automatically too. But with the old
# script tags this is the best solution that came to my mind.

# A class holding the information about rich text
class RichText extends BaseClass
  # @param content [String] an initial string
  # @param editor [Editor] an editor instance
  # @param author [String] the name of the local author
  constructor: (editor) ->
    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    # @author = author
    # TODO: assign an id / author name to the rich text instance for authorship
    if editor?
      @bindEditor editor
  #
  # Bind the RichText type to a rich text editor (e.g. quilljs)
  #
  bindEditor: (@editor)->
    # TODO: bind to multiple editors
    # TODO: accept instance of quill, not an editor abstraction
    @editor.observeLocalText @passDeltas
    @editor.observeLocalCursor @updateCursorPosition

  _getModel: (Y, Operation) ->
    if not @_model?
      super

      @_set "selections", new Y.Selections()
      @_set "characters", new Y.List()
      @_set "cursors", new Y.List()

      # set the cursor
      @_setCursor @editor.getCursor()
      @_setModel @_model

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
      @_setCursor @editor.getCursor()

    delete @_characters
    delete @_selections
    delete @_cursors

  # insert our own cursor in the cursors list
  # @param position [Integer] the position where to insert it
  setCursor = (position) ->
    character = (@_get "characters").val(position)
    selfCursor =
      author: @author
      position: character
      color: "grey" # FIXME
    (@_get "cursors").insert 0, selfCursor
    @selfCursor = (@_get "cursors").ref 0

  # pass deltas to the character instance
  # @param deltas [Array<Object>] an array of deltas (see ot-types for more info)
  passDeltas = (deltas) ->
    position = 0
    for delta in deltas
      position = @deltaHelper delta, position

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
          index = @indexOf event.object.char
          text = event.object.author
          color = "grey" # FIXME

          if event.type == "update" or event.type == "add"
            @editor.setCursor id, index, text, color

        when "characters"
          charPos = @indexOf event.object
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
          selectionStart = @indexOf left
          selectionEnd = @indexOf right
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

  # Apply a delta and return the new position
  # @param delta [Object] a *single* delta (see ot-types for more info)
  # @param position [Integer] start position for the delta, default: 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  deltaHelper = (delta, position =0) ->
    if delta?
      arentNull = (el) -> el != null
      selections = (@_get "selections")
      if _.all delta.attributes, arentNull
        operation = selections.select
      else
        operation = selections.unselect

      if delta.insert?
        @insertHelper position, delta.insert
        from = @val position
        to = @val (position + delta.insert.length)
        operation.call selections, from, to, delta.attributes
        return position + delta.insert.length

      else if delta.delete?
        @deleteHelper position, delta.delete
        return position

      else if delta.retain?
        retain = parseInt delta.retain
        from = @val position
        to = @val (position + retain)

        operation.call selections, from, to, delta.attributes
        return position + retain

  insertHelper = (position, content) ->
    pusher = (position, char) =>
      if @_model?
        (@_get "characters").insert position, char
      else
        @_chars.splice position, 0, char
      position + 1

    if content != null
      for char, offset in content
        charObj = @createChar char
        pusher (position + offset), charObj

  deleteHelper = (position, length = 1) ->
    (@_get "characters").delete position, length

  createChar = (char, left=[], right=[]) ->
    return new Y.Object char: char
      left: left
      right: right

  # return the index of a character
  # @param character [Y.Object] the character to look for
  #TODO: check that it works
  indexOf = (character) ->
    (@_get "characters").val().indexOf(character)
if module?
  module.exports = RichText
