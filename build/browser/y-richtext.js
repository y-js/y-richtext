(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AbstractEditor, QuillJs, TestEditor, misc,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

misc = require("./misc.coffee");

AbstractEditor = (function() {
  function AbstractEditor(editor) {
    this.editor = editor;
    this.locker = new misc.Locker();
  }

  AbstractEditor.prototype.getContents = function() {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.getCursor = function() {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.setCursor = function(param) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.removeCursor = function() {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.removeCursor = function(id) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.observeLocalText = function(backend) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.observeLocalCursor = function(backend) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.updateContents = function(delta) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.setContents = function(delta) {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.getEditor = function() {
    throw new Error("Implement me");
  };

  AbstractEditor.prototype.checkUpdate = function() {
    throw new Error("Implement me");
  };

  return AbstractEditor;

})();

QuillJs = (function(_super) {
  __extends(QuillJs, _super);

  function QuillJs(editor) {
    this.editor = editor;
    QuillJs.__super__.constructor.call(this, this.editor);
    this._cursors = this.editor.getModule("multi-cursor");
  }

  QuillJs.prototype.getLength = function() {
    return this.editor.getLength();
  };

  QuillJs.prototype.getCursorPosition = function() {
    var selection;
    selection = this.editor.getSelection();
    if (selection) {
      return selection.start;
    } else {
      return 0;
    }
  };

  QuillJs.prototype.getContents = function() {
    return this.editor.getContents().ops;
  };

  QuillJs.prototype.setCursor = function(param) {
    return this.locker["try"]((function(_this) {
      return function() {
        var cursor, fun, len;
        cursor = _this._cursors.cursors[param.id];
        if ((cursor != null) && cursor.color === param.color) {
          fun = function(index) {
            return _this._cursors.moveCursor(param.id, index);
          };
        } else {
          if ((cursor != null) && (cursor.color != null) && cursor.color !== param.color) {
            _this.removeCursor(param.id);
          }
          fun = function(index) {
            return _this._cursors.setCursor(param.id, index, param.text, param.color);
          };
        }
        len = _this.editor.getLength();
        if (param.index > len) {
          param.index = len;
        }
        if (param.index != null) {
          return fun(param.index);
        }
      };
    })(this));
  };

  QuillJs.prototype.removeCursor = function(id) {
    return this._cursors.removeCursor(id);
  };

  QuillJs.prototype.removeCursor = function(id) {
    return this._cursors.removeCursor(id);
  };

  QuillJs.prototype.observeLocalText = function(backend) {
    return this.editor.on("text-change", function(deltas, source) {
      var position;
      position = backend(deltas);
      return this.editor.selection.emitter.emit(this.editor.selection.emitter.constructor.events.SELECTION_CHANGE, this.editor.quill.getSelection(), "user");
    });
  };

  QuillJs.prototype.observeLocalCursor = function(backend) {
    return this.editor.on("selection-change", function(range, source) {
      if (range && range.start === range.end) {
        return backend(range.start);
      }
    });
  };

  QuillJs.prototype.updateContents = function(delta) {
    return this.editor.updateContents(delta);
  };

  QuillJs.prototype.setContents = function(delta) {
    return this.editor.setContents(delta);
  };

  QuillJs.prototype.getEditor = function() {
    return this.editor;
  };

  QuillJs.prototype.checkUpdate = function() {
    return this.editor.editor.checkUpdate();
  };

  return QuillJs;

})(AbstractEditor);

TestEditor = (function(_super) {
  __extends(TestEditor, _super);

  function TestEditor(editor) {
    this.editor = editor;
    TestEditor.__super__.constructor.apply(this, arguments);
  }

  TestEditor.prototype.getLength = function() {
    return 0;
  };

  TestEditor.prototype.getCursorPosition = function() {
    return 0;
  };

  TestEditor.prototype.getContents = function() {
    return {
      ops: [
        {
          insert: "Well, this is a test!"
        }, {
          insert: "And I'm bold…",
          attributes: {
            bold: true
          }
        }
      ]
    };
  };

  TestEditor.prototype.setCursor = function() {
    return "";
  };

  TestEditor.prototype.observeLocalText = function(backend) {
    return "";
  };

  TestEditor.prototype.observeLocalCursor = function(backend) {
    return "";
  };

  TestEditor.prototype.updateContents = function(delta) {
    return "";
  };

  TestEditor.prototype.setContents = function(delta) {
    return "";
  };

  TestEditor.prototype.getEditor = function() {
    return this.editor;
  };

  return TestEditor;

})(AbstractEditor);

exports.QuillJs = QuillJs;

exports.TestEditor = TestEditor;

exports.AbstractEditor = AbstractEditor;


},{"./misc.coffee":2}],2:[function(require,module,exports){
var BaseClass, Locker;

Locker = (function() {
  function Locker() {
    this.is_locked = false;
  }

  Locker.prototype["try"] = function(fun) {
    var ret;
    if (this.is_locked) {
      return;
    }
    this.is_locked = true;
    ret = fun();
    this.is_locked = false;
    return ret;
  };

  return Locker;

})();

BaseClass = (function() {
  function BaseClass() {
    this._tmp_model = {};
  }

  BaseClass.prototype._get = function(prop) {
    if (this._model == null) {
      return this._tmp_model[prop];
    } else {
      return this._model.val(prop);
    }
  };

  BaseClass.prototype._set = function(prop, val) {
    if (this._model == null) {
      return this._tmp_model[prop] = val;
    } else {
      return this._model.val(prop, val);
    }
  };

  BaseClass.prototype._getModel = function(Y, Operation) {
    var key, value, _ref;
    if (this._model == null) {
      this._model = new Operation.MapManager(this).execute();
      _ref = this._tmp_model;
      for (key in _ref) {
        value = _ref[key];
        this._model.val(key, value);
      }
    }
    return this._model;
  };

  BaseClass.prototype._setModel = function(_model) {
    this._model = _model;
    return delete this._tmp_model;
  };

  return BaseClass;

})();

if (typeof module !== "undefined" && module !== null) {
  exports.BaseClass = BaseClass;
  exports.Locker = Locker;
}


},{}],3:[function(require,module,exports){
var BaseClass, Delta, Editors, Locker, YRichText, misc,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

misc = require("./misc.coffee");

BaseClass = misc.BaseClass;

Locker = misc.Locker;

Editors = require("./editors.coffee");

Delta = require('rich-text/lib/delta');

YRichText = (function(_super) {
  var deleteHelper, deltaHelper, insertHelper;

  __extends(YRichText, _super);

  function YRichText(editor_name, editor_instance) {
    this.updateCursorPosition = __bind(this.updateCursorPosition, this);
    this.passDeltas = __bind(this.passDeltas, this);
    this.locker = new Locker();
    if ((editor_name != null) && (editor_instance != null)) {
      this._bind_later = {
        name: editor_name,
        instance: editor_instance
      };
    }
    this.pendingDelta = new Delta();
    window.setInterval(this.applyUpdateContents.bind(this), 200);
  }

  YRichText.prototype.applyUpdateContents = function() {
    if ((this.editor != null) && this.pendingDelta.length() > 0) {
      return this.locker["try"]((function(_this) {
        return function() {
          _this.editor.updateContents(_this.pendingDelta);
          return _this.pendingDelta = new Delta();
        };
      })(this));
    }
  };

  YRichText.prototype.bind = function() {
    var Editor, editor_instance, editor_name;
    if (arguments[0] instanceof Editors.AbstractEditor) {
      this.editor = arguments[0];
    } else {
      editor_name = arguments[0], editor_instance = arguments[1];
      if ((this.editor != null) && this.editor.getEditor() === editor_instance) {
        return;
      }
      Editor = Editors[editor_name];
      if (Editor != null) {
        this.editor = new Editor(editor_instance);
      } else {
        throw new Error("This type of editor is not supported! (" + editor_name + ")");
      }
    }
    this.editor.setContents({
      ops: this.getDelta()
    });
    this.editor.observeLocalText(((function(_this) {
      return function(delta) {
        var transformedDelta;
        transformedDelta = _this.pendingDelta.transform(delta);
        _this.applyUpdateContents();
        return _this.passDeltas.call(_this.editor, transformedDelta);
      };
    })(this)).bind(this));
    this.bindEventsToEditor(this.editor);
    this.editor.observeLocalCursor(this.updateCursorPosition);
    return this._model.connector.receive_handlers.unshift((function(_this) {
      return function() {
        return _this.editor.checkUpdate();
      };
    })(this));
  };

  YRichText.prototype.observe = function(fun) {
    if (this._model != null) {
      return this._model.observe(fun);
    } else {
      return this._observeWhenModel = (this._observeWhenModel || []).push(fun);
    }
  };

  YRichText.prototype.attachProvider = function(kind, fun) {
    this._providers = this._providers || {};
    return this._providers[kind] = fun;
  };

  YRichText.prototype.getDelta = function() {
    var deltas, expected_pos, sel, selection_length, selections, text_content, unselected_insert_content, _i, _len, _ref;
    text_content = this._model.getContent('characters').val();
    expected_pos = 0;
    deltas = new Delta();
    selections = this._model.getContent("selections");
    _ref = selections.getSelections(this._model.getContent("characters"));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sel = _ref[_i];
      selection_length = sel.to - sel.from + 1;
      if (expected_pos !== sel.from) {
        unselected_insert_content = text_content.splice(0, sel.from - expected_pos).join('');
        deltas.insert(unselected_insert_content);
        expected_pos += unselected_insert_content.length;
      }
      if (expected_pos !== sel.from) {
        throw new Error("This portion of code must not be reached in getDelta!");
      }
      deltas.insert(text_content.splice(0, selection_length).join(''), sel.attrs);
      expected_pos += selection_length;
    }
    if (text_content.length > 0) {
      deltas.insert(text_content.join(''));
    }
    return deltas;
  };

  YRichText.prototype._getModel = function(Y, Operation) {
    var Editor, content_operations, editor;
    if (this._model == null) {
      content_operations = {
        selections: new Y.Selections(),
        characters: new Y.List(),
        cursors: new Y.Object()
      };
      this._model = new Operation.MapManager(this, null, {}, content_operations).execute();
      this._setModel(this._model);
      if (this._bind_later != null) {
        Editor = Editors[this._bind_later.name];
        if (Editor != null) {
          editor = new Editor(this._bind_later.instance);
        } else {
          throw new Error("This type of editor is not supported! (" + editor_name + ") -- fatal error!");
        }
        this.passDeltas({
          ops: editor.getContents()
        });
        this.bind(editor);
        delete this._bind_later;
      }
      this._model.observe(this.propagateToEditor);
      (this._observeWhenModel || []).forEach(function(observer) {
        return this._model.observe(observer);
      });
    }
    return this._model;
  };

  YRichText.prototype._setModel = function(model) {
    YRichText.__super__._setModel.apply(this, arguments);
    return (this._observeWhenModel || []).forEach(function(observer) {
      return this._model.observe(observer);
    });
  };

  YRichText.prototype._name = "RichText";

  YRichText.prototype.getText = function() {
    return this._model.getContent('characters').val().join('');
  };

  YRichText.prototype.setCursor = function(position) {
    this.selfCursor = this._model.getContent("characters").ref(position);
    return this._model.getContent("cursors").val(this._model.HB.getUserId(), this.selfCursor);
  };

  YRichText.prototype.passDeltas = function(deltas) {
    return this.locker["try"]((function(_this) {
      return function() {
        var delta, position, _i, _len, _ref, _results;
        position = 0;
        _ref = deltas.ops || [];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          delta = _ref[_i];
          _results.push(position = deltaHelper(_this, delta, position));
        }
        return _results;
      };
    })(this));
  };

  YRichText.prototype.updateCursorPosition = function(obj) {
    return this.locker["try"]((function(_this) {
      return function() {
        if (typeof obj === "number") {
          _this.selfCursor = _this._model.getContent("characters").ref(obj);
        } else {
          _this.selfCursor = obj;
        }
        return _this._model.getContent("cursors").val(_this._model.HB.getUserId(), _this.selfCursor);
      };
    })(this));
  };

  YRichText.prototype.bindEventsToEditor = function(editor) {
    this._model.getContent("characters").observe((function(_this) {
      return function(events) {
        return _this.locker["try"](function() {
          var cursor_name, cursor_ref, delta, event, _i, _j, _len, _len1, _ref;
          for (_i = 0, _len = events.length; _i < _len; _i++) {
            event = events[_i];
            delta = new Delta();
            if (event.position > 0) {
              delta.retain(event.position);
            }
            if (event.type === "insert") {
              delta.insert(event.value);
            } else if (event.type === "delete") {
              delta["delete"](1);
              _ref = _this._model.getContent("cursors").val();
              for (cursor_ref = _j = 0, _len1 = _ref.length; _j < _len1; cursor_ref = ++_j) {
                cursor_name = _ref[cursor_ref];
                if (cursor_ref === event.reference) {
                  window.setTimeout(function() {
                    return this._model.getContent("cursors")["delete"](cursor_name);
                  }, 0);
                }
              }
            } else {
              return;
            }
            _this.pendingDelta = _this.pendingDelta.compose(delta);
            _this.applyUpdateContents();
          }
        });
      };
    })(this));
    this._model.getContent("selections").observe((function(_this) {
      return function(event) {
        return _this.locker["try"](function() {
          var attr, attrs, retain, selection_length, val, _i, _len, _ref, _ref1;
          attrs = {};
          if (event.type === "select") {
            _ref = event.attrs;
            for (attr in _ref) {
              val = _ref[attr];
              attrs[attr] = val;
            }
          } else {
            _ref1 = event.attrs;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              attr = _ref1[_i];
              attrs[attr] = null;
            }
          }
          retain = event.from.getPosition();
          selection_length = event.to.getPosition() - event.from.getPosition() + 1;
          return _this.editor.updateContents(new Delta({
            ops: [
              {
                retain: retain
              }, {
                retain: selection_length,
                attributes: attrs
              }
            ]
          }));
        });
      };
    })(this));
    this._model.getContent("cursors").observe((function(_this) {
      return function(events) {
        return _this.locker["try"](function() {
          var author, event, params, position, ref_to_char, _i, _len, _ref, _ref1;
          for (_i = 0, _len = events.length; _i < _len; _i++) {
            event = events[_i];
            if (event.type === "update" || event.type === "add") {
              author = event.changedBy;
              ref_to_char = event.object.val(author);
              if (ref_to_char === null) {
                position = _this.editor.getLength();
              } else if (ref_to_char != null) {
                if (ref_to_char.isDeleted()) {
                  return;
                } else {
                  position = ref_to_char.getPosition();
                }
              } else {
                console.warn("ref_to_char is undefined");
                return;
              }
              params = {
                id: author,
                index: position,
                text: ((_ref = _this._providers) != null ? typeof _ref.nameProvider === "function" ? _ref.nameProvider(author) : void 0 : void 0) || "Default user",
                color: ((_ref1 = _this._providers) != null ? typeof _ref1.colorProvider === "function" ? _ref1.colorProvider(author) : void 0 : void 0) || "grey"
              };
              _this.editor.setCursor(params);
            } else {
              _this.editor.removeCursor(event.name);
            }
          }
        });
      };
    })(this));
    return this._model.connector.onUserEvent((function(_this) {
      return function(event) {
        if (event.action === "userLeft") {
          return _this._model.getContent("cursors")["delete"](event.user);
        }
      };
    })(this));
  };

  deltaHelper = function(thisObj, delta, position) {
    var content_array, delta_selections, delta_unselections, from, fromPosition, insert_content, n, retain, selections, to, toPosition, v, _ref;
    if (position == null) {
      position = 0;
    }
    if (delta != null) {
      selections = thisObj._model.getContent("selections");
      delta_unselections = [];
      delta_selections = {};
      _ref = delta.attributes;
      for (n in _ref) {
        v = _ref[n];
        if (v != null) {
          delta_selections[n] = v;
        } else {
          delta_unselections.push(n);
        }
      }
      if (delta.insert != null) {
        insert_content = delta.insert;
        content_array = (function() {
          if (typeof insert_content === "string") {
            return insert_content.split("");
          } else if (typeof insert_content === "number") {
            return [insert_content];
          } else {
            throw new Error("Got an unexpected value in delta.insert! (" + (typeof content) + ")");
          }
        })();
        insertHelper(thisObj, position, content_array);
        fromPosition = from;
        toPosition = position + content_array.length - 1;
        from = thisObj._model.getContent("characters").ref(position);
        to = thisObj._model.getContent("characters").ref(position + content_array.length - 1);
        thisObj._model.getContent("selections").unselect(from, to, delta_unselections);
        thisObj._model.getContent("selections").select(from, to, delta_selections, true);
        return position + content_array.length;
      } else if (delta["delete"] != null) {
        deleteHelper(thisObj, position, delta["delete"]);
        return position;
      } else if (delta.retain != null) {
        retain = parseInt(delta.retain);
        from = thisObj._model.getContent("characters").ref(position);
        to = thisObj._model.getContent("characters").ref(position + retain - 1);
        thisObj._model.getContent("selections").unselect(from, to, delta_unselections);
        thisObj._model.getContent("selections").select(from, to, delta_selections);
        return position + retain;
      }
      throw new Error("This part of code must not be reached!");
    }
  };

  insertHelper = function(thisObj, position, content_array) {
    return thisObj._model.getContent("characters").insertContents(position, content_array);
  };

  deleteHelper = function(thisObj, position, length) {
    if (length == null) {
      length = 1;
    }
    return thisObj._model.getContent("characters")["delete"](position, length);
  };

  return YRichText;

})(BaseClass);

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    window.Y.RichText = YRichText;
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YRichText;
}


},{"./editors.coffee":1,"./misc.coffee":2,"rich-text/lib/delta":4}],4:[function(require,module,exports){
var diff = require('fast-diff');
var is = require('./is');
var op = require('./op');


var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


var Delta = function (ops) {
  // Assume we are given a well formed ops
  if (is.array(ops)) {
    this.ops = ops;
  } else if (is.object(ops) && is.array(ops.ops)) {
    this.ops = ops.ops;
  } else {
    this.ops = [];
  }
};


Delta.prototype.insert = function (text, attributes) {
  var newOp = {};
  if (text.length === 0) return this;
  newOp.insert = text;
  if (is.object(attributes) && Object.keys(attributes).length > 0) newOp.attributes = attributes;
  return this.push(newOp);
};

Delta.prototype['delete'] = function (length) {
  if (length <= 0) return this;
  return this.push({ 'delete': length });
};

Delta.prototype.retain = function (length, attributes) {
  if (length <= 0) return this;
  var newOp = { retain: length };
  if (is.object(attributes) && Object.keys(attributes).length > 0) newOp.attributes = attributes;
  return this.push(newOp);
};

Delta.prototype.push = function (newOp) {
  var index = this.ops.length;
  var lastOp = this.ops[index - 1];
  newOp = op.clone(newOp);
  if (is.object(lastOp)) {
    if (is.number(newOp['delete']) && is.number(lastOp['delete'])) {
      this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
      return this;
    }
    // Since it does not matter if we insert before or after deleting at the same index,
    // always prefer to insert first
    if (is.number(lastOp['delete']) && newOp.insert != null) {
      index -= 1;
      lastOp = this.ops[index - 1];
      if (!is.object(lastOp)) {
        this.ops.unshift(newOp);
        return this;
      }
    }
    if (is.equal(newOp.attributes, lastOp.attributes)) {
      if (is.string(newOp.insert) && is.string(lastOp.insert)) {
        this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
        if (is.object(newOp.attributes)) this.ops[index - 1].attributes = newOp.attributes
        return this;
      } else if (is.number(newOp.retain) && is.number(lastOp.retain)) {
        this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
        if (is.object(newOp.attributes)) this.ops[index - 1].attributes = newOp.attributes
        return this;
      }
    }
  }
  if (index === this.ops.length) {
    this.ops.push(newOp);
  } else {
    this.ops.splice(index, 0, newOp);
  }
  return this;
};

Delta.prototype.chop = function () {
  var lastOp = this.ops[this.ops.length - 1];
  if (lastOp && lastOp.retain && !lastOp.attributes) {
    this.ops.pop();
  }
  return this;
};

Delta.prototype.length = function () {
  return this.ops.reduce(function (length, elem) {
    return length + op.length(elem);
  }, 0);
};

Delta.prototype.slice = function (start, end) {
  start = start || 0;
  if (!is.number(end)) end = Infinity;
  var delta = new Delta();
  var iter = op.iterator(this.ops);
  var index = 0;
  while (index < end && iter.hasNext()) {
    var nextOp;
    if (index < start) {
      nextOp = iter.next(start - index);
    } else {
      nextOp = iter.next(end - index);
      delta.push(nextOp);
    }
    index += op.length(nextOp);
  }
  return delta;
};


Delta.prototype.compose = function (other) {
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  var delta = new Delta();
  while (thisIter.hasNext() || otherIter.hasNext()) {
    if (otherIter.peekType() === 'insert') {
      delta.push(otherIter.next());
    } else if (thisIter.peekType() === 'delete') {
      delta.push(thisIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (is.number(otherOp.retain)) {
        var newOp = {};
        if (is.number(thisOp.retain)) {
          newOp.retain = length;
        } else {
          newOp.insert = thisOp.insert;
        }
        // Preserve null when composing with a retain, otherwise remove it for inserts
        var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, is.number(thisOp.retain));
        if (attributes) newOp.attributes = attributes;
        delta.push(newOp);
      // Other op should be delete, we could be an insert or retain
      // Insert + delete cancels out
      } else if (is.number(otherOp['delete']) && is.number(thisOp.retain)) {
        delta.push(otherOp);
      }
    }
  }
  return delta.chop();
};

Delta.prototype.diff = function (other) {
  var delta = new Delta();
  if (this.ops === other.ops) {
    return delta;
  }
  var strings = [this.ops, other.ops].map(function (ops) {
    return ops.map(function (op) {
      if (op.insert != null) {
        return is.string(op.insert) ? op.insert : NULL_CHARACTER;
      }
      var prep = (ops === other.ops) ? 'on' : 'with';
      throw new Error('diff() called ' + prep + ' non-document');
    }).join('');
  });
  var diffResult = diff(strings[0], strings[1]);
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  diffResult.forEach(function (component) {
    var length = component[1].length;
    while (length > 0) {
      var opLength = 0;
      switch (component[0]) {
        case diff.INSERT:
          opLength = Math.min(otherIter.peekLength(), length);
          delta.push(otherIter.next(opLength));
          break;
        case diff.DELETE:
          opLength = Math.min(length, thisIter.peekLength());
          thisIter.next(opLength);
          delta['delete'](opLength);
          break;
        case diff.EQUAL:
          opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
          var thisOp = thisIter.next(opLength);
          var otherOp = otherIter.next(opLength);
          if (is.equal(thisOp.insert, otherOp.insert)) {
            delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
          } else {
            delta.push(otherOp)['delete'](opLength);
          }
          break;
      }
      length -= opLength;
    }
  });
  return delta.chop();
};

Delta.prototype.transform = function (other, priority) {
  priority = !!priority;
  if (is.number(other)) {
    return this.transformPosition(other, priority);
  }
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  var delta = new Delta();
  while (thisIter.hasNext() || otherIter.hasNext()) {
    if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
      delta.retain(op.length(thisIter.next()));
    } else if (otherIter.peekType() === 'insert') {
      delta.push(otherIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (thisOp['delete']) {
        // Our delete either makes their delete redundant or removes their retain
        continue;
      } else if (otherOp['delete']) {
        delta.push(otherOp);
      } else {
        // We retain either their retain or insert
        delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
      }
    }
  }
  return delta.chop();
};

Delta.prototype.transformPosition = function (index, priority) {
  priority = !!priority;
  var thisIter = op.iterator(this.ops);
  var offset = 0;
  while (thisIter.hasNext() && offset <= index) {
    var length = thisIter.peekLength();
    var nextType = thisIter.peekType();
    thisIter.next();
    if (nextType === 'delete') {
      index -= Math.min(length, index - offset);
      continue;
    } else if (nextType === 'insert' && (offset < index || !priority)) {
      index += length;
    }
    offset += length;
  }
  return index;
};


module.exports = Delta;

},{"./is":5,"./op":6,"fast-diff":7}],5:[function(require,module,exports){
module.exports = {
  equal: function (a, b) {
    if (a === b) return true;
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    if (!this.object(a) || !this.object(b)) return false;
    if (Object.keys(a).length != Object.keys(b).length) return false;
    for(var key in a) {
      // Only compare one level deep
      if (a[key] !== b[key]) return false;
    }
    return true;
  },

  array: function (value) {
    return Array.isArray(value);
  },

  number: function (value) {
    if (typeof value === 'number') return true;
    if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Number]') return true;
    return false;
  },

  object: function (value) {
    if (!value) return false;
    return (typeof value === 'function' || typeof value === 'object');
  },

  string: function (value) {
    if (typeof value === 'string') return true;
    if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object String]') return true;
    return false;
  }
};

},{}],6:[function(require,module,exports){
var is = require('./is');


var lib = {
  attributes: {
    clone: function (attributes, keepNull) {
      if (!is.object(attributes)) return {};
      return Object.keys(attributes).reduce(function (memo, key) {
        if (attributes[key] !== undefined && (attributes[key] !== null || keepNull)) {
          memo[key] = attributes[key];
        }
        return memo;
      }, {});
    },

    compose: function (a, b, keepNull) {
      if (!is.object(a)) a = {};
      if (!is.object(b)) b = {};
      var attributes = this.clone(b, keepNull);
      for (var key in a) {
        if (a[key] !== undefined && b[key] === undefined) {
          attributes[key] = a[key];
        }
      }
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    },

    diff: function(a, b) {
      if (!is.object(a)) a = {};
      if (!is.object(b)) b = {};
      var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
        if (a[key] !== b[key]) {
          attributes[key] = b[key] === undefined ? null : b[key];
        }
        return attributes;
      }, {});
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    },

    transform: function (a, b, priority) {
      if (!is.object(a)) return b;
      if (!is.object(b)) return undefined;
      if (!priority) return b;  // b simply overwrites us without priority
      var attributes = Object.keys(b).reduce(function (attributes, key) {
        if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
        return attributes;
      }, {});
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
  },

  clone: function (op) {
    var newOp = this.attributes.clone(op);
    if (is.object(newOp.attributes)) {
      newOp.attributes = this.attributes.clone(newOp.attributes, true);
    }
    return newOp;
  },

  iterator: function (ops) {
    return new Iterator(ops);
  },

  length: function (op) {
    if (is.number(op['delete'])) {
      return op['delete'];
    } else if (is.number(op.retain)) {
      return op.retain;
    } else {
      return is.string(op.insert) ? op.insert.length : 1;
    }
  }
};


function Iterator(ops) {
  this.ops = ops;
  this.index = 0;
  this.offset = 0;
};

Iterator.prototype.hasNext = function () {
  return this.peekLength() < Infinity;
};

Iterator.prototype.next = function (length) {
  if (!length) length = Infinity;
  var nextOp = this.ops[this.index];
  if (nextOp) {
    var offset = this.offset;
    var opLength = lib.length(nextOp)
    if (length >= opLength - offset) {
      length = opLength - offset;
      this.index += 1;
      this.offset = 0;
    } else {
      this.offset += length;
    }
    if (is.number(nextOp['delete'])) {
      return { 'delete': length };
    } else {
      var retOp = {};
      if (nextOp.attributes) {
        retOp.attributes = nextOp.attributes;
      }
      if (is.number(nextOp.retain)) {
        retOp.retain = length;
      } else if (is.string(nextOp.insert)) {
        retOp.insert = nextOp.insert.substr(offset, length);
      } else {
        // offset should === 0, length should === 1
        retOp.insert = nextOp.insert;
      }
      return retOp;
    }
  } else {
    return { retain: Infinity };
  }
};

Iterator.prototype.peekLength = function () {
  if (this.ops[this.index]) {
    // Should never return 0 if our index is being managed correctly
    return lib.length(this.ops[this.index]) - this.offset;
  } else {
    return Infinity;
  }
};

Iterator.prototype.peekType = function () {
  if (this.ops[this.index]) {
    if (is.number(this.ops[this.index]['delete'])) {
      return 'delete';
    } else if (is.number(this.ops[this.index].retain)) {
      return 'retain';
    } else {
      return 'insert';
    }
  }
  return 'retain';
};


module.exports = lib;

},{"./is":5}],7:[function(require,module,exports){
/**
 * This library modifies the diff-patch-match library by Neil Fraser
 * by removing the patch and match functionality and certain advanced
 * options in the diff function. The original license is as follows:
 *
 * ===
 *
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 */
function diff_main(text1, text2) {
  // Check for equality (speedup).
  if (text1 == text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  // Trim off common prefix (speedup).
  var commonlength = diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = diff_compute_(text1, text2);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  diff_cleanupMerge(diffs);
  return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 */
function diff_compute_(text1, text2) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i != -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
             [DIFF_EQUAL, shorttext],
             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length == 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  // Check to see if the problem can be split in two.
  var hm = diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = diff_main(text1_a, text2_a);
    var diffs_b = diff_main(text1_b, text2_b);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  return diff_bisect_(text1, text2);
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 * @private
 */
function diff_bisect_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = (delta % 2 != 0);
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length &&
             text1.charAt(x1) == text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length &&
             text1.charAt(text1_length - x2 - 1) ==
             text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @return {Array} Array of diff tuples.
 */
function diff_bisectSplit_(text1, text2, x, y) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = diff_main(text1a, text2a);
  var diffsb = diff_main(text1b, text2b);

  return diffs.concat(diffsb);
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
function diff_commonPrefix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
function diff_commonSuffix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 ||
      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 */
function diff_halfMatch_(text1, text2) {
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;  // Pointless.
  }

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = '';
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
      var prefixLength = diff_commonPrefix(longtext.substring(i),
                                           shorttext.substring(j));
      var suffixLength = diff_commonSuffix(longtext.substring(0, i),
                                           shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b,
              best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 4));
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {Array} diffs Array of diff tuples.
 */
function diff_cleanupMerge(diffs) {
  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  var commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            // Factor out any common prefixies.
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if ((pointer - count_delete - count_insert) > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ==
                  DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixies.
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length -
                  commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length -
                  commonlength);
              text_delete = text_delete.substring(0, text_delete.length -
                  commonlength);
            }
          }
          // Delete the offending records and add the merged ones.
          if (count_delete === 0) {
            diffs.splice(pointer - count_insert,
                count_delete + count_insert, [DIFF_INSERT, text_insert]);
          } else if (count_insert === 0) {
            diffs.splice(pointer - count_delete,
                count_delete + count_insert, [DIFF_DELETE, text_delete]);
          } else {
            diffs.splice(pointer - count_delete - count_insert,
                count_delete + count_insert, [DIFF_DELETE, text_delete],
                [DIFF_INSERT, text_insert]);
          }
          pointer = pointer - count_delete - count_insert +
                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();  // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diffs[pointer][1].substring(diffs[pointer][1].length -
          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] = diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    diff_cleanupMerge(diffs);
  }
};


