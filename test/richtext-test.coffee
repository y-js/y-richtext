chai      = require 'chai'     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require 'sinon'    # test spies, stubs and mocks for js
sinonChai = require 'sinon-chai'
_         = require "underscore"
$         = require 'jquery'

chai.use(sinonChai)
chai.config.includeStack = true

Y = require '../../yjs/lib/y.coffee'
Connector = require '../../y-test/lib/y-test.coffee'
Y.RichText = require '../lib/y-richtext.coffee'
TestEditor = (require '../lib/editor-abstraction.coffee').TestEditor

describe 'a', ->
  richText = null
  beforeEach () ->
    con = new Connector "abc"
    y = new Y con
    editor = new TestEditor()
    y.val("test", new Y.RichText(editor))
    richText = y.val("test")


  it 'b', ->
    richText.passDeltas [{insert: "abc"}]

