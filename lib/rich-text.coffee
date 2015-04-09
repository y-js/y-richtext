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
    # FIXME: shouldn't go there because of modularity
    @editor.cursors = @editor.getModule("multi-cursor")

  _getModel: (Y, Operation) ->
    if not @_model?
      # call the _getModel for each
      sels = @_selections._getModel(Y, Operation)
      chars = @_characters._getModel(Y, Operation)
      cursors = new Operation.ListManager(@).execute()

      @_model = new Operation.MapManager(@).execute()
      @_model.val "selections", sels
      @_model.val "characters", chars
      @_model.val "cursors", cursors

      @setCursor()

    return @_model

  _setModel: (model) ->
    @_model = model
    # check that our cursor isn't in the cursor list
    if _.all (@get "cursors").val(), (cursor -> cursor.author != @author)
      @setCursor()

  set: (key, val) ->
    @_model.val key, val
  get: (key) ->
    @_model.val key
  delete: (key) ->
    @_model.delete key

  setCursor: () ->
    if @editor.getSelection()
      position = (@get "characters").val @editor.getSelection().start
    else
      position = (@get "characters").val 0

    selfCursor =
      author: @author
      position: position
      color: "grey" # FIXME
    (@get "cursors").insert 0, selfCursor

  toQuill: (events) ->
    for event in events
      switch event.name
        when "cursors"
          id = event.object.author
          index = (@get "characters").indexOf event.object.char
          text = event.object.author
          color = "grey" # FIXME

          if event.type == "update" or event.type == "add"
            @editor.cursors.setCursor id, index, text, color

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
