chai      = require('chai')
expect    = chai.expect
should    = chai.should()
sinon     = require('sinon')
sinonChai = require('sinon-chai')
_         = require("underscore")

chai.use(sinonChai)

Y = require "../../yjs/lib/y"
Y.Characters = require "../lib/characters.coffee"
Y.Selections = require "../../y-selections/lib/y-selections"

Connector = require "../../y-test/lib/y-test.coffee"

TestSuite = require "../../yjs/test/object-test"

class CharacterTest extends TestSuite

  constructor: (suffix)->
    super suffix, Y

  type: "CharacterTest"

  makeNewUser: (userId)->
    conn = new Connector userId
    new Y conn

  initUsers: (u)->
    characters = new Y.Characters()
    characters.selections = new Y.Selections()
    u.val "CharacterTest", characters
  getRandomRoot: (user_num)->
    @users[user_num].val("CharacterTest")

  getContent: (user_num)->
    @users[user_num].val("CharacterTest").val()

describe "Text Test", ->
  @timeout 500000
  beforeEach (done)->
    @yTest = new CharacterTest()
    done()

  it "can handle many engines, many operations, concurrently (random)", ->
    console.log "" # TODO
    @yTest.run()

  it.only "simple multi-char insert", ->
    u = @yTest.users[0].val("CharacterTest")
    u.insert 0, "abc"
    u = @yTest.users[1].val("CharacterTest")
    u.insert 0, "xyz"
    @yTest.compareAll()
    u.delete 0, 1
    @yTest.compareAll()
    expect(u.val()).to.equal("bcxyz")

  it "Observers work on shared Text (insert type observers, local and foreign)", ->
    u = @yTest.users[0].val("CharacterTest",new Y.Text("my awesome Text")).val("CharacterTest")
    @yTest.flushAll()
    last_task = null
    observer1 = (changes)->
      expect(changes.length).to.equal(1)
      change = changes[0]
      expect(change.type).to.equal("insert")
      expect(change.object).to.equal(u)
      expect(change.value).to.equal("a")
      expect(change.position).to.equal(1)
      expect(change.changedBy).to.equal('0')
      last_task = "observer1"
    u.observe observer1
    u.insert 1, "a"
    expect(last_task).to.equal("observer1")
    u.unobserve observer1

    observer2 = (changes)->
      expect(changes.length).to.equal(1)
      change = changes[0]
      expect(change.type).to.equal("insert")
      expect(change.object).to.equal(u)
      expect(change.value).to.equal("x")
      expect(change.position).to.equal(0)
      expect(change.changedBy).to.equal('1')
      last_task = "observer2"
    u.observe observer2
    v = @yTest.users[1].val("CharacterTest")
    v.insert 0, "x"
    @yTest.flushAll()
    expect(last_task).to.equal("observer2")
    u.unobserve observer2

  it "Observers work on shared Text (delete type observers, local and foreign)", ->
    u = @yTest.users[0].val("CharacterTest",new Y.Text("my awesome Text")).val("CharacterTest")
    @yTest.flushAll()
    last_task = null
    observer1 = (changes)->
      expect(changes.length).to.equal(1)
      change = changes[0]
      expect(change.type).to.equal("delete")
      expect(change.object).to.equal(u)
      expect(change.position).to.equal(1)
      expect(change.length).to.equal(1)
      expect(change.changedBy).to.equal('0')
      last_task = "observer1"
    u.observe observer1
    u.delete 1, 1
    expect(last_task).to.equal("observer1")
    u.unobserve observer1

    observer2 = (changes)->
      expect(changes.length).to.equal(1)
      change = changes[0]
      expect(change.type).to.equal("delete")
      expect(change.object).to.equal(u)
      expect(change.position).to.equal(0)
      expect(change.length).to.equal(1)
      expect(change.changedBy).to.equal('1')
      last_task = "observer2"
    u.observe observer2
    v = @yTest.users[1].val("CharacterTest")
    v.delete 0, 1
    @yTest.flushAll()
    expect(last_task).to.equal("observer2")
    u.unobserve observer2

  it "can handle many engines, many operations, concurrently (random)", ->
    console.log("testiy deleted this TODO:dtrn")
    @yTest.run()

  it "handles double-late-join", ->
    test = new CharacterTest("double")
    test.run()
    @yTest.run()
    u1 = test.users[0]
    u2 = @yTest.users[1]
    ops1 = u1._model.HB._encode()
    ops2 = u2._model.HB._encode()
    u1._model.engine.applyOp ops2, true
    u2._model.engine.applyOp ops1, true
    compare = (o1, o2)->
      if o1._name? and o1._name isnt o2._name
        throw new Error "different types"
      else if o1._name is "Object"
        for name, val of o1.val()
          compare(val, o2.val(name))
      else if o1._name?
        compare(o1.val(), o2.val())
      else if o1 isnt o2
        throw new Error "different values"
    compare u1, u2
    expect(test.getContent(0)).to.deep.equal(@yTest.getContent(1))


module.exports = CharacterTest
#chai      = require 'chai'     # assertion library
#expect    = chai.expect()
#should    = chai.should()
#sinon     = require 'sinon'    # test spies, stubs and mocks for js
#sinonChai = require 'sinon-chai'
#_         = require "underscore"
#$         = require 'jquery'
#
#chai.use(sinonChai)
#chai.config.includeStack = true
#
#Characters = (require '../lib/characters.coffee').Characters
#
#Y = require "../../yjs/lib/y"
#Connector = require '../../y-test/lib/y-test.coffee'
#
#testString = "This is a test"
#
#describe "Characters", ->
#  conn = new Connector "hello"
#  y = new Y conn
#  c = new Characters testString
#  it "constructor", ->
#    c._chars.length.should.equal testString.length
#    for char, key in testString
#      c._chars[key].char.should.equal char
#  it "setModel", ->
#    y.val "test", c
#    console.log c
#
#  it "getModel", ->
#
#  it "createChar", ->
#
#  it "insert", ->
#    n = "not "
#    newString = "This is not a test"
#    c.insert 8, n
#    for char, key in newString
#      c._chars[key].char.should.equal char
#
#  it "val", ->
#
#  it "delete", ->
#  it "update", ->
#  it "bindSelection", ->
#  it "unbindSelection", ->
#  it "delta", ->
#
#
#