var diff = diff_main;
diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;


module.exports = diff;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9lZGl0b3JzLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9taXNjLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi95LXJpY2h0ZXh0LmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L25vZGVfbW9kdWxlcy9yaWNoLXRleHQvbGliL2RlbHRhLmpzIiwiL2hvbWUvY2NjL0RvY3VtZW50cy9wcm9nL0xpbmFnb3JhL3ktcmljaHRleHQvbm9kZV9tb2R1bGVzL3JpY2gtdGV4dC9saWIvaXMuanMiLCIvaG9tZS9jY2MvRG9jdW1lbnRzL3Byb2cvTGluYWdvcmEveS1yaWNodGV4dC9ub2RlX21vZHVsZXMvcmljaC10ZXh0L2xpYi9vcC5qcyIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L25vZGVfbW9kdWxlcy9yaWNoLXRleHQvbm9kZV9tb2R1bGVzL2Zhc3QtZGlmZi9kaWZmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSx5Q0FBQTtFQUFBO2lTQUFBOztBQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUE7QUFNZSxFQUFBLHdCQUFFLE1BQUYsR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxHQUFjLElB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1pc2MgPSByZXF1aXJlKFwiLi9taXNjLmNvZmZlZVwiKVxuXG4jIGEgZ2VuZXJpYyBlZGl0b3IgY2xhc3NcbmNsYXNzIEFic3RyYWN0RWRpdG9yXG4gICMgY3JlYXRlIGFuIGVkaXRvciBpbnN0YW5jZVxuICAjIEBwYXJhbSBpbnN0YW5jZSBbRWRpdG9yXSB0aGUgZWRpdG9yIG9iamVjdFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQGxvY2tlciA9IG5ldyBtaXNjLkxvY2tlcigpXG5cbiAgIyBnZXQgdGhlIGN1cnJlbnQgY29udGVudCBhcyBhIG90LWRlbHRhXG4gIGdldENvbnRlbnRzOiAoKS0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBnZXQgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uXG4gIGdldEN1cnNvcjogKCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcbiAgIyBzZXQgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uXG4gICMgQHBhcmFtIHBhcmFtIFtPcHRpb25dIHRoZSBvcHRpb25zXG4gICMgQG9wdGlvbiBwYXJhbSBbSW50ZWdlcl0gaWQgdGhlIGlkIG9mIHRoZSBhdXRob3JcbiAgIyBAb3B0aW9uIHBhcmFtIFtJbnRlZ2VyXSBpbmRleCB0aGUgaW5kZXggb2YgdGhlIGN1cnNvclxuICAjIEBvcHRpb24gcGFyYW0gW1N0cmluZ10gdGV4dCB0aGUgdGV4dCBvZiB0aGUgY3Vyc29yXG4gICMgQG9wdGlvbiBwYXJhbSBbU3RyaW5nXSBjb2xvciB0aGUgY29sb3Igb2YgdGhlIGN1cnNvclxuICBzZXRDdXJzb3I6IChwYXJhbSkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcbiAgcmVtb3ZlQ3Vyc29yOiAoKS0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cblxuICAjIHJlbW92ZSBhIGN1cnNvclxuICAjIEBwYXJhbSBpZCBbU3RyaW5nXSB0aGUgaWQgb2YgdGhlIGN1cnNvciB0byByZW1vdmVcbiAgcmVtb3ZlQ3Vyc29yOiAoaWQpIC0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBkZXNjcmliZSBob3cgdG8gcGFzcyBsb2NhbCBtb2RpZmljYXRpb25zIG9mIHRoZSB0ZXh0IHRvIHRoZSBiYWNrZW5kLlxuICAjIEBwYXJhbSBiYWNrZW5kIFtGdW5jdGlvbl0gdGhlIGZ1bmN0aW9uIHRvIHBhc3MgdGhlIGRlbHRhIHRvXG4gICMgQG5vdGUgVGhlIGJhY2tlbmQgZnVuY3Rpb24gdGFrZXMgYSBsaXN0IG9mIGRlbHRhcyBhcyBhcmd1bWVudFxuICBvYnNlcnZlTG9jYWxUZXh0OiAoYmFja2VuZCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIGRlc2NyaWJlIGhvdyB0byBwYXNzIGxvY2FsIG1vZGlmaWNhdGlvbnMgb2YgdGhlIGN1cnNvciB0byB0aGUgYmFja2VuZFxuICAjIEBwYXJhbSBiYWNrZW5kIFtGdW5jdGlvbl0gdGhlIGZ1bmN0aW9uIHRvIHBhc3MgdGhlIG5ldyBwb3NpdGlvbiB0b1xuICAjIEBub3RlIHRoZSBiYWNrZW5kIGZ1bmN0aW9uIHRha2VzIGEgcG9zaXRpb24gYXMgYXJndW1lbnRcbiAgb2JzZXJ2ZUxvY2FsQ3Vyc29yOiAoYmFja2VuZCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIEFwcGx5IGRlbHRhIG9uIHRoZSBlZGl0b3JcbiAgIyBAcGFyYW0gZGVsdGEgW0RlbHRhXSB0aGUgZGVsdGEgdG8gcHJvcGFnYXRlIHRvIHRoZSBlZGl0b3JcbiAgIyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vdHR5cGVzL3JpY2gtdGV4dFxuICB1cGRhdGVDb250ZW50czogKGRlbHRhKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgUmVtb3ZlIG9sZCBjb250ZW50IGFuZCBhcHBseSBkZWx0YSBvbiB0aGUgZWRpdG9yXG4gICMgQHBhcmFtIGRlbHRhIFtEZWx0YV0gdGhlIGRlbHRhIHRvIHByb3BhZ2F0ZSB0byB0aGUgZWRpdG9yXG4gICMgQHNlZSBodHRwczovL2dpdGh1Yi5jb20vb3R0eXBlcy9yaWNoLXRleHRcbiAgc2V0Q29udGVudHM6IChkZWx0YSkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIFJldHVybiB0aGUgZWRpdG9yIGluc3RhbmNlXG4gIGdldEVkaXRvcjogKCktPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgQ2hlY2sgaWYgdGhlIGVkaXRvciB0cmllcyB0byBhY2N1bXVsYXRlIG1lc3NhZ2VzLiBUaGlzIGlzIGV4ZWN1dGVkIGV2ZXJ5IHRpbWUgYmVmb3JlIFlqcyBleGVjdXRlcyBhIG1lc3NhZ2VzXG4gIGNoZWNrVXBkYXRlOiAoKS0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbmNsYXNzIFF1aWxsSnMgZXh0ZW5kcyBBYnN0cmFjdEVkaXRvclxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBzdXBlciBAZWRpdG9yXG4gICAgQF9jdXJzb3JzID0gQGVkaXRvci5nZXRNb2R1bGUoXCJtdWx0aS1jdXJzb3JcIilcblxuICAjIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSB0ZXh0XG4gIGdldExlbmd0aDogKCktPlxuICAgIEBlZGl0b3IuZ2V0TGVuZ3RoKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldFNlbGVjdGlvbigpXG4gICAgaWYgc2VsZWN0aW9uXG4gICAgICBzZWxlY3Rpb24uc3RhcnRcbiAgICBlbHNlXG4gICAgICAwXG5cbiAgZ2V0Q29udGVudHM6ICgpLT5cbiAgICBAZWRpdG9yLmdldENvbnRlbnRzKCkub3BzXG5cbiAgc2V0Q3Vyc29yOiAocGFyYW0pIC0+IEBsb2NrZXIudHJ5ICgpPT5cbiAgICBjdXJzb3IgPSBAX2N1cnNvcnMuY3Vyc29yc1twYXJhbS5pZF1cbiAgICBpZiBjdXJzb3I/IGFuZCBjdXJzb3IuY29sb3IgPT0gcGFyYW0uY29sb3JcbiAgICAgIGZ1biA9IChpbmRleCkgPT5cbiAgICAgICAgQF9jdXJzb3JzLm1vdmVDdXJzb3IgcGFyYW0uaWQsIGluZGV4XG4gICAgZWxzZVxuICAgICAgaWYgY3Vyc29yPyBhbmQgY3Vyc29yLmNvbG9yPyBhbmQgY3Vyc29yLmNvbG9yICE9IHBhcmFtLmNvbG9yXG4gICAgICAgIEByZW1vdmVDdXJzb3IgcGFyYW0uaWRcblxuICAgICAgZnVuID0gKGluZGV4KSA9PlxuICAgICAgICBAX2N1cnNvcnMuc2V0Q3Vyc29yKHBhcmFtLmlkLCBpbmRleCxcbiAgICAgICAgICBwYXJhbS50ZXh0LCBwYXJhbS5jb2xvcilcblxuICAgIGxlbiA9IEBlZGl0b3IuZ2V0TGVuZ3RoKClcbiAgICBpZiBwYXJhbS5pbmRleCA+IGxlblxuICAgICAgcGFyYW0uaW5kZXggPSBsZW5cbiAgICBpZiBwYXJhbS5pbmRleD9cbiAgICAgIGZ1biBwYXJhbS5pbmRleFxuXG4gIHJlbW92ZUN1cnNvcjogKGlkKSAtPlxuICAgIEBfY3Vyc29ycy5yZW1vdmVDdXJzb3IoaWQpXG5cbiAgcmVtb3ZlQ3Vyc29yOiAoaWQpLT5cbiAgICAgIEBfY3Vyc29ycy5yZW1vdmVDdXJzb3IgaWRcblxuICBvYnNlcnZlTG9jYWxUZXh0OiAoYmFja2VuZCktPlxuICAgIEBlZGl0b3Iub24gXCJ0ZXh0LWNoYW5nZVwiLCAoZGVsdGFzLCBzb3VyY2UpIC0+XG4gICAgICAjIGNhbGwgdGhlIGJhY2tlbmQgd2l0aCBkZWx0YXNcbiAgICAgIHBvc2l0aW9uID0gYmFja2VuZCBkZWx0YXNcbiAgICAgICMgdHJpZ2dlciBhbiBleHRyYSBldmVudCB0byBtb3ZlIGN1cnNvciB0byBwb3NpdGlvbiBvZiBpbnNlcnRlZCB0ZXh0XG4gICAgICBAZWRpdG9yLnNlbGVjdGlvbi5lbWl0dGVyLmVtaXQoXG4gICAgICAgIEBlZGl0b3Iuc2VsZWN0aW9uLmVtaXR0ZXIuY29uc3RydWN0b3IuZXZlbnRzLlNFTEVDVElPTl9DSEFOR0UsXG4gICAgICAgIEBlZGl0b3IucXVpbGwuZ2V0U2VsZWN0aW9uKCksXG4gICAgICAgIFwidXNlclwiKVxuXG4gIG9ic2VydmVMb2NhbEN1cnNvcjogKGJhY2tlbmQpIC0+XG4gICAgQGVkaXRvci5vbiBcInNlbGVjdGlvbi1jaGFuZ2VcIiwgKHJhbmdlLCBzb3VyY2UpLT5cbiAgICAgIGlmIHJhbmdlIGFuZCByYW5nZS5zdGFydCA9PSByYW5nZS5lbmRcbiAgICAgICAgYmFja2VuZCByYW5nZS5zdGFydFxuXG4gIHVwZGF0ZUNvbnRlbnRzOiAoZGVsdGEpLT5cbiAgICBAZWRpdG9yLnVwZGF0ZUNvbnRlbnRzIGRlbHRhXG5cblxuICBzZXRDb250ZW50czogKGRlbHRhKS0+XG4gICAgQGVkaXRvci5zZXRDb250ZW50cyhkZWx0YSlcblxuICBnZXRFZGl0b3I6ICgpLT5cbiAgICBAZWRpdG9yXG5cbiAgY2hlY2tVcGRhdGU6ICgpLT5cbiAgICBAZWRpdG9yLmVkaXRvci5jaGVja1VwZGF0ZSgpXG5cbmNsYXNzIFRlc3RFZGl0b3IgZXh0ZW5kcyBBYnN0cmFjdEVkaXRvclxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBzdXBlclxuXG4gIGdldExlbmd0aDooKSAtPlxuICAgIDBcblxuICBnZXRDdXJzb3JQb3NpdGlvbjogLT5cbiAgICAwXG5cbiAgZ2V0Q29udGVudHM6ICgpIC0+XG4gICAgb3BzOiBbe2luc2VydDogXCJXZWxsLCB0aGlzIGlzIGEgdGVzdCFcIn1cbiAgICAgIHtpbnNlcnQ6IFwiQW5kIEknbSBib2xk4oCmXCIsIGF0dHJpYnV0ZXM6IHtib2xkOnRydWV9fV1cblxuICBzZXRDdXJzb3I6ICgpIC0+XG4gICAgXCJcIlxuXG4gIG9ic2VydmVMb2NhbFRleHQ6KGJhY2tlbmQpIC0+XG4gICAgXCJcIlxuXG4gIG9ic2VydmVMb2NhbEN1cnNvcjogKGJhY2tlbmQpIC0+XG4gICAgXCJcIlxuXG4gIHVwZGF0ZUNvbnRlbnRzOiAoZGVsdGEpIC0+XG4gICAgXCJcIlxuXG4gIHNldENvbnRlbnRzOiAoZGVsdGEpLT5cbiAgICBcIlwiXG5cbiAgZ2V0RWRpdG9yOiAoKS0+XG4gICAgQGVkaXRvclxuXG5leHBvcnRzLlF1aWxsSnMgPSBRdWlsbEpzXG5leHBvcnRzLlRlc3RFZGl0b3IgPSBUZXN0RWRpdG9yXG5leHBvcnRzLkFic3RyYWN0RWRpdG9yID0gQWJzdHJhY3RFZGl0b3JcbiIsImNsYXNzIExvY2tlclxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICBAaXNfbG9ja2VkID0gZmFsc2VcblxuICB0cnk6IChmdW4pIC0+XG4gICAgaWYgQGlzX2xvY2tlZFxuICAgICAgcmV0dXJuXG5cbiAgICBAaXNfbG9ja2VkID0gdHJ1ZVxuICAgIHJldCA9IGRvIGZ1blxuICAgIEBpc19sb2NrZWQgPSBmYWxzZVxuICAgIHJldHVybiByZXRcblxuIyBhIGJhc2ljIGNsYXNzIHdpdGggZ2VuZXJpYyBnZXR0ZXIgLyBzZXR0ZXIgZnVuY3Rpb25cbmNsYXNzIEJhc2VDbGFzc1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICAjIG93blByb3BlcnR5IGlzIHVuc2FmZS4gUmF0aGVyIHB1dCBpdCBvbiBhIGRlZGljYXRlZCBwcm9wZXJ0eSBsaWtlLi5cbiAgICBAX3RtcF9tb2RlbCA9IHt9XG5cbiAgIyBUcnkgdG8gZmluZCB0aGUgcHJvcGVydHkgaW4gQF9tb2RlbCwgZWxzZSByZXR1cm4gdGhlXG4gICMgdG1wX21vZGVsXG4gIF9nZXQ6IChwcm9wKSAtPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgQF90bXBfbW9kZWxbcHJvcF1cbiAgICBlbHNlXG4gICAgICBAX21vZGVsLnZhbChwcm9wKVxuICAjIFRyeSB0byBzZXQgdGhlIHByb3BlcnR5IGluIEBfbW9kZWwsIGVsc2Ugc2V0IHRoZVxuICAjIHRtcF9tb2RlbFxuICBfc2V0OiAocHJvcCwgdmFsKSAtPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgQF90bXBfbW9kZWxbcHJvcF0gPSB2YWxcbiAgICBlbHNlXG4gICAgICBAX21vZGVsLnZhbChwcm9wLCB2YWwpXG5cbiAgIyBzaW5jZSB3ZSBhbHJlYWR5IGFzc3VtZSB0aGF0IGFueSBpbnN0YW5jZSBvZiBCYXNlQ2xhc3MgdXNlcyBhIE1hcE1hbmFnZXJcbiAgIyBXZSBjYW4gY3JlYXRlIGl0IGhlcmUsIHRvIHNhdmUgbGluZXMgb2YgY29kZVxuICBfZ2V0TW9kZWw6IChZLCBPcGVyYXRpb24pLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIEBfbW9kZWwgPSBuZXcgT3BlcmF0aW9uLk1hcE1hbmFnZXIoQCkuZXhlY3V0ZSgpXG4gICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBAX3RtcF9tb2RlbFxuICAgICAgICBAX21vZGVsLnZhbChrZXksIHZhbHVlKVxuICAgIEBfbW9kZWxcblxuICBfc2V0TW9kZWw6IChAX21vZGVsKS0+XG4gICAgZGVsZXRlIEBfdG1wX21vZGVsXG5cbmlmIG1vZHVsZT9cbiAgZXhwb3J0cy5CYXNlQ2xhc3MgPSBCYXNlQ2xhc3NcbiAgZXhwb3J0cy5Mb2NrZXIgPSBMb2NrZXJcbiIsIm1pc2MgPSAocmVxdWlyZSBcIi4vbWlzYy5jb2ZmZWVcIilcbkJhc2VDbGFzcyA9IG1pc2MuQmFzZUNsYXNzXG5Mb2NrZXIgPSBtaXNjLkxvY2tlclxuRWRpdG9ycyA9IChyZXF1aXJlIFwiLi9lZGl0b3JzLmNvZmZlZVwiKVxuRGVsdGEgPSByZXF1aXJlKCdyaWNoLXRleHQvbGliL2RlbHRhJylcblxuXG4jIEFsbCBkZXBlbmRlbmNpZXMgKGxpa2UgWS5TZWxlY3Rpb25zKSB0byBvdGhlciB0eXBlcyAodGhhdCBoYXZlIGl0cyBvd25cbiMgcmVwb3NpdG9yeSkgc2hvdWxkICBiZSBpbmNsdWRlZCBieSB0aGUgdXNlciAoaW4gb3JkZXIgdG8gcmVkdWNlIHRoZSBhbW91bnQgb2ZcbiMgZG93bmxvYWRlZCBjb250ZW50KS5cbiMgV2l0aCBodG1sNSBpbXBvcnRzLCB3ZSBjYW4gaW5jbHVkZSBpdCBhdXRvbWF0aWNhbGx5IHRvby4gQnV0IHdpdGggdGhlIG9sZFxuIyBzY3JpcHQgdGFncyB0aGlzIGlzIHRoZSBiZXN0IHNvbHV0aW9uIHRoYXQgY2FtZSB0byBteSBtaW5kLlxuXG4jIEEgY2xhc3MgaG9sZGluZyB0aGUgaW5mb3JtYXRpb24gYWJvdXQgcmljaCB0ZXh0XG5jbGFzcyBZUmljaFRleHQgZXh0ZW5kcyBCYXNlQ2xhc3NcbiAgIyBAcGFyYW0gY29udGVudCBbU3RyaW5nXSBhbiBpbml0aWFsIHN0cmluZ1xuICAjIEBwYXJhbSBlZGl0b3IgW0VkaXRvcl0gYW4gZWRpdG9yIGluc3RhbmNlXG4gICMgQHBhcmFtIGF1dGhvciBbU3RyaW5nXSB0aGUgbmFtZSBvZiB0aGUgbG9jYWwgYXV0aG9yXG4gIGNvbnN0cnVjdG9yOiAoZWRpdG9yX25hbWUsIGVkaXRvcl9pbnN0YW5jZSkgLT5cbiAgICBAbG9ja2VyID0gbmV3IExvY2tlcigpXG5cbiAgICBpZiBlZGl0b3JfbmFtZT8gYW5kIGVkaXRvcl9pbnN0YW5jZT9cbiAgICAgIEBfYmluZF9sYXRlciA9XG4gICAgICAgIG5hbWU6IGVkaXRvcl9uYW1lXG4gICAgICAgIGluc3RhbmNlOiBlZGl0b3JfaW5zdGFuY2VcblxuICAgICMgVE9ETzogZ2VuZXJhdGUgYSBVSUQgKHlvdSBjYW4gZ2V0IGEgdW5pcXVlIGlkIGJ5IGNhbGxpbmdcbiAgICAjIGBAX21vZGVsLmdldFVpZCgpYCAtIGlzIHRoaXMgd2hhdCB5b3UgbWVhbj8pXG4gICAgIyBAYXV0aG9yID0gYXV0aG9yXG4gICAgIyBUT0RPOiBhc3NpZ24gYW4gaWQgLyBhdXRob3IgbmFtZSB0byB0aGUgcmljaCB0ZXh0IGluc3RhbmNlIGZvciBhdXRob3JzaGlwXG5cbiAgICAjIGFwcGxpZXMgcGVuZGluZyBkZWx0YXMgZnJlcXVlbnRseVxuICAgIEBwZW5kaW5nRGVsdGEgPSBuZXcgRGVsdGEoKVxuICAgIHdpbmRvdy5zZXRJbnRlcnZhbCBAYXBwbHlVcGRhdGVDb250ZW50cy5iaW5kKEApLCAyMDBcblxuXG4gIGFwcGx5VXBkYXRlQ29udGVudHM6ICgpIC0+XG4gICAgaWYgQGVkaXRvcj8gYW5kIEBwZW5kaW5nRGVsdGEubGVuZ3RoKCkgPiAwXG4gICAgICBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICAgIEBlZGl0b3IudXBkYXRlQ29udGVudHMgQHBlbmRpbmdEZWx0YVxuICAgICAgICBAcGVuZGluZ0RlbHRhID0gbmV3IERlbHRhKClcbiAgI1xuICAjIEJpbmQgdGhlIFJpY2hUZXh0IHR5cGUgdG8gYSByaWNoIHRleHQgZWRpdG9yIChlLmcuIHF1aWxsanMpXG4gICNcbiAgYmluZDogKCktPlxuICAgICMgVE9ETzogYmluZCB0byBtdWx0aXBsZSBlZGl0b3JzXG4gICAgaWYgYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgRWRpdG9ycy5BYnN0cmFjdEVkaXRvclxuICAgICAgIyBpcyBhbHJlYWR5IGFuIGVkaXRvciFcbiAgICAgIEBlZGl0b3IgPSBhcmd1bWVudHNbMF1cbiAgICBlbHNlXG4gICAgICBbZWRpdG9yX25hbWUsIGVkaXRvcl9pbnN0YW5jZV0gPSBhcmd1bWVudHNcbiAgICAgIGlmIEBlZGl0b3I/IGFuZCBAZWRpdG9yLmdldEVkaXRvcigpIGlzIGVkaXRvcl9pbnN0YW5jZVxuICAgICAgICAjIHJldHVybiwgaWYgQGVkaXRvciBpcyBhbHJlYWR5IGJvdW5kISAobmV2ZXIgYmluZCB0d2ljZSEpXG4gICAgICAgIHJldHVyblxuICAgICAgRWRpdG9yID0gRWRpdG9yc1tlZGl0b3JfbmFtZV1cbiAgICAgIGlmIEVkaXRvcj9cbiAgICAgICAgQGVkaXRvciA9IG5ldyBFZGl0b3IgZWRpdG9yX2luc3RhbmNlXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgdHlwZSBvZiBlZGl0b3IgaXMgbm90IHN1cHBvcnRlZCEgKFwiICtcbiAgICAgICAgICBlZGl0b3JfbmFtZSArIFwiKVwiXG5cbiAgICAjIFRPRE86IHBhcnNlIHRoZSBmb2xsb3dpbmcgZGlyZWN0bHkgZnJvbSAkY2hhcmFjdGVycyskc2VsZWN0aW9ucyAoaW4gTyhuKSlcbiAgICBAZWRpdG9yLnNldENvbnRlbnRzXG4gICAgICBvcHM6IEBnZXREZWx0YSgpXG5cbiAgICAjIGJpbmQgdGhlIHJlc3QuLlxuICAgICMgVE9ETzogcmVtb3ZlIG9ic2VydmVycywgd2hlbiBlZGl0b3IgaXMgb3ZlcndyaXR0ZW5cbiAgICBAZWRpdG9yLm9ic2VydmVMb2NhbFRleHQgKChkZWx0YSkgPT5cbiAgICAgIHRyYW5zZm9ybWVkRGVsdGEgPSBAcGVuZGluZ0RlbHRhLnRyYW5zZm9ybSBkZWx0YVxuICAgICAgQGFwcGx5VXBkYXRlQ29udGVudHMoKVxuICAgICAgQHBhc3NEZWx0YXMuY2FsbChAZWRpdG9yLCB0cmFuc2Zvcm1lZERlbHRhKSkuYmluZCBAXG5cbiAgICBAYmluZEV2ZW50c1RvRWRpdG9yIEBlZGl0b3JcbiAgICBAZWRpdG9yLm9ic2VydmVMb2NhbEN1cnNvciBAdXBkYXRlQ3Vyc29yUG9zaXRpb25cblxuICAgICMgcHVsbCBjaGFuZ2VzIGZyb20gcXVpbGwsIGJlZm9yZSBtZXNzYWdlIGlzIHJlY2VpdmVkIGFuZCBldmVudHVhbGx5IGFwcGx5IGFsbCBub24tYXBwbGllZCBtb2RpZmljYXRpb25zXG4gICAgIyBhcyBzdWdnZXN0ZWQgaHR0cHM6Ly9kaXNjdXNzLnF1aWxsanMuY29tL3QvcHJvYmxlbXMtaW4tY29sbGFib3JhdGl2ZS1pbXBsZW1lbnRhdGlvbi8yNThcbiAgICAjIFRPRE86IG1vdmUgdGhpcyB0byBFZGl0b3JzLmNvZmZlZVxuICAgIEBfbW9kZWwuY29ubmVjdG9yLnJlY2VpdmVfaGFuZGxlcnMudW5zaGlmdCAoKT0+XG4gICAgICBAZWRpdG9yLmNoZWNrVXBkYXRlKClcblxuICBvYnNlcnZlOiAoZnVuKSAtPlxuICAgIGlmIEBfbW9kZWw/XG4gICAgICBAX21vZGVsLm9ic2VydmUoZnVuKVxuICAgIGVsc2VcbiAgICAgIEBfb2JzZXJ2ZVdoZW5Nb2RlbCA9IChAX29ic2VydmVXaGVuTW9kZWwgb3IgW10pLnB1c2goZnVuKVxuXG4gIGF0dGFjaFByb3ZpZGVyOiAoa2luZCwgZnVuKSAtPlxuICAgIEBfcHJvdmlkZXJzID0gQF9wcm92aWRlcnMgb3Ige31cbiAgICBAX3Byb3ZpZGVyc1traW5kXSA9IGZ1blxuXG4gIGdldERlbHRhOiAoKS0+XG4gICAgdGV4dF9jb250ZW50ID0gQF9tb2RlbC5nZXRDb250ZW50KCdjaGFyYWN0ZXJzJykudmFsKClcbiAgICAjIHRyYW5zZm9ybSBZLlNlbGVjdGlvbnMuZ2V0U2VsZWN0aW9ucygpIHRvIGEgZGVsdGFcbiAgICBleHBlY3RlZF9wb3MgPSAwXG4gICAgZGVsdGFzID0gbmV3IERlbHRhKClcbiAgICBzZWxlY3Rpb25zID0gQF9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKVxuICAgIGZvciBzZWwgaW4gc2VsZWN0aW9ucy5nZXRTZWxlY3Rpb25zKEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikpXG4gICAgICAjICgrMSksIGJlY2F1c2UgaWYgd2Ugc2VsZWN0IGZyb20gMSB0byAxICh3aXRoIHktc2VsZWN0aW9ucyksIHRoZW4gdGhlXG4gICAgICAjIGxlbmd0aCBpcyAxXG4gICAgICBzZWxlY3Rpb25fbGVuZ3RoID0gc2VsLnRvIC0gc2VsLmZyb20gKyAxXG4gICAgICBpZiBleHBlY3RlZF9wb3MgaXNudCBzZWwuZnJvbVxuICAgICAgICAjIFRoZXJlIGlzIHVuc2VsZWN0ZWQgdGV4dC4gJHJldGFpbiB0byB0aGUgbmV4dCBzZWxlY3Rpb25cbiAgICAgICAgdW5zZWxlY3RlZF9pbnNlcnRfY29udGVudCA9IHRleHRfY29udGVudC5zcGxpY2UoXG4gICAgICAgICAgMCwgc2VsLmZyb20tZXhwZWN0ZWRfcG9zIClcbiAgICAgICAgICAuam9pbignJylcbiAgICAgICAgZGVsdGFzLmluc2VydCB1bnNlbGVjdGVkX2luc2VydF9jb250ZW50XG4gICAgICAgIGV4cGVjdGVkX3BvcyArPSB1bnNlbGVjdGVkX2luc2VydF9jb250ZW50Lmxlbmd0aFxuICAgICAgaWYgZXhwZWN0ZWRfcG9zIGlzbnQgc2VsLmZyb21cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBwb3J0aW9uIG9mIGNvZGUgbXVzdCBub3QgYmUgcmVhY2hlZCBpbiBnZXREZWx0YSFcIlxuICAgICAgZGVsdGFzLmluc2VydCB0ZXh0X2NvbnRlbnQuc3BsaWNlKDAsIHNlbGVjdGlvbl9sZW5ndGgpLmpvaW4oJycpLCBzZWwuYXR0cnNcbiAgICAgIGV4cGVjdGVkX3BvcyArPSBzZWxlY3Rpb25fbGVuZ3RoXG4gICAgaWYgdGV4dF9jb250ZW50Lmxlbmd0aCA+IDBcbiAgICAgIGRlbHRhcy5pbnNlcnQgdGV4dF9jb250ZW50LmpvaW4oJycpXG4gICAgZGVsdGFzXG5cbiAgX2dldE1vZGVsOiAoWSwgT3BlcmF0aW9uKSAtPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgIyB3ZSBzYXZlIHRoaXMgc3R1ZmYgYXMgX3N0YXRpY18gY29udGVudCBub3cuXG4gICAgICAjIFRoZXJlZm9yZSwgeW91IGNhbid0IG92ZXJ3cml0ZSBpdCwgYWZ0ZXIgeW91IG9uY2Ugc2F2ZWQgaXQuXG4gICAgICAjIEJ1dCBvbiB0aGUgdXBzaWRlLCB3ZSBjYW4gYWx3YXlzIG1ha2Ugc3VyZSwgdGhhdCB0aGV5IGFyZSBkZWZpbmVkIVxuICAgICAgY29udGVudF9vcGVyYXRpb25zID1cbiAgICAgICAgc2VsZWN0aW9uczogbmV3IFkuU2VsZWN0aW9ucygpXG4gICAgICAgIGNoYXJhY3RlcnM6IG5ldyBZLkxpc3QoKVxuICAgICAgICBjdXJzb3JzOiBuZXcgWS5PYmplY3QoKVxuICAgICAgQF9tb2RlbCA9IG5ldyBPcGVyYXRpb24uTWFwTWFuYWdlcihALCBudWxsLCB7fSwgY29udGVudF9vcGVyYXRpb25zICkuZXhlY3V0ZSgpXG5cbiAgICAgIEBfc2V0TW9kZWwgQF9tb2RlbFxuXG4gICAgICBpZiBAX2JpbmRfbGF0ZXI/XG4gICAgICAgIEVkaXRvciA9IEVkaXRvcnNbQF9iaW5kX2xhdGVyLm5hbWVdXG4gICAgICAgIGlmIEVkaXRvcj9cbiAgICAgICAgICBlZGl0b3IgPSBuZXcgRWRpdG9yIEBfYmluZF9sYXRlci5pbnN0YW5jZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyB0eXBlIG9mIGVkaXRvciBpcyBub3Qgc3VwcG9ydGVkISAoXCIrZWRpdG9yX25hbWUrXCIpIC0tIGZhdGFsIGVycm9yIVwiXG4gICAgICAgIEBwYXNzRGVsdGFzIG9wczogZWRpdG9yLmdldENvbnRlbnRzKClcbiAgICAgICAgQGJpbmQgZWRpdG9yXG4gICAgICAgIGRlbGV0ZSBAX2JpbmRfbGF0ZXJcblxuICAgICAgIyBsaXN0ZW4gdG8gZXZlbnRzIG9uIHRoZSBtb2RlbCB1c2luZyB0aGUgZnVuY3Rpb24gcHJvcGFnYXRlVG9FZGl0b3JcbiAgICAgIEBfbW9kZWwub2JzZXJ2ZSBAcHJvcGFnYXRlVG9FZGl0b3JcbiAgICAgIChAX29ic2VydmVXaGVuTW9kZWwgb3IgW10pLmZvckVhY2ggKG9ic2VydmVyKSAtPlxuICAgICAgICBAX21vZGVsLm9ic2VydmUgb2JzZXJ2ZXJcblxuICAgIEBfbW9kZWxcblxuICBfc2V0TW9kZWw6IChtb2RlbCkgLT5cbiAgICBzdXBlclxuICAgIChAX29ic2VydmVXaGVuTW9kZWwgb3IgW10pLmZvckVhY2ggKG9ic2VydmVyKSAtPlxuICAgICAgQF9tb2RlbC5vYnNlcnZlIG9ic2VydmVyXG5cbiAgX25hbWU6IFwiUmljaFRleHRcIlxuXG4gIGdldFRleHQ6ICgpLT5cbiAgICBAX21vZGVsLmdldENvbnRlbnQoJ2NoYXJhY3RlcnMnKS52YWwoKS5qb2luKCcnKVxuXG4gICMgaW5zZXJ0IG91ciBvd24gY3Vyc29yIGluIHRoZSBjdXJzb3JzIG9iamVjdFxuICAjIEBwYXJhbSBwb3NpdGlvbiBbSW50ZWdlcl0gdGhlIHBvc2l0aW9uIHdoZXJlIHRvIGluc2VydCBpdFxuICBzZXRDdXJzb3IgOiAocG9zaXRpb24pIC0+XG4gICAgQHNlbGZDdXJzb3IgPSBAX21vZGVsLmdldENvbnRlbnQoXCJjaGFyYWN0ZXJzXCIpLnJlZihwb3NpdGlvbilcbiAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLnZhbChAX21vZGVsLkhCLmdldFVzZXJJZCgpLCBAc2VsZkN1cnNvcilcblxuXG4gICMgcGFzcyBkZWx0YXMgdG8gdGhlIGNoYXJhY3RlciBpbnN0YW5jZVxuICAjIEBwYXJhbSBkZWx0YXMgW0FycmF5PE9iamVjdD5dIGFuIGFycmF5IG9mIGRlbHRhcyAoc2VlIG90LXR5cGVzIGZvciBtb3JlIGluZm8pXG4gIHBhc3NEZWx0YXMgOiAoZGVsdGFzKSA9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgcG9zaXRpb24gPSAwXG4gICAgZm9yIGRlbHRhIGluIGRlbHRhcy5vcHMgb3IgW11cbiAgICAgIHBvc2l0aW9uID0gZGVsdGFIZWxwZXIgQCwgZGVsdGEsIHBvc2l0aW9uXG5cbiAgIyBAb3ZlcnJpZGUgdXBkYXRlQ3Vyc29yUG9zaXRpb24oaW5kZXgpXG4gICMgICB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIG91ciBjdXJzb3IgdG8gdGhlIG5ldyBvbmUgdXNpbmcgYW4gaW5kZXhcbiAgIyAgIEBwYXJhbSBpbmRleCBbSW50ZWdlcl0gdGhlIG5ldyBpbmRleFxuICAjIEBvdmVycmlkZSB1cGRhdGVDdXJzb3JQb3NpdGlvbihjaGFyYWN0ZXIpXG4gICMgICB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIG91ciBjdXJzb3IgdG8gdGhlIG5ldyBvbmUgdXNpbmcgYSBjaGFyYWN0ZXJcbiAgIyAgIEBwYXJhbSBjaGFyYWN0ZXIgW0NoYXJhY3Rlcl0gdGhlIG5ldyBjaGFyYWN0ZXJcbiAgdXBkYXRlQ3Vyc29yUG9zaXRpb24gOiAob2JqKSA9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgaWYgdHlwZW9mIG9iaiBpcyBcIm51bWJlclwiXG4gICAgICBAc2VsZkN1cnNvciA9IEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmKG9iailcbiAgICBlbHNlXG4gICAgICBAc2VsZkN1cnNvciA9IG9ialxuICAgIEBfbW9kZWwuZ2V0Q29udGVudChcImN1cnNvcnNcIikudmFsKEBfbW9kZWwuSEIuZ2V0VXNlcklkKCksIEBzZWxmQ3Vyc29yKVxuXG4gICMgZGVzY3JpYmUgaG93IHRvIHByb3BhZ2F0ZSB5anMgZXZlbnRzIHRvIHRoZSBlZGl0b3JcbiAgIyBUT0RPOiBzaG91bGQgYmUgcHJpdmF0ZSFcbiAgYmluZEV2ZW50c1RvRWRpdG9yIDogKGVkaXRvcikgLT5cbiAgICAjIHVwZGF0ZSB0aGUgZWRpdG9yIHdoZW4gc29tZXRoaW5nIG9uIHRoZSAkY2hhcmFjdGVycyBoYXBwZW5zXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5vYnNlcnZlIChldmVudHMpID0+IEBsb2NrZXIudHJ5ICgpPT5cblxuXG4gICAgICAjIGNyZWF0ZSBhIGRlbHRhIG91dCBvZiB0aGUgZXZlbnRcbiAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgZGVsdGEgPSBuZXcgRGVsdGEoKVxuXG4gICAgICAgIGlmIGV2ZW50LnBvc2l0aW9uID4gMFxuICAgICAgICAgIGRlbHRhLnJldGFpbiBldmVudC5wb3NpdGlvblxuXG4gICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJpbnNlcnRcIlxuICAgICAgICAgIGRlbHRhLmluc2VydCBldmVudC52YWx1ZVxuXG4gICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgZGVsdGEuZGVsZXRlIDFcbiAgICAgICAgICAjIGRlbGV0ZSBjdXJzb3IsIGlmIGl0IHJlZmVyZW5jZXMgdG8gdGhpcyBwb3NpdGlvblxuICAgICAgICAgIGZvciBjdXJzb3JfbmFtZSwgY3Vyc29yX3JlZiBpbiBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLnZhbCgpXG4gICAgICAgICAgICBpZiBjdXJzb3JfcmVmIGlzIGV2ZW50LnJlZmVyZW5jZVxuICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICMgd2UgaGF2ZSB0byBkZWxldGUgdGhlIGN1cnNvciBpZiB0aGUgcmVmZXJlbmNlIGRvZXMgbm90IGV4aXN0IGFueW1vcmVcbiAgICAgICAgICAgICAgIyB0aGUgZG93bnNpZGUgb2YgdGhpcyBhcHByb2FjaCBpcyB0aGF0IGV2ZXJ5b25lIHdpbGwgc2VuZCB0aGlzIGRlbGV0ZSBldmVudCFcbiAgICAgICAgICAgICAgIyBpbiB0aGUgZnV0dXJlLCB3ZSBjb3VsZCByZXBsYWNlIHRoZSBjdXJzb3JzLCB3aXRoIGEgeS1zZWxlY3Rpb25zXG4gICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCktPlxuICAgICAgICAgICAgICAgICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS5kZWxldGUoY3Vyc29yX25hbWUpXG4gICAgICAgICAgICAgICAgLCAwKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgXG4gICAgICAgIEBwZW5kaW5nRGVsdGEgPSBAcGVuZGluZ0RlbHRhLmNvbXBvc2UgZGVsdGFcbiAgICAgICAgQGFwcGx5VXBkYXRlQ29udGVudHMoKVxuXG5cbiAgICAjIHVwZGF0ZSB0aGUgZWRpdG9yIHdoZW4gc29tZXRoaW5nIG9uIHRoZSAkc2VsZWN0aW9ucyBoYXBwZW5zXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKS5vYnNlcnZlIChldmVudCk9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICBhdHRycyA9IHt9XG4gICAgICBpZiBldmVudC50eXBlIGlzIFwic2VsZWN0XCJcbiAgICAgICAgZm9yIGF0dHIsdmFsIG9mIGV2ZW50LmF0dHJzXG4gICAgICAgICAgYXR0cnNbYXR0cl0gPSB2YWxcbiAgICAgIGVsc2UgIyBpcyBcInVuc2VsZWN0XCIhXG4gICAgICAgIGZvciBhdHRyIGluIGV2ZW50LmF0dHJzXG4gICAgICAgICAgYXR0cnNbYXR0cl0gPSBudWxsXG4gICAgICByZXRhaW4gPSBldmVudC5mcm9tLmdldFBvc2l0aW9uKClcbiAgICAgIHNlbGVjdGlvbl9sZW5ndGggPSBldmVudC50by5nZXRQb3NpdGlvbigpLWV2ZW50LmZyb20uZ2V0UG9zaXRpb24oKSsxXG4gICAgICBAZWRpdG9yLnVwZGF0ZUNvbnRlbnRzIChuZXcgRGVsdGEoXG4gICAgICAgIG9wczogW1xuICAgICAgICAgIHtyZXRhaW46IHJldGFpbn0sXG4gICAgICAgICAge3JldGFpbjogc2VsZWN0aW9uX2xlbmd0aCwgYXR0cmlidXRlczogYXR0cnN9XG4gICAgICAgIF0pKVxuXG4gICAgIyB1cGRhdGUgdGhlIGVkaXRvciB3aGVuIHRoZSBjdXJzb3IgaXMgbW92ZWRcbiAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLm9ic2VydmUgKGV2ZW50cyk9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIiBvciBldmVudC50eXBlIGlzIFwiYWRkXCJcbiAgICAgICAgICBhdXRob3IgPSBldmVudC5jaGFuZ2VkQnlcbiAgICAgICAgICByZWZfdG9fY2hhciA9IGV2ZW50Lm9iamVjdC52YWwoYXV0aG9yKVxuICAgICAgICAgIGlmIHJlZl90b19jaGFyIGlzIG51bGxcbiAgICAgICAgICAgIHBvc2l0aW9uID0gQGVkaXRvci5nZXRMZW5ndGgoKVxuICAgICAgICAgIGVsc2UgaWYgcmVmX3RvX2NoYXI/XG4gICAgICAgICAgICBpZiByZWZfdG9fY2hhci5pc0RlbGV0ZWQoKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcG9zaXRpb24gPSByZWZfdG9fY2hhci5nZXRQb3NpdGlvbigpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuIFwicmVmX3RvX2NoYXIgaXMgdW5kZWZpbmVkXCJcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgcGFyYW1zID1cbiAgICAgICAgICAgIGlkOiBhdXRob3JcbiAgICAgICAgICAgIGluZGV4OiBwb3NpdGlvblxuICAgICAgICAgICAgdGV4dDogQF9wcm92aWRlcnM/Lm5hbWVQcm92aWRlcj8oYXV0aG9yKSBvciBcIkRlZmF1bHQgdXNlclwiXG4gICAgICAgICAgICBjb2xvcjogQF9wcm92aWRlcnM/LmNvbG9yUHJvdmlkZXI/KGF1dGhvcikgb3IgXCJncmV5XCJcblxuICAgICAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yIHBhcmFtc1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZWRpdG9yLnJlbW92ZUN1cnNvciBldmVudC5uYW1lXG5cbiAgICBAX21vZGVsLmNvbm5lY3Rvci5vblVzZXJFdmVudCAoZXZlbnQpPT5cbiAgICAgIGlmIGV2ZW50LmFjdGlvbiBpcyBcInVzZXJMZWZ0XCJcbiAgICAgICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS5kZWxldGUoZXZlbnQudXNlcilcblxuICAjIEFwcGx5IGEgZGVsdGEgYW5kIHJldHVybiB0aGUgbmV3IHBvc2l0aW9uXG4gICMgQHBhcmFtIGRlbHRhIFtPYmplY3RdIGEgKnNpbmdsZSogZGVsdGEgKHNlZSBvdC10eXBlcyBmb3IgbW9yZSBpbmZvKVxuICAjIEBwYXJhbSBwb3NpdGlvbiBbSW50ZWdlcl0gc3RhcnQgcG9zaXRpb24gZm9yIHRoZSBkZWx0YSwgZGVmYXVsdDogMFxuICAjXG4gICMgQHJldHVybiBbSW50ZWdlcl0gdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJzb3IgYWZ0ZXIgcGFyc2luZyB0aGUgZGVsdGFcbiAgZGVsdGFIZWxwZXIgPSAodGhpc09iaiwgZGVsdGEsIHBvc2l0aW9uID0gMCkgLT5cbiAgICBpZiBkZWx0YT9cbiAgICAgIHNlbGVjdGlvbnMgPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKVxuICAgICAgZGVsdGFfdW5zZWxlY3Rpb25zID0gW11cbiAgICAgIGRlbHRhX3NlbGVjdGlvbnMgPSB7fVxuICAgICAgZm9yIG4sdiBvZiBkZWx0YS5hdHRyaWJ1dGVzXG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgZGVsdGFfc2VsZWN0aW9uc1tuXSA9IHZcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlbHRhX3Vuc2VsZWN0aW9ucy5wdXNoIG5cblxuICAgICAgaWYgZGVsdGEuaW5zZXJ0P1xuICAgICAgICBpbnNlcnRfY29udGVudCA9IGRlbHRhLmluc2VydFxuICAgICAgICBjb250ZW50X2FycmF5ID1cbiAgICAgICAgICBpZiB0eXBlb2YgaW5zZXJ0X2NvbnRlbnQgaXMgXCJzdHJpbmdcIlxuICAgICAgICAgICAgaW5zZXJ0X2NvbnRlbnQuc3BsaXQoXCJcIilcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBpbnNlcnRfY29udGVudCBpcyBcIm51bWJlclwiXG4gICAgICAgICAgICBbaW5zZXJ0X2NvbnRlbnRdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiR290IGFuIHVuZXhwZWN0ZWQgdmFsdWUgaW4gZGVsdGEuaW5zZXJ0ISAoXCIgK1xuICAgICAgICAgICAgKHR5cGVvZiBjb250ZW50KSArIFwiKVwiXG4gICAgICAgIGluc2VydEhlbHBlciB0aGlzT2JqLCBwb3NpdGlvbiwgY29udGVudF9hcnJheVxuICAgICAgICBmcm9tUG9zaXRpb24gPSBmcm9tXG4gICAgICAgIHRvUG9zaXRpb24gPSBwb3NpdGlvbitjb250ZW50X2FycmF5Lmxlbmd0aC0xXG4gICAgICAgIGZyb20gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYgcG9zaXRpb25cbiAgICAgICAgdG8gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYoXG4gICAgICAgICAgcG9zaXRpb24rY29udGVudF9hcnJheS5sZW5ndGgtMSlcbiAgICAgICAgIyBpbXBvcnRhbnQsIGZpcnN0IHVuc2VsZWN0LCB0aGVuIHNlbGVjdCFcbiAgICAgICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcInNlbGVjdGlvbnNcIikudW5zZWxlY3QoXG4gICAgICAgICAgZnJvbSwgdG8sIGRlbHRhX3Vuc2VsZWN0aW9ucylcbiAgICAgICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcInNlbGVjdGlvbnNcIikuc2VsZWN0KFxuICAgICAgICAgIGZyb20sIHRvLCBkZWx0YV9zZWxlY3Rpb25zLCB0cnVlKVxuXG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uICsgY29udGVudF9hcnJheS5sZW5ndGhcblxuICAgICAgZWxzZSBpZiBkZWx0YS5kZWxldGU/XG4gICAgICAgIGRlbGV0ZUhlbHBlciB0aGlzT2JqLCBwb3NpdGlvbiwgZGVsdGEuZGVsZXRlXG4gICAgICAgIHJldHVybiBwb3NpdGlvblxuXG4gICAgICBlbHNlIGlmIGRlbHRhLnJldGFpbj9cbiAgICAgICAgcmV0YWluID0gcGFyc2VJbnQgZGVsdGEucmV0YWluXG4gICAgICAgIGZyb20gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYocG9zaXRpb24pXG4gICAgICAgICMgd2Ugc2V0IGBwb3NpdGlvbityZXRhaW4tMWAsIC0xIGJlY2F1c2Ugd2hlbiBzZWxlY3Rpbmcgb25lIGNoYXIsXG4gICAgICAgICMgWS1zZWxlY3Rpb25zIHdpbGwgb25seSBtYXJrIHRoaXMgb25lIGNoYXIgKGFzIGJlZ2lubmluZyBhbmQgZW5kKVxuICAgICAgICB0byA9IHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJjaGFyYWN0ZXJzXCIpLnJlZihwb3NpdGlvbiArIHJldGFpbiAtIDEpXG4gICAgICAgICMgaW1wb3J0YW50LCBmaXJzdCB1bnNlbGVjdCwgdGhlbiBzZWxlY3QhXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnVuc2VsZWN0KFxuICAgICAgICAgIGZyb20sIHRvLCBkZWx0YV91bnNlbGVjdGlvbnMpXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnNlbGVjdChcbiAgICAgICAgICBmcm9tLCB0bywgZGVsdGFfc2VsZWN0aW9ucylcblxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbiArIHJldGFpblxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBwYXJ0IG9mIGNvZGUgbXVzdCBub3QgYmUgcmVhY2hlZCFcIlxuXG4gIGluc2VydEhlbHBlciA9ICh0aGlzT2JqLCBwb3NpdGlvbiwgY29udGVudF9hcnJheSkgLT5cbiAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5pbnNlcnRDb250ZW50cyBwb3NpdGlvbiwgY29udGVudF9hcnJheVxuXG4gIGRlbGV0ZUhlbHBlciA9ICh0aGlzT2JqLCBwb3NpdGlvbiwgbGVuZ3RoID0gMSkgLT5cbiAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5kZWxldGUgcG9zaXRpb24sIGxlbmd0aFxuXG5pZiB3aW5kb3c/XG4gIGlmIHdpbmRvdy5ZP1xuICAgIHdpbmRvdy5ZLlJpY2hUZXh0ID0gWVJpY2hUZXh0XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVJpY2hUZXh0XG4iLCJ2YXIgZGlmZiA9IHJlcXVpcmUoJ2Zhc3QtZGlmZicpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xudmFyIG9wID0gcmVxdWlyZSgnLi9vcCcpO1xuXG5cbnZhciBOVUxMX0NIQVJBQ1RFUiA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMCk7ICAvLyBQbGFjZWhvbGRlciBjaGFyIGZvciBlbWJlZCBpbiBkaWZmKClcblxuXG52YXIgRGVsdGEgPSBmdW5jdGlvbiAob3BzKSB7XG4gIC8vIEFzc3VtZSB3ZSBhcmUgZ2l2ZW4gYSB3ZWxsIGZvcm1lZCBvcHNcbiAgaWYgKGlzLmFycmF5KG9wcykpIHtcbiAgICB0aGlzLm9wcyA9IG9wcztcbiAgfSBlbHNlIGlmIChpcy5vYmplY3Qob3BzKSAmJiBpcy5hcnJheShvcHMub3BzKSkge1xuICAgIHRoaXMub3BzID0gb3BzLm9wcztcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm9wcyA9IFtdO1xuICB9XG59O1xuXG5cbkRlbHRhLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbiAodGV4dCwgYXR0cmlidXRlcykge1xuICB2YXIgbmV3T3AgPSB7fTtcbiAgaWYgKHRleHQubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcztcbiAgbmV3T3AuaW5zZXJ0ID0gdGV4dDtcbiAgaWYgKGlzLm9iamVjdChhdHRyaWJ1dGVzKSAmJiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5sZW5ndGggPiAwKSBuZXdPcC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgcmV0dXJuIHRoaXMucHVzaChuZXdPcCk7XG59O1xuXG5EZWx0YS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICBpZiAobGVuZ3RoIDw9IDApIHJldHVybiB0aGlzO1xuICByZXR1cm4gdGhpcy5wdXNoKHsgJ2RlbGV0ZSc6IGxlbmd0aCB9KTtcbn07XG5cbkRlbHRhLnByb3RvdHlwZS5yZXRhaW4gPSBmdW5jdGlvbiAobGVuZ3RoLCBhdHRyaWJ1dGVzKSB7XG4gIGlmIChsZW5ndGggPD0gMCkgcmV0dXJuIHRoaXM7XG4gIHZhciBuZXdPcCA9IHsgcmV0YWluOiBsZW5ndGggfTtcbiAgaWYgKGlzLm9iamVjdChhdHRyaWJ1dGVzKSAmJiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5sZW5ndGggPiAwKSBuZXdPcC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgcmV0dXJuIHRoaXMucHVzaChuZXdPcCk7XG59O1xuXG5EZWx0YS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChuZXdPcCkge1xuICB2YXIgaW5kZXggPSB0aGlzLm9wcy5sZW5ndGg7XG4gIHZhciBsYXN0T3AgPSB0aGlzLm9wc1tpbmRleCAtIDFdO1xuICBuZXdPcCA9IG9wLmNsb25lKG5ld09wKTtcbiAgaWYgKGlzLm9iamVjdChsYXN0T3ApKSB7XG4gICAgaWYgKGlzLm51bWJlcihuZXdPcFsnZGVsZXRlJ10pICYmIGlzLm51bWJlcihsYXN0T3BbJ2RlbGV0ZSddKSkge1xuICAgICAgdGhpcy5vcHNbaW5kZXggLSAxXSA9IHsgJ2RlbGV0ZSc6IGxhc3RPcFsnZGVsZXRlJ10gKyBuZXdPcFsnZGVsZXRlJ10gfTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvLyBTaW5jZSBpdCBkb2VzIG5vdCBtYXR0ZXIgaWYgd2UgaW5zZXJ0IGJlZm9yZSBvciBhZnRlciBkZWxldGluZyBhdCB0aGUgc2FtZSBpbmRleCxcbiAgICAvLyBhbHdheXMgcHJlZmVyIHRvIGluc2VydCBmaXJzdFxuICAgIGlmIChpcy5udW1iZXIobGFzdE9wWydkZWxldGUnXSkgJiYgbmV3T3AuaW5zZXJ0ICE9IG51bGwpIHtcbiAgICAgIGluZGV4IC09IDE7XG4gICAgICBsYXN0T3AgPSB0aGlzLm9wc1tpbmRleCAtIDFdO1xuICAgICAgaWYgKCFpcy5vYmplY3QobGFzdE9wKSkge1xuICAgICAgICB0aGlzLm9wcy51bnNoaWZ0KG5ld09wKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5lcXVhbChuZXdPcC5hdHRyaWJ1dGVzLCBsYXN0T3AuYXR0cmlidXRlcykpIHtcbiAgICAgIGlmIChpcy5zdHJpbmcobmV3T3AuaW5zZXJ0KSAmJiBpcy5zdHJpbmcobGFzdE9wLmluc2VydCkpIHtcbiAgICAgICAgdGhpcy5vcHNbaW5kZXggLSAxXSA9IHsgaW5zZXJ0OiBsYXN0T3AuaW5zZXJ0ICsgbmV3T3AuaW5zZXJ0IH07XG4gICAgICAgIGlmIChpcy5vYmplY3QobmV3T3AuYXR0cmlidXRlcykpIHRoaXMub3BzW2luZGV4IC0gMV0uYXR0cmlidXRlcyA9IG5ld09wLmF0dHJpYnV0ZXNcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGVsc2UgaWYgKGlzLm51bWJlcihuZXdPcC5yZXRhaW4pICYmIGlzLm51bWJlcihsYXN0T3AucmV0YWluKSkge1xuICAgICAgICB0aGlzLm9wc1tpbmRleCAtIDFdID0geyByZXRhaW46IGxhc3RPcC5yZXRhaW4gKyBuZXdPcC5yZXRhaW4gfTtcbiAgICAgICAgaWYgKGlzLm9iamVjdChuZXdPcC5hdHRyaWJ1dGVzKSkgdGhpcy5vcHNbaW5kZXggLSAxXS5hdHRyaWJ1dGVzID0gbmV3T3AuYXR0cmlidXRlc1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGluZGV4ID09PSB0aGlzLm9wcy5sZW5ndGgpIHtcbiAgICB0aGlzLm9wcy5wdXNoKG5ld09wKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm9wcy5zcGxpY2UoaW5kZXgsIDAsIG5ld09wKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbkRlbHRhLnByb3RvdHlwZS5jaG9wID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGFzdE9wID0gdGhpcy5vcHNbdGhpcy5vcHMubGVuZ3RoIC0gMV07XG4gIGlmIChsYXN0T3AgJiYgbGFzdE9wLnJldGFpbiAmJiAhbGFzdE9wLmF0dHJpYnV0ZXMpIHtcbiAgICB0aGlzLm9wcy5wb3AoKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbkRlbHRhLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm9wcy5yZWR1Y2UoZnVuY3Rpb24gKGxlbmd0aCwgZWxlbSkge1xuICAgIHJldHVybiBsZW5ndGggKyBvcC5sZW5ndGgoZWxlbSk7XG4gIH0sIDApO1xufTtcblxuRGVsdGEucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgc3RhcnQgPSBzdGFydCB8fCAwO1xuICBpZiAoIWlzLm51bWJlcihlbmQpKSBlbmQgPSBJbmZpbml0eTtcbiAgdmFyIGRlbHRhID0gbmV3IERlbHRhKCk7XG4gIHZhciBpdGVyID0gb3AuaXRlcmF0b3IodGhpcy5vcHMpO1xuICB2YXIgaW5kZXggPSAwO1xuICB3aGlsZSAoaW5kZXggPCBlbmQgJiYgaXRlci5oYXNOZXh0KCkpIHtcbiAgICB2YXIgbmV4dE9wO1xuICAgIGlmIChpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBuZXh0T3AgPSBpdGVyLm5leHQoc3RhcnQgLSBpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRPcCA9IGl0ZXIubmV4dChlbmQgLSBpbmRleCk7XG4gICAgICBkZWx0YS5wdXNoKG5leHRPcCk7XG4gICAgfVxuICAgIGluZGV4ICs9IG9wLmxlbmd0aChuZXh0T3ApO1xuICB9XG4gIHJldHVybiBkZWx0YTtcbn07XG5cblxuRGVsdGEucHJvdG90eXBlLmNvbXBvc2UgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgdmFyIHRoaXNJdGVyID0gb3AuaXRlcmF0b3IodGhpcy5vcHMpO1xuICB2YXIgb3RoZXJJdGVyID0gb3AuaXRlcmF0b3Iob3RoZXIub3BzKTtcbiAgdmFyIGRlbHRhID0gbmV3IERlbHRhKCk7XG4gIHdoaWxlICh0aGlzSXRlci5oYXNOZXh0KCkgfHwgb3RoZXJJdGVyLmhhc05leHQoKSkge1xuICAgIGlmIChvdGhlckl0ZXIucGVla1R5cGUoKSA9PT0gJ2luc2VydCcpIHtcbiAgICAgIGRlbHRhLnB1c2gob3RoZXJJdGVyLm5leHQoKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzSXRlci5wZWVrVHlwZSgpID09PSAnZGVsZXRlJykge1xuICAgICAgZGVsdGEucHVzaCh0aGlzSXRlci5uZXh0KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGVuZ3RoID0gTWF0aC5taW4odGhpc0l0ZXIucGVla0xlbmd0aCgpLCBvdGhlckl0ZXIucGVla0xlbmd0aCgpKTtcbiAgICAgIHZhciB0aGlzT3AgPSB0aGlzSXRlci5uZXh0KGxlbmd0aCk7XG4gICAgICB2YXIgb3RoZXJPcCA9IG90aGVySXRlci5uZXh0KGxlbmd0aCk7XG4gICAgICBpZiAoaXMubnVtYmVyKG90aGVyT3AucmV0YWluKSkge1xuICAgICAgICB2YXIgbmV3T3AgPSB7fTtcbiAgICAgICAgaWYgKGlzLm51bWJlcih0aGlzT3AucmV0YWluKSkge1xuICAgICAgICAgIG5ld09wLnJldGFpbiA9IGxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdPcC5pbnNlcnQgPSB0aGlzT3AuaW5zZXJ0O1xuICAgICAgICB9XG4gICAgICAgIC8vIFByZXNlcnZlIG51bGwgd2hlbiBjb21wb3Npbmcgd2l0aCBhIHJldGFpbiwgb3RoZXJ3aXNlIHJlbW92ZSBpdCBmb3IgaW5zZXJ0c1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IG9wLmF0dHJpYnV0ZXMuY29tcG9zZSh0aGlzT3AuYXR0cmlidXRlcywgb3RoZXJPcC5hdHRyaWJ1dGVzLCBpcy5udW1iZXIodGhpc09wLnJldGFpbikpO1xuICAgICAgICBpZiAoYXR0cmlidXRlcykgbmV3T3AuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIGRlbHRhLnB1c2gobmV3T3ApO1xuICAgICAgLy8gT3RoZXIgb3Agc2hvdWxkIGJlIGRlbGV0ZSwgd2UgY291bGQgYmUgYW4gaW5zZXJ0IG9yIHJldGFpblxuICAgICAgLy8gSW5zZXJ0ICsgZGVsZXRlIGNhbmNlbHMgb3V0XG4gICAgICB9IGVsc2UgaWYgKGlzLm51bWJlcihvdGhlck9wWydkZWxldGUnXSkgJiYgaXMubnVtYmVyKHRoaXNPcC5yZXRhaW4pKSB7XG4gICAgICAgIGRlbHRhLnB1c2gob3RoZXJPcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWx0YS5jaG9wKCk7XG59O1xuXG5EZWx0YS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICB2YXIgZGVsdGEgPSBuZXcgRGVsdGEoKTtcbiAgaWYgKHRoaXMub3BzID09PSBvdGhlci5vcHMpIHtcbiAgICByZXR1cm4gZGVsdGE7XG4gIH1cbiAgdmFyIHN0cmluZ3MgPSBbdGhpcy5vcHMsIG90aGVyLm9wc10ubWFwKGZ1bmN0aW9uIChvcHMpIHtcbiAgICByZXR1cm4gb3BzLm1hcChmdW5jdGlvbiAob3ApIHtcbiAgICAgIGlmIChvcC5pbnNlcnQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gaXMuc3RyaW5nKG9wLmluc2VydCkgPyBvcC5pbnNlcnQgOiBOVUxMX0NIQVJBQ1RFUjtcbiAgICAgIH1cbiAgICAgIHZhciBwcmVwID0gKG9wcyA9PT0gb3RoZXIub3BzKSA/ICdvbicgOiAnd2l0aCc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpZmYoKSBjYWxsZWQgJyArIHByZXAgKyAnIG5vbi1kb2N1bWVudCcpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9KTtcbiAgdmFyIGRpZmZSZXN1bHQgPSBkaWZmKHN0cmluZ3NbMF0sIHN0cmluZ3NbMV0pO1xuICB2YXIgdGhpc0l0ZXIgPSBvcC5pdGVyYXRvcih0aGlzLm9wcyk7XG4gIHZhciBvdGhlckl0ZXIgPSBvcC5pdGVyYXRvcihvdGhlci5vcHMpO1xuICBkaWZmUmVzdWx0LmZvckVhY2goZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIHZhciBsZW5ndGggPSBjb21wb25lbnRbMV0ubGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGggPiAwKSB7XG4gICAgICB2YXIgb3BMZW5ndGggPSAwO1xuICAgICAgc3dpdGNoIChjb21wb25lbnRbMF0pIHtcbiAgICAgICAgY2FzZSBkaWZmLklOU0VSVDpcbiAgICAgICAgICBvcExlbmd0aCA9IE1hdGgubWluKG90aGVySXRlci5wZWVrTGVuZ3RoKCksIGxlbmd0aCk7XG4gICAgICAgICAgZGVsdGEucHVzaChvdGhlckl0ZXIubmV4dChvcExlbmd0aCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGRpZmYuREVMRVRFOlxuICAgICAgICAgIG9wTGVuZ3RoID0gTWF0aC5taW4obGVuZ3RoLCB0aGlzSXRlci5wZWVrTGVuZ3RoKCkpO1xuICAgICAgICAgIHRoaXNJdGVyLm5leHQob3BMZW5ndGgpO1xuICAgICAgICAgIGRlbHRhWydkZWxldGUnXShvcExlbmd0aCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgZGlmZi5FUVVBTDpcbiAgICAgICAgICBvcExlbmd0aCA9IE1hdGgubWluKHRoaXNJdGVyLnBlZWtMZW5ndGgoKSwgb3RoZXJJdGVyLnBlZWtMZW5ndGgoKSwgbGVuZ3RoKTtcbiAgICAgICAgICB2YXIgdGhpc09wID0gdGhpc0l0ZXIubmV4dChvcExlbmd0aCk7XG4gICAgICAgICAgdmFyIG90aGVyT3AgPSBvdGhlckl0ZXIubmV4dChvcExlbmd0aCk7XG4gICAgICAgICAgaWYgKGlzLmVxdWFsKHRoaXNPcC5pbnNlcnQsIG90aGVyT3AuaW5zZXJ0KSkge1xuICAgICAgICAgICAgZGVsdGEucmV0YWluKG9wTGVuZ3RoLCBvcC5hdHRyaWJ1dGVzLmRpZmYodGhpc09wLmF0dHJpYnV0ZXMsIG90aGVyT3AuYXR0cmlidXRlcykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWx0YS5wdXNoKG90aGVyT3ApWydkZWxldGUnXShvcExlbmd0aCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbGVuZ3RoIC09IG9wTGVuZ3RoO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBkZWx0YS5jaG9wKCk7XG59O1xuXG5EZWx0YS5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKG90aGVyLCBwcmlvcml0eSkge1xuICBwcmlvcml0eSA9ICEhcHJpb3JpdHk7XG4gIGlmIChpcy5udW1iZXIob3RoZXIpKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtUG9zaXRpb24ob3RoZXIsIHByaW9yaXR5KTtcbiAgfVxuICB2YXIgdGhpc0l0ZXIgPSBvcC5pdGVyYXRvcih0aGlzLm9wcyk7XG4gIHZhciBvdGhlckl0ZXIgPSBvcC5pdGVyYXRvcihvdGhlci5vcHMpO1xuICB2YXIgZGVsdGEgPSBuZXcgRGVsdGEoKTtcbiAgd2hpbGUgKHRoaXNJdGVyLmhhc05leHQoKSB8fCBvdGhlckl0ZXIuaGFzTmV4dCgpKSB7XG4gICAgaWYgKHRoaXNJdGVyLnBlZWtUeXBlKCkgPT09ICdpbnNlcnQnICYmIChwcmlvcml0eSB8fCBvdGhlckl0ZXIucGVla1R5cGUoKSAhPT0gJ2luc2VydCcpKSB7XG4gICAgICBkZWx0YS5yZXRhaW4ob3AubGVuZ3RoKHRoaXNJdGVyLm5leHQoKSkpO1xuICAgIH0gZWxzZSBpZiAob3RoZXJJdGVyLnBlZWtUeXBlKCkgPT09ICdpbnNlcnQnKSB7XG4gICAgICBkZWx0YS5wdXNoKG90aGVySXRlci5uZXh0KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGVuZ3RoID0gTWF0aC5taW4odGhpc0l0ZXIucGVla0xlbmd0aCgpLCBvdGhlckl0ZXIucGVla0xlbmd0aCgpKTtcbiAgICAgIHZhciB0aGlzT3AgPSB0aGlzSXRlci5uZXh0KGxlbmd0aCk7XG4gICAgICB2YXIgb3RoZXJPcCA9IG90aGVySXRlci5uZXh0KGxlbmd0aCk7XG4gICAgICBpZiAodGhpc09wWydkZWxldGUnXSkge1xuICAgICAgICAvLyBPdXIgZGVsZXRlIGVpdGhlciBtYWtlcyB0aGVpciBkZWxldGUgcmVkdW5kYW50IG9yIHJlbW92ZXMgdGhlaXIgcmV0YWluXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChvdGhlck9wWydkZWxldGUnXSkge1xuICAgICAgICBkZWx0YS5wdXNoKG90aGVyT3ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgcmV0YWluIGVpdGhlciB0aGVpciByZXRhaW4gb3IgaW5zZXJ0XG4gICAgICAgIGRlbHRhLnJldGFpbihsZW5ndGgsIG9wLmF0dHJpYnV0ZXMudHJhbnNmb3JtKHRoaXNPcC5hdHRyaWJ1dGVzLCBvdGhlck9wLmF0dHJpYnV0ZXMsIHByaW9yaXR5KSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWx0YS5jaG9wKCk7XG59O1xuXG5EZWx0YS5wcm90b3R5cGUudHJhbnNmb3JtUG9zaXRpb24gPSBmdW5jdGlvbiAoaW5kZXgsIHByaW9yaXR5KSB7XG4gIHByaW9yaXR5ID0gISFwcmlvcml0eTtcbiAgdmFyIHRoaXNJdGVyID0gb3AuaXRlcmF0b3IodGhpcy5vcHMpO1xuICB2YXIgb2Zmc2V0ID0gMDtcbiAgd2hpbGUgKHRoaXNJdGVyLmhhc05leHQoKSAmJiBvZmZzZXQgPD0gaW5kZXgpIHtcbiAgICB2YXIgbGVuZ3RoID0gdGhpc0l0ZXIucGVla0xlbmd0aCgpO1xuICAgIHZhciBuZXh0VHlwZSA9IHRoaXNJdGVyLnBlZWtUeXBlKCk7XG4gICAgdGhpc0l0ZXIubmV4dCgpO1xuICAgIGlmIChuZXh0VHlwZSA9PT0gJ2RlbGV0ZScpIHtcbiAgICAgIGluZGV4IC09IE1hdGgubWluKGxlbmd0aCwgaW5kZXggLSBvZmZzZXQpO1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIGlmIChuZXh0VHlwZSA9PT0gJ2luc2VydCcgJiYgKG9mZnNldCA8IGluZGV4IHx8ICFwcmlvcml0eSkpIHtcbiAgICAgIGluZGV4ICs9IGxlbmd0aDtcbiAgICB9XG4gICAgb2Zmc2V0ICs9IGxlbmd0aDtcbiAgfVxuICByZXR1cm4gaW5kZXg7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGVsdGE7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXF1YWw6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHJldHVybiB0cnVlO1xuICAgIGlmIChhID09IG51bGwgJiYgYiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghdGhpcy5vYmplY3QoYSkgfHwgIXRoaXMub2JqZWN0KGIpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKE9iamVjdC5rZXlzKGEpLmxlbmd0aCAhPSBPYmplY3Qua2V5cyhiKS5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IodmFyIGtleSBpbiBhKSB7XG4gICAgICAvLyBPbmx5IGNvbXBhcmUgb25lIGxldmVsIGRlZXBcbiAgICAgIGlmIChhW2tleV0gIT09IGJba2V5XSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBhcnJheTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpO1xuICB9LFxuXG4gIG51bWJlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE51bWJlcl0nKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgb2JqZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jyk7XG4gIH0sXG5cbiAgc3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgU3RyaW5nXScpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcbiIsInZhciBpcyA9IHJlcXVpcmUoJy4vaXMnKTtcblxuXG52YXIgbGliID0ge1xuICBhdHRyaWJ1dGVzOiB7XG4gICAgY2xvbmU6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBrZWVwTnVsbCkge1xuICAgICAgaWYgKCFpcy5vYmplY3QoYXR0cmlidXRlcykpIHJldHVybiB7fTtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5yZWR1Y2UoZnVuY3Rpb24gKG1lbW8sIGtleSkge1xuICAgICAgICBpZiAoYXR0cmlidXRlc1trZXldICE9PSB1bmRlZmluZWQgJiYgKGF0dHJpYnV0ZXNba2V5XSAhPT0gbnVsbCB8fCBrZWVwTnVsbCkpIHtcbiAgICAgICAgICBtZW1vW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICB9LCB7fSk7XG4gICAgfSxcblxuICAgIGNvbXBvc2U6IGZ1bmN0aW9uIChhLCBiLCBrZWVwTnVsbCkge1xuICAgICAgaWYgKCFpcy5vYmplY3QoYSkpIGEgPSB7fTtcbiAgICAgIGlmICghaXMub2JqZWN0KGIpKSBiID0ge307XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuY2xvbmUoYiwga2VlcE51bGwpO1xuICAgICAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICAgICAgaWYgKGFba2V5XSAhPT0gdW5kZWZpbmVkICYmIGJba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXR0cmlidXRlc1trZXldID0gYVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoYXR0cmlidXRlcykubGVuZ3RoID4gMCA/IGF0dHJpYnV0ZXMgOiB1bmRlZmluZWQ7XG4gICAgfSxcblxuICAgIGRpZmY6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIGlmICghaXMub2JqZWN0KGEpKSBhID0ge307XG4gICAgICBpZiAoIWlzLm9iamVjdChiKSkgYiA9IHt9O1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBPYmplY3Qua2V5cyhhKS5jb25jYXQoT2JqZWN0LmtleXMoYikpLnJlZHVjZShmdW5jdGlvbiAoYXR0cmlidXRlcywga2V5KSB7XG4gICAgICAgIGlmIChhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IGJba2V5XSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGJba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcbiAgICAgIH0sIHt9KTtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5sZW5ndGggPiAwID8gYXR0cmlidXRlcyA6IHVuZGVmaW5lZDtcbiAgICB9LFxuXG4gICAgdHJhbnNmb3JtOiBmdW5jdGlvbiAoYSwgYiwgcHJpb3JpdHkpIHtcbiAgICAgIGlmICghaXMub2JqZWN0KGEpKSByZXR1cm4gYjtcbiAgICAgIGlmICghaXMub2JqZWN0KGIpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgaWYgKCFwcmlvcml0eSkgcmV0dXJuIGI7ICAvLyBiIHNpbXBseSBvdmVyd3JpdGVzIHVzIHdpdGhvdXQgcHJpb3JpdHlcbiAgICAgIHZhciBhdHRyaWJ1dGVzID0gT2JqZWN0LmtleXMoYikucmVkdWNlKGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBrZXkpIHtcbiAgICAgICAgaWYgKGFba2V5XSA9PT0gdW5kZWZpbmVkKSBhdHRyaWJ1dGVzW2tleV0gPSBiW2tleV07ICAvLyBudWxsIGlzIGEgdmFsaWQgdmFsdWVcbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgICB9LCB7fSk7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoYXR0cmlidXRlcykubGVuZ3RoID4gMCA/IGF0dHJpYnV0ZXMgOiB1bmRlZmluZWQ7XG4gICAgfVxuICB9LFxuXG4gIGNsb25lOiBmdW5jdGlvbiAob3ApIHtcbiAgICB2YXIgbmV3T3AgPSB0aGlzLmF0dHJpYnV0ZXMuY2xvbmUob3ApO1xuICAgIGlmIChpcy5vYmplY3QobmV3T3AuYXR0cmlidXRlcykpIHtcbiAgICAgIG5ld09wLmF0dHJpYnV0ZXMgPSB0aGlzLmF0dHJpYnV0ZXMuY2xvbmUobmV3T3AuYXR0cmlidXRlcywgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdPcDtcbiAgfSxcblxuICBpdGVyYXRvcjogZnVuY3Rpb24gKG9wcykge1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3Iob3BzKTtcbiAgfSxcblxuICBsZW5ndGg6IGZ1bmN0aW9uIChvcCkge1xuICAgIGlmIChpcy5udW1iZXIob3BbJ2RlbGV0ZSddKSkge1xuICAgICAgcmV0dXJuIG9wWydkZWxldGUnXTtcbiAgICB9IGVsc2UgaWYgKGlzLm51bWJlcihvcC5yZXRhaW4pKSB7XG4gICAgICByZXR1cm4gb3AucmV0YWluO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaXMuc3RyaW5nKG9wLmluc2VydCkgPyBvcC5pbnNlcnQubGVuZ3RoIDogMTtcbiAgICB9XG4gIH1cbn07XG5cblxuZnVuY3Rpb24gSXRlcmF0b3Iob3BzKSB7XG4gIHRoaXMub3BzID0gb3BzO1xuICB0aGlzLmluZGV4ID0gMDtcbiAgdGhpcy5vZmZzZXQgPSAwO1xufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLmhhc05leHQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBlZWtMZW5ndGgoKSA8IEluZmluaXR5O1xufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gIGlmICghbGVuZ3RoKSBsZW5ndGggPSBJbmZpbml0eTtcbiAgdmFyIG5leHRPcCA9IHRoaXMub3BzW3RoaXMuaW5kZXhdO1xuICBpZiAobmV4dE9wKSB7XG4gICAgdmFyIG9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICAgIHZhciBvcExlbmd0aCA9IGxpYi5sZW5ndGgobmV4dE9wKVxuICAgIGlmIChsZW5ndGggPj0gb3BMZW5ndGggLSBvZmZzZXQpIHtcbiAgICAgIGxlbmd0aCA9IG9wTGVuZ3RoIC0gb2Zmc2V0O1xuICAgICAgdGhpcy5pbmRleCArPSAxO1xuICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCArPSBsZW5ndGg7XG4gICAgfVxuICAgIGlmIChpcy5udW1iZXIobmV4dE9wWydkZWxldGUnXSkpIHtcbiAgICAgIHJldHVybiB7ICdkZWxldGUnOiBsZW5ndGggfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJldE9wID0ge307XG4gICAgICBpZiAobmV4dE9wLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgcmV0T3AuYXR0cmlidXRlcyA9IG5leHRPcC5hdHRyaWJ1dGVzO1xuICAgICAgfVxuICAgICAgaWYgKGlzLm51bWJlcihuZXh0T3AucmV0YWluKSkge1xuICAgICAgICByZXRPcC5yZXRhaW4gPSBsZW5ndGg7XG4gICAgICB9IGVsc2UgaWYgKGlzLnN0cmluZyhuZXh0T3AuaW5zZXJ0KSkge1xuICAgICAgICByZXRPcC5pbnNlcnQgPSBuZXh0T3AuaW5zZXJ0LnN1YnN0cihvZmZzZXQsIGxlbmd0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvZmZzZXQgc2hvdWxkID09PSAwLCBsZW5ndGggc2hvdWxkID09PSAxXG4gICAgICAgIHJldE9wLmluc2VydCA9IG5leHRPcC5pbnNlcnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0T3A7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7IHJldGFpbjogSW5maW5pdHkgfTtcbiAgfVxufTtcblxuSXRlcmF0b3IucHJvdG90eXBlLnBlZWtMZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLm9wc1t0aGlzLmluZGV4XSkge1xuICAgIC8vIFNob3VsZCBuZXZlciByZXR1cm4gMCBpZiBvdXIgaW5kZXggaXMgYmVpbmcgbWFuYWdlZCBjb3JyZWN0bHlcbiAgICByZXR1cm4gbGliLmxlbmd0aCh0aGlzLm9wc1t0aGlzLmluZGV4XSkgLSB0aGlzLm9mZnNldDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn07XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS5wZWVrVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMub3BzW3RoaXMuaW5kZXhdKSB7XG4gICAgaWYgKGlzLm51bWJlcih0aGlzLm9wc1t0aGlzLmluZGV4XVsnZGVsZXRlJ10pKSB7XG4gICAgICByZXR1cm4gJ2RlbGV0ZSc7XG4gICAgfSBlbHNlIGlmIChpcy5udW1iZXIodGhpcy5vcHNbdGhpcy5pbmRleF0ucmV0YWluKSkge1xuICAgICAgcmV0dXJuICdyZXRhaW4nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2luc2VydCc7XG4gICAgfVxuICB9XG4gIHJldHVybiAncmV0YWluJztcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBsaWI7XG4iLCIvKipcbiAqIFRoaXMgbGlicmFyeSBtb2RpZmllcyB0aGUgZGlmZi1wYXRjaC1tYXRjaCBsaWJyYXJ5IGJ5IE5laWwgRnJhc2VyXG4gKiBieSByZW1vdmluZyB0aGUgcGF0Y2ggYW5kIG1hdGNoIGZ1bmN0aW9uYWxpdHkgYW5kIGNlcnRhaW4gYWR2YW5jZWRcbiAqIG9wdGlvbnMgaW4gdGhlIGRpZmYgZnVuY3Rpb24uIFRoZSBvcmlnaW5hbCBsaWNlbnNlIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogPT09XG4gKlxuICogRGlmZiBNYXRjaCBhbmQgUGF0Y2hcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiBHb29nbGUgSW5jLlxuICogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuXG4vKipcbiAqIFRoZSBkYXRhIHN0cnVjdHVyZSByZXByZXNlbnRpbmcgYSBkaWZmIGlzIGFuIGFycmF5IG9mIHR1cGxlczpcbiAqIFtbRElGRl9ERUxFVEUsICdIZWxsbyddLCBbRElGRl9JTlNFUlQsICdHb29kYnllJ10sIFtESUZGX0VRVUFMLCAnIHdvcmxkLiddXVxuICogd2hpY2ggbWVhbnM6IGRlbGV0ZSAnSGVsbG8nLCBhZGQgJ0dvb2RieWUnIGFuZCBrZWVwICcgd29ybGQuJ1xuICovXG52YXIgRElGRl9ERUxFVEUgPSAtMTtcbnZhciBESUZGX0lOU0VSVCA9IDE7XG52YXIgRElGRl9FUVVBTCA9IDA7XG5cblxuLyoqXG4gKiBGaW5kIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byB0ZXh0cy4gIFNpbXBsaWZpZXMgdGhlIHByb2JsZW0gYnkgc3RyaXBwaW5nXG4gKiBhbnkgY29tbW9uIHByZWZpeCBvciBzdWZmaXggb2ZmIHRoZSB0ZXh0cyBiZWZvcmUgZGlmZmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqL1xuZnVuY3Rpb24gZGlmZl9tYWluKHRleHQxLCB0ZXh0Mikge1xuICAvLyBDaGVjayBmb3IgZXF1YWxpdHkgKHNwZWVkdXApLlxuICBpZiAodGV4dDEgPT0gdGV4dDIpIHtcbiAgICBpZiAodGV4dDEpIHtcbiAgICAgIHJldHVybiBbW0RJRkZfRVFVQUwsIHRleHQxXV07XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIFRyaW0gb2ZmIGNvbW1vbiBwcmVmaXggKHNwZWVkdXApLlxuICB2YXIgY29tbW9ubGVuZ3RoID0gZGlmZl9jb21tb25QcmVmaXgodGV4dDEsIHRleHQyKTtcbiAgdmFyIGNvbW1vbnByZWZpeCA9IHRleHQxLnN1YnN0cmluZygwLCBjb21tb25sZW5ndGgpO1xuICB0ZXh0MSA9IHRleHQxLnN1YnN0cmluZyhjb21tb25sZW5ndGgpO1xuICB0ZXh0MiA9IHRleHQyLnN1YnN0cmluZyhjb21tb25sZW5ndGgpO1xuXG4gIC8vIFRyaW0gb2ZmIGNvbW1vbiBzdWZmaXggKHNwZWVkdXApLlxuICBjb21tb25sZW5ndGggPSBkaWZmX2NvbW1vblN1ZmZpeCh0ZXh0MSwgdGV4dDIpO1xuICB2YXIgY29tbW9uc3VmZml4ID0gdGV4dDEuc3Vic3RyaW5nKHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQxID0gdGV4dDEuc3Vic3RyaW5nKDAsIHRleHQxLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG4gIHRleHQyID0gdGV4dDIuc3Vic3RyaW5nKDAsIHRleHQyLmxlbmd0aCAtIGNvbW1vbmxlbmd0aCk7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgZGlmZiBvbiB0aGUgbWlkZGxlIGJsb2NrLlxuICB2YXIgZGlmZnMgPSBkaWZmX2NvbXB1dGVfKHRleHQxLCB0ZXh0Mik7XG5cbiAgLy8gUmVzdG9yZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gIGlmIChjb21tb25wcmVmaXgpIHtcbiAgICBkaWZmcy51bnNoaWZ0KFtESUZGX0VRVUFMLCBjb21tb25wcmVmaXhdKTtcbiAgfVxuICBpZiAoY29tbW9uc3VmZml4KSB7XG4gICAgZGlmZnMucHVzaChbRElGRl9FUVVBTCwgY29tbW9uc3VmZml4XSk7XG4gIH1cbiAgZGlmZl9jbGVhbnVwTWVyZ2UoZGlmZnMpO1xuICByZXR1cm4gZGlmZnM7XG59O1xuXG5cbi8qKlxuICogRmluZCB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiB0d28gdGV4dHMuICBBc3N1bWVzIHRoYXQgdGhlIHRleHRzIGRvIG5vdFxuICogaGF2ZSBhbnkgY29tbW9uIHByZWZpeCBvciBzdWZmaXguXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgT2xkIHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgTmV3IHN0cmluZyB0byBiZSBkaWZmZWQuXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIGRpZmZfY29tcHV0ZV8odGV4dDEsIHRleHQyKSB7XG4gIHZhciBkaWZmcztcblxuICBpZiAoIXRleHQxKSB7XG4gICAgLy8gSnVzdCBhZGQgc29tZSB0ZXh0IChzcGVlZHVwKS5cbiAgICByZXR1cm4gW1tESUZGX0lOU0VSVCwgdGV4dDJdXTtcbiAgfVxuXG4gIGlmICghdGV4dDIpIHtcbiAgICAvLyBKdXN0IGRlbGV0ZSBzb21lIHRleHQgKHNwZWVkdXApLlxuICAgIHJldHVybiBbW0RJRkZfREVMRVRFLCB0ZXh0MV1dO1xuICB9XG5cbiAgdmFyIGxvbmd0ZXh0ID0gdGV4dDEubGVuZ3RoID4gdGV4dDIubGVuZ3RoID8gdGV4dDEgOiB0ZXh0MjtcbiAgdmFyIHNob3J0dGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQyIDogdGV4dDE7XG4gIHZhciBpID0gbG9uZ3RleHQuaW5kZXhPZihzaG9ydHRleHQpO1xuICBpZiAoaSAhPSAtMSkge1xuICAgIC8vIFNob3J0ZXIgdGV4dCBpcyBpbnNpZGUgdGhlIGxvbmdlciB0ZXh0IChzcGVlZHVwKS5cbiAgICBkaWZmcyA9IFtbRElGRl9JTlNFUlQsIGxvbmd0ZXh0LnN1YnN0cmluZygwLCBpKV0sXG4gICAgICAgICAgICAgW0RJRkZfRVFVQUwsIHNob3J0dGV4dF0sXG4gICAgICAgICAgICAgW0RJRkZfSU5TRVJULCBsb25ndGV4dC5zdWJzdHJpbmcoaSArIHNob3J0dGV4dC5sZW5ndGgpXV07XG4gICAgLy8gU3dhcCBpbnNlcnRpb25zIGZvciBkZWxldGlvbnMgaWYgZGlmZiBpcyByZXZlcnNlZC5cbiAgICBpZiAodGV4dDEubGVuZ3RoID4gdGV4dDIubGVuZ3RoKSB7XG4gICAgICBkaWZmc1swXVswXSA9IGRpZmZzWzJdWzBdID0gRElGRl9ERUxFVEU7XG4gICAgfVxuICAgIHJldHVybiBkaWZmcztcbiAgfVxuXG4gIGlmIChzaG9ydHRleHQubGVuZ3RoID09IDEpIHtcbiAgICAvLyBTaW5nbGUgY2hhcmFjdGVyIHN0cmluZy5cbiAgICAvLyBBZnRlciB0aGUgcHJldmlvdXMgc3BlZWR1cCwgdGhlIGNoYXJhY3RlciBjYW4ndCBiZSBhbiBlcXVhbGl0eS5cbiAgICByZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdLCBbRElGRl9JTlNFUlQsIHRleHQyXV07XG4gIH1cblxuICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIHByb2JsZW0gY2FuIGJlIHNwbGl0IGluIHR3by5cbiAgdmFyIGhtID0gZGlmZl9oYWxmTWF0Y2hfKHRleHQxLCB0ZXh0Mik7XG4gIGlmIChobSkge1xuICAgIC8vIEEgaGFsZi1tYXRjaCB3YXMgZm91bmQsIHNvcnQgb3V0IHRoZSByZXR1cm4gZGF0YS5cbiAgICB2YXIgdGV4dDFfYSA9IGhtWzBdO1xuICAgIHZhciB0ZXh0MV9iID0gaG1bMV07XG4gICAgdmFyIHRleHQyX2EgPSBobVsyXTtcbiAgICB2YXIgdGV4dDJfYiA9IGhtWzNdO1xuICAgIHZhciBtaWRfY29tbW9uID0gaG1bNF07XG4gICAgLy8gU2VuZCBib3RoIHBhaXJzIG9mZiBmb3Igc2VwYXJhdGUgcHJvY2Vzc2luZy5cbiAgICB2YXIgZGlmZnNfYSA9IGRpZmZfbWFpbih0ZXh0MV9hLCB0ZXh0Ml9hKTtcbiAgICB2YXIgZGlmZnNfYiA9IGRpZmZfbWFpbih0ZXh0MV9iLCB0ZXh0Ml9iKTtcbiAgICAvLyBNZXJnZSB0aGUgcmVzdWx0cy5cbiAgICByZXR1cm4gZGlmZnNfYS5jb25jYXQoW1tESUZGX0VRVUFMLCBtaWRfY29tbW9uXV0sIGRpZmZzX2IpO1xuICB9XG5cbiAgcmV0dXJuIGRpZmZfYmlzZWN0Xyh0ZXh0MSwgdGV4dDIpO1xufTtcblxuXG4vKipcbiAqIEZpbmQgdGhlICdtaWRkbGUgc25ha2UnIG9mIGEgZGlmZiwgc3BsaXQgdGhlIHByb2JsZW0gaW4gdHdvXG4gKiBhbmQgcmV0dXJuIHRoZSByZWN1cnNpdmVseSBjb25zdHJ1Y3RlZCBkaWZmLlxuICogU2VlIE15ZXJzIDE5ODYgcGFwZXI6IEFuIE8oTkQpIERpZmZlcmVuY2UgQWxnb3JpdGhtIGFuZCBJdHMgVmFyaWF0aW9ucy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiBkaWZmIHR1cGxlcy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGRpZmZfYmlzZWN0Xyh0ZXh0MSwgdGV4dDIpIHtcbiAgLy8gQ2FjaGUgdGhlIHRleHQgbGVuZ3RocyB0byBwcmV2ZW50IG11bHRpcGxlIGNhbGxzLlxuICB2YXIgdGV4dDFfbGVuZ3RoID0gdGV4dDEubGVuZ3RoO1xuICB2YXIgdGV4dDJfbGVuZ3RoID0gdGV4dDIubGVuZ3RoO1xuICB2YXIgbWF4X2QgPSBNYXRoLmNlaWwoKHRleHQxX2xlbmd0aCArIHRleHQyX2xlbmd0aCkgLyAyKTtcbiAgdmFyIHZfb2Zmc2V0ID0gbWF4X2Q7XG4gIHZhciB2X2xlbmd0aCA9IDIgKiBtYXhfZDtcbiAgdmFyIHYxID0gbmV3IEFycmF5KHZfbGVuZ3RoKTtcbiAgdmFyIHYyID0gbmV3IEFycmF5KHZfbGVuZ3RoKTtcbiAgLy8gU2V0dGluZyBhbGwgZWxlbWVudHMgdG8gLTEgaXMgZmFzdGVyIGluIENocm9tZSAmIEZpcmVmb3ggdGhhbiBtaXhpbmdcbiAgLy8gaW50ZWdlcnMgYW5kIHVuZGVmaW5lZC5cbiAgZm9yICh2YXIgeCA9IDA7IHggPCB2X2xlbmd0aDsgeCsrKSB7XG4gICAgdjFbeF0gPSAtMTtcbiAgICB2Mlt4XSA9IC0xO1xuICB9XG4gIHYxW3Zfb2Zmc2V0ICsgMV0gPSAwO1xuICB2Mlt2X29mZnNldCArIDFdID0gMDtcbiAgdmFyIGRlbHRhID0gdGV4dDFfbGVuZ3RoIC0gdGV4dDJfbGVuZ3RoO1xuICAvLyBJZiB0aGUgdG90YWwgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaXMgb2RkLCB0aGVuIHRoZSBmcm9udCBwYXRoIHdpbGwgY29sbGlkZVxuICAvLyB3aXRoIHRoZSByZXZlcnNlIHBhdGguXG4gIHZhciBmcm9udCA9IChkZWx0YSAlIDIgIT0gMCk7XG4gIC8vIE9mZnNldHMgZm9yIHN0YXJ0IGFuZCBlbmQgb2YgayBsb29wLlxuICAvLyBQcmV2ZW50cyBtYXBwaW5nIG9mIHNwYWNlIGJleW9uZCB0aGUgZ3JpZC5cbiAgdmFyIGsxc3RhcnQgPSAwO1xuICB2YXIgazFlbmQgPSAwO1xuICB2YXIgazJzdGFydCA9IDA7XG4gIHZhciBrMmVuZCA9IDA7XG4gIGZvciAodmFyIGQgPSAwOyBkIDwgbWF4X2Q7IGQrKykge1xuICAgIC8vIFdhbGsgdGhlIGZyb250IHBhdGggb25lIHN0ZXAuXG4gICAgZm9yICh2YXIgazEgPSAtZCArIGsxc3RhcnQ7IGsxIDw9IGQgLSBrMWVuZDsgazEgKz0gMikge1xuICAgICAgdmFyIGsxX29mZnNldCA9IHZfb2Zmc2V0ICsgazE7XG4gICAgICB2YXIgeDE7XG4gICAgICBpZiAoazEgPT0gLWQgfHwgKGsxICE9IGQgJiYgdjFbazFfb2Zmc2V0IC0gMV0gPCB2MVtrMV9vZmZzZXQgKyAxXSkpIHtcbiAgICAgICAgeDEgPSB2MVtrMV9vZmZzZXQgKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHgxID0gdjFbazFfb2Zmc2V0IC0gMV0gKyAxO1xuICAgICAgfVxuICAgICAgdmFyIHkxID0geDEgLSBrMTtcbiAgICAgIHdoaWxlICh4MSA8IHRleHQxX2xlbmd0aCAmJiB5MSA8IHRleHQyX2xlbmd0aCAmJlxuICAgICAgICAgICAgIHRleHQxLmNoYXJBdCh4MSkgPT0gdGV4dDIuY2hhckF0KHkxKSkge1xuICAgICAgICB4MSsrO1xuICAgICAgICB5MSsrO1xuICAgICAgfVxuICAgICAgdjFbazFfb2Zmc2V0XSA9IHgxO1xuICAgICAgaWYgKHgxID4gdGV4dDFfbGVuZ3RoKSB7XG4gICAgICAgIC8vIFJhbiBvZmYgdGhlIHJpZ2h0IG9mIHRoZSBncmFwaC5cbiAgICAgICAgazFlbmQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoeTEgPiB0ZXh0Ml9sZW5ndGgpIHtcbiAgICAgICAgLy8gUmFuIG9mZiB0aGUgYm90dG9tIG9mIHRoZSBncmFwaC5cbiAgICAgICAgazFzdGFydCArPSAyO1xuICAgICAgfSBlbHNlIGlmIChmcm9udCkge1xuICAgICAgICB2YXIgazJfb2Zmc2V0ID0gdl9vZmZzZXQgKyBkZWx0YSAtIGsxO1xuICAgICAgICBpZiAoazJfb2Zmc2V0ID49IDAgJiYgazJfb2Zmc2V0IDwgdl9sZW5ndGggJiYgdjJbazJfb2Zmc2V0XSAhPSAtMSkge1xuICAgICAgICAgIC8vIE1pcnJvciB4MiBvbnRvIHRvcC1sZWZ0IGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgICAgICAgIHZhciB4MiA9IHRleHQxX2xlbmd0aCAtIHYyW2syX29mZnNldF07XG4gICAgICAgICAgaWYgKHgxID49IHgyKSB7XG4gICAgICAgICAgICAvLyBPdmVybGFwIGRldGVjdGVkLlxuICAgICAgICAgICAgcmV0dXJuIGRpZmZfYmlzZWN0U3BsaXRfKHRleHQxLCB0ZXh0MiwgeDEsIHkxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSByZXZlcnNlIHBhdGggb25lIHN0ZXAuXG4gICAgZm9yICh2YXIgazIgPSAtZCArIGsyc3RhcnQ7IGsyIDw9IGQgLSBrMmVuZDsgazIgKz0gMikge1xuICAgICAgdmFyIGsyX29mZnNldCA9IHZfb2Zmc2V0ICsgazI7XG4gICAgICB2YXIgeDI7XG4gICAgICBpZiAoazIgPT0gLWQgfHwgKGsyICE9IGQgJiYgdjJbazJfb2Zmc2V0IC0gMV0gPCB2MltrMl9vZmZzZXQgKyAxXSkpIHtcbiAgICAgICAgeDIgPSB2MltrMl9vZmZzZXQgKyAxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHgyID0gdjJbazJfb2Zmc2V0IC0gMV0gKyAxO1xuICAgICAgfVxuICAgICAgdmFyIHkyID0geDIgLSBrMjtcbiAgICAgIHdoaWxlICh4MiA8IHRleHQxX2xlbmd0aCAmJiB5MiA8IHRleHQyX2xlbmd0aCAmJlxuICAgICAgICAgICAgIHRleHQxLmNoYXJBdCh0ZXh0MV9sZW5ndGggLSB4MiAtIDEpID09XG4gICAgICAgICAgICAgdGV4dDIuY2hhckF0KHRleHQyX2xlbmd0aCAtIHkyIC0gMSkpIHtcbiAgICAgICAgeDIrKztcbiAgICAgICAgeTIrKztcbiAgICAgIH1cbiAgICAgIHYyW2syX29mZnNldF0gPSB4MjtcbiAgICAgIGlmICh4MiA+IHRleHQxX2xlbmd0aCkge1xuICAgICAgICAvLyBSYW4gb2ZmIHRoZSBsZWZ0IG9mIHRoZSBncmFwaC5cbiAgICAgICAgazJlbmQgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAoeTIgPiB0ZXh0Ml9sZW5ndGgpIHtcbiAgICAgICAgLy8gUmFuIG9mZiB0aGUgdG9wIG9mIHRoZSBncmFwaC5cbiAgICAgICAgazJzdGFydCArPSAyO1xuICAgICAgfSBlbHNlIGlmICghZnJvbnQpIHtcbiAgICAgICAgdmFyIGsxX29mZnNldCA9IHZfb2Zmc2V0ICsgZGVsdGEgLSBrMjtcbiAgICAgICAgaWYgKGsxX29mZnNldCA+PSAwICYmIGsxX29mZnNldCA8IHZfbGVuZ3RoICYmIHYxW2sxX29mZnNldF0gIT0gLTEpIHtcbiAgICAgICAgICB2YXIgeDEgPSB2MVtrMV9vZmZzZXRdO1xuICAgICAgICAgIHZhciB5MSA9IHZfb2Zmc2V0ICsgeDEgLSBrMV9vZmZzZXQ7XG4gICAgICAgICAgLy8gTWlycm9yIHgyIG9udG8gdG9wLWxlZnQgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAgICAgICAgeDIgPSB0ZXh0MV9sZW5ndGggLSB4MjtcbiAgICAgICAgICBpZiAoeDEgPj0geDIpIHtcbiAgICAgICAgICAgIC8vIE92ZXJsYXAgZGV0ZWN0ZWQuXG4gICAgICAgICAgICByZXR1cm4gZGlmZl9iaXNlY3RTcGxpdF8odGV4dDEsIHRleHQyLCB4MSwgeTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBEaWZmIHRvb2sgdG9vIGxvbmcgYW5kIGhpdCB0aGUgZGVhZGxpbmUgb3JcbiAgLy8gbnVtYmVyIG9mIGRpZmZzIGVxdWFscyBudW1iZXIgb2YgY2hhcmFjdGVycywgbm8gY29tbW9uYWxpdHkgYXQgYWxsLlxuICByZXR1cm4gW1tESUZGX0RFTEVURSwgdGV4dDFdLCBbRElGRl9JTlNFUlQsIHRleHQyXV07XG59O1xuXG5cbi8qKlxuICogR2l2ZW4gdGhlIGxvY2F0aW9uIG9mIHRoZSAnbWlkZGxlIHNuYWtlJywgc3BsaXQgdGhlIGRpZmYgaW4gdHdvIHBhcnRzXG4gKiBhbmQgcmVjdXJzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBPbGQgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MiBOZXcgc3RyaW5nIHRvIGJlIGRpZmZlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEluZGV4IG9mIHNwbGl0IHBvaW50IGluIHRleHQxLlxuICogQHBhcmFtIHtudW1iZXJ9IHkgSW5kZXggb2Ygc3BsaXQgcG9pbnQgaW4gdGV4dDIuXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIGRpZmZfYmlzZWN0U3BsaXRfKHRleHQxLCB0ZXh0MiwgeCwgeSkge1xuICB2YXIgdGV4dDFhID0gdGV4dDEuc3Vic3RyaW5nKDAsIHgpO1xuICB2YXIgdGV4dDJhID0gdGV4dDIuc3Vic3RyaW5nKDAsIHkpO1xuICB2YXIgdGV4dDFiID0gdGV4dDEuc3Vic3RyaW5nKHgpO1xuICB2YXIgdGV4dDJiID0gdGV4dDIuc3Vic3RyaW5nKHkpO1xuXG4gIC8vIENvbXB1dGUgYm90aCBkaWZmcyBzZXJpYWxseS5cbiAgdmFyIGRpZmZzID0gZGlmZl9tYWluKHRleHQxYSwgdGV4dDJhKTtcbiAgdmFyIGRpZmZzYiA9IGRpZmZfbWFpbih0ZXh0MWIsIHRleHQyYik7XG5cbiAgcmV0dXJuIGRpZmZzLmNvbmNhdChkaWZmc2IpO1xufTtcblxuXG4vKipcbiAqIERldGVybWluZSB0aGUgY29tbW9uIHByZWZpeCBvZiB0d28gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0MSBGaXJzdCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDIgU2Vjb25kIHN0cmluZy5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbW1vbiB0byB0aGUgc3RhcnQgb2YgZWFjaFxuICogICAgIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGlmZl9jb21tb25QcmVmaXgodGV4dDEsIHRleHQyKSB7XG4gIC8vIFF1aWNrIGNoZWNrIGZvciBjb21tb24gbnVsbCBjYXNlcy5cbiAgaWYgKCF0ZXh0MSB8fCAhdGV4dDIgfHwgdGV4dDEuY2hhckF0KDApICE9IHRleHQyLmNoYXJBdCgwKSkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIC8vIEJpbmFyeSBzZWFyY2guXG4gIC8vIFBlcmZvcm1hbmNlIGFuYWx5c2lzOiBodHRwOi8vbmVpbC5mcmFzZXIubmFtZS9uZXdzLzIwMDcvMTAvMDkvXG4gIHZhciBwb2ludGVybWluID0gMDtcbiAgdmFyIHBvaW50ZXJtYXggPSBNYXRoLm1pbih0ZXh0MS5sZW5ndGgsIHRleHQyLmxlbmd0aCk7XG4gIHZhciBwb2ludGVybWlkID0gcG9pbnRlcm1heDtcbiAgdmFyIHBvaW50ZXJzdGFydCA9IDA7XG4gIHdoaWxlIChwb2ludGVybWluIDwgcG9pbnRlcm1pZCkge1xuICAgIGlmICh0ZXh0MS5zdWJzdHJpbmcocG9pbnRlcnN0YXJ0LCBwb2ludGVybWlkKSA9PVxuICAgICAgICB0ZXh0Mi5zdWJzdHJpbmcocG9pbnRlcnN0YXJ0LCBwb2ludGVybWlkKSkge1xuICAgICAgcG9pbnRlcm1pbiA9IHBvaW50ZXJtaWQ7XG4gICAgICBwb2ludGVyc3RhcnQgPSBwb2ludGVybWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb2ludGVybWF4ID0gcG9pbnRlcm1pZDtcbiAgICB9XG4gICAgcG9pbnRlcm1pZCA9IE1hdGguZmxvb3IoKHBvaW50ZXJtYXggLSBwb2ludGVybWluKSAvIDIgKyBwb2ludGVybWluKTtcbiAgfVxuICByZXR1cm4gcG9pbnRlcm1pZDtcbn07XG5cblxuLyoqXG4gKiBEZXRlcm1pbmUgdGhlIGNvbW1vbiBzdWZmaXggb2YgdHdvIHN0cmluZ3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBjb21tb24gdG8gdGhlIGVuZCBvZiBlYWNoIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGlmZl9jb21tb25TdWZmaXgodGV4dDEsIHRleHQyKSB7XG4gIC8vIFF1aWNrIGNoZWNrIGZvciBjb21tb24gbnVsbCBjYXNlcy5cbiAgaWYgKCF0ZXh0MSB8fCAhdGV4dDIgfHxcbiAgICAgIHRleHQxLmNoYXJBdCh0ZXh0MS5sZW5ndGggLSAxKSAhPSB0ZXh0Mi5jaGFyQXQodGV4dDIubGVuZ3RoIC0gMSkpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICAvLyBCaW5hcnkgc2VhcmNoLlxuICAvLyBQZXJmb3JtYW5jZSBhbmFseXNpczogaHR0cDovL25laWwuZnJhc2VyLm5hbWUvbmV3cy8yMDA3LzEwLzA5L1xuICB2YXIgcG9pbnRlcm1pbiA9IDA7XG4gIHZhciBwb2ludGVybWF4ID0gTWF0aC5taW4odGV4dDEubGVuZ3RoLCB0ZXh0Mi5sZW5ndGgpO1xuICB2YXIgcG9pbnRlcm1pZCA9IHBvaW50ZXJtYXg7XG4gIHZhciBwb2ludGVyZW5kID0gMDtcbiAgd2hpbGUgKHBvaW50ZXJtaW4gPCBwb2ludGVybWlkKSB7XG4gICAgaWYgKHRleHQxLnN1YnN0cmluZyh0ZXh0MS5sZW5ndGggLSBwb2ludGVybWlkLCB0ZXh0MS5sZW5ndGggLSBwb2ludGVyZW5kKSA9PVxuICAgICAgICB0ZXh0Mi5zdWJzdHJpbmcodGV4dDIubGVuZ3RoIC0gcG9pbnRlcm1pZCwgdGV4dDIubGVuZ3RoIC0gcG9pbnRlcmVuZCkpIHtcbiAgICAgIHBvaW50ZXJtaW4gPSBwb2ludGVybWlkO1xuICAgICAgcG9pbnRlcmVuZCA9IHBvaW50ZXJtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvaW50ZXJtYXggPSBwb2ludGVybWlkO1xuICAgIH1cbiAgICBwb2ludGVybWlkID0gTWF0aC5mbG9vcigocG9pbnRlcm1heCAtIHBvaW50ZXJtaW4pIC8gMiArIHBvaW50ZXJtaW4pO1xuICB9XG4gIHJldHVybiBwb2ludGVybWlkO1xufTtcblxuXG4vKipcbiAqIERvIHRoZSB0d28gdGV4dHMgc2hhcmUgYSBzdWJzdHJpbmcgd2hpY2ggaXMgYXQgbGVhc3QgaGFsZiB0aGUgbGVuZ3RoIG9mIHRoZVxuICogbG9uZ2VyIHRleHQ/XG4gKiBUaGlzIHNwZWVkdXAgY2FuIHByb2R1Y2Ugbm9uLW1pbmltYWwgZGlmZnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dDEgRmlyc3Qgc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQyIFNlY29uZCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn0gRml2ZSBlbGVtZW50IEFycmF5LCBjb250YWluaW5nIHRoZSBwcmVmaXggb2ZcbiAqICAgICB0ZXh0MSwgdGhlIHN1ZmZpeCBvZiB0ZXh0MSwgdGhlIHByZWZpeCBvZiB0ZXh0MiwgdGhlIHN1ZmZpeCBvZlxuICogICAgIHRleHQyIGFuZCB0aGUgY29tbW9uIG1pZGRsZS4gIE9yIG51bGwgaWYgdGhlcmUgd2FzIG5vIG1hdGNoLlxuICovXG5mdW5jdGlvbiBkaWZmX2hhbGZNYXRjaF8odGV4dDEsIHRleHQyKSB7XG4gIHZhciBsb25ndGV4dCA9IHRleHQxLmxlbmd0aCA+IHRleHQyLmxlbmd0aCA/IHRleHQxIDogdGV4dDI7XG4gIHZhciBzaG9ydHRleHQgPSB0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGggPyB0ZXh0MiA6IHRleHQxO1xuICBpZiAobG9uZ3RleHQubGVuZ3RoIDwgNCB8fCBzaG9ydHRleHQubGVuZ3RoICogMiA8IGxvbmd0ZXh0Lmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsOyAgLy8gUG9pbnRsZXNzLlxuICB9XG5cbiAgLyoqXG4gICAqIERvZXMgYSBzdWJzdHJpbmcgb2Ygc2hvcnR0ZXh0IGV4aXN0IHdpdGhpbiBsb25ndGV4dCBzdWNoIHRoYXQgdGhlIHN1YnN0cmluZ1xuICAgKiBpcyBhdCBsZWFzdCBoYWxmIHRoZSBsZW5ndGggb2YgbG9uZ3RleHQ/XG4gICAqIENsb3N1cmUsIGJ1dCBkb2VzIG5vdCByZWZlcmVuY2UgYW55IGV4dGVybmFsIHZhcmlhYmxlcy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGxvbmd0ZXh0IExvbmdlciBzdHJpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzaG9ydHRleHQgU2hvcnRlciBzdHJpbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpIFN0YXJ0IGluZGV4IG9mIHF1YXJ0ZXIgbGVuZ3RoIHN1YnN0cmluZyB3aXRoaW4gbG9uZ3RleHQuXG4gICAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSBGaXZlIGVsZW1lbnQgQXJyYXksIGNvbnRhaW5pbmcgdGhlIHByZWZpeCBvZlxuICAgKiAgICAgbG9uZ3RleHQsIHRoZSBzdWZmaXggb2YgbG9uZ3RleHQsIHRoZSBwcmVmaXggb2Ygc2hvcnR0ZXh0LCB0aGUgc3VmZml4XG4gICAqICAgICBvZiBzaG9ydHRleHQgYW5kIHRoZSBjb21tb24gbWlkZGxlLiAgT3IgbnVsbCBpZiB0aGVyZSB3YXMgbm8gbWF0Y2guXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBkaWZmX2hhbGZNYXRjaElfKGxvbmd0ZXh0LCBzaG9ydHRleHQsIGkpIHtcbiAgICAvLyBTdGFydCB3aXRoIGEgMS80IGxlbmd0aCBzdWJzdHJpbmcgYXQgcG9zaXRpb24gaSBhcyBhIHNlZWQuXG4gICAgdmFyIHNlZWQgPSBsb25ndGV4dC5zdWJzdHJpbmcoaSwgaSArIE1hdGguZmxvb3IobG9uZ3RleHQubGVuZ3RoIC8gNCkpO1xuICAgIHZhciBqID0gLTE7XG4gICAgdmFyIGJlc3RfY29tbW9uID0gJyc7XG4gICAgdmFyIGJlc3RfbG9uZ3RleHRfYSwgYmVzdF9sb25ndGV4dF9iLCBiZXN0X3Nob3J0dGV4dF9hLCBiZXN0X3Nob3J0dGV4dF9iO1xuICAgIHdoaWxlICgoaiA9IHNob3J0dGV4dC5pbmRleE9mKHNlZWQsIGogKyAxKSkgIT0gLTEpIHtcbiAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBkaWZmX2NvbW1vblByZWZpeChsb25ndGV4dC5zdWJzdHJpbmcoaSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnR0ZXh0LnN1YnN0cmluZyhqKSk7XG4gICAgICB2YXIgc3VmZml4TGVuZ3RoID0gZGlmZl9jb21tb25TdWZmaXgobG9uZ3RleHQuc3Vic3RyaW5nKDAsIGkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3J0dGV4dC5zdWJzdHJpbmcoMCwgaikpO1xuICAgICAgaWYgKGJlc3RfY29tbW9uLmxlbmd0aCA8IHN1ZmZpeExlbmd0aCArIHByZWZpeExlbmd0aCkge1xuICAgICAgICBiZXN0X2NvbW1vbiA9IHNob3J0dGV4dC5zdWJzdHJpbmcoaiAtIHN1ZmZpeExlbmd0aCwgaikgK1xuICAgICAgICAgICAgc2hvcnR0ZXh0LnN1YnN0cmluZyhqLCBqICsgcHJlZml4TGVuZ3RoKTtcbiAgICAgICAgYmVzdF9sb25ndGV4dF9hID0gbG9uZ3RleHQuc3Vic3RyaW5nKDAsIGkgLSBzdWZmaXhMZW5ndGgpO1xuICAgICAgICBiZXN0X2xvbmd0ZXh0X2IgPSBsb25ndGV4dC5zdWJzdHJpbmcoaSArIHByZWZpeExlbmd0aCk7XG4gICAgICAgIGJlc3Rfc2hvcnR0ZXh0X2EgPSBzaG9ydHRleHQuc3Vic3RyaW5nKDAsIGogLSBzdWZmaXhMZW5ndGgpO1xuICAgICAgICBiZXN0X3Nob3J0dGV4dF9iID0gc2hvcnR0ZXh0LnN1YnN0cmluZyhqICsgcHJlZml4TGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJlc3RfY29tbW9uLmxlbmd0aCAqIDIgPj0gbG9uZ3RleHQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW2Jlc3RfbG9uZ3RleHRfYSwgYmVzdF9sb25ndGV4dF9iLFxuICAgICAgICAgICAgICBiZXN0X3Nob3J0dGV4dF9hLCBiZXN0X3Nob3J0dGV4dF9iLCBiZXN0X2NvbW1vbl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpcnN0IGNoZWNrIGlmIHRoZSBzZWNvbmQgcXVhcnRlciBpcyB0aGUgc2VlZCBmb3IgYSBoYWxmLW1hdGNoLlxuICB2YXIgaG0xID0gZGlmZl9oYWxmTWF0Y2hJXyhsb25ndGV4dCwgc2hvcnR0ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwobG9uZ3RleHQubGVuZ3RoIC8gNCkpO1xuICAvLyBDaGVjayBhZ2FpbiBiYXNlZCBvbiB0aGUgdGhpcmQgcXVhcnRlci5cbiAgdmFyIGhtMiA9IGRpZmZfaGFsZk1hdGNoSV8obG9uZ3RleHQsIHNob3J0dGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jZWlsKGxvbmd0ZXh0Lmxlbmd0aCAvIDIpKTtcbiAgdmFyIGhtO1xuICBpZiAoIWhtMSAmJiAhaG0yKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoIWhtMikge1xuICAgIGhtID0gaG0xO1xuICB9IGVsc2UgaWYgKCFobTEpIHtcbiAgICBobSA9IGhtMjtcbiAgfSBlbHNlIHtcbiAgICAvLyBCb3RoIG1hdGNoZWQuICBTZWxlY3QgdGhlIGxvbmdlc3QuXG4gICAgaG0gPSBobTFbNF0ubGVuZ3RoID4gaG0yWzRdLmxlbmd0aCA/IGhtMSA6IGhtMjtcbiAgfVxuXG4gIC8vIEEgaGFsZi1tYXRjaCB3YXMgZm91bmQsIHNvcnQgb3V0IHRoZSByZXR1cm4gZGF0YS5cbiAgdmFyIHRleHQxX2EsIHRleHQxX2IsIHRleHQyX2EsIHRleHQyX2I7XG4gIGlmICh0ZXh0MS5sZW5ndGggPiB0ZXh0Mi5sZW5ndGgpIHtcbiAgICB0ZXh0MV9hID0gaG1bMF07XG4gICAgdGV4dDFfYiA9IGhtWzFdO1xuICAgIHRleHQyX2EgPSBobVsyXTtcbiAgICB0ZXh0Ml9iID0gaG1bM107XG4gIH0gZWxzZSB7XG4gICAgdGV4dDJfYSA9IGhtWzBdO1xuICAgIHRleHQyX2IgPSBobVsxXTtcbiAgICB0ZXh0MV9hID0gaG1bMl07XG4gICAgdGV4dDFfYiA9IGhtWzNdO1xuICB9XG4gIHZhciBtaWRfY29tbW9uID0gaG1bNF07XG4gIHJldHVybiBbdGV4dDFfYSwgdGV4dDFfYiwgdGV4dDJfYSwgdGV4dDJfYiwgbWlkX2NvbW1vbl07XG59O1xuXG5cbi8qKlxuICogUmVvcmRlciBhbmQgbWVyZ2UgbGlrZSBlZGl0IHNlY3Rpb25zLiAgTWVyZ2UgZXF1YWxpdGllcy5cbiAqIEFueSBlZGl0IHNlY3Rpb24gY2FuIG1vdmUgYXMgbG9uZyBhcyBpdCBkb2Vzbid0IGNyb3NzIGFuIGVxdWFsaXR5LlxuICogQHBhcmFtIHtBcnJheX0gZGlmZnMgQXJyYXkgb2YgZGlmZiB0dXBsZXMuXG4gKi9cbmZ1bmN0aW9uIGRpZmZfY2xlYW51cE1lcmdlKGRpZmZzKSB7XG4gIGRpZmZzLnB1c2goW0RJRkZfRVFVQUwsICcnXSk7ICAvLyBBZGQgYSBkdW1teSBlbnRyeSBhdCB0aGUgZW5kLlxuICB2YXIgcG9pbnRlciA9IDA7XG4gIHZhciBjb3VudF9kZWxldGUgPSAwO1xuICB2YXIgY291bnRfaW5zZXJ0ID0gMDtcbiAgdmFyIHRleHRfZGVsZXRlID0gJyc7XG4gIHZhciB0ZXh0X2luc2VydCA9ICcnO1xuICB2YXIgY29tbW9ubGVuZ3RoO1xuICB3aGlsZSAocG9pbnRlciA8IGRpZmZzLmxlbmd0aCkge1xuICAgIHN3aXRjaCAoZGlmZnNbcG9pbnRlcl1bMF0pIHtcbiAgICAgIGNhc2UgRElGRl9JTlNFUlQ6XG4gICAgICAgIGNvdW50X2luc2VydCsrO1xuICAgICAgICB0ZXh0X2luc2VydCArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9ERUxFVEU6XG4gICAgICAgIGNvdW50X2RlbGV0ZSsrO1xuICAgICAgICB0ZXh0X2RlbGV0ZSArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRElGRl9FUVVBTDpcbiAgICAgICAgLy8gVXBvbiByZWFjaGluZyBhbiBlcXVhbGl0eSwgY2hlY2sgZm9yIHByaW9yIHJlZHVuZGFuY2llcy5cbiAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSArIGNvdW50X2luc2VydCA+IDEpIHtcbiAgICAgICAgICBpZiAoY291bnRfZGVsZXRlICE9PSAwICYmIGNvdW50X2luc2VydCAhPT0gMCkge1xuICAgICAgICAgICAgLy8gRmFjdG9yIG91dCBhbnkgY29tbW9uIHByZWZpeGllcy5cbiAgICAgICAgICAgIGNvbW1vbmxlbmd0aCA9IGRpZmZfY29tbW9uUHJlZml4KHRleHRfaW5zZXJ0LCB0ZXh0X2RlbGV0ZSk7XG4gICAgICAgICAgICBpZiAoY29tbW9ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgIGlmICgocG9pbnRlciAtIGNvdW50X2RlbGV0ZSAtIGNvdW50X2luc2VydCkgPiAwICYmXG4gICAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0IC0gMV1bMF0gPT1cbiAgICAgICAgICAgICAgICAgIERJRkZfRVFVQUwpIHtcbiAgICAgICAgICAgICAgICBkaWZmc1twb2ludGVyIC0gY291bnRfZGVsZXRlIC0gY291bnRfaW5zZXJ0IC0gMV1bMV0gKz1cbiAgICAgICAgICAgICAgICAgICAgdGV4dF9pbnNlcnQuc3Vic3RyaW5nKDAsIGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlmZnMuc3BsaWNlKDAsIDAsIFtESUZGX0VRVUFMLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dF9pbnNlcnQuc3Vic3RyaW5nKDAsIGNvbW1vbmxlbmd0aCldKTtcbiAgICAgICAgICAgICAgICBwb2ludGVyKys7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGV4dF9pbnNlcnQgPSB0ZXh0X2luc2VydC5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgdGV4dF9kZWxldGUgPSB0ZXh0X2RlbGV0ZS5zdWJzdHJpbmcoY29tbW9ubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZhY3RvciBvdXQgYW55IGNvbW1vbiBzdWZmaXhpZXMuXG4gICAgICAgICAgICBjb21tb25sZW5ndGggPSBkaWZmX2NvbW1vblN1ZmZpeCh0ZXh0X2luc2VydCwgdGV4dF9kZWxldGUpO1xuICAgICAgICAgICAgaWYgKGNvbW1vbmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICBkaWZmc1twb2ludGVyXVsxXSA9IHRleHRfaW5zZXJ0LnN1YnN0cmluZyh0ZXh0X2luc2VydC5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgY29tbW9ubGVuZ3RoKSArIGRpZmZzW3BvaW50ZXJdWzFdO1xuICAgICAgICAgICAgICB0ZXh0X2luc2VydCA9IHRleHRfaW5zZXJ0LnN1YnN0cmluZygwLCB0ZXh0X2luc2VydC5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgY29tbW9ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgdGV4dF9kZWxldGUgPSB0ZXh0X2RlbGV0ZS5zdWJzdHJpbmcoMCwgdGV4dF9kZWxldGUubGVuZ3RoIC1cbiAgICAgICAgICAgICAgICAgIGNvbW1vbmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIERlbGV0ZSB0aGUgb2ZmZW5kaW5nIHJlY29yZHMgYW5kIGFkZCB0aGUgbWVyZ2VkIG9uZXMuXG4gICAgICAgICAgaWYgKGNvdW50X2RlbGV0ZSA9PT0gMCkge1xuICAgICAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgLSBjb3VudF9pbnNlcnQsXG4gICAgICAgICAgICAgICAgY291bnRfZGVsZXRlICsgY291bnRfaW5zZXJ0LCBbRElGRl9JTlNFUlQsIHRleHRfaW5zZXJ0XSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb3VudF9pbnNlcnQgPT09IDApIHtcbiAgICAgICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyIC0gY291bnRfZGVsZXRlLFxuICAgICAgICAgICAgICAgIGNvdW50X2RlbGV0ZSArIGNvdW50X2luc2VydCwgW0RJRkZfREVMRVRFLCB0ZXh0X2RlbGV0ZV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciAtIGNvdW50X2RlbGV0ZSAtIGNvdW50X2luc2VydCxcbiAgICAgICAgICAgICAgICBjb3VudF9kZWxldGUgKyBjb3VudF9pbnNlcnQsIFtESUZGX0RFTEVURSwgdGV4dF9kZWxldGVdLFxuICAgICAgICAgICAgICAgIFtESUZGX0lOU0VSVCwgdGV4dF9pbnNlcnRdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9pbnRlciA9IHBvaW50ZXIgLSBjb3VudF9kZWxldGUgLSBjb3VudF9pbnNlcnQgK1xuICAgICAgICAgICAgICAgICAgICAoY291bnRfZGVsZXRlID8gMSA6IDApICsgKGNvdW50X2luc2VydCA/IDEgOiAwKSArIDE7XG4gICAgICAgIH0gZWxzZSBpZiAocG9pbnRlciAhPT0gMCAmJiBkaWZmc1twb2ludGVyIC0gMV1bMF0gPT0gRElGRl9FUVVBTCkge1xuICAgICAgICAgIC8vIE1lcmdlIHRoaXMgZXF1YWxpdHkgd2l0aCB0aGUgcHJldmlvdXMgb25lLlxuICAgICAgICAgIGRpZmZzW3BvaW50ZXIgLSAxXVsxXSArPSBkaWZmc1twb2ludGVyXVsxXTtcbiAgICAgICAgICBkaWZmcy5zcGxpY2UocG9pbnRlciwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9pbnRlcisrO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50X2luc2VydCA9IDA7XG4gICAgICAgIGNvdW50X2RlbGV0ZSA9IDA7XG4gICAgICAgIHRleHRfZGVsZXRlID0gJyc7XG4gICAgICAgIHRleHRfaW5zZXJ0ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoZGlmZnNbZGlmZnMubGVuZ3RoIC0gMV1bMV0gPT09ICcnKSB7XG4gICAgZGlmZnMucG9wKCk7ICAvLyBSZW1vdmUgdGhlIGR1bW15IGVudHJ5IGF0IHRoZSBlbmQuXG4gIH1cblxuICAvLyBTZWNvbmQgcGFzczogbG9vayBmb3Igc2luZ2xlIGVkaXRzIHN1cnJvdW5kZWQgb24gYm90aCBzaWRlcyBieSBlcXVhbGl0aWVzXG4gIC8vIHdoaWNoIGNhbiBiZSBzaGlmdGVkIHNpZGV3YXlzIHRvIGVsaW1pbmF0ZSBhbiBlcXVhbGl0eS5cbiAgLy8gZS5nOiBBPGlucz5CQTwvaW5zPkMgLT4gPGlucz5BQjwvaW5zPkFDXG4gIHZhciBjaGFuZ2VzID0gZmFsc2U7XG4gIHBvaW50ZXIgPSAxO1xuICAvLyBJbnRlbnRpb25hbGx5IGlnbm9yZSB0aGUgZmlyc3QgYW5kIGxhc3QgZWxlbWVudCAoZG9uJ3QgbmVlZCBjaGVja2luZykuXG4gIHdoaWxlIChwb2ludGVyIDwgZGlmZnMubGVuZ3RoIC0gMSkge1xuICAgIGlmIChkaWZmc1twb2ludGVyIC0gMV1bMF0gPT0gRElGRl9FUVVBTCAmJlxuICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMF0gPT0gRElGRl9FUVVBTCkge1xuICAgICAgLy8gVGhpcyBpcyBhIHNpbmdsZSBlZGl0IHN1cnJvdW5kZWQgYnkgZXF1YWxpdGllcy5cbiAgICAgIGlmIChkaWZmc1twb2ludGVyXVsxXS5zdWJzdHJpbmcoZGlmZnNbcG9pbnRlcl1bMV0ubGVuZ3RoIC1cbiAgICAgICAgICBkaWZmc1twb2ludGVyIC0gMV1bMV0ubGVuZ3RoKSA9PSBkaWZmc1twb2ludGVyIC0gMV1bMV0pIHtcbiAgICAgICAgLy8gU2hpZnQgdGhlIGVkaXQgb3ZlciB0aGUgcHJldmlvdXMgZXF1YWxpdHkuXG4gICAgICAgIGRpZmZzW3BvaW50ZXJdWzFdID0gZGlmZnNbcG9pbnRlciAtIDFdWzFdICtcbiAgICAgICAgICAgIGRpZmZzW3BvaW50ZXJdWzFdLnN1YnN0cmluZygwLCBkaWZmc1twb2ludGVyXVsxXS5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgLSAxXVsxXS5sZW5ndGgpO1xuICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV0gPSBkaWZmc1twb2ludGVyIC0gMV1bMV0gKyBkaWZmc1twb2ludGVyICsgMV1bMV07XG4gICAgICAgIGRpZmZzLnNwbGljZShwb2ludGVyIC0gMSwgMSk7XG4gICAgICAgIGNoYW5nZXMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChkaWZmc1twb2ludGVyXVsxXS5zdWJzdHJpbmcoMCwgZGlmZnNbcG9pbnRlciArIDFdWzFdLmxlbmd0aCkgPT1cbiAgICAgICAgICBkaWZmc1twb2ludGVyICsgMV1bMV0pIHtcbiAgICAgICAgLy8gU2hpZnQgdGhlIGVkaXQgb3ZlciB0aGUgbmV4dCBlcXVhbGl0eS5cbiAgICAgICAgZGlmZnNbcG9pbnRlciAtIDFdWzFdICs9IGRpZmZzW3BvaW50ZXIgKyAxXVsxXTtcbiAgICAgICAgZGlmZnNbcG9pbnRlcl1bMV0gPVxuICAgICAgICAgICAgZGlmZnNbcG9pbnRlcl1bMV0uc3Vic3RyaW5nKGRpZmZzW3BvaW50ZXIgKyAxXVsxXS5sZW5ndGgpICtcbiAgICAgICAgICAgIGRpZmZzW3BvaW50ZXIgKyAxXVsxXTtcbiAgICAgICAgZGlmZnMuc3BsaWNlKHBvaW50ZXIgKyAxLCAxKTtcbiAgICAgICAgY2hhbmdlcyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHBvaW50ZXIrKztcbiAgfVxuICAvLyBJZiBzaGlmdHMgd2VyZSBtYWRlLCB0aGUgZGlmZiBuZWVkcyByZW9yZGVyaW5nIGFuZCBhbm90aGVyIHNoaWZ0IHN3ZWVwLlxuICBpZiAoY2hhbmdlcykge1xuICAgIGRpZmZfY2xlYW51cE1lcmdlKGRpZmZzKTtcbiAgfVxufTtcblxuXG52YXIgZGlmZiA9IGRpZmZfbWFpbjtcbmRpZmYuSU5TRVJUID0gRElGRl9JTlNFUlQ7XG5kaWZmLkRFTEVURSA9IERJRkZfREVMRVRFO1xuZGlmZi5FUVVBTCA9IERJRkZfRVFVQUw7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmO1xuIl19
