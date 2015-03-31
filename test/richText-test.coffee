chai      = require('chai')     # assertion library
expect    = chai.expect()
should    = chai.should()
sinon     = require('sinon')    # test spies, stubs and mocks for js
sinonChai = require('sinon-chai')
_         = require("underscore")
$         = require('jquery')

chai.use(sinonChai)
chai.config.includeStack = true

Y_richText = require '../lib/y-richtext.coffee'
Y =
  RichText: Y_richText.YRichText
  Selection: Y_richText.Selection
  Word: Y_richText.Word
  misc:
    absoluteFromRelative: Y_richText.absoluteFromRelative
    relativeFromAbsolute: Y_richText.relativeFromAbsolute

describe 'Rich Text type should', ->
  richText1 = RichText2 = null
  ar = ["This", "is", "a ", "test"]

  it 'initialize correctly [constructor, val]', ->
    richText1 = new Y.RichText "Test"
    richText1.val().should.equal "Test"

  it 'split the words correctly [push]', ->
    richText1 = new Y.RichText "This is a  test"
    richText1.val().should.equal "This is a  test"
    richText1 = new Y.RichText "   "
    richText1.val().should.equal "   "

  it 'get word correctly [getWord]', ->
    richText1 = new Y.RichText "This is a  test"
    richText1.getWord(0).word.should.equal "This "
    richText1.getWord(1).word.should.equal "is "
    richText1.getWord(2).word.should.equal "a  "
    richText1.getWord(3).word.should.equal "test"

  it 'set word correctly [setWord]', ->
    richText1 = new Y.RichText "This is a  test"
    richText1.setWord(2, 'a ')
    richText1.val().should.equal "This is a test"

  it 'insert words correctly [insertWords]', ->
    richText1 = new Y.RichText "is"
    richText1.insertWords(0, ["This "])
    richText1.val().should.equal "This is"
    richText1.insertWords(2, [" sparta ", "!"])
    richText1.val().should.equal "This is sparta !"

  it 'delete words correctly [deleteWords]', ->
    richText1 = new Y.RichText "This There is a mistake in this sentence!"
    richText1.deleteWords(0, 1)
    richText1.val().should.equal "There is a mistake in this sentence!"

    richText1 = new Y.RichText "This are There is a mistake in this sentence!"
    richText1.deleteWords(0, 2)
    richText1.val().should.equal "There is a mistake in this sentence!"

    richText1 = new Y.RichText "There is a mistake in this sentence! there"
    richText1.deleteWords(7, 8)
    richText1.val().should.equal "There is a mistake in this sentence! "

  it 'not delete space after word when selection ends at last character
   [deleteSel]', ->
    richText1 = new Y.RichText "I am yjs here!"
    sel = new Y.Selection(5, 8, richText1)
    richText1.deleteSel(sel)
    richText1.val().should.equal "I am  here!"

  it 'delete space and merge (if necessary) [deleteSel]', ->
    richText1 = new Y.RichText "y jjs is here!"
    sel = new Y.Selection(1, 3, richText1)
    richText1.deleteSel(sel)
    richText1.val().should.equal "yjs is here!"

  it 'merge words when no space anymore [deleteSel]', ->
    richText1 = new Y.RichText "yjs is is here!"
    sel = new Y.Selection(4, 7, richText1)
    richText1.deleteSel(sel)
    richText1.val().should.equal "yjs is here!"

  it 'merge the two words [merge]', ->
    richText1 = new Y.RichText "Hel lo"
    richText1.merge(0)
    richText1.val().should.equal "Hello"

  it 'insert correctly [insert]', ->
    richText1 =  new Y.RichText ""

    richText1.insert(0, "Two words")
    richText1.val().should.equal "Two words"
    richText1._richText.words.length.should.equal 2

    richText1.insert(4, "insertd ")
    richText1.val().should.equal "Two insertd words"
    richText1._richText.words.length.should.equal 3

   it 'accept deltas (insert) [delta]', ->
    delta = { ops:[
      { insert: 'Gandalf', attributes: { bold: true } },
      { insert: ' the ' },
      { insert: 'Grey', attributes: { color: '#ccc' } },
      { insert: '.'}
      ] }
    richText1 = new Y.RichText()

    richText1.delta delta

    richText1.val().should.equal "Gandalf the Grey."
    richText1._richText.words.length.should.equal 4
    richText1._richText.words[0].word.should.equal "Gandalf "
    richText1._richText.selections[0].should.have.property 'left', richText1.getWord(0)
    richText1._richText.selections.length.should.equal 2

  it 'accept styles [delta]', ->
    delta = { ops:[
      { insert: 'Gandalf', attributes: { bold: true } },
      { insert: ' the ' },
      { insert: 'Grey', attributes: { bold: true } }
      ] }
    richText1 = new Y.RichText()
    richText1.delta delta
    delta1 = {ops: [
      {retain: 7},
      {retain: 5, attributes: {bold: true}}
      ]}
    richText1.delta delta1
    richText1.getSelections().length.should.equal 1

  it 'should accept deltas (retain & delete) [delta]', ->
    delta = { ops:[
      { retain: 7, attributes: { bold: true } },
      { delete: 4},
      ] }
    richText1 = new Y.RichText "Gandalf the Grey"
    richText1.delta delta
    richText1.val().should.equal "Gandalf Grey"

