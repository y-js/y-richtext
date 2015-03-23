chai      = require('chai')     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require('sinon')    # test spies, stubs and mocks for js
sinonChai = require('sinon-chai')
_         = require("underscore")
$         = require('jquery')

chai.use(sinonChai)
chai.config.includeStack = true

[Rte, Selection, Word] = require '../lib/y-rte'


describe 'Rich Text type should', ->
  rte1 = rte2 = null
  ar = ["This", "is", "a ", "test"]

  it 'initialize correctly [constructor, val]', ->
    rte1 = new Rte "Test"
    rte1.val().should.equal "Test"

  it 'split the words correctly [push]', ->
    rte1 = new Rte "This is a  test"
    rte1.val().should.equal "This is a  test"
    rte1 = new Rte "   "
    rte1.val().should.equal "   "

  it 'get word correctly [getWord]', ->
    rte1 = new Rte "This is a  test"
    rte1.getWord(0).word.should.equal "This "
    rte1.getWord(1).word.should.equal "is "
    rte1.getWord(2).word.should.equal "a  "
    rte1.getWord(3).word.should.equal "test"

  it 'set word correctly [setWord]', ->
    rte1 = new Rte "This is a  test"
    rte1.setWord(2, 'a ')
    rte1.val().should.equal "This is a test"

  it 'insert words correctly [insertWords]', ->
    rte1 = new Rte "is"
    rte1.insertWords(0, ["This "])
    rte1.val().should.equal "This is"
    rte1.insertWords(2, [" sparta ", "!"])
    rte1.val().should.equal "This is sparta !"

  it 'delete words correctly [deleteWords]', ->
    rte1 = new Rte "This There is a mistake in this sentence!"
    rte1.deleteWords(0, 1)
    rte1.val().should.equal "There is a mistake in this sentence!"

    rte1 = new Rte "This are There is a mistake in this sentence!"
    rte1.deleteWords(0, 2)
    rte1.val().should.equal "There is a mistake in this sentence!"

    rte1 = new Rte "There is a mistake in this sentence! there"
    rte1.deleteWords(7, 8)
    rte1.val().should.equal "There is a mistake in this sentence! "

  it 'not delete space after word when selection ends at last character [deleteSel]', ->
    rte1 = new Rte "I am yjs here!"
    sel = new Selection(5, 8, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "I am  here!"

  it 'delete space and merge (if necessary) [deleteSel]', ->
    rte1 = new Rte "y jjs is here!"
    sel = new Selection(1, 3, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "yjs is here!"

  it 'merge words when no space anymore [deleteSel]', ->
    rte1 = new Rte "yjs is is here!"
    sel = new Selection(4, 7, rte1)
    rte1.deleteSel(sel)
    rte1.val().should.equal "yjs is here!"

  it 'merge the two words [merge]', ->
    rte1 = new Rte "Hel lo"
    rte1.merge(0)
    rte1.val().should.equal "Hello"

  it 'insert correctly [insert]', ->
    rte1 =  new Rte ""
    sel = new Selection(0, 0, rte1)
    rte1.insert(sel, "Two words")
    rte1.val().should.equal "Two words"
    rte1._rte.words.length.should.equal 2
    sel = new Selection(4, 0, rte1)
    rte1.insert(sel, "inserted ")
    rte1.val().should.equal "Two inserted words"
    rte1._rte.words.length.should.equal 3

  it 'support styles [setStyle]', ->
    rte1 =  new Rte "I am testing styles"
    sel0 = new Selection 0, 3, rte1
    sel1 = new Selection 3, 4, rte1, 'some random style'

    rte1.setStyle sel0, "bold" # should leave sel0
    rte1._rte.selections.length.should.equal 2

    rte1.setStyle sel1, "italic" # should create a clone of sel0 with style italic
    rte1._rte.selections.length.should.equal 2
    rte1.setStyle sel1, "bold" # should merge
    rte1._rte.selections.length.should.equal 1

  it 'accept deltas (insert) [delta]', ->
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

  it 'should accept deltas (retain & delete) [delta]', ->
    delta = { ops:[
      { retain: 7, attributes: { bold: true } },
      { delete: 4},
      ] }
    rte1 = new Rte "Gandalf the Grey"
    rte1.delta delta
    rte1.val().should.equal "Gandalf Grey"

  it 'should accept deltas (style) [delta]', ->
    delta = {ops:[
      { retain: 7, attributes: {bold: true } }]}
    rte1 = new Rte "Gandalf the Grey"
    rte1.delta delta

describe 'Selection object should', ->
  sel = sel2 = word = null
  rte = new Rte "Zero One two three four five"

  it 'initialized with three parameters [constructor]', ->
    sel = new Selection 1, 7, rte

  it 'convert positions correctly [_relativeFromAbsolute]', ->
    sel = new Selection 1, 7, rte
    sel.should.have.property('startPos')
    sel.should.have.deep.property('startPos.word', 0)
    sel.should.have.deep.property('startPos.pos', 1)

    sel.should.have.property('endPos')
    sel.should.have.deep.property('endPos.word', 1)
    sel.should.have.deep.property('endPos.pos', 2)

  it 'have an order relation [startPos.gt,…]', ->
    sel0 = new Selection 1, 5, rte
    (sel0.startPos.gt {word: 0, pos: 0}).should.be.true
    (sel0.startPos.gt {word: 1, pos: 0}).should.be.false
    (sel0.startPos.gt {word: 0, pos: 1}).should.be.true
    (sel0.startPos.gt {word: 0, pos: 2}).should.be.false

  it 'have an order relation [startPos.lt, …]', ->
    sel0 = new Selection 1, 5, rte
    (sel0.startPos.lt {word: 0, pos: 0}).should.be.false
    (sel0.startPos.lt {word: 1, pos: 0}).should.be.true
    (sel0.startPos.lt {word: 0, pos: 1}).should.be.true
    (sel0.startPos.lt {word: 0, pos: 2}).should.be.true

  it 'have working functions [equals,notEquals,in,contains,overlaps,atLeftOf]', ->
    sel0 = new Selection 0, 1, rte
    sel1 = new Selection 1, 2, rte
    sel2 = new Selection 0, 2, rte
    sel3 = new Selection 2, 3, rte
    sel0.equals(sel0).should.be.true
    sel0.equals(sel1).should.be.false

    sel0.notEquals(sel0).should.be.false
    sel0.notEquals(sel1).should.be.true

    sel0.in(sel1).should.be.false
    sel0.in(sel2).should.be.true

    sel0.contains(sel1).should.be.false
    sel0.contains(sel2).should.be.false
    sel2.contains(sel0).should.be.true

    sel0.atLeftOf(sel1).should.be.true
    sel0.atLeftOf(sel2).should.be.false

  it 'return good values for [isValid]', ->
    sel0 = new Selection 1, 0, rte
    sel1 = new Selection 0, 1, rte

    sel0.isValid().should.be.false
    sel1.isValid().should.be.true

  it 'merge correctly the selections [merge]', ->
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

  it 'unbind correctly [unbind]', ->
    rte = new Rte "Zero One two three four five"
    sel = new Selection 0, 1, rte
    sel2 = new Selection 0, 5, rte
    sel.unbind()
    (sel.left == null).should.be.true
    (sel.right == null).should.be.true
    rte.getWord(0).left.length.should.equal 1
    rte.getWord(0).right.length.should.equal 0


describe 'Word objects should', ->
  sel = sel2 = rte = word = null
  it 'be linked correctly to selections [constructor]', ->
    rte = new Rte "This is a test"
    sel = new Selection 0, 6, rte
    word = rte.getWord(0)
    word.left[0].equals(sel).should.be.true
    word.right.length.should.equals 0

    word = rte.getWord(1)
    word.left.length.should.equals 0
    word.right[0].equals(sel).should.be.true

  it 'remove selection correctly [removeSel]', ->
    rte = new Rte "This is a test"
    sel = new Selection 0, 6, rte
    word = rte.getWord(0)
    word.removeSel sel, "left"
    word.left.length.should.equals 0

    word = rte.getWord(1)
    word.right.length.should.equals 1

  it 'be able to get its index in RTE instance [index]', ->
    rte = new Rte "This is a test"
    rte.val()
    word = rte.getWord( 3)
    word.index(rte).should.equal 3
