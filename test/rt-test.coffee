chai      = require('chai')     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require('sinon')    # test spies, stubs and mocks for js
sinonChai = require('sinon-chai')
_         = require("underscore")
$         = require('jquery')

chai.use(sinonChai)
chai.config.includeStack = true

yRt = require '../lib/y-rte'

describe 'Rich Text type should', ->
  rt1 = rt2 = null
  ar = ["This", "is", "a ", "test"]

  it 'initialize correctly [constructor, val]', ->
    rt1 = new yRt.Rt "Test"
    rt1.val().should.equal "Test"

  it 'split the words correctly [push]', ->
    rt1 = new yRt.Rt "This is a  test"
    rt1.val().should.equal "This is a  test"
    rt1 = new yRt.Rt "   "
    rt1.val().should.equal "   "

  it 'get word correctly [getWord]', ->
    rt1 = new yRt.Rt "This is a  test"
    rt1.getWord(0).word.should.equal "This "
    rt1.getWord(1).word.should.equal "is "
    rt1.getWord(2).word.should.equal "a  "
    rt1.getWord(3).word.should.equal "test"

  it 'set word correctly [setWord]', ->
    rt1 = new yRt.Rt "This is a  test"
    rt1.setWord(2, 'a ')
    rt1.val().should.equal "This is a test"

  it 'insert words correctly [insertWords]', ->
    rt1 = new yRt.Rt "is"
    rt1.insertWords(0, ["This "])
    rt1.val().should.equal "This is"
    rt1.insertWords(2, [" sparta ", "!"])
    rt1.val().should.equal "This is sparta !"

  it 'delete words correctly [deleteWords]', ->
    rt1 = new yRt.Rt "This There is a mistake in this sentence!"
    rt1.deleteWords(0, 1)
    rt1.val().should.equal "There is a mistake in this sentence!"

    rt1 = new yRt.Rt "This are There is a mistake in this sentence!"
    rt1.deleteWords(0, 2)
    rt1.val().should.equal "There is a mistake in this sentence!"

    rt1 = new yRt.Rt "There is a mistake in this sentence! there"
    rt1.deleteWords(7, 8)
    rt1.val().should.equal "There is a mistake in this sentence! "

  it 'not delete space after word when selection ends at last character
   [deleteSel]', ->
    rt1 = new yRt.Rt "I am yjs here!"
    sel = new yRt.Selection(5, 8, rt1)
    rt1.deleteSel(sel)
    rt1.val().should.equal "I am  here!"

  it 'delete space and merge (if necessary) [deleteSel]', ->
    rt1 = new yRt.Rt "y jjs is here!"
    sel = new yRt.Selection(1, 3, rt1)
    rt1.deleteSel(sel)
    rt1.val().should.equal "yjs is here!"

  it 'merge words when no space anymore [deleteSel]', ->
    rt1 = new yRt.Rt "yjs is is here!"
    sel = new yRt.Selection(4, 7, rt1)
    rt1.deleteSel(sel)
    rt1.val().should.equal "yjs is here!"

  it 'merge the two words [merge]', ->
    rt1 = new yRt.Rt "Hel lo"
    rt1.merge(0)
    rt1.val().should.equal "Hello"

  it 'insert correctly [insert]', ->
    rt1 =  new yRt.Rt ""

    rt1.insert(0, "Two words")
    rt1.val().should.equal "Two words"
    rt1._rt.words.length.should.equal 2

    rt1.insert(4, "insertd ")
    rt1.val().should.equal "Two insertd words"
    rt1._rt.words.length.should.equal 3

   it 'accept deltas (insert) [delta]', ->
    delta = { ops:[
      { insert: 'Gandalf', attributes: { bold: true } },
      { insert: ' the ' },
      { insert: 'Grey', attributes: { color: '#ccc' } },
      { insert: '.'}
      ] }
    rt1 = new yRt.Rt()

    rt1.delta delta

    rt1.val().should.equal "Gandalf the Grey."
    rt1._rt.words.length.should.equal 4
    rt1._rt.words[0].word.should.equal "Gandalf "
    rt1._rt.selections[0].should.have.property 'left', rt1.getWord(0)
    rt1._rt.selections.length.should.equal 2

  it 'accept styles [delta]', ->
    delta = { ops:[
      { insert: 'Gandalf', attributes: { bold: true } },
      { insert: ' the ' },
      { insert: 'Grey', attributes: { bold: true } }
      ] }
    rt1 = new yRt.Rt()
    rt1.delta delta
    delta1 = {ops: [
      {retain: 7},
      {retain: 5, attributes: {bold: true}}
      ]}
    rt1.delta delta1
    rt1.getSelections().length.should.equal 1

  it 'should accept deltas (retain & delete) [delta]', ->
    delta = { ops:[
      { retain: 7, attributes: { bold: true } },
      { delete: 4},
      ] }
    rt1 = new yRt.Rt "Gandalf the Grey"
    rt1.delta delta
    rt1.val().should.equal "Gandalf Grey"

