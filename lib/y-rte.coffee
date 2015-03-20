class Selection
  constructor: (a, b, c, d, e)->
    if a? and b? and c? and d?
      if !( typeof a is "number" and
            typeof b is "number" and
            typeof c is "number" and
            typeof d is "number")
        throw new Error "Expecting numbers as arguments"
      @startPos = {word: a, pos: b}
      @endPos = {word: c, pos: d}

      attr = e

    else if a? and b? and c?
      if !( typeof a is "number" and
            typeof b is "number")
        throw new Error "Expecting numbers as arguments"
      c.constructor is "Rte"

      [@startPos, @endPos] = @relativeFromAbsolute(a, b, c)
      attr = d

    else if a? and b? and a.pos? and a.word? and b.pos? and b.word?
      @startPos = a
      @endPos = b

      attr = c

    else throw new Error "Wrong set of parameters #{[a, b, c, d, e]}"

    if attr?
      @attr = attr

    @startPos.lt = @endPos.lt = (s) ->
      @word < s.word or (@word == s.word and @pos <= s.pos)

    @startPos.gt = @endPos.gt = (s) ->
      @word > s.word or (@word == s.word and @pos >= s.pos)

  relativeFromAbsolute: (untilStart, untilEnd, rte)->
    # Convert absolute coordinates to relatives
    spw = spp = epw = epp = 0

    words = rte._rte.words
    for i in [0..words.length-1]
      l = words[i].length
      if l >= untilStart
        spp = untilStart
        untilStart = 0
      else
        spw += 1
        untilStart -= l

      if l >= untilEnd
        # throw new Error(untilEnd)
        epp = untilEnd
        untilEnd = 0
      else
        epw += 1
        untilEnd -= l
      if untilStart == untilEnd == 0
        break

    [{word: spw, pos: spp}, {word: epw, pos: epp}]

  equals: (s)->
    @startPos.word == s.startPos.word and
    @startPos.pos == s.startPos.pos and
    @endPos.word == s.endPos.word and
    @endPos.pos == s.endPos.pos

  in: (s) ->
    @startPos.lt(s) and @endPos.gt(s)

  contains: (s) ->
    s.in(@)

  overlaps: (s) ->
    @startPos.lt(s.endPos) or @endPos.gt(s.startPos)

  setAttr: (@attr) ->

  clone: ->
    new Selection(@startPos, @endPos)

  isValid: ->
    @startPos.lt(@endPos)

