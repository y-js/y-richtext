BaseClass = (require "./misc.coffee").BaseClass

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
  constructor: () ->
    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    # @author = author
    # TODO: assign an id / author name to the rich text instance for authorship

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
      @_set "cursors", new Y.Object()

      # set the cursor
      @_setCursor @editor.getCursorPosition()
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
      @_setCursor @editor.getCursorPosition()

  # insert our own cursor in the cursors object
  # @param position [Integer] the position where to insert it
  setCursor = (position) ->
    @selfCursor = (@_get "characters").ref(position)
    (@_get "cursors").val(@_model.HB.getUserId(), @selfCursor)

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
      @selfCursor = (@_get "characters").ref(obj)
    else
      @selfCursor = obj
    (@_get "cursors").val(@_model.HB.getUserId(), @selfCursor)

  # describe how to propagate yjs events to the editor
  # TODO: should be private!
  bindEventsToEditor = (editor) ->
    # update the editor when something on the $cursors happens
    @_get("cursors").observe (events)=>
      for event in events
        id = event.name
        index = event.object.val(event.name).getPosition()
        text = event.name
        color = "grey" # FIXME

        @editor.setCursor id, index, text, color

    # update the editor when something on the $characters happens
    @_get("characters").observe (events)=>
      for event in events
        delta =
          ops: [{retain: event.position}]

        if event.type == "insert"
          delta.ops.push {insert: event.value}

        else if event.type == "delete"
          delta.ops.push {delete: 1}

        @editor.updateContents delta

    # update the editor when something on the $selections happens
    @_get("selections").observe (events)=>
      for event in events
        attrs = {}
        if event.type is "select"
          for attr,val of event.attrs
            attr[attr] = val
        else # is "unselect"!
          for attr in event.attrs
            attrs[attr] = null
        retain = event.from.getPosition()
        selection_length = event.to.getPosition()-event.from.getPosition()
        delta =
          ops: [
            {retain: retain},
            {retain: selection_length, attributes: attrs}
          ]
 

  # Apply a delta and return the new position
  # @param delta [Object] a *single* delta (see ot-types for more info)
  # @param position [Integer] start position for the delta, default: 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  deltaHelper = (delta, position =0) ->
    if delta?
      selections = (@_get "selections")
      delta_unselections = []
      delta_selections = {}
      for n,v of delta.attributes
        if v?
          delta_selections[n] = v
        else
          delta_unselections.push n

      if delta.insert?
        @insertHelper position, delta.insert
        from = @_get("characters").ref(position)
        to = @_get("characters").ref(position+delta.insert.length)
        @_get("selections").select from, to, delta_selections
        @_get("selections").unselect from, to, delta_unselections

        return position + delta.insert.length

      else if delta.delete?
        @deleteHelper position, delta.delete
        return position

      else if delta.retain?
        retain = parseInt delta.retain
        from = @_get("characters").ref(position)
        to = @_get("characters").ref(position + retain)

        @_get("selections").select from, to, delta_selections
        @_get("selections").unselect from, to, delta_unselections

        return position + retain
      throw new Error "This part of code must not be reached!"

  insertHelper = (position, content) ->
    if content?
      @_get("characters").insertContents position, content.split("") # convert content to an array

  deleteHelper = (position, length = 1) ->
    (@_get "characters").delete position, length