describe 'Utilities', ->
  it 'should convert correctly [relativeFromAbsolute]', ->
    rt = new yRt.Rt "Zero One two three four five"
    pos = yRt.relativeFromAbsolute 0, rt
    pos.should.have.property 'word', 0
    pos.should.have.property 'pos', 0

    pos = yRt.relativeFromAbsolute 7, rt
    pos.should.have.property 'word', 1
    pos.should.have.property 'pos', 2

  it 'should convert correctly [absoluteFromRelative]', ->
    rt = new yRt.Rt "Zero One two three four five"
    pos = yRt.absoluteFromRelative 0, 2, rt
    pos.should.equal 2

    pos = yRt.absoluteFromRelative 1, 2, rt
    pos.should.equal 7

describe 'y-rt.Selection object should', ->
  sel = sel2 = word = null
  rt = new yRt.Rt "Zero One two three four five"

  it 'initialized with three parameters [constructor]', ->
    sel = new yRt.Selection 1, 7, rt

  it 'convert positions correctly [_relativeFromAbsolute]', ->
    sel = new yRt.Selection 1, 7, rt
    sel.should.have.property 'left', (rt.getWord 0)
    sel.should.have.property 'leftPos', 1

    sel.should.have.property 'right', (rt.getWord 1)
    sel.should.have.property 'rightPos', 2

  it 'have an order relation [gt]', ->
    sel0 = new yRt.Selection 1, 7, rt
    (sel0.gt((rt.getWord 0), 0, "left")).should.be.true
    (sel0.gt((rt.getWord 0), 0, "right")).should.be.true

    (sel0.gt((rt.getWord 1), 0, "left")).should.be.false
    (sel0.gt((rt.getWord 1), 0, "right")).should.be.true

    (sel0.gt((rt.getWord 1), 2, "left")).should.be.false
    (sel0.gt((rt.getWord 1), 2, "right")).should.be.true

    (sel0.gt((rt.getWord 1), 3, "left")).should.be.false
    (sel0.gt((rt.getWord 1), 3, "right")).should.be.false

  it 'have an order relation [lt]', ->
    sel0 = new yRt.Selection 1, 7, rt
    (sel0.lt((rt.getWord 0), 0, "left")).should.be.false
    (sel0.lt((rt.getWord 0), 0, "right")).should.be.false

    (sel0.lt((rt.getWord 1), 0, "left")).should.be.true
    (sel0.lt((rt.getWord 1), 0, "right")).should.be.false

    (sel0.lt((rt.getWord 1), 2, "left")).should.be.true
    (sel0.lt((rt.getWord 1), 2, "right")).should.be.true

    (sel0.lt((rt.getWord 1), 3, "left")).should.be.true
    (sel0.lt((rt.getWord 1), 3, "right")).should.be.true

  it 'have working functions [equals,notEquals,in,contains,overlaps,atLeftOf]', ->
    sel0 = new yRt.Selection 0, 1, rt
    sel1 = new yRt.Selection 1, 2, rt
    sel2 = new yRt.Selection 0, 2, rt
    sel3 = new yRt.Selection 2, 3, rt
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
    sel0.atLeftOf(sel2).should.be.true
    sel0.atLeftOf(sel3).should.be.false

  it 'return good values for [isValid]', ->
    sel0 = new yRt.Selection 1, 0, rt
    sel1 = new yRt.Selection 0, 1, rt

    sel0.isValid().should.be.false
    sel1.isValid().should.be.true


  it 'split correcly two selections [split]', ->
    rt = new yRt.Rt "Zero one two three"
    sel0 = new yRt.Selection 0, 10, rt, {style: {foo: "bar"}}
    sel1 = new yRt.Selection 2, 8, rt, {style: {foo: "ping pong is awesome"}}

    sel0.split sel1 # nothing happens!
    rt.getSelections().length.should.equal 2

    sel1.split sel0 # should create a new selection at right of sel1
    sels = rt.getSelections()

    sels.length.should.equal 3
    sels[0].should.equal sel0
    sels[1].should.equal sel1
    sels[2].leftPos.should.equal(sels[1].rightPos)
    sels[2].left.word.should.equal(sels[1].right.word)

  it 'unbind correctly [unbind]', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel = new yRt.Selection 0, 1, rt
    sel2 = new yRt.Selection 0, 5, rt
    sel.unbind()
    (sel.left == null).should.be.true
    (sel.right == null).should.be.true
    rt.getWord(0).left.length.should.equal 1
    rt.getWord(0).right.length.should.equal 0

