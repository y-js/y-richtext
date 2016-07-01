/* global Y */
'use strict'

function extend (Y) {
  Y.requestModules(['Array']).then(function () {
    class YRichtext extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content) {
        super(os, _model, _content)
        this.instances = []
        // append this utility function with which eventhandler can pull changes from quill
        this.eventHandler._pullChanges = () => {
          this.instances.forEach(function (instance) {
            instance.editor.update()
          })
        }
      }
      _destroy () {
        for (var i = this.instances.length - 1; i >= 0; i--) {
          this.unbindQuill(this.instances[i].editor)
        }
        super._destroy()
      }
      get length () {
        /*
          TODO: I must not use observe to compute the length.
          But since I inherit from Y.Array, I can't set observe
          the changes at the right momet (for that I would require direct access to EventHandler).
          This is the most elegant solution, for now.
          But at some time you should re-write Y.Richtext more elegantly!!
        */
        return this.toString().length
      }
      toString () {
        return this._content.map(function (v) {
          if (typeof v.val === 'string') {
            return v.val
          }
        }).join('')
      }
      toDelta () {
        // check last character
        // insert a newline as the last character, if neccessary
        // (quill will do that automatically otherwise..)
        var newLineCharacter = false
        for (var i = this._content.length - 1; i >= 0; i--) {
          var c = this._content[i]
          if (typeof c.val === 'string') {
            if (c.val === '\n') {
              newLineCharacter = true
            }
            break
          }
        }
        if (!newLineCharacter) {
          this.push('\n')
        }

        // create the delta
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
        for (; i < this._content.length; i++) {
          let v = this._content[i].val
          if (v.constructor === Array) {
            if ((!op.attributes.hasOwnProperty(v[0]) && v[1] == null) || op.attributes[v[0]] === v[1]) {
              continue
            }
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
        ops.map(function (op) {
          if (Object.keys(op.attributes).length === 0) {
            delete op.attributes
          }
        })
        return ops
      }
      insert (pos, content) {
        var curPos = 0
        var selection = {}
        for (var i = 0; i < this._content.length; i++) {
          if (curPos === pos) {
            break
          }
          var v = this._content[i].val
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
        /*
          let x = to be deleted string
          let s = some string
          let * = some selection
          E.g.
          sss*s***x*xxxxx***xx*x**ss*s
               |---delete-range--|
             delStart         delEnd

          We'll check the following
          * is it possible to delete some of the selections?
            1. a dominating selection to the right could be the same as the selection (curSel) to delStart
            2. a selections could be overwritten by another selection to the right
        */
        var curPos = 0
        var curSel = {}
        var endPos = pos + length
        if (length <= 0) return
        var delStart // relative to _content
        var delEnd // ..
        var v, i // helper variable for elements of _content

        for (delStart = 0; curPos < pos && delStart < this._content.length; delStart++) {
          v = this._content[delStart].val
          if (typeof v === 'string') {
            curPos++
          } else if (v.constructor === Array) {
            curSel[v[0]] = v[1]
          }
        }
        for (delEnd = delStart; curPos < endPos && delEnd < this._content.length; delEnd++) {
          v = this._content[delEnd].val
          if (typeof v === 'string') {
            curPos++
          }
        }
        if (delEnd === this._content.length) {
          // yay, you can delete everything without checking
          super.delete(delStart, delEnd - delStart)
        } else {
          if (typeof v === 'string') {
            delEnd--
          }
          var rightSel = {}
          for (i = delEnd; i >= delStart; i--) {
            v = this._content[i].val
            if (v.constructor === Array) {
              if (rightSel[v[0]] === undefined) {
                if (v[1] === curSel[v[0]]) {
                  // case 1.
                  super.delete(i, 1)
                }
                rightSel[v[0]] = v[1]
              } else {
                // case 2.
                super.delete(i, 1)
              }
            } else if (typeof v === 'string') {
              var end = i + 1
              while (i > delStart) {
                v = this._content[i - 1].val
                if (typeof v === 'string') {
                  i--
                } else {
                  break
                }
              }
              // always delete the strings
              super.delete(i, end - i)
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
        if (from == null || to == null || attrName == null || attrValue === undefined) {
          throw new Error('You must define four parameters')
        } else {
          var step2i
          var step2sel
          var antiAttrs = [attrName, null]
          var curPos = 0
          var i = 0
          // 1. compute antiAttrs
          for (; i < this._content.length; i++) {
            let v = this._content[i].val
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
          for (; i < this._content.length; i++) {
            let v = this._content[i].val
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
          //  1. when it is the last position ~ i < _content.length)
          //  2. when a similar attrName already exists between i and the next character
          if (antiAttrs[1] !== attrValue && i < this._content.length) { // check 1.
            var performStep4 = true
            var v
            for (j = i; j < this._content.length; j++) {
              v = this._content[j].val
              if (v.constructor !== Array) {
                break
              }
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
            // if there are some selections to the left of step2sel, delete them if possible
            // * have same attribute name
            // * no insert between step2sel and selection
            for (j = step2i - 1; j >= 0; j--) {
              v = this._content[j].val
              if (v.constructor !== Array) {
                break
              }
              if (v[0] === attrName) {
                super.delete(j, 1)
              }
            }
          }
        }
      }
      /*
        This method accepts a quill delta (http://quilljs.com/docs/deltas/)
        The second parameter (_quill) is optional (it is only necessary when binding a quill instance)
      */
      applyDelta (delta, _quill) {
        var pos = 0
        var name // helper variable
        for (var i = 0; i < delta.ops.length; i++) {
          var op = delta.ops[i]
          if (op.insert != null) {
            var attrs = this.insert(pos, op.insert)
            // create new selection
            for (name in op.attributes) {
              if (op.attributes[name] !== attrs[name]) {
                this.select(pos, pos + op.insert.length, name, op.attributes[name])
              }
            }
            // not-existence of an attribute in op.attributes denotes
            // that we have to unselect (set to null)
            for (name in attrs) {
              if (op.attributes == null || attrs[name] !== op.attributes[name]) {
                this.select(pos, pos + op.insert.length, name, null)
              }
            }
            pos += op.insert.length
          }
          if (op.delete != null) {
            this.delete(pos, op.delete)
          }
          if (op.retain != null && _quill != null) {
            var afterRetain = pos + op.retain
            if (afterRetain > this.length) {
              debugger // TODO: check why this is still called..
              let additionalContent = _quill.getText(this.length)
              _quill.insertText(this.length, additionalContent)
              // quill.deleteText(this.length + additionalContent.length, quill.getLength()) the api changed!
              for (name in op.attributes) {
                // TODO: format expects falsy values now in order to remove formats
                _quill.formatText(this.length + additionalContent.length, additionalContent.length, name, null)
                // quill.deleteText(this.length, this.length + op.retain) the api changed!
              }
              this.insert(this.length, additionalContent)
              // op.attributes = null
            }
            for (name in op.attributes) {
              var attr = op.attributes[name]
              this.select(pos, pos + op.retain, name, attr)
              // TODO: check if attr is `false` sometimes.. (then you need to adapt the algorithm)
              _quill.formatText(pos, op.retain, name, attr == null ? false : attr) // use correct values here (changed in quill@1.0)
            }
            pos = afterRetain
          }
        }
      }
      bind () {
        this.bindQuill.apply(this, arguments)
      }
      unbindQuill (quill) {
        var i = this.instances.findIndex(function (binding) {
          return binding.editor === quill
        })
        if (i >= 0) {
          var binding = this.instances[i]
          this.unobserve(binding.yCallback)
          binding.editor.off('text-change', binding.quillCallback)
          this.instances.splice(i, 1)
        }
      }
      bindQuill (quill) {
        var self = this

        // this function makes sure that either the
        // quill event is executed, or the yjs observer is executed
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
        quill.setContents(this.toDelta())

        self._debugQuillEvents = [] // TODO: REMOVE!!!  
        function quillCallback (delta) {
          mutualExcluse(function () {
            self._debugQuillEvents.push(JSON.parse(JSON.stringify(delta)))
            self.applyDelta(delta, quill)
          })
        }
        quill.on('text-change', quillCallback)

        function yCallback (event) {
          mutualExcluse(function () {
            var v // helper variable
            var curSel // helper variable (current selection)
            if (event.type === 'insert') {
              var _value_i = 0
              while (_value_i < event.values.length) {
                if (_value_i > 0) {
                  debugger
                  // TODO: something is wrong.. at least the position can't be right in the second iteration!
                }
                var vals = []
                while (_value_i < event.values.length && typeof event.values[_value_i] === 'string') {
                  vals.push(event.values[_value_i])
                  _value_i++
                }
                if (vals.length > 0) {
                  var position = 0
                  var insertSel = {}
                  for (var l = 0; l < event.index; l++) {
                    // TODO: previous algorithm: for (var l = event.index - 1; l >= 0; l--) {
                    v = self._content[l].val
                    if (typeof v === 'string') {
                      position++
                    } else if (v.constructor === Array) { //  TODO: remove the following? : && typeof insertSel[v[0]] === 'undefined'
                      insertSel[v[0]] = v[1]
                    }
                  }
                  // consider the case (this is markup): "hi *you*" & insert "d" at position 3
                  // Quill may implicitely make "d" bold (dunno if thats true). Yjs, however, expects d not to be bold.
                  // So we check future attributes and explicitely set them, if neccessary
                  l = event.index + event.length
                  while (l < self._content.length) {
                    v = self._content[l].val
                    if (v.constructor === Array) {
                      if (!insertSel.hasOwnProperty(v[0])) {
                        insertSel[v[0]] = null
                      }
                    } else {
                      break
                    }
                    l++
                  }
                  // TODO: you definitely should exchange null with the new "false" approach..
                  // Then remove the following! :
                  for (var name in insertSel) {
                    if (insertSel[name] == null) {
                      insertSel[name] = false
                    }
                  }
                  if (self.length == position + vals.length && vals[vals.length - 1] != '\n') {
                    // always make sure that the last character is enter!
                    var end = ['\n']
                    var sel = {}
                    // now we remove all selections
                    for (var name in insertSel) {
                      if (insertSel[name] != false) {
                        end.unshift([name, false])
                        sel[name] = false
                      }
                    }
                    self.push('\n')
                    quill.insertText(position, '\n', false)
                  }
                  quill.insertText(position, vals.join(''), insertSel)
                } else { // Array, that denotes a selection
                  // a new selection is created
                  // find left selection that matches newSel[0]
                  curSel = null
                  var newSel = event.values[_value_i++] // get selection, increment counter
                  // denotes the start position of the selection
                  // (without the selection objects)
                  var selectionStart = 0
                  for (var j = event.index + _value_i - 2/* -1 for index, -1 for incremented _value_i*/; j >= 0; j--) {
                    v = self._content[j].val
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
                    v = self._content[j].val
                    if (typeof v === 'string') {
                      selectionStart++
                    }
                  }
                  // either a selection was found {then curSel was updated}, or not (then curSel = null)
                  if (newSel[1] === curSel) {
                    // both are the same. not necessary to do anything
                    continue
                  }
                  // now find out the range over which newSel has to be created
                  var selectionEnd = selectionStart
                  for (var k = event.index + _value_i/* -1 for incremented _value_i, +1 for algorithm */; k < self._content.length; k++) {
                    v = self._content[k].val
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
                    // TODO: check if attr is `false` sometimes.. (then you need to adapt the algorithm)
                    quill.formatText(selectionStart, selectionEnd - selectionStart, newSel[0], newSel[1] == null ? false : newSel[1])
                  }
                }
              }
            } else if (event.type === 'delete') {
              // sanitize events
              var myEvents = []
              for (var i = 0, _i = 0; i < event.length; i++) {
                if (typeof event.values[i] !== 'string') {
                  if (i !== _i) {
                    myEvents.push({
                      type: 'text',
                      length: i - _i,
                      index: event.index
                    })
                  }
                  _i = i + 1
                  myEvents.push({
                    type: 'selection',
                    val: event.values[i],
                    index: event.index
                  })
                }
              }
              if (i !== _i) {
                myEvents.push({
                  type: 'text',
                  length: i - _i,
                  index: event.index
                })
              }
              // ending sanitizing.. start brainfuck
              myEvents.forEach(event => {
                if (event.type === 'text') {
                  var pos = 0
                  for (var u = 0; u < event.index; u++) {
                    v = self._content[u].val
                    if (typeof v === 'string') {
                      pos++
                    }
                  }
                  quill.deleteText(pos, event.length)
                } else {
                  curSel = null
                  var from = 0
                  var x
                  for (x = event.index - 1; x >= 0; x--) {
                    v = self._content[x].val
                    if (v.constructor === Array) {
                      if (v[0] === event.val[0]) {
                        curSel = v[1]
                        break
                      }
                    } else if (typeof v === 'string') {
                      from++
                    }
                  }
                  for (; x >= 0; x--) {
                    v = self._content[x].val
                    if (typeof v === 'string') {
                      from++
                    }
                  }
                  var to = from
                  for (x = event.index; x < self._content.length; x++) {
                    v = self._content[x].val
                    if (v.constructor === Array) {
                      if (v[0] === event.val[0]) {
                        break
                      }
                    } else if (typeof v === 'string') {
                      to++
                    }
                  }
                  if (curSel !== event.val[1] && from !== to) {
                    // TODO: check if attr is `false` sometimes.. (then you need to adapt the algorithm)
                    quill.formatText(from, to - from, event.val[0], curSel == null ? false : curSel)
                  }
                }
              })
            }
            quill.update()
          })
        }
        this.observe(yCallback)
        this.instances.push({
          editor: quill,
          yCallback: yCallback,
          quillCallback: quillCallback
        })
      }
    }
    Y.extend('Richtext', new Y.utils.CustomType({
      name: 'Richtext',
      class: YRichtext,
      struct: 'List',
      initType: function * YTextInitializer (os, model) {
        var _content = []
        yield* Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            throw new Error('Text must not contain types!')
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              })
            })
          }
        })
        return new YRichtext(os, model.id, _content)
      }
    }))
  })
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