describe 'Utilities', ->
  it 'should convert correctly [relativeFromAbsolute]', ->
    richText = new Y.RichText "Zero One two three four five"
    pos = Y.misc.relativeFromAbsolute 0, richText
    pos.should.have.property 'word', 0
    pos.should.have.property 'pos', 0

    pos = Y.misc.relativeFromAbsolute 7, richText
    pos.should.have.property 'word', 1
    pos.should.have.property 'pos', 2

  it 'should convert correctly [absoluteFromRelative]', ->
    richText = new Y.RichText "Zero One two three four five"
    pos = Y.misc.absoluteFromRelative 0, 2, richText
    pos.should.equal 2

    pos = Y.misc.absoluteFromRelative 1, 2, richText
    pos.should.equal 7

describe 'y-richText.Selection object should', ->
  sel = sel2 = word = null
  richText = new Y.RichText "Zero One two three four five"

  it 'initialized with three parameters [constructor]', ->
    sel = new Y.Selection 1, 7, richText

  it 'converichText positions correctly [_relativeFromAbsolute]', ->
    sel = new Y.Selection 1, 7, richText
    sel.should.have.property 'left', (richText.getWord 0)
    sel.should.have.property 'leftPos', 1

    sel.should.have.property 'right', (richText.getWord 1)
    sel.should.have.property 'rightPos', 2

  it 'have an order relation [gt]', ->
    sel0 = new Y.Selection 1, 7, richText
    (sel0.gt((richText.getWord 0), 0, "left")).should.be.true
    (sel0.gt((richText.getWord 0), 0, "right")).should.be.true

    (sel0.gt((richText.getWord 1), 0, "left")).should.be.false
    (sel0.gt((richText.getWord 1), 0, "right")).should.be.true

    (sel0.gt((richText.getWord 1), 2, "left")).should.be.false
    (sel0.gt((richText.getWord 1), 2, "right")).should.be.true

    (sel0.gt((richText.getWord 1), 3, "left")).should.be.false
    (sel0.gt((richText.getWord 1), 3, "right")).should.be.false

  it 'have an order relation [lt]', ->
    sel0 = new Y.Selection 1, 7, richText
    (sel0.lt((richText.getWord 0), 0, "left")).should.be.false
    (sel0.lt((richText.getWord 0), 0, "right")).should.be.false

    (sel0.lt((richText.getWord 1), 0, "left")).should.be.true
    (sel0.lt((richText.getWord 1), 0, "right")).should.be.false

    (sel0.lt((richText.getWord 1), 2, "left")).should.be.true
    (sel0.lt((richText.getWord 1), 2, "right")).should.be.true

    (sel0.lt((richText.getWord 1), 3, "left")).should.be.true
    (sel0.lt((richText.getWord 1), 3, "right")).should.be.true

  it 'have working functions [equals,notEquals,in,contains,overlaps,atLeftOf]', ->
    sel0 = new Y.Selection 0, 1, richText
    sel1 = new Y.Selection 1, 2, richText
    sel2 = new Y.Selection 0, 2, richText
    sel3 = new Y.Selection 2, 3, richText
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
    sel0 = new Y.Selection 1, 0, richText
    sel1 = new Y.Selection 0, 1, richText

    sel0.isValid().should.be.false
    sel1.isValid().should.be.true


  it 'split correcly two selections [split]', ->
    richText = new Y.RichText "Zero one two three"
    sel0 = new Y.Selection 0, 10, richText, {style: {foo: "bar"}}
    sel1 = new Y.Selection 2, 8, richText, {style: {foo: "ping pong is awesome"}}

    sel0.split sel1 # nothing happens!
    richText.getSelections().length.should.equal 2

    sel1.split sel0 # should create a new selection at right of sel1
    sels = richText.getSelections()

    sels.length.should.equal 3
    sels[0].should.equal sel0
    sels[1].should.equal sel1
    sels[2].leftPos.should.equal(sels[1].rightPos)
    sels[2].left.word.should.equal(sels[1].right.word)

  it 'unbind correctly [unbind]', ->
    richText = new Y.RichText "Zero One two three four five"
    sel = new Y.Selection 0, 1, richText
    sel2 = new Y.Selection 0, 5, richText
    sel.unbind()
    (sel.left == null).should.be.true
    (sel.right == null).should.be.true
    richText.getWord(0).left.length.should.equal 1
    richText.getWord(0).right.length.should.equal 0