describe 'Selection.merge ', ->
  it 'not merging', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel0 = new yRt.Selection 0, 1, rt, {style: {foo: "bar"}}
    sel1 = new yRt.Selection 0, 1, rt, {style: {mergeMe: "I'm famous"}}
    sel2 = new yRt.Selection 2, 10, rt, {style: {foo: "bar"}}

    sel0.merge sel0 # same selection
    rt._rt.selections.length.should.equal 3

    sel0.merge sel1 # not same style
    rt._rt.selections.length.should.equal 3

    sel0.merge sel2 # not merging
    rt._rt.selections.length.should.equal 3

    sel0.merge() # no argument
    rt._rt.selections.length.should.equal 3

  it 'at right', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel0 = new yRt.Selection 0, 1, rt, {style: {foo: "bar"}}
    sel1 = new yRt.Selection 0, 1, rt, {style: {mergeMe: "I'm famous"}}
    sel2 = new yRt.Selection 1, 10, rt, {style: {foo: "bar"}}
    sel0.merge sel2
    rt._rt.selections.length.should.equal 2
    rt._rt.selections.indexOf(sel2).should.equal -1

    leftWord = rt.getWord 0
    rightWord = rt.getWord 2

    sel0.should.have.deep.property 'left', leftWord
    sel0.should.have.deep.property 'leftPos', 0
    sel0.should.have.deep.property 'right', rightWord
    sel0.should.have.deep.property 'rightPos', 1

  it 'at left', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel0 = new yRt.Selection 0, 1, rt, {style: {foo: "bar"}}
    sel2 = new yRt.Selection 1, 10, rt, {style: {foo: "bar"}}

    sel2.merge sel0, rt
    rt._rt.selections.length.should.equal 1
    rt._rt.selections.indexOf(sel0).should.equal -1

  it 'in', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel0 = new yRt.Selection 0, 10, rt
    sel2 = new yRt.Selection 2, 5, rt

    console.log sel2.in sel0
    sel2.merge sel0, rt
    rt._rt.selections.length.should.equal 1
    rt._rt.selections.indexOf(sel0).should.equal -1

  it 'contains', ->
    rt = new yRt.Rt "Zero One two three four five"
    sel0 = new yRt.Selection 0, 10, rt
    sel2 = new yRt.Selection 2, 5, rt

    sel0.merge sel2, rt
    rt._rt.selections.length.should.equal 1
    rt._rt.selections.indexOf(sel2).should.equal -1


