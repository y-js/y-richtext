/* global Y */
'use strict'

function extend (Y) {
  Y.requestModules(['Array']).then(function () {
    class YRichtext extends Y.Array['class'] {
      constructor (os, _model, idArray, valArray) {
        super(os, _model, idArray, valArray)
      }
      toString () {
        return this.valArray.map(function (v) {
          if (typeof v === 'string') {
            return v
          }
        }).join('')
      }
      toOTOps () {
        var ops = []
        var op = {
          insert: [],
          attributes: {}
        }
        function createNewOp () {
          var attrs = {}
          // copy attributes
          for (var name in op.attributes) {
            attrs[name] = op.attributes[name]
          }
          op = {
            insert: [],
            attributes: attrs
          }
        }
        var i = 0
        for (; i < this.valArray.length; i++) {
          let v = this.valArray[i]
          if (v.constructor === Array) {
            if (op.insert.length > 0) {
              op.insert = op.insert.join('')
              ops.push(op)
              createNewOp()
            }
            if (v[1] === null) {
              delete op.attributes[v[0]]
            } else {
              op.attributes[v[0]] = v[1]
            }
          } else {
            op.insert.push(v)
          }
        }
        if (op.insert.length > 0) {
          op.insert = op.insert.join('')
          ops.push(op)
        }
        return ops
      }
      insert (pos, content) {
        var curPos = 0
        var selection = {}
        for (var i = 0; i <= this.valArray.length; i++) {
          if (curPos === pos) {
            break
          }
          var v = this.valArray[i]
          if (typeof v === 'string') {
            curPos++
          } else if (v.constructor === Array) {
            if (v[1] === null) {
              delete selection[v[0]]
            } else {
              selection[v[0]] = v[1]
            }
          }
        }
        super.insert(i, content.split(''))
        return selection
      }
      delete (pos, length) {
        var curPos = 0
        var endPos = pos + length
        var deletes = []
        for (var i = 0; i < this.valArray.length && curPos < endPos; i++) {
          if (typeof this.valArray[i] === 'string') {
            if (curPos >= pos)
              deletes.push(i)
            curPos++
          }
        }
        // we found all elements that need to be removed
        // now we check if we can safely delete some selections
        // e.g. if [{bold:null},*deleted op position* {bold:true}], we can delete the first op
        // or if deleted op is the last element: [.., {..},{..}, *deleted op position*],
        // we can delete the last to selections
        for (var j = deletes.length - 1; j >= 0; j--) {
          var d = deletes[j]
          var rights = [], c
          var v
          if (this.valArray[d+1] != null) {
            for (c = d + 1; v != null && v.constructor === Array; v = this.valArray[++c]) {
              rights.push(v)
            }
            super.delete(d, 1)
            for (c = d - 1, v = this.valArray[c]; v != null && v.constructor === Array; v = this.valArray[--c]) {
              for (var rr = 0; rr < rights.length; rr++) {
                if (v[0] === rights[rr][0]) {
                  super.delete(c)
                  break
                }
              }
            }
          } else {
            // element does not exist. we can delete all left selections
            super.delete(d, 1)
            for (c = d - 1, v = this.valArray[c]; v != null && v.constructor === Array; v = this.valArray[--c]) {
              super.delete(c)
            }
          }
        }
      }
      /*
      1. get selection attributes from position $from
         (name it antiAttrs, and we'll use it to make sure that selection ends in antiAttrs)
      2. Insert selection $attr, if necessary
      3. Between from and to, we'll delete all selections that do not match $attr.
         Furthermore, we'll update antiAttrs, if necessary
      4. In the end well insert a selection that makes sure that selection($to) ends in antiAttrs  
      */
      select (from, to, attrName, attrValue) {
        if (from == null || to == null || attrName == null, attrValue === undefined) {
          throw new Error("You must define four parameters")
        } else {
          var step2i
          var step2sel
          var antiAttrs = [attrName, null]
          var curPos = 0
          var i = 0
          // 1. compute antiAttrs
          for (; i < this.valArray.length; i++) {
            let v = this.valArray[i]
            if (curPos === from) {
              break
            }
            if (v.constructor === Array) {
              if (v[0] === attrName) {
                antiAttrs[1] = v[1]
              }
            } else if (typeof v === 'string') {
              curPos++
            }
          }
          // 2. Insert attr
          if (antiAttrs[1] !== attrValue) {
            // we'll execute this later
            step2i = i
            step2sel = [attrName, attrValue]
          }
           
          // 3. update antiAttrs, modify selection
          var deletes = []
          for (; i < this.valArray.length; i++) {
            let v = this.valArray[i]
            if (curPos === to) {
              break
            }
            if (v.constructor === Array) {
              if (v[0] === attrName) {
                antiAttrs[1] = v[1]
                deletes.push(i)
              }
            } else if (typeof v === 'string') {
              curPos++
            }
          }
          // actually delete the found selections
          // also.. we have to delete from right to left (so that the positions dont change)
          for (var j = deletes.length - 1; j >= 0; j--) {
            var del = deletes[j]
            super.delete(del, 1)
            // update i, rel. to 
            if (del < i) {
              i--
            }
            if (del < step2i) {
              step2i--
            }
          }
          // 4. Update selection to match antiAttrs
          // never insert, if not necessary 
          //  1. when it is the last position ~ i < valArray.length)
          //  2. when a similar attrName already exists between i and the next character
          if (antiAttrs[1] !== attrValue && i < this.valArray.length) { // check 1.
            var performStep4 = true 
            var v
            for (j = i, v = this.valArray[j]; j < this.valArray.length && v.constructor === Array; v = this.valArray[++j]) {
              if (v[0] === attrName) {
                performStep4 = false // check 2.
                if (v[1] === attrValue) {
                  super.delete(j, 1)
                }
                break
              }
            }
            if (performStep4) {
              var sel = [attrName, antiAttrs[1]]
              super.insert(i, [sel])
            }
          }
          if (step2i != null) {
            super.insert(step2i, [step2sel])
          }
        }
      }
      bind (quill) {
        var self = this
        
        // this function makes sure that either the
        // quill event is executed, or the yjs is executed
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              token = true
              throw new Error(e)
            }
            token = true
          }
        }
        
        quill.setContents(this.toOTOps())
        
        quill.on('text-change', function (delta) {
          mutualExcluse(function () {
            var pos = 0
            for (var i = 0; i < delta.ops.length; i++) {
              var op = delta.ops[i]
              if (op.insert != null) {
                var attrs = self.insert(pos, op.insert)
                // create new selection
                for (var name in op.attributes) {
                  if (op.attributes[name] != attrs[name]) {
                    self.select(pos, pos + op.insert.length, name, op.attributes[name])
                  }
                }
                // not-existence of an attribute in op.attributes denotes
                // that we have to unselect (set to null)
                for (var name in attrs) {
                  if (op.attributes == null || attrs[name] != op.attributes[name]) {
                    self.select(pos, pos + op.insert.length, name, null)
                  } 
                }
                pos += op.insert.length
              }
              if (op.delete != null) {
                self.delete(pos, op.delete)
              }
              if (op.retain != null) {
                for (var name in op.attributes) {
                  self.select(pos, pos + op.retain, name, op.attributes[name])
                }
                pos += op.retain
              }
            }
          })
        })
        this.observe(function (events) {
          mutualExcluse(function () {
            for (var i=0; i < events.length; i++) {
              var event = events[i]
              if (event.type === 'insert') {
                if (typeof event.value === 'string') {
                  var position = 0
                  var insertSel = {}
                  for (var l = event.index - 1; l >= 0; l--) {
                    var v = self.valArray[l]
                    if (typeof v === 'string') {
                      position++
                    } else if (v.constructor === Array && typeof insertSel[v[0]] === 'undefined') {
                      insertSel[v[0]] = v[1]
                    }
                  }
                  quill.insertText(position, event.value, insertSel)
                } else if (event.value.constructor === Array) {
                  // a new selection is created
                  // find left selection that matches newSel[0]
                  var curSel = null
                  var newSel = event.value
                  // denotes the start position of the selection
                  // (without the selection objects)
                  var selectionStart = 0
                  var v // helper variable
                  for (var j = event.index - 1; j >= 0; j--) {
                    v = self.valArray[j]
                    if (v.constructor === Array) {
                      // check if v matches newSel
                      if (newSel[0] === v[0]) {
                        // found a selection
                        // update curSel and go to next step
                        curSel = v[1]
                        break
                      }
                    } else if (typeof v === 'string') {
                      selectionStart++
                    }
                  }
                  // make sure to decrement j, so we correctly compute selectionStart
                  for (; j >= 0; j--) {
                    v = self.valArray[j]
                    if (typeof v === 'string') {
                      selectionStart++
                    }
                  }
                  // either a selection was found {then curSel was updated}, or not (then curSel = null)
                  if (newSel[1] === curSel) {
                    // both are the same. not necessary to do anything
                    return
                  }
                  // now find out the range over which newSel has to be created
                  var selectionEnd = selectionStart
                  for (var k = event.index + 1; k < self.valArray.length; k++) {
                    v = self.valArray[k]
                    if (v.constructor === Array) {
                      if (v[0] === newSel[0]) {
                        // found another selection with same attr name
                        break
                      }
                    } else if (typeof v === 'string') {
                      selectionEnd++
                    }
                  }
                  // create a selection from selectionStart to selectionEnd
                  if (selectionStart !== selectionEnd) {
                    quill.formatText(selectionStart, selectionEnd, newSel[0], newSel[1])
                  }
                }
              } else if (event.type === 'delete') {
                if (typeof event.value === 'string') { // TODO: see button. add  || `event.length > 1`
                  // only if these conditions are true, we have to actually check if we have to delete sth.
                  // Then we have to check if between pos and pos + event.length are selections:
                  // delete till pos + (event.length - number of selections)
                  var pos = 0
                  for (var u = 0; u < event.index; u++) {
                    var v = self.valArray[u]
                    if (typeof v === 'string') {
                      pos++
                    }
                  }
                  var delLength = event.length
                  /* TODO!!
                  they do not exist anymore.. so i can't query. you have to query over event.value(s) - but that not yet implemented
                  for (; i < event.index + event.length; i++) {
                    if (self.valArray[i].constructor === Array) {
                      delLength--
                    }
                  }*/
                  quill.deleteText(pos, pos + delLength)
                } else if (event.value.constructor === Array) {
                  var curSel = null
                  var from = 0
                  for (var x = event.index - 1; x >= 0; x--) {
                    var v = self.valArray[x]
                    if (v.constructor === Array) {
                      if (v[0] === event.value[0]) {
                        curSel = v[1]
                        break
                      }
                    } else if (typeof v === 'string') {
                      from++
                    }
                  }
                  for (; x >= 0; v = self.valArray[--x]) {
                    if (typeof v === 'string') {
                      from++
                    }
                  }
                  var to = from
                  for (var x = event.index; x < self.valArray.length; x++) {
                    var v = self.valArray[x]
                    if (v.constructor === Array) {
                      if (v[0] === event.value[0]) {
                        break
                      }
                    } else if (typeof v === 'string') {
                      to++
                    }
                  }
                  if (curSel !== event.value[1] && from !== to) {
                    quill.formatText(from, to, event.value[0], curSel)
                  }
                }
              }
            }
          })
        })
      }
    }
    Y.extend('Richtext', new Y.utils.CustomType({
      name: 'Richtext',
      class: YRichtext,
      struct: 'List',
      initType: function * YTextInitializer (os, model) {
        var valArray = []
        var idArray = yield* Y.Struct.List.map.call(this, model, function (c) {
          valArray.push(c.content)
          return JSON.stringify(c.id)
        })
        return new YRichtext(os, model.id, idArray, valArray)
      }
    }))
  })
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
