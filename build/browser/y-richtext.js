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
        var cursor, fun;
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
      position = backend(deltas.ops);
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
var BaseClass, Editors, Locker, YRichText, misc,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

misc = require("./misc.coffee");

BaseClass = misc.BaseClass;

Locker = misc.Locker;

Editors = require("./editors.coffee");

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
  }

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
    this.editor.observeLocalText(this.passDeltas);
    this.bindEventsToEditor(this.editor);
    this.editor.observeLocalCursor(this.updateCursorPosition);
    return this._model.connector.receive_handlers.unshift((function(_this) {
      return function() {
        return _this.editor.checkUpdate();
      };
    })(this));
  };

  YRichText.prototype.getDelta = function() {
    var deltas, expected_pos, sel, selection_length, selections, text_content, unselected_insert_content, _i, _len, _ref;
    text_content = this._model.getContent('characters').val();
    expected_pos = 0;
    deltas = [];
    selections = this._model.getContent("selections");
    _ref = selections.getSelections(this._model.getContent("characters"));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sel = _ref[_i];
      selection_length = sel.to - sel.from + 1;
      if (expected_pos !== sel.from) {
        unselected_insert_content = text_content.splice(0, sel.from - expected_pos).join('');
        deltas.push({
          insert: unselected_insert_content
        });
        expected_pos += unselected_insert_content.length;
      }
      if (expected_pos !== sel.from) {
        throw new Error("This portion of code must not be reached in getDelta!");
      }
      deltas.push({
        insert: text_content.splice(0, selection_length).join(''),
        attributes: sel.attrs
      });
      expected_pos += selection_length;
    }
    if (text_content.length > 0) {
      deltas.push({
        insert: text_content.join('')
      });
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
        this.passDeltas(editor.getContents());
        this.bind(editor);
        delete this._bind_later;
      }
      this._model.observe(this.propagateToEditor);
    }
    return this._model;
  };

  YRichText.prototype._setModel = function(model) {
    return YRichText.__super__._setModel.apply(this, arguments);
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
        var delta, position, _i, _len, _results;
        position = 0;
        _results = [];
        for (_i = 0, _len = deltas.length; _i < _len; _i++) {
          delta = deltas[_i];
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
            delta = {
              ops: []
            };
            if (event.position > 0) {
              delta.ops.push({
                retain: event.position
              });
            }
            if (event.type === "insert") {
              delta.ops.push({
                insert: event.value
              });
            } else if (event.type === "delete") {
              delta.ops.push({
                "delete": 1
              });
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
            _this.editor.updateContents(delta);
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
          return _this.editor.updateContents({
            ops: [
              {
                retain: retain
              }, {
                retain: selection_length,
                attributes: attrs
              }
            ]
          });
        });
      };
    })(this));
    this._model.getContent("cursors").observe((function(_this) {
      return function(events) {
        return _this.locker["try"](function() {
          var author, event, params, position, ref_to_char, _i, _len;
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
                text: author,
                color: "grey"
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
    var content_array, delta_selections, delta_unselections, from, insert_content, n, retain, selections, to, v, _ref;
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


},{"./editors.coffee":1,"./misc.coffee":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9lZGl0b3JzLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9taXNjLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi95LXJpY2h0ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEseUNBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBO0FBTWUsRUFBQSx3QkFBRSxNQUFGLEdBQUE7QUFDWCxJQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBZCxDQURXO0VBQUEsQ0FBYjs7QUFBQSwyQkFJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQUssVUFBVSxJQUFBLEtBQUEsQ0FBTSxjQUFOLENBQVYsQ0FBTDtFQUFBLENBSmIsQ0FBQTs7QUFBQSwyQkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQU0sVUFBVSxJQUFBLEtBQUEsQ0FBTSxjQUFOLENBQVYsQ0FBTjtFQUFBLENBUFgsQ0FBQTs7QUFBQSwyQkFjQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFBVyxVQUFVLElBQUEsS0FBQSxDQUFNLGNBQU4sQ0FBVixDQUFYO0VBQUEsQ0FkWCxDQUFBOztBQUFBLDJCQWVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFB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RCxRQUF2RCxFQUFpRSxhQUFqRSxFQURhO0VBQUEsQ0F4UmYsQ0FBQTs7QUFBQSxFQTJSQSxZQUFBLEdBQWUsU0FBQyxPQUFELEVBQVUsUUFBVixFQUFvQixNQUFwQixHQUFBOztNQUFvQixTQUFTO0tBQzFDO1dBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFmLENBQTBCLFlBQTFCLENBQXVDLENBQUMsUUFBRCxDQUF2QyxDQUErQyxRQUEvQyxFQUF5RCxNQUF6RCxFQURhO0VBQUEsQ0EzUmYsQ0FBQTs7bUJBQUE7O0dBSnNCLFVBWnhCLENBQUE7O0FBOFNBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLElBQUcsZ0JBQUg7QUFDRSxJQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBVCxHQUFvQixTQUFwQixDQURGO0dBQUEsTUFBQTtBQUdFLFVBQVUsSUFBQSxLQUFBLENBQU0sMEJBQU4sQ0FBVixDQUhGO0dBREY7Q0E5U0E7O0FBb1RBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQWpCLENBREY7Q0FwVEEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibWlzYyA9IHJlcXVpcmUoXCIuL21pc2MuY29mZmVlXCIpXG5cbiMgYSBnZW5lcmljIGVkaXRvciBjbGFzc1xuY2xhc3MgQWJzdHJhY3RFZGl0b3JcbiAgIyBjcmVhdGUgYW4gZWRpdG9yIGluc3RhbmNlXG4gICMgQHBhcmFtIGluc3RhbmNlIFtFZGl0b3JdIHRoZSBlZGl0b3Igb2JqZWN0XG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBAbG9ja2VyID0gbmV3IG1pc2MuTG9ja2VyKClcblxuICAjIGdldCB0aGUgY3VycmVudCBjb250ZW50IGFzIGEgb3QtZGVsdGFcbiAgZ2V0Q29udGVudHM6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIGdldCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb25cbiAgZ2V0Q3Vyc29yOiAoKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuICAjIHNldCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb25cbiAgIyBAcGFyYW0gcGFyYW0gW09wdGlvbl0gdGhlIG9wdGlvbnNcbiAgIyBAb3B0aW9uIHBhcmFtIFtJbnRlZ2VyXSBpZCB0aGUgaWQgb2YgdGhlIGF1dGhvclxuICAjIEBvcHRpb24gcGFyYW0gW0ludGVnZXJdIGluZGV4IHRoZSBpbmRleCBvZiB0aGUgY3Vyc29yXG4gICMgQG9wdGlvbiBwYXJhbSBbU3RyaW5nXSB0ZXh0IHRoZSB0ZXh0IG9mIHRoZSBjdXJzb3JcbiAgIyBAb3B0aW9uIHBhcmFtIFtTdHJpbmddIGNvbG9yIHRoZSBjb2xvciBvZiB0aGUgY3Vyc29yXG4gIHNldEN1cnNvcjogKHBhcmFtKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuICByZW1vdmVDdXJzb3I6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuXG4gICMgcmVtb3ZlIGEgY3Vyc29yXG4gICMgQHBhcmFtIGlkIFtTdHJpbmddIHRoZSBpZCBvZiB0aGUgY3Vyc29yIHRvIHJlbW92ZVxuICByZW1vdmVDdXJzb3I6IChpZCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIGRlc2NyaWJlIGhvdyB0byBwYXNzIGxvY2FsIG1vZGlmaWNhdGlvbnMgb2YgdGhlIHRleHQgdG8gdGhlIGJhY2tlbmQuXG4gICMgQHBhcmFtIGJhY2tlbmQgW0Z1bmN0aW9uXSB0aGUgZnVuY3Rpb24gdG8gcGFzcyB0aGUgZGVsdGEgdG9cbiAgIyBAbm90ZSBUaGUgYmFja2VuZCBmdW5jdGlvbiB0YWtlcyBhIGxpc3Qgb2YgZGVsdGFzIGFzIGFyZ3VtZW50XG4gIG9ic2VydmVMb2NhbFRleHQ6IChiYWNrZW5kKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgZGVzY3JpYmUgaG93IHRvIHBhc3MgbG9jYWwgbW9kaWZpY2F0aW9ucyBvZiB0aGUgY3Vyc29yIHRvIHRoZSBiYWNrZW5kXG4gICMgQHBhcmFtIGJhY2tlbmQgW0Z1bmN0aW9uXSB0aGUgZnVuY3Rpb24gdG8gcGFzcyB0aGUgbmV3IHBvc2l0aW9uIHRvXG4gICMgQG5vdGUgdGhlIGJhY2tlbmQgZnVuY3Rpb24gdGFrZXMgYSBwb3NpdGlvbiBhcyBhcmd1bWVudFxuICBvYnNlcnZlTG9jYWxDdXJzb3I6IChiYWNrZW5kKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgQXBwbHkgZGVsdGEgb24gdGhlIGVkaXRvclxuICAjIEBwYXJhbSBkZWx0YSBbRGVsdGFdIHRoZSBkZWx0YSB0byBwcm9wYWdhdGUgdG8gdGhlIGVkaXRvclxuICAjIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL290dHlwZXMvcmljaC10ZXh0XG4gIHVwZGF0ZUNvbnRlbnRzOiAoZGVsdGEpIC0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBSZW1vdmUgb2xkIGNvbnRlbnQgYW5kIGFwcGx5IGRlbHRhIG9uIHRoZSBlZGl0b3JcbiAgIyBAcGFyYW0gZGVsdGEgW0RlbHRhXSB0aGUgZGVsdGEgdG8gcHJvcGFnYXRlIHRvIHRoZSBlZGl0b3JcbiAgIyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vdHR5cGVzL3JpY2gtdGV4dFxuICBzZXRDb250ZW50czogKGRlbHRhKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgUmV0dXJuIHRoZSBlZGl0b3IgaW5zdGFuY2VcbiAgZ2V0RWRpdG9yOiAoKS0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBDaGVjayBpZiB0aGUgZWRpdG9yIHRyaWVzIHRvIGFjY3VtdWxhdGUgbWVzc2FnZXMuIFRoaXMgaXMgZXhlY3V0ZWQgZXZlcnkgdGltZSBiZWZvcmUgWWpzIGV4ZWN1dGVzIGEgbWVzc2FnZXNcbiAgY2hlY2tVcGRhdGU6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuY2xhc3MgUXVpbGxKcyBleHRlbmRzIEFic3RyYWN0RWRpdG9yXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIHN1cGVyIEBlZGl0b3JcbiAgICBAX2N1cnNvcnMgPSBAZWRpdG9yLmdldE1vZHVsZShcIm11bHRpLWN1cnNvclwiKVxuXG4gICMgUmV0dXJuIHRoZSBsZW5ndGggb2YgdGhlIHRleHRcbiAgZ2V0TGVuZ3RoOiAoKS0+XG4gICAgQGVkaXRvci5nZXRMZW5ndGgoKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uKClcbiAgICBpZiBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvbi5zdGFydFxuICAgIGVsc2VcbiAgICAgIDBcblxuICBnZXRDb250ZW50czogKCktPlxuICAgIEBlZGl0b3IuZ2V0Q29udGVudHMoKS5vcHNcblxuICBzZXRDdXJzb3I6IChwYXJhbSkgLT4gQGxvY2tlci50cnkgKCk9PlxuICAgIGN1cnNvciA9IEBfY3Vyc29ycy5jdXJzb3JzW3BhcmFtLmlkXVxuICAgIGlmIGN1cnNvcj8gYW5kIGN1cnNvci5jb2xvciA9PSBwYXJhbS5jb2xvclxuICAgICAgZnVuID0gKGluZGV4KSA9PlxuICAgICAgICBAX2N1cnNvcnMubW92ZUN1cnNvciBwYXJhbS5pZCwgaW5kZXhcbiAgICBlbHNlXG4gICAgICBpZiBjdXJzb3I/IGFuZCBjdXJzb3IuY29sb3I/IGFuZCBjdXJzb3IuY29sb3IgIT0gcGFyYW0uY29sb3JcbiAgICAgICAgQHJlbW92ZUN1cnNvciBwYXJhbS5pZFxuXG4gICAgICBmdW4gPSAoaW5kZXgpID0+XG4gICAgICAgIEBfY3Vyc29ycy5zZXRDdXJzb3IocGFyYW0uaWQsIGluZGV4LFxuICAgICAgICAgIHBhcmFtLnRleHQsIHBhcmFtLmNvbG9yKVxuXG4gICAgaWYgcGFyYW0uaW5kZXg/XG4gICAgICBmdW4gcGFyYW0uaW5kZXhcblxuICByZW1vdmVDdXJzb3I6IChpZCkgLT5cbiAgICBAX2N1cnNvcnMucmVtb3ZlQ3Vyc29yKGlkKVxuXG4gIHJlbW92ZUN1cnNvcjogKGlkKS0+XG4gICAgICBAX2N1cnNvcnMucmVtb3ZlQ3Vyc29yIGlkXG5cbiAgb2JzZXJ2ZUxvY2FsVGV4dDogKGJhY2tlbmQpLT5cbiAgICBAZWRpdG9yLm9uIFwidGV4dC1jaGFuZ2VcIiwgKGRlbHRhcywgc291cmNlKSAtPlxuICAgICAgIyBjYWxsIHRoZSBiYWNrZW5kIHdpdGggZGVsdGFzXG4gICAgICBwb3NpdGlvbiA9IGJhY2tlbmQgZGVsdGFzLm9wc1xuICAgICAgIyB0cmlnZ2VyIGFuIGV4dHJhIGV2ZW50IHRvIG1vdmUgY3Vyc29yIHRvIHBvc2l0aW9uIG9mIGluc2VydGVkIHRleHRcbiAgICAgIEBlZGl0b3Iuc2VsZWN0aW9uLmVtaXR0ZXIuZW1pdChcbiAgICAgICAgQGVkaXRvci5zZWxlY3Rpb24uZW1pdHRlci5jb25zdHJ1Y3Rvci5ldmVudHMuU0VMRUNUSU9OX0NIQU5HRSxcbiAgICAgICAgQGVkaXRvci5xdWlsbC5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgXCJ1c2VyXCIpXG5cbiAgb2JzZXJ2ZUxvY2FsQ3Vyc29yOiAoYmFja2VuZCkgLT5cbiAgICBAZWRpdG9yLm9uIFwic2VsZWN0aW9uLWNoYW5nZVwiLCAocmFuZ2UsIHNvdXJjZSktPlxuICAgICAgaWYgcmFuZ2UgYW5kIHJhbmdlLnN0YXJ0ID09IHJhbmdlLmVuZFxuICAgICAgICBiYWNrZW5kIHJhbmdlLnN0YXJ0XG5cbiAgdXBkYXRlQ29udGVudHM6IChkZWx0YSktPlxuICAgIEBlZGl0b3IudXBkYXRlQ29udGVudHMgZGVsdGFcblxuXG4gIHNldENvbnRlbnRzOiAoZGVsdGEpLT5cbiAgICBAZWRpdG9yLnNldENvbnRlbnRzKGRlbHRhKVxuXG4gIGdldEVkaXRvcjogKCktPlxuICAgIEBlZGl0b3JcblxuICBjaGVja1VwZGF0ZTogKCktPlxuICAgIEBlZGl0b3IuZWRpdG9yLmNoZWNrVXBkYXRlKClcblxuY2xhc3MgVGVzdEVkaXRvciBleHRlbmRzIEFic3RyYWN0RWRpdG9yXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIHN1cGVyXG5cbiAgZ2V0TGVuZ3RoOigpIC0+XG4gICAgMFxuXG4gIGdldEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIDBcblxuICBnZXRDb250ZW50czogKCkgLT5cbiAgICBvcHM6IFt7aW5zZXJ0OiBcIldlbGwsIHRoaXMgaXMgYSB0ZXN0IVwifVxuICAgICAge2luc2VydDogXCJBbmQgSSdtIGJvbGTigKZcIiwgYXR0cmlidXRlczoge2JvbGQ6dHJ1ZX19XVxuXG4gIHNldEN1cnNvcjogKCkgLT5cbiAgICBcIlwiXG5cbiAgb2JzZXJ2ZUxvY2FsVGV4dDooYmFja2VuZCkgLT5cbiAgICBcIlwiXG5cbiAgb2JzZXJ2ZUxvY2FsQ3Vyc29yOiAoYmFja2VuZCkgLT5cbiAgICBcIlwiXG5cbiAgdXBkYXRlQ29udGVudHM6IChkZWx0YSkgLT5cbiAgICBcIlwiXG5cbiAgc2V0Q29udGVudHM6IChkZWx0YSktPlxuICAgIFwiXCJcblxuICBnZXRFZGl0b3I6ICgpLT5cbiAgICBAZWRpdG9yXG5cbmV4cG9ydHMuUXVpbGxKcyA9IFF1aWxsSnNcbmV4cG9ydHMuVGVzdEVkaXRvciA9IFRlc3RFZGl0b3JcbmV4cG9ydHMuQWJzdHJhY3RFZGl0b3IgPSBBYnN0cmFjdEVkaXRvclxuIiwiY2xhc3MgTG9ja2VyXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBpc19sb2NrZWQgPSBmYWxzZVxuXG4gIHRyeTogKGZ1bikgLT5cbiAgICBpZiBAaXNfbG9ja2VkXG4gICAgICByZXR1cm5cblxuICAgIEBpc19sb2NrZWQgPSB0cnVlXG4gICAgcmV0ID0gZG8gZnVuXG4gICAgQGlzX2xvY2tlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHJldFxuXG4jIGEgYmFzaWMgY2xhc3Mgd2l0aCBnZW5lcmljIGdldHRlciAvIHNldHRlciBmdW5jdGlvblxuY2xhc3MgQmFzZUNsYXNzXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgb3duUHJvcGVydHkgaXMgdW5zYWZlLiBSYXRoZXIgcHV0IGl0IG9uIGEgZGVkaWNhdGVkIHByb3BlcnR5IGxpa2UuLlxuICAgIEBfdG1wX21vZGVsID0ge31cblxuICAjIFRyeSB0byBmaW5kIHRoZSBwcm9wZXJ0eSBpbiBAX21vZGVsLCBlbHNlIHJldHVybiB0aGVcbiAgIyB0bXBfbW9kZWxcbiAgX2dldDogKHByb3ApIC0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBAX3RtcF9tb2RlbFtwcm9wXVxuICAgIGVsc2VcbiAgICAgIEBfbW9kZWwudmFsKHByb3ApXG4gICMgVHJ5IHRvIHNldCB0aGUgcHJvcGVydHkgaW4gQF9tb2RlbCwgZWxzZSBzZXQgdGhlXG4gICMgdG1wX21vZGVsXG4gIF9zZXQ6IChwcm9wLCB2YWwpIC0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBAX3RtcF9tb2RlbFtwcm9wXSA9IHZhbFxuICAgIGVsc2VcbiAgICAgIEBfbW9kZWwudmFsKHByb3AsIHZhbClcblxuICAjIHNpbmNlIHdlIGFscmVhZHkgYXNzdW1lIHRoYXQgYW55IGluc3RhbmNlIG9mIEJhc2VDbGFzcyB1c2VzIGEgTWFwTWFuYWdlclxuICAjIFdlIGNhbiBjcmVhdGUgaXQgaGVyZSwgdG8gc2F2ZSBsaW5lcyBvZiBjb2RlXG4gIF9nZXRNb2RlbDogKFksIE9wZXJhdGlvbiktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgQF9tb2RlbCA9IG5ldyBPcGVyYXRpb24uTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIGZvciBrZXksIHZhbHVlIG9mIEBfdG1wX21vZGVsXG4gICAgICAgIEBfbW9kZWwudmFsKGtleSwgdmFsdWUpXG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBkZWxldGUgQF90bXBfbW9kZWxcblxuaWYgbW9kdWxlP1xuICBleHBvcnRzLkJhc2VDbGFzcyA9IEJhc2VDbGFzc1xuICBleHBvcnRzLkxvY2tlciA9IExvY2tlclxuIiwibWlzYyA9IChyZXF1aXJlIFwiLi9taXNjLmNvZmZlZVwiKVxuQmFzZUNsYXNzID0gbWlzYy5CYXNlQ2xhc3NcbkxvY2tlciA9IG1pc2MuTG9ja2VyXG5FZGl0b3JzID0gKHJlcXVpcmUgXCIuL2VkaXRvcnMuY29mZmVlXCIpXG5cbiMgQWxsIGRlcGVuZGVuY2llcyAobGlrZSBZLlNlbGVjdGlvbnMpIHRvIG90aGVyIHR5cGVzICh0aGF0IGhhdmUgaXRzIG93blxuIyByZXBvc2l0b3J5KSBzaG91bGQgIGJlIGluY2x1ZGVkIGJ5IHRoZSB1c2VyIChpbiBvcmRlciB0byByZWR1Y2UgdGhlIGFtb3VudCBvZlxuIyBkb3dubG9hZGVkIGNvbnRlbnQpLlxuIyBXaXRoIGh0bWw1IGltcG9ydHMsIHdlIGNhbiBpbmNsdWRlIGl0IGF1dG9tYXRpY2FsbHkgdG9vLiBCdXQgd2l0aCB0aGUgb2xkXG4jIHNjcmlwdCB0YWdzIHRoaXMgaXMgdGhlIGJlc3Qgc29sdXRpb24gdGhhdCBjYW1lIHRvIG15IG1pbmQuXG5cbiMgQSBjbGFzcyBob2xkaW5nIHRoZSBpbmZvcm1hdGlvbiBhYm91dCByaWNoIHRleHRcbmNsYXNzIFlSaWNoVGV4dCBleHRlbmRzIEJhc2VDbGFzc1xuICAjIEBwYXJhbSBjb250ZW50IFtTdHJpbmddIGFuIGluaXRpYWwgc3RyaW5nXG4gICMgQHBhcmFtIGVkaXRvciBbRWRpdG9yXSBhbiBlZGl0b3IgaW5zdGFuY2VcbiAgIyBAcGFyYW0gYXV0aG9yIFtTdHJpbmddIHRoZSBuYW1lIG9mIHRoZSBsb2NhbCBhdXRob3JcbiAgY29uc3RydWN0b3I6IChlZGl0b3JfbmFtZSwgZWRpdG9yX2luc3RhbmNlKSAtPlxuICAgIEBsb2NrZXIgPSBuZXcgTG9ja2VyKClcblxuICAgIGlmIGVkaXRvcl9uYW1lPyBhbmQgZWRpdG9yX2luc3RhbmNlP1xuICAgICAgQF9iaW5kX2xhdGVyID1cbiAgICAgICAgbmFtZTogZWRpdG9yX25hbWVcbiAgICAgICAgaW5zdGFuY2U6IGVkaXRvcl9pbnN0YW5jZVxuXG4gICAgIyBUT0RPOiBnZW5lcmF0ZSBhIFVJRCAoeW91IGNhbiBnZXQgYSB1bmlxdWUgaWQgYnkgY2FsbGluZ1xuICAgICMgYEBfbW9kZWwuZ2V0VWlkKClgIC0gaXMgdGhpcyB3aGF0IHlvdSBtZWFuPylcbiAgICAjIEBhdXRob3IgPSBhdXRob3JcbiAgICAjIFRPRE86IGFzc2lnbiBhbiBpZCAvIGF1dGhvciBuYW1lIHRvIHRoZSByaWNoIHRleHQgaW5zdGFuY2UgZm9yIGF1dGhvcnNoaXBcblxuICAjXG4gICMgQmluZCB0aGUgUmljaFRleHQgdHlwZSB0byBhIHJpY2ggdGV4dCBlZGl0b3IgKGUuZy4gcXVpbGxqcylcbiAgI1xuICBiaW5kOiAoKS0+XG4gICAgIyBUT0RPOiBiaW5kIHRvIG11bHRpcGxlIGVkaXRvcnNcbiAgICBpZiBhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBFZGl0b3JzLkFic3RyYWN0RWRpdG9yXG4gICAgICAjIGlzIGFscmVhZHkgYW4gZWRpdG9yIVxuICAgICAgQGVkaXRvciA9IGFyZ3VtZW50c1swXVxuICAgIGVsc2VcbiAgICAgIFtlZGl0b3JfbmFtZSwgZWRpdG9yX2luc3RhbmNlXSA9IGFyZ3VtZW50c1xuICAgICAgaWYgQGVkaXRvcj8gYW5kIEBlZGl0b3IuZ2V0RWRpdG9yKCkgaXMgZWRpdG9yX2luc3RhbmNlXG4gICAgICAgICMgcmV0dXJuLCBpZiBAZWRpdG9yIGlzIGFscmVhZHkgYm91bmQhIChuZXZlciBiaW5kIHR3aWNlISlcbiAgICAgICAgcmV0dXJuXG4gICAgICBFZGl0b3IgPSBFZGl0b3JzW2VkaXRvcl9uYW1lXVxuICAgICAgaWYgRWRpdG9yP1xuICAgICAgICBAZWRpdG9yID0gbmV3IEVkaXRvciBlZGl0b3JfaW5zdGFuY2VcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyB0eXBlIG9mIGVkaXRvciBpcyBub3Qgc3VwcG9ydGVkISAoXCIgK1xuICAgICAgICAgIGVkaXRvcl9uYW1lICsgXCIpXCJcblxuICAgICMgVE9ETzogcGFyc2UgdGhlIGZvbGxvd2luZyBkaXJlY3RseSBmcm9tICRjaGFyYWN0ZXJzKyRzZWxlY3Rpb25zIChpbiBPKG4pKVxuICAgIEBlZGl0b3Iuc2V0Q29udGVudHNcbiAgICAgIG9wczogQGdldERlbHRhKClcblxuICAgICMgYmluZCB0aGUgcmVzdC4uXG4gICAgIyBUT0RPOiByZW1vdmUgb2JzZXJ2ZXJzLCB3aGVuIGVkaXRvciBpcyBvdmVyd3JpdHRlblxuICAgIEBlZGl0b3Iub2JzZXJ2ZUxvY2FsVGV4dCBAcGFzc0RlbHRhc1xuICAgIEBiaW5kRXZlbnRzVG9FZGl0b3IgQGVkaXRvclxuICAgIEBlZGl0b3Iub2JzZXJ2ZUxvY2FsQ3Vyc29yIEB1cGRhdGVDdXJzb3JQb3NpdGlvblxuXG4gICAgIyBwdWxsIGNoYW5nZXMgZnJvbSBxdWlsbCwgYmVmb3JlIG1lc3NhZ2UgaXMgcmVjZWl2ZWRcbiAgICAjIGFzIHN1Z2dlc3RlZCBodHRwczovL2Rpc2N1c3MucXVpbGxqcy5jb20vdC9wcm9ibGVtcy1pbi1jb2xsYWJvcmF0aXZlLWltcGxlbWVudGF0aW9uLzI1OFxuICAgICMgVE9ETzogbW92ZSB0aGlzIHRvIEVkaXRvcnMuY29mZmVlXG4gICAgQF9tb2RlbC5jb25uZWN0b3IucmVjZWl2ZV9oYW5kbGVycy51bnNoaWZ0ICgpPT5cbiAgICAgIEBlZGl0b3IuY2hlY2tVcGRhdGUoKVxuXG5cbiAgZ2V0RGVsdGE6ICgpLT5cbiAgICB0ZXh0X2NvbnRlbnQgPSBAX21vZGVsLmdldENvbnRlbnQoJ2NoYXJhY3RlcnMnKS52YWwoKVxuICAgICMgdHJhbnNmb3JtIFkuU2VsZWN0aW9ucy5nZXRTZWxlY3Rpb25zKCkgdG8gYSBkZWx0YVxuICAgIGV4cGVjdGVkX3BvcyA9IDBcbiAgICBkZWx0YXMgPSBbXVxuICAgIHNlbGVjdGlvbnMgPSBAX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpXG4gICAgZm9yIHNlbCBpbiBzZWxlY3Rpb25zLmdldFNlbGVjdGlvbnMoQF9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKSlcbiAgICAgICMgKCsxKSwgYmVjYXVzZSBpZiB3ZSBzZWxlY3QgZnJvbSAxIHRvIDEgKHdpdGggeS1zZWxlY3Rpb25zKSwgdGhlbiB0aGVcbiAgICAgICMgbGVuZ3RoIGlzIDFcbiAgICAgIHNlbGVjdGlvbl9sZW5ndGggPSBzZWwudG8gLSBzZWwuZnJvbSArIDFcbiAgICAgIGlmIGV4cGVjdGVkX3BvcyBpc250IHNlbC5mcm9tXG4gICAgICAgICMgVGhlcmUgaXMgdW5zZWxlY3RlZCB0ZXh0LiAkcmV0YWluIHRvIHRoZSBuZXh0IHNlbGVjdGlvblxuICAgICAgICB1bnNlbGVjdGVkX2luc2VydF9jb250ZW50ID0gdGV4dF9jb250ZW50LnNwbGljZShcbiAgICAgICAgICAwLCBzZWwuZnJvbS1leHBlY3RlZF9wb3MgKVxuICAgICAgICAgIC5qb2luKCcnKVxuICAgICAgICBkZWx0YXMucHVzaFxuICAgICAgICAgIGluc2VydDogdW5zZWxlY3RlZF9pbnNlcnRfY29udGVudFxuICAgICAgICBleHBlY3RlZF9wb3MgKz0gdW5zZWxlY3RlZF9pbnNlcnRfY29udGVudC5sZW5ndGhcbiAgICAgIGlmIGV4cGVjdGVkX3BvcyBpc250IHNlbC5mcm9tXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgcG9ydGlvbiBvZiBjb2RlIG11c3Qgbm90IGJlIHJlYWNoZWQgaW4gZ2V0RGVsdGEhXCJcbiAgICAgIGRlbHRhcy5wdXNoXG4gICAgICAgIGluc2VydDogdGV4dF9jb250ZW50LnNwbGljZSgwLCBzZWxlY3Rpb25fbGVuZ3RoKS5qb2luKCcnKVxuICAgICAgICBhdHRyaWJ1dGVzOiBzZWwuYXR0cnNcbiAgICAgIGV4cGVjdGVkX3BvcyArPSBzZWxlY3Rpb25fbGVuZ3RoXG4gICAgaWYgdGV4dF9jb250ZW50Lmxlbmd0aCA+IDBcbiAgICAgIGRlbHRhcy5wdXNoXG4gICAgICAgIGluc2VydDogdGV4dF9jb250ZW50LmpvaW4oJycpXG4gICAgZGVsdGFzXG5cbiAgX2dldE1vZGVsOiAoWSwgT3BlcmF0aW9uKSAtPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgIyB3ZSBzYXZlIHRoaXMgc3R1ZmYgYXMgX3N0YXRpY18gY29udGVudCBub3cuXG4gICAgICAjIFRoZXJlZm9yZSwgeW91IGNhbid0IG92ZXJ3cml0ZSBpdCwgYWZ0ZXIgeW91IG9uY2Ugc2F2ZWQgaXQuXG4gICAgICAjIEJ1dCBvbiB0aGUgdXBzaWRlLCB3ZSBjYW4gYWx3YXlzIG1ha2Ugc3VyZSwgdGhhdCB0aGV5IGFyZSBkZWZpbmVkIVxuICAgICAgY29udGVudF9vcGVyYXRpb25zID1cbiAgICAgICAgc2VsZWN0aW9uczogbmV3IFkuU2VsZWN0aW9ucygpXG4gICAgICAgIGNoYXJhY3RlcnM6IG5ldyBZLkxpc3QoKVxuICAgICAgICBjdXJzb3JzOiBuZXcgWS5PYmplY3QoKVxuICAgICAgQF9tb2RlbCA9IG5ldyBPcGVyYXRpb24uTWFwTWFuYWdlcihALCBudWxsLCB7fSwgY29udGVudF9vcGVyYXRpb25zICkuZXhlY3V0ZSgpXG5cbiAgICAgIEBfc2V0TW9kZWwgQF9tb2RlbFxuXG4gICAgICBpZiBAX2JpbmRfbGF0ZXI/XG4gICAgICAgIEVkaXRvciA9IEVkaXRvcnNbQF9iaW5kX2xhdGVyLm5hbWVdXG4gICAgICAgIGlmIEVkaXRvcj9cbiAgICAgICAgICBlZGl0b3IgPSBuZXcgRWRpdG9yIEBfYmluZF9sYXRlci5pbnN0YW5jZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyB0eXBlIG9mIGVkaXRvciBpcyBub3Qgc3VwcG9ydGVkISAoXCIrZWRpdG9yX25hbWUrXCIpIC0tIGZhdGFsIGVycm9yIVwiXG4gICAgICAgIEBwYXNzRGVsdGFzIGVkaXRvci5nZXRDb250ZW50cygpXG4gICAgICAgIEBiaW5kIGVkaXRvclxuICAgICAgICBkZWxldGUgQF9iaW5kX2xhdGVyXG5cbiAgICAgICMgbGlzdGVuIHRvIGV2ZW50cyBvbiB0aGUgbW9kZWwgdXNpbmcgdGhlIGZ1bmN0aW9uIHByb3BhZ2F0ZVRvRWRpdG9yXG4gICAgICBAX21vZGVsLm9ic2VydmUgQHByb3BhZ2F0ZVRvRWRpdG9yXG4gICAgcmV0dXJuIEBfbW9kZWxcblxuICBfc2V0TW9kZWw6IChtb2RlbCkgLT5cbiAgICBzdXBlclxuXG4gIF9uYW1lOiBcIlJpY2hUZXh0XCJcblxuICBnZXRUZXh0OiAoKS0+XG4gICAgQF9tb2RlbC5nZXRDb250ZW50KCdjaGFyYWN0ZXJzJykudmFsKCkuam9pbignJylcblxuICAjIGluc2VydCBvdXIgb3duIGN1cnNvciBpbiB0aGUgY3Vyc29ycyBvYmplY3RcbiAgIyBAcGFyYW0gcG9zaXRpb24gW0ludGVnZXJdIHRoZSBwb3NpdGlvbiB3aGVyZSB0byBpbnNlcnQgaXRcbiAgc2V0Q3Vyc29yIDogKHBvc2l0aW9uKSAtPlxuICAgIEBzZWxmQ3Vyc29yID0gQF9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYocG9zaXRpb24pXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS52YWwoQF9tb2RlbC5IQi5nZXRVc2VySWQoKSwgQHNlbGZDdXJzb3IpXG5cblxuICAjIHBhc3MgZGVsdGFzIHRvIHRoZSBjaGFyYWN0ZXIgaW5zdGFuY2VcbiAgIyBAcGFyYW0gZGVsdGFzIFtBcnJheTxPYmplY3Q+XSBhbiBhcnJheSBvZiBkZWx0YXMgKHNlZSBvdC10eXBlcyBmb3IgbW9yZSBpbmZvKVxuICBwYXNzRGVsdGFzIDogKGRlbHRhcykgPT4gQGxvY2tlci50cnkgKCk9PlxuICAgIHBvc2l0aW9uID0gMFxuICAgIGZvciBkZWx0YSBpbiBkZWx0YXNcbiAgICAgIHBvc2l0aW9uID0gZGVsdGFIZWxwZXIgQCwgZGVsdGEsIHBvc2l0aW9uXG5cbiAgIyBAb3ZlcnJpZGUgdXBkYXRlQ3Vyc29yUG9zaXRpb24oaW5kZXgpXG4gICMgICB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIG91ciBjdXJzb3IgdG8gdGhlIG5ldyBvbmUgdXNpbmcgYW4gaW5kZXhcbiAgIyAgIEBwYXJhbSBpbmRleCBbSW50ZWdlcl0gdGhlIG5ldyBpbmRleFxuICAjIEBvdmVycmlkZSB1cGRhdGVDdXJzb3JQb3NpdGlvbihjaGFyYWN0ZXIpXG4gICMgICB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIG91ciBjdXJzb3IgdG8gdGhlIG5ldyBvbmUgdXNpbmcgYSBjaGFyYWN0ZXJcbiAgIyAgIEBwYXJhbSBjaGFyYWN0ZXIgW0NoYXJhY3Rlcl0gdGhlIG5ldyBjaGFyYWN0ZXJcbiAgdXBkYXRlQ3Vyc29yUG9zaXRpb24gOiAob2JqKSA9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgaWYgdHlwZW9mIG9iaiBpcyBcIm51bWJlclwiXG4gICAgICBAc2VsZkN1cnNvciA9IEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmKG9iailcbiAgICBlbHNlXG4gICAgICBAc2VsZkN1cnNvciA9IG9ialxuICAgIEBfbW9kZWwuZ2V0Q29udGVudChcImN1cnNvcnNcIikudmFsKEBfbW9kZWwuSEIuZ2V0VXNlcklkKCksIEBzZWxmQ3Vyc29yKVxuXG4gICMgZGVzY3JpYmUgaG93IHRvIHByb3BhZ2F0ZSB5anMgZXZlbnRzIHRvIHRoZSBlZGl0b3JcbiAgIyBUT0RPOiBzaG91bGQgYmUgcHJpdmF0ZSFcbiAgYmluZEV2ZW50c1RvRWRpdG9yIDogKGVkaXRvcikgLT5cbiAgICAjIHVwZGF0ZSB0aGUgZWRpdG9yIHdoZW4gc29tZXRoaW5nIG9uIHRoZSAkY2hhcmFjdGVycyBoYXBwZW5zXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5vYnNlcnZlIChldmVudHMpID0+IEBsb2NrZXIudHJ5ICgpPT5cbiAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgZGVsdGEgPVxuICAgICAgICAgIG9wczogW11cblxuICAgICAgICBpZiBldmVudC5wb3NpdGlvbiA+IDBcbiAgICAgICAgICBkZWx0YS5vcHMucHVzaCB7cmV0YWluOiBldmVudC5wb3NpdGlvbn1cblxuICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiaW5zZXJ0XCJcbiAgICAgICAgICBkZWx0YS5vcHMucHVzaCB7aW5zZXJ0OiBldmVudC52YWx1ZX1cblxuICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgIGRlbHRhLm9wcy5wdXNoIHtkZWxldGU6IDF9XG4gICAgICAgICAgIyBkZWxldGUgY3Vyc29yLCBpZiBpdCByZWZlcmVuY2VzIHRvIHRoaXMgcG9zaXRpb25cbiAgICAgICAgICBmb3IgY3Vyc29yX25hbWUsIGN1cnNvcl9yZWYgaW4gQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS52YWwoKVxuICAgICAgICAgICAgaWYgY3Vyc29yX3JlZiBpcyBldmVudC5yZWZlcmVuY2VcbiAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAjIHdlIGhhdmUgdG8gZGVsZXRlIHRoZSBjdXJzb3IgaWYgdGhlIHJlZmVyZW5jZSBkb2VzIG5vdCBleGlzdCBhbnltb3JlXG4gICAgICAgICAgICAgICMgdGhlIGRvd25zaWRlIG9mIHRoaXMgYXBwcm9hY2ggaXMgdGhhdCBldmVyeW9uZSB3aWxsIHNlbmQgdGhpcyBkZWxldGUgZXZlbnQhXG4gICAgICAgICAgICAgICMgaW4gdGhlIGZ1dHVyZSwgd2UgY291bGQgcmVwbGFjZSB0aGUgY3Vyc29ycywgd2l0aCBhIHktc2VsZWN0aW9uc1xuICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpLT5cbiAgICAgICAgICAgICAgICAgIEBfbW9kZWwuZ2V0Q29udGVudChcImN1cnNvcnNcIikuZGVsZXRlKGN1cnNvcl9uYW1lKVxuICAgICAgICAgICAgICAgICwgMClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIEBlZGl0b3IudXBkYXRlQ29udGVudHMgZGVsdGFcblxuICAgICMgdXBkYXRlIHRoZSBlZGl0b3Igd2hlbiBzb21ldGhpbmcgb24gdGhlICRzZWxlY3Rpb25zIGhhcHBlbnNcbiAgICBAX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLm9ic2VydmUgKGV2ZW50KT0+IEBsb2NrZXIudHJ5ICgpPT5cbiAgICAgIGF0dHJzID0ge31cbiAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJzZWxlY3RcIlxuICAgICAgICBmb3IgYXR0cix2YWwgb2YgZXZlbnQuYXR0cnNcbiAgICAgICAgICBhdHRyc1thdHRyXSA9IHZhbFxuICAgICAgZWxzZSAjIGlzIFwidW5zZWxlY3RcIiFcbiAgICAgICAgZm9yIGF0dHIgaW4gZXZlbnQuYXR0cnNcbiAgICAgICAgICBhdHRyc1thdHRyXSA9IG51bGxcbiAgICAgIHJldGFpbiA9IGV2ZW50LmZyb20uZ2V0UG9zaXRpb24oKVxuICAgICAgc2VsZWN0aW9uX2xlbmd0aCA9IGV2ZW50LnRvLmdldFBvc2l0aW9uKCktZXZlbnQuZnJvbS5nZXRQb3NpdGlvbigpKzFcbiAgICAgIEBlZGl0b3IudXBkYXRlQ29udGVudHNcbiAgICAgICAgb3BzOiBbXG4gICAgICAgICAge3JldGFpbjogcmV0YWlufSxcbiAgICAgICAgICB7cmV0YWluOiBzZWxlY3Rpb25fbGVuZ3RoLCBhdHRyaWJ1dGVzOiBhdHRyc31cbiAgICAgICAgXVxuXG4gICAgIyB1cGRhdGUgdGhlIGVkaXRvciB3aGVuIHRoZSBjdXJzb3IgaXMgbW92ZWRcbiAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLm9ic2VydmUgKGV2ZW50cyk9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJ1cGRhdGVcIiBvciBldmVudC50eXBlIGlzIFwiYWRkXCJcbiAgICAgICAgICBhdXRob3IgPSBldmVudC5jaGFuZ2VkQnlcbiAgICAgICAgICByZWZfdG9fY2hhciA9IGV2ZW50Lm9iamVjdC52YWwoYXV0aG9yKVxuICAgICAgICAgIGlmIHJlZl90b19jaGFyIGlzIG51bGxcbiAgICAgICAgICAgIHBvc2l0aW9uID0gQGVkaXRvci5nZXRMZW5ndGgoKVxuICAgICAgICAgIGVsc2UgaWYgcmVmX3RvX2NoYXI/XG4gICAgICAgICAgICBpZiByZWZfdG9fY2hhci5pc0RlbGV0ZWQoKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcG9zaXRpb24gPSByZWZfdG9fY2hhci5nZXRQb3NpdGlvbigpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuIFwicmVmX3RvX2NoYXIgaXMgdW5kZWZpbmVkXCJcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgcGFyYW1zID1cbiAgICAgICAgICAgIGlkOiBhdXRob3JcbiAgICAgICAgICAgIGluZGV4OiBwb3NpdGlvblxuICAgICAgICAgICAgdGV4dDogYXV0aG9yXG4gICAgICAgICAgICBjb2xvcjogXCJncmV5XCJcbiAgICAgICAgICBAZWRpdG9yLnNldEN1cnNvciBwYXJhbXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBlZGl0b3IucmVtb3ZlQ3Vyc29yIGV2ZW50Lm5hbWVcblxuICAgIEBfbW9kZWwuY29ubmVjdG9yLm9uVXNlckV2ZW50IChldmVudCk9PlxuICAgICAgaWYgZXZlbnQuYWN0aW9uIGlzIFwidXNlckxlZnRcIlxuICAgICAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLmRlbGV0ZShldmVudC51c2VyKVxuXG4gICMgQXBwbHkgYSBkZWx0YSBhbmQgcmV0dXJuIHRoZSBuZXcgcG9zaXRpb25cbiAgIyBAcGFyYW0gZGVsdGEgW09iamVjdF0gYSAqc2luZ2xlKiBkZWx0YSAoc2VlIG90LXR5cGVzIGZvciBtb3JlIGluZm8pXG4gICMgQHBhcmFtIHBvc2l0aW9uIFtJbnRlZ2VyXSBzdGFydCBwb3NpdGlvbiBmb3IgdGhlIGRlbHRhLCBkZWZhdWx0OiAwXG4gICNcbiAgIyBAcmV0dXJuIFtJbnRlZ2VyXSB0aGUgcG9zaXRpb24gb2YgdGhlIGN1cnNvciBhZnRlciBwYXJzaW5nIHRoZSBkZWx0YVxuICBkZWx0YUhlbHBlciA9ICh0aGlzT2JqLCBkZWx0YSwgcG9zaXRpb24gPSAwKSAtPlxuICAgIGlmIGRlbHRhP1xuICAgICAgc2VsZWN0aW9ucyA9IHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpXG4gICAgICBkZWx0YV91bnNlbGVjdGlvbnMgPSBbXVxuICAgICAgZGVsdGFfc2VsZWN0aW9ucyA9IHt9XG4gICAgICBmb3Igbix2IG9mIGRlbHRhLmF0dHJpYnV0ZXNcbiAgICAgICAgaWYgdj9cbiAgICAgICAgICBkZWx0YV9zZWxlY3Rpb25zW25dID0gdlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVsdGFfdW5zZWxlY3Rpb25zLnB1c2ggblxuXG4gICAgICBpZiBkZWx0YS5pbnNlcnQ/XG4gICAgICAgIGluc2VydF9jb250ZW50ID0gZGVsdGEuaW5zZXJ0XG4gICAgICAgIGNvbnRlbnRfYXJyYXkgPVxuICAgICAgICAgIGlmIHR5cGVvZiBpbnNlcnRfY29udGVudCBpcyBcInN0cmluZ1wiXG4gICAgICAgICAgICBpbnNlcnRfY29udGVudC5zcGxpdChcIlwiKVxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIGluc2VydF9jb250ZW50IGlzIFwibnVtYmVyXCJcbiAgICAgICAgICAgIFtpbnNlcnRfY29udGVudF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJHb3QgYW4gdW5leHBlY3RlZCB2YWx1ZSBpbiBkZWx0YS5pbnNlcnQhIChcIiArXG4gICAgICAgICAgICAodHlwZW9mIGNvbnRlbnQpICsgXCIpXCJcbiAgICAgICAgaW5zZXJ0SGVscGVyIHRoaXNPYmosIHBvc2l0aW9uLCBjb250ZW50X2FycmF5XG4gICAgICAgIGZyb20gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYgcG9zaXRpb25cbiAgICAgICAgdG8gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYoXG4gICAgICAgICAgcG9zaXRpb24rY29udGVudF9hcnJheS5sZW5ndGgtMSlcbiAgICAgICAgIyBpbXBvcnRhbnQsIGZpcnN0IHVuc2VsZWN0LCB0aGVuIHNlbGVjdCFcbiAgICAgICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcInNlbGVjdGlvbnNcIikudW5zZWxlY3QoXG4gICAgICAgICAgZnJvbSwgdG8sIGRlbHRhX3Vuc2VsZWN0aW9ucylcbiAgICAgICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcInNlbGVjdGlvbnNcIikuc2VsZWN0KFxuICAgICAgICAgIGZyb20sIHRvLCBkZWx0YV9zZWxlY3Rpb25zLCB0cnVlKVxuXG5cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uICsgY29udGVudF9hcnJheS5sZW5ndGhcblxuICAgICAgZWxzZSBpZiBkZWx0YS5kZWxldGU/XG4gICAgICAgIGRlbGV0ZUhlbHBlciB0aGlzT2JqLCBwb3NpdGlvbiwgZGVsdGEuZGVsZXRlXG4gICAgICAgIHJldHVybiBwb3NpdGlvblxuXG4gICAgICBlbHNlIGlmIGRlbHRhLnJldGFpbj9cbiAgICAgICAgcmV0YWluID0gcGFyc2VJbnQgZGVsdGEucmV0YWluXG4gICAgICAgIGZyb20gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYocG9zaXRpb24pXG4gICAgICAgICMgd2Ugc2V0IGBwb3NpdGlvbityZXRhaW4tMWAsIC0xIGJlY2F1c2Ugd2hlbiBzZWxlY3Rpbmcgb25lIGNoYXIsXG4gICAgICAgICMgWS1zZWxlY3Rpb25zIHdpbGwgb25seSBtYXJrIHRoaXMgb25lIGNoYXIgKGFzIGJlZ2lubmluZyBhbmQgZW5kKVxuICAgICAgICB0byA9IHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJjaGFyYWN0ZXJzXCIpLnJlZihwb3NpdGlvbiArIHJldGFpbiAtIDEpXG4gICAgICAgICMgaW1wb3J0YW50LCBmaXJzdCB1bnNlbGVjdCwgdGhlbiBzZWxlY3QhXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnVuc2VsZWN0KFxuICAgICAgICAgIGZyb20sIHRvLCBkZWx0YV91bnNlbGVjdGlvbnMpXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnNlbGVjdChcbiAgICAgICAgICBmcm9tLCB0bywgZGVsdGFfc2VsZWN0aW9ucylcblxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbiArIHJldGFpblxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBwYXJ0IG9mIGNvZGUgbXVzdCBub3QgYmUgcmVhY2hlZCFcIlxuXG4gIGluc2VydEhlbHBlciA9ICh0aGlzT2JqLCBwb3NpdGlvbiwgY29udGVudF9hcnJheSkgLT5cbiAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5pbnNlcnRDb250ZW50cyBwb3NpdGlvbiwgY29udGVudF9hcnJheVxuXG4gIGRlbGV0ZUhlbHBlciA9ICh0aGlzT2JqLCBwb3NpdGlvbiwgbGVuZ3RoID0gMSkgLT5cbiAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5kZWxldGUgcG9zaXRpb24sIGxlbmd0aFxuXG5pZiB3aW5kb3c/XG4gIGlmIHdpbmRvdy5ZP1xuICAgIHdpbmRvdy5ZLlJpY2hUZXh0ID0gWVJpY2hUZXh0XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWVJpY2hUZXh0XG4iXX0=
