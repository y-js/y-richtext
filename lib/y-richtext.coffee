misc = (require "./misc.coffee")
BaseClass = misc.BaseClass
Locker = misc.Locker
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
  constructor: (editor_name, editor_instance) ->
    @locker = new Locker()
    @_graphicsPalette = ['#837DFA', '#FA7D7D','#34DA43', '#D1BC30']

    if editor_name? and editor_instance?
      @_bind_later =
        name: editor_name
        instance: editor_instance

    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    # @author = author
    # TODO: assign an id / author name to the rich text instance for authorship

  #
  # Bind the RichText type to a rich text editor (e.g. quilljs)
  #
  bind: ()->
    # TODO: bind to multiple editors
    if arguments[0] instanceof Editors.AbstractEditor
      # is already an editor!
      @editor = arguments[0]
    else
      [editor_name, editor_instance] = arguments
      if @editor? and @editor.getEditor() is editor_instance
        # return, if @editor is already bound! (never bind twice!)
        return
      Editor = Editors[editor_name]
      if Editor?
        @editor = new Editor editor_instance
      else
        throw new Error "This type of editor is not supported! (" +
          editor_name + ")"

    # TODO: parse the following directly from $characters+$selections (in O(n))
    @editor.setContents
      ops: @getDelta()

    # bind the rest..
    # TODO: remove observers, when editor is overwritten
    @editor.observeLocalText @passDeltas
    @bindEventsToEditor @editor
    @editor.observeLocalCursor @updateCursorPosition

    # pull changes from quill, before message is received
    # as suggested https://discuss.quilljs.com/t/problems-in-collaborative-implementation/258
    # TODO: move this to Editors.coffee
    @_model.connector.receive_handlers.unshift ()=>
      @editor.checkUpdate()


  getDelta: ()->
    text_content = @_model.getContent('characters').val()
    # transform Y.Selections.getSelections() to a delta
    expected_pos = 0
    deltas = []
    selections = @_model.getContent("selections")
    for sel in selections.getSelections(@_model.getContent("characters"))
      # (+1), because if we select from 1 to 1 (with y-selections), then the
      # length is 1
      selection_length = sel.to - sel.from + 1
      if expected_pos isnt sel.from
        # There is unselected text. $retain to the next selection
        unselected_insert_content = text_content.splice(
          0, sel.from-expected_pos )
          .join('')
        deltas.push
          insert: unselected_insert_content
        expected_pos += unselected_insert_content.length
      if expected_pos isnt sel.from
        throw new Error "This portion of code must not be reached in getDelta!"
      deltas.push
        insert: text_content.splice(0, selection_length).join('')
        attributes: sel.attrs
      expected_pos += selection_length
    if text_content.length > 0
      deltas.push
        insert: text_content.join('')
    deltas

  _getModel: (Y, Operation) ->
    if not @_model?
      # we save this stuff as _static_ content now.
      # Therefore, you can't overwrite it, after you once saved it.
      # But on the upside, we can always make sure, that they are defined!
      content_operations =
        selections: new Y.Selections()
        characters: new Y.List()
        cursors: new Y.Object()
        authors: new Y.Object()
      @_model = new Operation.MapManager(@, null, {}, content_operations )
        .execute()

      @_setModel @_model

      if @_bind_later?
        Editor = Editors[@_bind_later.name]
        if Editor?
          editor = new Editor @_bind_later.instance
        else
          throw new Error "This type of editor is not supported! (" +
          editor_name + ") -- fatal error!"
        @passDeltas editor.getContents()
        @bind editor
        delete @_bind_later

      # listen to events on the model using the function propagateToEditor
      @_model.observe @propagateToEditor
    return @_model

  _setModel: (model) ->
    super

  _name: "RichText"

  getText: ()->
    @_model.getContent('characters').val().join('')

  # insert our own cursor in the cursors object
  # @param position [Integer] the position where to insert it
  setCursor : (position) ->
    @selfCursor = @_model.getContent("characters").ref(position)

    @_model.getContent("cursors").val(@_model.HB.getUserId(), @selfCursor)

  setAuthor : (option) ->
    if option? and option.name?
      name = option.name
    else
      name = if @author? and @author.name then @author.name else 'Default user'

    if option? and option.color?
      color = option.color
    else
      # if already a color set
      if @author? and @author.color
        color = @author.color
      else # if no color, pick the next one from the palette
        n_authors = 0
        for auth of @_model.getContent('authors').val()
          n_authors++
        color = @_graphicsPalette[n_authors % @_graphicsPalette.length]


    @author =
       name: name
       color: color

    console.log option, @author
    @_model.getContent('authors').val(@_model.HB.getUserId(), @author)

  # pass deltas to the character instance
  # @param deltas [Array<Object>] an array of deltas
  # @see ot-types for more info
  passDeltas : (deltas) => @locker.try ()=>
    position = 0
    for delta in deltas
      position = deltaHelper @, delta, position

  # @override updateCursorPosition(index)
  #   update the position of our cursor to the new one using an index
  #   @param index [Integer] the new index
  # @override updateCursorPosition(character)
  #   update the position of our cursor to the new one using a character
  #   @param character [Character] the new character
  updateCursorPosition : (obj) => @locker.try ()=>
    if typeof obj is "number"
      @selfCursor = @_model.getContent("characters").ref(obj)
    else
      @selfCursor = obj

    @_model.getContent("cursors").val(@_model.HB.getUserId(), @selfCursor)


  # describe how to propagate yjs events to the editor
  # TODO: should be private!
  bindEventsToEditor : (editor) ->
    # update the editor when something on the $characters happens
    @_model.getContent("characters").observe (events) => @locker.try ()=>
      for event in events
        delta =
          ops: [{retain: event.position}]

        if event.type is "insert"
          delta.ops.push {insert: event.value}

        else if event.type is "delete"
          delta.ops.push {delete: 1}
          # delete cursor, if it references to this position
          for cursor_name, cursor_ref in @_model.getContent("cursors").val()
            if cursor_ref is event.reference
              window.setTimeout(()->
                  @_model.getContent("cursors").delete(cursor_name)
                , 0)
        else
          return

        @editor.updateContents delta

    # update the editor when something on the $selections happens
    @_model.getContent("selections").observe (event) => @locker.try ()=>
      attrs = {}
      if event.type is "select"
        for attr,val of event.attrs
          attrs[attr] = val
      else # is "unselect"!
        for attr in event.attrs
          attrs[attr] = null
      retain = event.from.getPosition()
      selection_length = event.to.getPosition()-event.from.getPosition()+1
      @editor.updateContents
        ops: [
          {retain: retain},
          {retain: selection_length, attributes: attrs}
        ]

    # update the editor when the cursor is moved
    @_model.getContent("cursors").observe (events) => @locker.try ()=>
      for event in events
        if event.type is "update" or event.type is "add"
          authorId = event.changedBy
          ref_to_char = event.object.val(authorId)

          if ref_to_char is null
            position = @editor.getLength()
          else if ref_to_char?
            if ref_to_char.isDeleted()
              #
              # we have to delete the cursor if the reference does not exist anymore
              # the downside of this approach is that everyone will send this delete event!
              # in the future, we could replace the cursors, with a y-selections
              #
              window.setTimeout(()->
                  event.object.delete(authorId)
                , 0)
              return
            else
              position = ref_to_char.getPosition()
          else
            console.warn "ref_to_char is undefined"
            return
          author_info = @_model.getContent('authors').val(authorId)
          params =
            id: authorId
            index: position
            name: author_info?.name or "Default user"
            color: author_info?.color or "grey"
          @editor.setCursor params
        else
          @editor.removeCursor event.name

    @_model.connector.onUserEvent (event)=>
      if event.action is "userLeft"
        @_model.getContent("cursors").delete(event.user)

    @_model.getContent('authors').observe (events) => @locker.try ()=>
      for event in events
        @editor.removeCursor event.changedBy




  # Apply a delta and return the new position
  # @param delta [Object] a *single* delta (see ot-types for more info)
  # @param position [Integer] start position for the delta, default: 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  deltaHelper = (thisObj, delta, position = 0) ->
    if delta?
      selections = thisObj._model.getContent("selections")
      delta_unselections = []
      delta_selections = {}
      for n,v of delta.attributes
        if v?
          delta_selections[n] = v
        else
          delta_unselections.push n

      if delta.insert?
        insert_content = delta.insert
        content_array =
          if typeof insert_content is "string"
            insert_content.split("")
          else if typeof insert_content is "number"
            [insert_content]
          else
            throw new Error "Got an unexpected value in delta.insert! (" +
            (typeof content) + ")"
        insertHelper thisObj, position, content_array
        from = thisObj._model.getContent("characters").ref position
        to = thisObj._model.getContent("characters").ref(
          position+content_array.length-1)
        thisObj._model.getContent("selections").select(
          from, to, delta_selections, true)
        thisObj._model.getContent("selections").unselect(
          from, to, delta_unselections)

        return position + content_array.length

      else if delta.delete?
        deleteHelper thisObj, position, delta.delete
        return position

      else if delta.retain?
        retain = parseInt delta.retain
        from = thisObj._model.getContent("characters").ref(position)
        # we set `position+retain-1`, -1 because when selecting one char,
        # Y-selections will only mark this one char (as beginning and end)
        to = thisObj._model.getContent("characters").ref(position + retain - 1)

        thisObj._model.getContent("selections").select(
          from, to, delta_selections)
        thisObj._model.getContent("selections").unselect(
          from, to, delta_unselections)

        return position + retain
      throw new Error "This part of code must not be reached!"

  insertHelper = (thisObj, position, content_array) ->
    thisObj._model.getContent("characters").insertContents(
      position, content_array)

  deleteHelper = (thisObj, position, length = 1) ->
    thisObj._model.getContent("characters").delete position, length

if window?
  if window.Y?
    window.Y.RichText = YRichText
  else
    throw new Error "You must first import Y!"

if module?
  module.exports = YRichText
