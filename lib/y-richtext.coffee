BaseClass = (require "./misc.coffee").BaseClass
Editors = (require "./editors.coffee")
# All dependencies (like Y.Selections) to other types (that have its own
# repository) should  be included by the user (in order to reduce the amount of
# downloaded content).
# With html5 imports, we can include it automatically too. But with the old
# script tags this is the best solution that came to my mind.

# A class holding the information about rich text
class YRichText extends BaseClass
  # @param content [String] an initial string
  # @param editor [Editor] an editor instance
  # @param author [String] the name of the local author
  constructor: () ->
    @lock_editor_propagation = false
    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    # @author = author
    # TODO: assign an id / author name to the rich text instance for authorship

  #
  # Bind the RichText type to a rich text editor (e.g. quilljs)
  #
  bind: (editor_name, editor_instance)->
    # TODO: bind to multiple editors
    # TODO: accept instance of quill, not an editor abstraction
    Editor = Editors[editor_name]
    if Editor?
      @editor = new Editor editor_instance

      # TODO: parse the following directly from $characters+$selections (in O(n))
      @editor.editor.deleteText(0, @editor.editor.getText().length)
      @editor.updateContents
        ops: [{insert: @_get("characters").val().join("")}]
      # transform Y.Selections.getSelections() to a delta
      expected_pos = 0
      selections = [] # we will apply these selections on quill (therefore they have to be transformed)
      for sel in @_get("selections").getSelections(@_get("characters"))
        selection_length = sel.to - sel.from
        if expected_pos isnt sel.from
          # There is unselected text. $retain to the next selection
          selections.push
            retain: sel.from-expected_pos
        selections.push
          retain: selection_length
          attributes: sel.attrs
        expected_pos += selection_length
      # update the selections of the editor accordingly
      @editor.updateContents
        ops: selections

      # bind the rest..
      @editor.observeLocalText @passDeltas
      @bindEventsToEditor @editor
      @editor.observeLocalCursor @updateCursorPosition
    else
      throw new Error "This type of editor is not supported!"

  _getModel: (Y, Operation) ->
    if not @_model?
      super

      @_set "selections", new Y.Selections()
      @_set "characters", new Y.List()
      @_set "cursors", new Y.Object()

      @_setModel @_model

      # listen to events on the model using the function propagateToEditor
      @_model.observe @propagateToEditor
    return @_model

  _setModel: (model) ->
    super

  _name: "RichText"

  # insert our own cursor in the cursors object
  # @param position [Integer] the position where to insert it
  setCursor : (position) ->
    @selfCursor = (@_get "characters").ref(position)
    (@_get "cursors").val(@_model.HB.getUserId(), @selfCursor)


  # pass deltas to the character instance
  # @param deltas [Array<Object>] an array of deltas (see ot-types for more info)
  passDeltas : (deltas) => # TODO: don't bind to $this
    if @lock_editor_propagation
      # break, if lock is on
      return
    @lock_editor_propagation = true
    position = 0
    for delta in deltas
      position = @deltaHelper delta, position
    @lock_editor_propagation = false

  # @override updateCursorPosition(index)
  #   update the position of our cursor to the new one using an index
  #   @param index [Integer] the new index
  # @override updateCursorPosition(character)
  #   update the position of our cursor to the new one using a character
  #   @param character [Character] the new character
  updateCursorPosition : (obj) =>
    if @lock_editor_propagation
      # break, if lock is on
      return
    @lock_editor_propagation = true
    if typeof obj is "number"
      @selfCursor = (@_get "characters").ref(obj)
    else
      @selfCursor = obj
    (@_get "cursors").val(@_model.HB.getUserId(), @selfCursor)
    @lock_editor_propagation = false

  # describe how to propagate yjs events to the editor
  # TODO: should be private!
  bindEventsToEditor : (editor) ->
    # update the editor when something on the $cursors happens
    ###
    @_get("cursors").observe (events)=>
      if @lock_editor_propagation
        # break, if lock is on
        return
      @lock_editor_propagation = true
      for event in events
        id = event.name
        index = event.object.val(event.name).getPosition()
        text = event.name
        color = "grey" # FIXME

        @editor.setCursor id, index, text, color
      this.lock_editor_propagation = false
      @lock_editor_propagation = false
    ###

    # update the editor when something on the $characters happens
    @_get("characters").observe (events)=>
      if @lock_editor_propagation
        # break, if lock is on
        return
      @lock_editor_propagation = true
      for event in events
        delta =
          ops: [{retain: event.position}]

        if event.type is "insert"
          delta.ops.push {insert: event.value}

        else if event.type is "delete"
          delta.ops.push {delete: 1}

        @editor.updateContents delta
      @lock_editor_propagation = false

    # update the editor when something on the $selections happens
    @_get("selections").observe (event)=>
      if @lock_editor_propagation
        # break, if lock is on
        return
      @lock_editor_propagation = true

      attrs = {}
      if event.type is "select"
        for attr,val of event.attrs
          attrs[attr] = val
      else # is "unselect"!
        for attr in event.attrs
          attrs[attr] = null
      retain = event.from.getPosition()
      selection_length = event.to.getPosition()-event.from.getPosition()
      @editor.updateContents
        ops: [
          {retain: retain},
          {retain: selection_length, attributes: attrs}
        ]

      @lock_editor_propagation = false

    # update the editor when the cursor is moved
    @_get("cursors").observe (events)=>
      if this.lock_editor_propagation
        # break, if lock is on
        return
      this.lock_editor_propagation = true

      for event in events
        author = event.changedBy
        position = event.object.val(author)
        if position != null
          params =
            id: author
            index: event.object.val(author).getPosition()
            text: author
            color: "grey"
          @editor.setCursor params

      this.lock_editor_propagation = false

  # Apply a delta and return the new position
  # @param delta [Object] a *single* delta (see ot-types for more info)
  # @param position [Integer] start position for the delta, default: 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  deltaHelper= (delta, position = 0) =>
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

  insertHelper= (position, content) =>
    as_array =
      if typeof content is "string"
        content.split("")
      else if typeof content is "number"
        [content]
    if as_array?
      @_get("characters").insertContents position, as_array

  deleteHelper= (position, length = 1) =>
    console.log "deleteHelper"
    (@_get "characters").delete position, length

if window?
  if window.Y?
    window.Y.RichText = YRichText
  else
    throw new Error "You must first import Y!"

if module?
  module.exports = YRichText