describe 'Selection.merge ', ->
  it 'not merging', ->
    richText = new Y.RichText "Zero One two three four five"
    sel0 = new Y.Selection 0, 1, richText, {style: {foo: "bar"}}
    sel1 = new Y.Selection 0, 1, richText, {style: {mergeMe: "I'm famous"}}
    sel2 = new Y.Selection 2, 10, richText, {style: {foo: "bar"}}

    sel0.merge sel0 # same selection
    richText._richText.selections.length.should.equal 3

    sel0.merge sel1 # not same style
    richText._richText.selections.length.should.equal 3

    sel0.merge sel2 # not merging
    richText._richText.selections.length.should.equal 3

    sel0.merge() # no argument
    richText._richText.selections.length.should.equal 3

  it 'at right', ->
    richText = new Y.RichText "Zero One two three four five"
    sel0 = new Y.Selection 0, 1, richText, {style: {foo: "bar"}}
    sel1 = new Y.Selection 0, 1, richText, {style: {mergeMe: "I'm famous"}}
    sel2 = new Y.Selection 1, 10, richText, {style: {foo: "bar"}}
    sel0.merge sel2
    richText._richText.selections.length.should.equal 2
    richText._richText.selections.indexOf(sel2).should.equal -1

    leftWord = richText.getWord 0
    rightWord = richText.getWord 2

    sel0.should.have.deep.property 'left', leftWord
    sel0.should.have.deep.property 'leftPos', 0
    sel0.should.have.deep.property 'right', rightWord
    sel0.should.have.deep.property 'rightPos', 1

  it 'at left', ->
    richText = new Y.RichText "Zero One two three four five"
    sel0 = new Y.Selection 0, 1, richText, {style: {foo: "bar"}}
    sel2 = new Y.Selection 1, 10, richText, {style: {foo: "bar"}}

    sel2.merge sel0, richText
    richText._richText.selections.length.should.equal 1
    richText._richText.selections.indexOf(sel0).should.equal -1

  it 'in', ->
    richText = new Y.RichText "Zero One two three four five"
    sel0 = new Y.Selection 0, 10, richText
    sel2 = new Y.Selection 2, 5, richText

    console.log sel2.in sel0
    sel2.merge sel0, richText
    richText._richText.selections.length.should.equal 1
    richText._richText.selections.indexOf(sel0).should.equal -1

  it 'contains', ->
    richText = new Y.RichText "Zero One two three four five"
    sel0 = new Y.Selection 0, 10, richText
    sel2 = new Y.Selection 2, 5, richText

    sel0.merge sel2, richText
    richText._richText.selections.length.should.equal 1
    richText._richText.selections.indexOf(sel2).should.equal -1


