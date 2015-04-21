Locker = (require "./misc.coffee").Locker
# a generic editor class
class AbstractEditor
  # create an editor instance
  # @param instance [Editor] the editor object
  constructor: (@editor) ->
    @locker = new Locker()

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

class QuillJs extends AbstractEditor
  constructor: (@editor) ->
    super @editor
    @_cursors = @editor.getModule("multi-cursor")

  getCursorPosition: ->
    selection = @editor.getSelection()
    if selection
      selection.start
    else
      0

  getContents: ()->
    @editor.getContents().ops

  setCursor: (param) -> @locker.try ()=>
    @_cursors.setCursor param.id, param.index, param.text, param.color

  observeLocalText: (backend)->
    @editor.on "text-change", (deltas, source)->
      # call the backend with deltas
      backend deltas.ops

  observeLocalCursor: (backend) ->
    @editor.on "selection-change", (range, source)->
      if range and range.start == range.end
        backend range.start
        console.log range.start

  updateContents: (delta)->
    @editor.updateContents delta

  setContents: (delta)->
    @editor.setContents(delta)

  getEditor: ()->
    @editor

class TestEditor extends AbstractEditor
  constructor: (@editor) ->
    super

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