class Rte # Rich Text Editor
  constructor: (content = '')->
    if content.constructor is String
      @_rte = {}
      # TODO: convert HTML
      @_rte.align = 'left'
      @_rte.style = []
      @_rte.selections = []
      @_rte.cursorInformation = {}
      @_rte.words = []
      @push(content)
    else
      throw new Error "Only accepts strings."

  _name: "Rich Text Editor"

  # _getModel:
  # _setModel:
  # observe:
  # unobserve:

  val: (content)->
    if content?
      # reset styles when replacing content
      @_rte.words = []
      @_rte.style = []
      @push(content)
    else
      # TODO: support breaks (br, new paragraph, …)
      (e for e in @_rte.words).join(' ')

  push: (content) ->
    for w in content.split(' ')
      @_rte.words.push(w)


  insertWords: (position, words)->
    # TODO: update selections
    if typeof position isnt "number"
      throw new Error 'Expected a number as first parameter'
    if words.constructor isnt Array
      throw new Error 'Expected a string array as second parameter'
    if 0 <= position <= @_rte.words.length
      if position == 0
        before = []
      else
        before = @_rte.words[..position-1]
      after = @_rte.words[position..]
      @_rte.words = before.concat(words).concat(after)
      @updateInsertWords(position, words.length)
    else
      throw new Error 'Index #{position} out of bound in word list'

  # insert l words at pos wNum
  updateInsertWords: (wNum, n)->
    # TODO: check that we don't get negative positions
    if typeof wNum isnt "number"
      throw new Error "Expected a number as first parameter"
    if typeof n isnt "number"
      throw new Error "Expected a number as second parameter"

    for pt in @_rte.selections when pt.endPos.word >= wNum
      if pt.startPos.word >= wNum
        pt.startPos.word += n
      pt.endPos.word += n

  # insert n caracters in word wNum at position pos
  updateInsert: (wNum, pos, n)->
    # TODO: check that we don't get negative positions
    if typeof wNum isnt "number"
      throw new Error "Expected a number as first parameter"
    if typeof pos isnt "number"
      throw new Error "Expected a number as second parameter"
    if typeof n isnt "number"
      throw new Error "Expected a number as third parameter"

    for pt in @_rte.selections
      if pt.startPos.word == wNum and pt.startPos.pos >= pos
        pt.startPos.pos += n
      if pt.endPos.word == wNum and pt.endPos.pos >= pos
        pt.endPos.pos += n


  deleteWords: (start, end) ->
    if not end?
      end = start+1

    if start <= end
      if start - 1 < 0
        before = []
      else
        before = @_rte.words[..start-1]

      @_rte.words = before.concat(@_rte.words[end..])
    @_rte.words

  merge: (n) ->
    if 0 <= n < @_rte.words.length
      w = @_rte.words[n]
      @deleteWords(n)
      @insert({startPos: {word: n, pos:0}}, w)
    else
      throw new Error "Impossible to merge"

  deleteSel: (sel) ->
    if not sel.isValid()
      throw new Error "Invalid selection"
    if not 0 <= sel.startPos.loc <= @_rte.words[sel.startPos.word].length
      throw new Error "Invalid selection"
    if not 0 <= sel.endPos.loc <= @_rte.words[sel.endPos.word].length
      throw new Error "Invalid selection"

    s = sel.startPos.word
    e = sel.endPos.word

    newLeft = @_rte.words[s].substring(0, sel.startPos.pos)
    newRight = @_rte.words[e].substring(sel.endPos.pos)

    if s == e
      @_rte.words[s] = newLeft + newRight

      # delete the words in between
      @deleteWords(s+1, e)
    else
      @_rte.words[s] = newLeft
      @_rte.words[e] = newRight

      # delete the words in between
      @deleteWords(s+1, e)
      # merge
      @merge(s)



  insert: (sel, content)->
    if not sel.startPos?
      throw new Error "Expected a location object as first argument"
    if typeof content isnt "string"
      throw new Error "Expected a string as second argument"

    #TODO: check boundaries
    n = sel.startPos.word
    pos = sel.startPos.pos
    word = @_rte.words[n]

    # throw new Error @_rte.words[n]

    @_rte.words[n] = word.substring(0, pos) + content + word.substring(pos)

  # relative jump from position
  _jump: (position, relJump) ->
    word = position.word
    pos = position.pos

    if jump < 0
      jump = Math.abs(jump)
      while jump > 0
        if pos < jump
          word -= 1
          jump -= pos
          pos = @_rte.words[word].length - 1

          if word < 0
            return null
        else
          pos -= jump
    else if jump > 0
      while jump > 0
        delta = pos + jump - @_rte.word[word].length + 1
        if delta > 0
          word += 1
          jump -= delta
          pos = 0

          if word >= @_rte.words.length
            return null
        else
          pos += jump
    else
      word = word
      pos = pos
    {word: word, pos: pos}

  # get all selections with right (or left end) at location
  _getSel: (location, rightOrLeft) ->
    ret = []
    if rightOrLeft == 'right'
      selList = @_rte.words[location.word].refRight
      for sel in selList
        if sel.endPos.pos == location.pos
          ret.push(sel)

    else if rightOrLeft == 'left'
      selList = @_rte.words[location.word].refLeft
      for sel in selList
        if sel.startPos.pos == location.pos
          ret.push(sel)

    else
      throw new Error "Error in second argument of _getSel"

    ret

  # set the attribute to the selection and try to extend as much
  # as possible existing ones
  setAttr: (thisSel)->
    if not thisSel.isValid()
      throw new Error "Invalid selection"
    # goto left of selection, see if extendable
    leftPos = _jump(thisSel.startPos, (-1))
    if leftPos isnt null
      w = @_rte.words[leftPos.word]
      doLeft = true
      # pop and repush references except if merge possible
      while s = w.refRight.pop()
        if s.type == thisSel.type and s.endPos.pos == leftPos.pos
          doLeft = false
        else
          w.push(s)

      if doLeft
        @_rte.words[thisSel.startPos.word].refLeft.push(thisSel)

    rightPos = _jump(thisSel.startPos, 1)
    if rightPos isnt null
      w = @_rte.words[rightPos.word]
      doRight = true
      # pop and repush references except if merge possible
      while s = w.refRight.pop()
        if s.type == thisSel.type and s.startPos.pos == rightPos.pos
          doRight = false
        else
          w.push(s)

      if doRight
        @_rte.words[rightPos.left].refRight.push(thisSel)


  apply: (deltas)->
    position = 0
    for delta in deltas.ops
      if delta.retain?
        selection = new Selection position (position+=delta.retain)
      else if delta.delete?
        selection = new Selection position (position+=delta.retain)
        @delete(selection)
      else if delta.insert?
        selection = new Selection position (position+=delta.insert.length)
        @insert(selection, delta.insert)

      if delta.attributes?
        for attr in delta.attributes
          @setAttr(selection.clone().attr = attr)

if window?
  window.Rte = Rte
  window.Selection = Selection

if module?
  module.exports = [Rte, Selection]
