chai      = require('chai')     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require('sinon')    # test spies, stubs and mocks for js
sinonChai = require('sinon-chai')
_         = require("underscore")
$         = require('jquery')

chai.use(sinonChai)
chai.config.includeStack = true

[Rte, Selection] = require '../lib/y-rte'


describe 'Rich Text type should', ->
  rte1 = rte2 = null
  ar = ["This", "is", "a ", "test"]

  it 'initialize correctly', ->
    rte1 = new Rte "Test"
    rte1.val().should.equal "Test"

  it 'split the words correctly', ->
    rte1 = new Rte "This is a  test"
    rte1.val().should.equal "This is a  test"
    rte1 = new Rte "   "
    rte1.val().should.equal "   "

  it 'insert words correctly', ->
    rte1 = new Rte "is"
    rte1.insertWords(0, ["This "])
    rte1.val().should.equal "This is"
    rte1.insertWords(2, [" sparta ", "!"])
    rte1.val().should.equal "This is sparta !"

  it 'delete words correctly', ->
    rte1 = new Rte "This There is a mistake in this sentence!"
    rte1.deleteWords(0, 1)
    rte1.val().should.equal "There is a mistake in this sentence!"

    rte1 = new Rte "This are There is a mistake in this sentence!"
    rte1.deleteWords(0, 2)
    rte1.val().should.equal "There is a mistake in this sentence!"

    rte1 = new Rte "There is a mistake in this sentence! there"
    rte1.deleteWords(7, 8)
    rte1.val().should.equal "There is a mistake in this sentence! "

  it 'insert characters correctly at relative positions', ->
    rte1 = new Rte "I lot the gam"
    rte1.insert({startPos: {word:1, pos:2}}, 's')
    rte1.val().should.equal "I lost the gam"

    rte1.insert({startPos: {word:3, pos:3}}, 'e')
    rte1.val().should.equal "I lost the game"

  it 'delete relative selection correctly', ->
    rte1 = new Rte "yjs is really nyice"
    sel = new Selection(15, 16, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "yjs is really nice"

  it 'not delete space after word when selection ends at last character', ->
    rte1 = new Rte "I am yjs here!"
    sel = new Selection(5, 8, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "I am  here!"

  it 'delete space and merge (if necessary)', ->
    rte1 = new Rte "y jjs is here!"
    sel = new Selection(1, 3, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "yjs is here!"

  it 'merge words when no space anymore', ->
    rte1 = new Rte "yjs is is here!"
    sel = new Selection(4, 7, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "yjs is here!"

  it 'merge the two words', ->
    rte1 = new Rte "Hel lo"
    rte1.merge(0)
    rte1.val().should.equal "Hello"

  # it 'throw an error', ->
  #   rte1 = new Rte "Some string"
  #   sel = new Selection({word:1, pos:0}, {word:0, pos:0})
  #   expect(rte1.deleteSel(sel)).to.throw Error("Invalid selection")

  it 'should accept deltas (insert)', ->
    delta = { ops:[
      { insert: 'Gandalf', attributes: { bold: true } },
      { insert: ' the ' },
      { insert: 'Grey', attributes: { color: '#ccc' } }
      ] }
    rte1 = new Rte ""
    rte1.delta delta
    rte1.val().should.equal "Gandalf the Grey"
    rte1._rte.words.length.should.equal 3
    rte1._rte.words[0].word.should.equal "Gandalf "

  it 'should accept deltas (retain & delete)', ->
    delta = { ops:[
      { retain: 7, attributes: { bold: true } },
      { delete: 4},
      ] }
    rte1 = new Rte "Gandalf the Grey"
    rte1.delta delta
    rte1.val().should.equal "Gandalf Grey"

  it 'should accept deltas (style)', ->
    delta = {ops:[
      { retain: 7, attributes: {bold: true } }]}
    rte1 = new Rte "Gandalf the Grey"
    rte1.delta delta
    console.log rte1.getWord(0)

describe 'Selection object should', ->
  sel = sel2 = rte = null

  it 'be initialized with three parameters', ->
    rte = new Rte "Zero One two three four five"
    sel = new Selection 1, 7, rte

    sel.should.have.property('startPos')
    sel.should.have.deep.property('startPos.word', 0)
    sel.should.have.deep.property('startPos.pos', 1)

    sel.should.have.property('endPos')
    sel.should.have.deep.property('endPos.word', 1)
    sel.should.have.deep.property('endPos.pos', 2)

  it 'merge correctly the selections', ->
    rte = new Rte "Zero One two three four five"
    sel = new Selection 0, 1, rte
    sel2 = new Selection 1, 10, rte

    sel.merge sel2, rte
    rte._rte.selections.length.should.equal 1
    rte._rte.selections[0].equals(sel2).should.be.true

    sel2.should.have.deep.property 'startPos.word', 0
    sel2.should.have.deep.property 'startPos.pos', 0
    sel2.should.have.deep.property 'endPos.word', 2
    sel2.should.have.deep.property 'endPos.pos', 1
