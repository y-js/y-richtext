misc = require("./misc.coffee")

# a generic editor class
class AbstractEditor
  # create an editor instance
  # @param instance [Editor] the editor object
  constructor: (@editor) ->
    @locker = new misc.Locker()

  # get the current content as a ot-delta
  getContents: ()-> throw new Error "Implement me"

  # get the current cursor position
  getCursor: () -> throw new Error "Implement me"
  # set the current cursor position
  # @param param [Option] the options
  # @option param [Integer] id the id of the author
  # @option param [Integer] index the index of the cursor
  # @option param [String] text the text of the cursor
  # @option param [String] color the color of the cursor
  setCursor: (param) -> throw new Error "Implement me"
  removeCursor: ()-> throw new Error "Implement me"


  # remove a cursor
  # @param id [String] the id of the cursor to remove
  removeCursor: (id) -> throw new Error "Implement me"

  # describe how to pass local modifications of the text to the backend.
  # @param backend [Function] the function to pass the delta to
  # @note The backend function takes a list of deltas as argument
  observeLocalText: (backend) -> throw new Error "Implement me"

  # describe how to pass local modifications of the cursor to the backend
  # @param backend [Function] the function to pass the new position to
  # @note the backend function takes a position as argument
  observeLocalCursor: (backend) -> throw new Error "Implement me"

  # Apply delta on the editor
  # @param delta [Delta] the delta to propagate to the editor
  # @see https://github.com/ottypes/rich-text
  updateContents: (delta) -> throw new Error "Implement me"

  # Remove old content and apply delta on the editor
  # @param delta [Delta] the delta to propagate to the editor
  # @see https://github.com/ottypes/rich-text
  setContents: (delta) -> throw new Error "Implement me"

  # Return the editor instance
  getEditor: ()-> throw new Error "Implement me"

  # Check if the editor tries to accumulate messages. This is executed every time before Yjs executes a messages
  checkUpdate: ()-> throw new Error "Implement me"

class QuillJs extends AbstractEditor

  constructor: (@editor) ->
    super @editor
    @_cursors = @editor.getModule("multi-cursor")

  # Return the length of the text
  getLength: ()->
    @editor.getLength()

  getCursorPosition: ->
    selection = @editor.getSelection()
    if selection
      selection.start
    else
      0

  getContents: ()->
    @editor.getContents().ops

  setCursor: (param) -> @locker.try ()=>
    cursor = @_cursors.cursors[param.id]
    if cursor? and cursor.color == param.color
      fun = (index) =>
        @_cursors.moveCursor param.id, index
    else
      if cursor? and cursor.color? and cursor.color != param.color
        @removeCursor param.id

      fun = (index) =>
        @_cursors.setCursor(param.id, index,
          param.name, param.color)

    if param.index?
      fun param.index

  removeCursor: (id) ->
    @_cursors.removeCursor(id)

  removeCursor: (id)->
      @_cursors.removeCursor id

  observeLocalText: (backend)->
    @editor.on "text-change", (deltas, source) ->
      # call the backend with deltas
      position = backend deltas.ops
      # trigger an extra event to move cursor to position of inserted text
      @editor.selection.emitter.emit(
        @editor.selection.emitter.constructor.events.SELECTION_CHANGE,
        @editor.quill.getSelection(),
        "user")

  observeLocalCursor: (backend) ->
    @editor.on "selection-change", (range, source)->
      if range and range.start == range.end
        backend range.start

  updateContents: (delta)->
    @editor.updateContents delta

  setContents: (delta)->
    @editor.setContents(delta)

  getEditor: ()->
    @editor

  checkUpdate: ()->
    @editor.editor.checkUpdate()

class TestEditor extends AbstractEditor

  constructor: (@editor) ->
    super

  getLength:() ->
    0

  getCursorPosition: ->
    0

  getContents: () ->
    ops: [{insert: "Well, this is a test!"}
      {insert: "And I'm bold…", attributes: {bold:true}}]

  setCursor: () ->
    ""

  observeLocalText:(backend) ->
    ""

  observeLocalCursor: (backend) ->
    ""

  updateContents: (delta) ->
    ""

  setContents: (delta)->
    ""

  getEditor: ()->
    @editor

exports.QuillJs = QuillJs
exports.TestEditor = TestEditor
exports.AbstractEditor = AbstractEditor
