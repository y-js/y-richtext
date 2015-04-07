Characters = require 'characters'
Selections = require '../../y-selections'

class RichText
  constructor: (content, editor) ->
    # TODO: generate a UID
    @selections = new Selections
    @characters = new Characters content, @selections
    @_cursors = []

    @editor = editor
    @editor.cursors = @editor.getModule("multi-cursor")

  _getModel: (Y, Operation) ->
    if not @_model?
      sels = @selections._getModel(Y, Operation)
      chars = @characters._getModel(Y, Operation)
      cursors = new Operation.ListManager(@).execute()
      cursors.insert 0, @_cursors

      @_model = new Operation.MapManager(@).execute()
      @_model.val "selections", sels
      @_model.val "characters", chars
      @_model.val "cursors", cursors

      @_setModel @_model
    return @_model

  _setModel: (model) ->
    # TODO: check that our cursor is in the cursors
    @_model = model
    delete @_cursors
  set: (key, val) ->
    @_model.val key, val
  get: (key) ->
    @_model.val key
  delete: (key) ->
    @_model.delete key

  toQuill: (events) ->
    for event in events
      switch event.name
        when "cursors"
          cursorPos = @characters.indexOf event.object.char
          @editor.cursors.setCursor event.object.author,
            cursorPos,
            event.object.author,
            'grey' #FIXME

        when "characters"
          charPos = @characters.indexOf event.object
          if event.type == "update"
            #TODO: inherit attributes
            delta = {ops: [{retain: charPos},
              {delete: 1},
              {insert: event.object.char, attributes: event.object.attributes}
            ]}
          else if event.type == "add"
            delta = {ops: [{retain:charPos},
              {insert: event.object.char, attributes: event.object.attributes}
            ]}
          else if event.type == "delete"
            delta = {ops: [{retain:charPos},
              {delete: 1}
            ]}
          @editor.setContents delta

          # propagate new string
        when "selections"
          selectionStart = @characters.indexOf (event.object.left or event.oldValue.left)
          selectionEnd = @characters.indexOf (event.object.right or event.oldValue.right)
          attributes = event.object.attributes
          if event.type == "update" or event.type == "insert"
            delta = {ops: [{retain: selectionStart},
              {retain: selectionEnd-selectionStart, attributes: attributes}
            ]}
            @editor.setContents delta
          else if event.type == "delete"
            #FIXME
            console.log "Ohow… what am I supposed to do there?"