describe 'Word objects should', ->
  sel = sel2 = richText = word = null
  it 'be linked correctly to selections [constructor]', ->
    richText = new Y.RichText "This is a test"
    sel = new Y.Selection 0, 6, richText
    word = richText.getWord(0)
    word.left[0].equals(sel).should.be.true
    word.right.length.should.equals 0

    word = richText.getWord(1)
    word.left.length.should.equals 0
    word.right[0].equals(sel).should.be.true

  it 'remove selection correctly [removeSel]', ->
    richText = new Y.RichText "This is a test"
    sel = new Y.Selection 0, 6, richText
    word = richText.getWord(0)
    word.removeSel sel, "left"
    word.left.length.should.equals 0

    word = richText.getWord(1)
    word.right.length.should.equals 1

  it 'be able to get its index in RTE instance [index]', ->
    richText = new Y.RichText "This is a test"
    richText.val()
    word = richText.getWord( 3)
    word.index(richText).should.equal 3

describe 'y-richtext.Selections objects should get updated when', ->
  it 'deleting words [deleteWords]', ->
    richText = new Y.RichText "This is a test with many words."
    sel1 = new Y.Selection 8, 10, richText # will be deleted
    sel2 = new Y.Selection 0, 6, richText # will be updated
    sel3 = new Y.Selection 10, 18, richText # will be updated
    richText.deleteWords 1, 4 # deleting "is ", "a " and "test "
    # richText is now "This with many words."

    richText.getSelections().indexOf(sel1).should.equal -1

    sel2.left.should.equal richText.getWord(0)
    sel2.right.should.equal richText.getWord(1)

    sel3.left.should.equal richText.getWord(1)
    sel3.leftPos.should.equal 0
    sel3.right.should.equal richText.getWord(1)
    sel3.rightPos.should.equal 3

  it 'merging words [merge]', ->
    richText = new Y.RichText "Long sword is a kind of sword."
    sel1 = new Y.Selection 2, 15, richText # will point on Longsword at left
    sel2 = new Y.Selection 4, 6, richText # will point on Longsword at left
    richText.merge 0
    sel1.left.should.equal richText.getWord(0)
    sel1.right.should.equal richText.getWord(2)

    sel2.left.should.equal richText.getWord(0)
    sel2.right.should.equal richText.getWord(0)

  it 'deleting a selection [deleteSel]', ->
    richText = new Y.RichText "I'm the real test"
    sel = new Y.Selection 2, 8, richText
    sel2 = new Y.Selection 0, 2, richText, {bind: false}
    richText.deleteSel sel2
    sel.left.should.equal (richText.getWord 0)
    sel.leftPos.should.equal 0
    sel.right.should.equal (richText.getWord 2)
    sel.rightPos.should.equal 0

  it 'inserting content [insert]', ->
    richText = new Y.RichText "Th is a test"
    sel = new Y.Selection 2, 8, richText

    richText.insert 2, 'is'
    sel.left.should.equal richText.getWord(0)
    sel.leftPos.should.equal 4

    sel.right.should.equal richText.getWord(3)
    sel.rightPos.should.equal 0

  it 'inserting words [insertWords]', ->
    richText = new Y.RichText "This is a test"

    sel = new Y.Selection 2, 8, richText
    [leftPos, rightPos, this_word, a_word] = [sel.leftPos, sel.rightPos,
                                              sel.left, sel.right]

    toInsert = 'is really cool, ain\'t it? Because this'.split(' ')
    richText.insertWords 1, toInsert
    sel.left.should.equal this_word
    sel.right.should.equal a_word

    sel.leftPos.should.equal leftPos
    sel.rightPos.should.equal rightPos
