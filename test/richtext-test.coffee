blanket   = require 'blanket'
chai      = require 'chai'     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require 'sinon'    # test spies, stubs and mocks for js
sinonChai = require 'sinon-chai'
_         = require "underscore"
$         = require 'jquery'

chai.use(sinonChai)
chai.config.includeStack = true
blanket()
Y = require '../../yjs/lib/y.coffee'
Connector = require '../../y-test/lib/y-test.coffee'
Y.RichText = require '../lib/y-richtext.coffee'

Y.Selections = require '../../y-selections/lib/y-selections.coffee'
Y.List = require '../../y-list/lib/y-list.coffee'
TestEditor = (require '../lib/editors.coffee').TestEditor


print = (richText) ->
  return richText._model.getContent("characters").val().join("")

describe 'deltas', ->
  richText = null
  beforeEach () ->
    richText = (() ->
      con = new Connector "abc"
      y = new Y con
      editor = new TestEditor()
      y.val("test", new Y.RichText("TestEditor", null))
      y.val("test"))()

  it 'insertion', ->
    richText.passDeltas [{insert: "abc"}]
    print(richText).should.equal "abc"

  it 'deletion', ->
    richText.passDeltas [{insert: "abc"}]
    richText.passDeltas [{delete: 1}]
    print(richText).should.equal "bc"

  it 'retain', ->
    richText.passDeltas [{insert: "abc"}]
    richText.passDeltas [{retain: 1}, {delete: 1}]
    print(richText).should.equal "ac"