describe 'Word objects should', ->
  sel = sel2 = rt = word = null
  it 'be linked correctly to selections [constructor]', ->
    rt = new yRt.Rt "This is a test"
    sel = new yRt.Selection 0, 6, rt
    word = rt.getWord(0)
    word.left[0].equals(sel).should.be.true
    word.right.length.should.equals 0

    word = rt.getWord(1)
    word.left.length.should.equals 0
    word.right[0].equals(sel).should.be.true

  it 'remove selection correctly [removeSel]', ->
    rt = new yRt.Rt "This is a test"
    sel = new yRt.Selection 0, 6, rt
    word = rt.getWord(0)
    word.removeSel sel, "left"
    word.left.length.should.equals 0

    word = rt.getWord(1)
    word.right.length.should.equals 1

  it 'be able to get its index in RTE instance [index]', ->
    rt = new yRt.Rt "This is a test"
    rt.val()
    word = rt.getWord( 3)
    word.index(rt).should.equal 3

describe 'y-rt.Selections objects should get updated when', ->
  it 'deleting words [deleteWords]', ->
    rt = new yRt.Rt "This is a test with many words."
    sel1 = new yRt.Selection 8, 10, rt # will be deleted
    sel2 = new yRt.Selection 0, 6, rt # will be updated
    sel3 = new yRt.Selection 10, 18, rt # will be updated
    rt.deleteWords 1, 4 # deleting "is ", "a " and "test "
    # rt is now "This with many words."

    rt.getSelections().indexOf(sel1).should.equal -1

    sel2.left.should.equal rt.getWord(0)
    sel2.right.should.equal rt.getWord(1)

    sel3.left.should.equal rt.getWord(1)
    sel3.leftPos.should.equal 0
    sel3.right.should.equal rt.getWord(1)
    sel3.rightPos.should.equal 3

  it 'merging words [merge]', ->
    rt = new yRt.Rt "Long sword is a kind of sword."
    sel1 = new yRt.Selection 2, 15, rt # will point on Longsword at left
    sel2 = new yRt.Selection 4, 6, rt # will point on Longsword at left
    rt.merge 0
    sel1.left.should.equal rt.getWord(0)
    sel1.right.should.equal rt.getWord(2)

    sel2.left.should.equal rt.getWord(0)
    sel2.right.should.equal rt.getWord(0)

  it 'deleting a selection [deleteSel]', ->
    rt = new yRt.Rt "I'm the real test"
    sel = new yRt.Selection 2, 8, rt
    sel2 = new yRt.Selection 0, 2, rt, {bind: false}
    rt.deleteSel sel2
    sel.left.should.equal (rt.getWord 0)
    sel.leftPos.should.equal 0
    sel.right.should.equal (rt.getWord 2)
    sel.rightPos.should.equal 0

  it 'inserting content [insert]', ->
    rt = new yRt.Rt "Th is a test"
    sel = new yRt.Selection 2, 8, rt

    rt.insert 2, 'is'
    sel.left.should.equal rt.getWord(0)
    sel.leftPos.should.equal 4

    sel.right.should.equal rt.getWord(3)
    sel.rightPos.should.equal 0

  it 'inserting words [insertWords]', ->
    rt = new yRt.Rt "This is a test"

    sel = new yRt.Selection 2, 8, rt
    [leftPos, rightPos, this_word, a_word] = [sel.leftPos, sel.rightPos,
                                              sel.left, sel.right]

    toInsert = 'is really cool, ain\'t it? Because this'.split(' ')
    rt.insertWords 1, toInsert
    sel.left.should.equal this_word
    sel.right.should.equal a_word

    sel.leftPos.should.equal leftPos
    sel.rightPos.should.equal rightPos
