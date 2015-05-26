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

  YRichText.prototype.attachProvider = function(kind, fun) {
    this._providers = this._providers || {};
    return this._providers[kind] = fun;
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
                text: (_this._providers != null) && _this._providers.nameProvider(author) || "Default user",
                color: (_this._providers != null) && _this._providers.colorProvider(author) || "grey"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9lZGl0b3JzLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi9taXNjLmNvZmZlZSIsIi9ob21lL2NjYy9Eb2N1bWVudHMvcHJvZy9MaW5hZ29yYS95LXJpY2h0ZXh0L2xpYi95LXJpY2h0ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEseUNBQUE7RUFBQTtpU0FBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBO0FBTWUsRUFBQSx3QkFBRSxNQUFGLEdBQUE7QUFDWCxJQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBZCxDQURXO0VBQUEsQ0FBYjs7QUFBQSwyQkFJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQUssVUFBVSxJQUFBLEtBQUEsQ0FBTSxjQUFOLENBQVYsQ0FBTDtFQUFBLENBSmIsQ0FBQTs7QUFBQSwyQkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQU0sVUFBVSxJQUFBLEtBQUEsQ0FBTSxjQUFOLENBQVYsQ0FBTjtFQUFBLENBUFgsQ0FBQTs7QUFBQSwyQkFjQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFBVyxVQUFVLElBQUEsS0FBQSxDQUFNLGNBQU4sQ0FBVixDQUFYO0VBQUEsQ0FkWCxDQUFBOztBQUFBLDJCQWVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFB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QUFmLENBQTBCLFlBQTFCLENBQXVDLENBQUMsTUFBeEMsQ0FDRSxJQURGLEVBQ1EsRUFEUixFQUNZLGdCQURaLENBUkEsQ0FBQTtBQVlBLGVBQU8sUUFBQSxHQUFXLE1BQWxCLENBYkc7T0FwQ0w7QUFrREEsWUFBVSxJQUFBLEtBQUEsQ0FBTSx3Q0FBTixDQUFWLENBbkRGO0tBRFk7RUFBQSxDQXJPZCxDQUFBOztBQUFBLEVBMlJBLFlBQUEsR0FBZSxTQUFDLE9BQUQsRUFBVSxRQUFWLEVBQW9CLGFBQXBCLEdBQUE7V0FDYixPQUFPLENBQUMsTUFBTSxDQUFDLFVBQWYsQ0FBMEIsWUFBMUIsQ0FBdUMsQ0FBQyxjQUF4QyxDQUF1RCxRQUF2RCxFQUFpRSxhQUFqRSxFQURhO0VBQUEsQ0EzUmYsQ0FBQTs7QUFBQSxFQThSQSxZQUFBLEdBQWUsU0FBQyxPQUFELEVBQVUsUUFBVixFQUFvQixNQUFwQixHQUFBOztNQUFvQixTQUFTO0tBQzFDO1dBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFmLENBQTBCLFlBQTFCLENBQXVDLENBQUMsUUFBRCxDQUF2QyxDQUErQyxRQUEvQyxFQUF5RCxNQUF6RCxFQURhO0VBQUEsQ0E5UmYsQ0FBQTs7bUJBQUE7O0dBSnNCLFVBWnhCLENBQUE7O0FBaVRBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLElBQUcsZ0JBQUg7QUFDRSxJQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBVCxHQUFvQixTQUFwQixDQURGO0dBQUEsTUFBQTtBQUdFLFVBQVUsSUFBQSxLQUFBLENBQU0sMEJBQU4sQ0FBVixDQUhGO0dBREY7Q0FqVEE7O0FBdVRBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQWpCLENBREY7Q0F2VEEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibWlzYyA9IHJlcXVpcmUoXCIuL21pc2MuY29mZmVlXCIpXG5cbiMgYSBnZW5lcmljIGVkaXRvciBjbGFzc1xuY2xhc3MgQWJzdHJhY3RFZGl0b3JcbiAgIyBjcmVhdGUgYW4gZWRpdG9yIGluc3RhbmNlXG4gICMgQHBhcmFtIGluc3RhbmNlIFtFZGl0b3JdIHRoZSBlZGl0b3Igb2JqZWN0XG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICBAbG9ja2VyID0gbmV3IG1pc2MuTG9ja2VyKClcblxuICAjIGdldCB0aGUgY3VycmVudCBjb250ZW50IGFzIGEgb3QtZGVsdGFcbiAgZ2V0Q29udGVudHM6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIGdldCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb25cbiAgZ2V0Q3Vyc29yOiAoKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuICAjIHNldCB0aGUgY3VycmVudCBjdXJzb3IgcG9zaXRpb25cbiAgIyBAcGFyYW0gcGFyYW0gW09wdGlvbl0gdGhlIG9wdGlvbnNcbiAgIyBAb3B0aW9uIHBhcmFtIFtJbnRlZ2VyXSBpZCB0aGUgaWQgb2YgdGhlIGF1dGhvclxuICAjIEBvcHRpb24gcGFyYW0gW0ludGVnZXJdIGluZGV4IHRoZSBpbmRleCBvZiB0aGUgY3Vyc29yXG4gICMgQG9wdGlvbiBwYXJhbSBbU3RyaW5nXSB0ZXh0IHRoZSB0ZXh0IG9mIHRoZSBjdXJzb3JcbiAgIyBAb3B0aW9uIHBhcmFtIFtTdHJpbmddIGNvbG9yIHRoZSBjb2xvciBvZiB0aGUgY3Vyc29yXG4gIHNldEN1cnNvcjogKHBhcmFtKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuICByZW1vdmVDdXJzb3I6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuXG4gICMgcmVtb3ZlIGEgY3Vyc29yXG4gICMgQHBhcmFtIGlkIFtTdHJpbmddIHRoZSBpZCBvZiB0aGUgY3Vyc29yIHRvIHJlbW92ZVxuICByZW1vdmVDdXJzb3I6IChpZCkgLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuICAjIGRlc2NyaWJlIGhvdyB0byBwYXNzIGxvY2FsIG1vZGlmaWNhdGlvbnMgb2YgdGhlIHRleHQgdG8gdGhlIGJhY2tlbmQuXG4gICMgQHBhcmFtIGJhY2tlbmQgW0Z1bmN0aW9uXSB0aGUgZnVuY3Rpb24gdG8gcGFzcyB0aGUgZGVsdGEgdG9cbiAgIyBAbm90ZSBUaGUgYmFja2VuZCBmdW5jdGlvbiB0YWtlcyBhIGxpc3Qgb2YgZGVsdGFzIGFzIGFyZ3VtZW50XG4gIG9ic2VydmVMb2NhbFRleHQ6IChiYWNrZW5kKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgZGVzY3JpYmUgaG93IHRvIHBhc3MgbG9jYWwgbW9kaWZpY2F0aW9ucyBvZiB0aGUgY3Vyc29yIHRvIHRoZSBiYWNrZW5kXG4gICMgQHBhcmFtIGJhY2tlbmQgW0Z1bmN0aW9uXSB0aGUgZnVuY3Rpb24gdG8gcGFzcyB0aGUgbmV3IHBvc2l0aW9uIHRvXG4gICMgQG5vdGUgdGhlIGJhY2tlbmQgZnVuY3Rpb24gdGFrZXMgYSBwb3NpdGlvbiBhcyBhcmd1bWVudFxuICBvYnNlcnZlTG9jYWxDdXJzb3I6IChiYWNrZW5kKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgQXBwbHkgZGVsdGEgb24gdGhlIGVkaXRvclxuICAjIEBwYXJhbSBkZWx0YSBbRGVsdGFdIHRoZSBkZWx0YSB0byBwcm9wYWdhdGUgdG8gdGhlIGVkaXRvclxuICAjIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL290dHlwZXMvcmljaC10ZXh0XG4gIHVwZGF0ZUNvbnRlbnRzOiAoZGVsdGEpIC0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBSZW1vdmUgb2xkIGNvbnRlbnQgYW5kIGFwcGx5IGRlbHRhIG9uIHRoZSBlZGl0b3JcbiAgIyBAcGFyYW0gZGVsdGEgW0RlbHRhXSB0aGUgZGVsdGEgdG8gcHJvcGFnYXRlIHRvIHRoZSBlZGl0b3JcbiAgIyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vdHR5cGVzL3JpY2gtdGV4dFxuICBzZXRDb250ZW50czogKGRlbHRhKSAtPiB0aHJvdyBuZXcgRXJyb3IgXCJJbXBsZW1lbnQgbWVcIlxuXG4gICMgUmV0dXJuIHRoZSBlZGl0b3IgaW5zdGFuY2VcbiAgZ2V0RWRpdG9yOiAoKS0+IHRocm93IG5ldyBFcnJvciBcIkltcGxlbWVudCBtZVwiXG5cbiAgIyBDaGVjayBpZiB0aGUgZWRpdG9yIHRyaWVzIHRvIGFjY3VtdWxhdGUgbWVzc2FnZXMuIFRoaXMgaXMgZXhlY3V0ZWQgZXZlcnkgdGltZSBiZWZvcmUgWWpzIGV4ZWN1dGVzIGEgbWVzc2FnZXNcbiAgY2hlY2tVcGRhdGU6ICgpLT4gdGhyb3cgbmV3IEVycm9yIFwiSW1wbGVtZW50IG1lXCJcblxuY2xhc3MgUXVpbGxKcyBleHRlbmRzIEFic3RyYWN0RWRpdG9yXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIHN1cGVyIEBlZGl0b3JcbiAgICBAX2N1cnNvcnMgPSBAZWRpdG9yLmdldE1vZHVsZShcIm11bHRpLWN1cnNvclwiKVxuXG4gICMgUmV0dXJuIHRoZSBsZW5ndGggb2YgdGhlIHRleHRcbiAgZ2V0TGVuZ3RoOiAoKS0+XG4gICAgQGVkaXRvci5nZXRMZW5ndGgoKVxuXG4gIGdldEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9uKClcbiAgICBpZiBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvbi5zdGFydFxuICAgIGVsc2VcbiAgICAgIDBcblxuICBnZXRDb250ZW50czogKCktPlxuICAgIEBlZGl0b3IuZ2V0Q29udGVudHMoKS5vcHNcblxuICBzZXRDdXJzb3I6IChwYXJhbSkgLT4gQGxvY2tlci50cnkgKCk9PlxuICAgIGN1cnNvciA9IEBfY3Vyc29ycy5jdXJzb3JzW3BhcmFtLmlkXVxuICAgIGlmIGN1cnNvcj8gYW5kIGN1cnNvci5jb2xvciA9PSBwYXJhbS5jb2xvclxuICAgICAgZnVuID0gKGluZGV4KSA9PlxuICAgICAgICBAX2N1cnNvcnMubW92ZUN1cnNvciBwYXJhbS5pZCwgaW5kZXhcbiAgICBlbHNlXG4gICAgICBpZiBjdXJzb3I/IGFuZCBjdXJzb3IuY29sb3I/IGFuZCBjdXJzb3IuY29sb3IgIT0gcGFyYW0uY29sb3JcbiAgICAgICAgQHJlbW92ZUN1cnNvciBwYXJhbS5pZFxuXG4gICAgICBmdW4gPSAoaW5kZXgpID0+XG4gICAgICAgIEBfY3Vyc29ycy5zZXRDdXJzb3IocGFyYW0uaWQsIGluZGV4LFxuICAgICAgICAgIHBhcmFtLnRleHQsIHBhcmFtLmNvbG9yKVxuXG4gICAgaWYgcGFyYW0uaW5kZXg/XG4gICAgICBmdW4gcGFyYW0uaW5kZXhcblxuICByZW1vdmVDdXJzb3I6IChpZCkgLT5cbiAgICBAX2N1cnNvcnMucmVtb3ZlQ3Vyc29yKGlkKVxuXG4gIHJlbW92ZUN1cnNvcjogKGlkKS0+XG4gICAgICBAX2N1cnNvcnMucmVtb3ZlQ3Vyc29yIGlkXG5cbiAgb2JzZXJ2ZUxvY2FsVGV4dDogKGJhY2tlbmQpLT5cbiAgICBAZWRpdG9yLm9uIFwidGV4dC1jaGFuZ2VcIiwgKGRlbHRhcywgc291cmNlKSAtPlxuICAgICAgIyBjYWxsIHRoZSBiYWNrZW5kIHdpdGggZGVsdGFzXG4gICAgICBwb3NpdGlvbiA9IGJhY2tlbmQgZGVsdGFzLm9wc1xuICAgICAgIyB0cmlnZ2VyIGFuIGV4dHJhIGV2ZW50IHRvIG1vdmUgY3Vyc29yIHRvIHBvc2l0aW9uIG9mIGluc2VydGVkIHRleHRcbiAgICAgIEBlZGl0b3Iuc2VsZWN0aW9uLmVtaXR0ZXIuZW1pdChcbiAgICAgICAgQGVkaXRvci5zZWxlY3Rpb24uZW1pdHRlci5jb25zdHJ1Y3Rvci5ldmVudHMuU0VMRUNUSU9OX0NIQU5HRSxcbiAgICAgICAgQGVkaXRvci5xdWlsbC5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgXCJ1c2VyXCIpXG5cbiAgb2JzZXJ2ZUxvY2FsQ3Vyc29yOiAoYmFja2VuZCkgLT5cbiAgICBAZWRpdG9yLm9uIFwic2VsZWN0aW9uLWNoYW5nZVwiLCAocmFuZ2UsIHNvdXJjZSktPlxuICAgICAgaWYgcmFuZ2UgYW5kIHJhbmdlLnN0YXJ0ID09IHJhbmdlLmVuZFxuICAgICAgICBiYWNrZW5kIHJhbmdlLnN0YXJ0XG5cbiAgdXBkYXRlQ29udGVudHM6IChkZWx0YSktPlxuICAgIEBlZGl0b3IudXBkYXRlQ29udGVudHMgZGVsdGFcblxuXG4gIHNldENvbnRlbnRzOiAoZGVsdGEpLT5cbiAgICBAZWRpdG9yLnNldENvbnRlbnRzKGRlbHRhKVxuXG4gIGdldEVkaXRvcjogKCktPlxuICAgIEBlZGl0b3JcblxuICBjaGVja1VwZGF0ZTogKCktPlxuICAgIEBlZGl0b3IuZWRpdG9yLmNoZWNrVXBkYXRlKClcblxuY2xhc3MgVGVzdEVkaXRvciBleHRlbmRzIEFic3RyYWN0RWRpdG9yXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIHN1cGVyXG5cbiAgZ2V0TGVuZ3RoOigpIC0+XG4gICAgMFxuXG4gIGdldEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIDBcblxuICBnZXRDb250ZW50czogKCkgLT5cbiAgICBvcHM6IFt7aW5zZXJ0OiBcIldlbGwsIHRoaXMgaXMgYSB0ZXN0IVwifVxuICAgICAge2luc2VydDogXCJBbmQgSSdtIGJvbGTigKZcIiwgYXR0cmlidXRlczoge2JvbGQ6dHJ1ZX19XVxuXG4gIHNldEN1cnNvcjogKCkgLT5cbiAgICBcIlwiXG5cbiAgb2JzZXJ2ZUxvY2FsVGV4dDooYmFja2VuZCkgLT5cbiAgICBcIlwiXG5cbiAgb2JzZXJ2ZUxvY2FsQ3Vyc29yOiAoYmFja2VuZCkgLT5cbiAgICBcIlwiXG5cbiAgdXBkYXRlQ29udGVudHM6IChkZWx0YSkgLT5cbiAgICBcIlwiXG5cbiAgc2V0Q29udGVudHM6IChkZWx0YSktPlxuICAgIFwiXCJcblxuICBnZXRFZGl0b3I6ICgpLT5cbiAgICBAZWRpdG9yXG5cbmV4cG9ydHMuUXVpbGxKcyA9IFF1aWxsSnNcbmV4cG9ydHMuVGVzdEVkaXRvciA9IFRlc3RFZGl0b3JcbmV4cG9ydHMuQWJzdHJhY3RFZGl0b3IgPSBBYnN0cmFjdEVkaXRvclxuIiwiY2xhc3MgTG9ja2VyXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIEBpc19sb2NrZWQgPSBmYWxzZVxuXG4gIHRyeTogKGZ1bikgLT5cbiAgICBpZiBAaXNfbG9ja2VkXG4gICAgICByZXR1cm5cblxuICAgIEBpc19sb2NrZWQgPSB0cnVlXG4gICAgcmV0ID0gZG8gZnVuXG4gICAgQGlzX2xvY2tlZCA9IGZhbHNlXG4gICAgcmV0dXJuIHJldFxuXG4jIGEgYmFzaWMgY2xhc3Mgd2l0aCBnZW5lcmljIGdldHRlciAvIHNldHRlciBmdW5jdGlvblxuY2xhc3MgQmFzZUNsYXNzXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgb3duUHJvcGVydHkgaXMgdW5zYWZlLiBSYXRoZXIgcHV0IGl0IG9uIGEgZGVkaWNhdGVkIHByb3BlcnR5IGxpa2UuLlxuICAgIEBfdG1wX21vZGVsID0ge31cblxuICAjIFRyeSB0byBmaW5kIHRoZSBwcm9wZXJ0eSBpbiBAX21vZGVsLCBlbHNlIHJldHVybiB0aGVcbiAgIyB0bXBfbW9kZWxcbiAgX2dldDogKHByb3ApIC0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBAX3RtcF9tb2RlbFtwcm9wXVxuICAgIGVsc2VcbiAgICAgIEBfbW9kZWwudmFsKHByb3ApXG4gICMgVHJ5IHRvIHNldCB0aGUgcHJvcGVydHkgaW4gQF9tb2RlbCwgZWxzZSBzZXQgdGhlXG4gICMgdG1wX21vZGVsXG4gIF9zZXQ6IChwcm9wLCB2YWwpIC0+XG4gICAgaWYgbm90IEBfbW9kZWw/XG4gICAgICBAX3RtcF9tb2RlbFtwcm9wXSA9IHZhbFxuICAgIGVsc2VcbiAgICAgIEBfbW9kZWwudmFsKHByb3AsIHZhbClcblxuICAjIHNpbmNlIHdlIGFscmVhZHkgYXNzdW1lIHRoYXQgYW55IGluc3RhbmNlIG9mIEJhc2VDbGFzcyB1c2VzIGEgTWFwTWFuYWdlclxuICAjIFdlIGNhbiBjcmVhdGUgaXQgaGVyZSwgdG8gc2F2ZSBsaW5lcyBvZiBjb2RlXG4gIF9nZXRNb2RlbDogKFksIE9wZXJhdGlvbiktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgQF9tb2RlbCA9IG5ldyBPcGVyYXRpb24uTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIGZvciBrZXksIHZhbHVlIG9mIEBfdG1wX21vZGVsXG4gICAgICAgIEBfbW9kZWwudmFsKGtleSwgdmFsdWUpXG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBkZWxldGUgQF90bXBfbW9kZWxcblxuaWYgbW9kdWxlP1xuICBleHBvcnRzLkJhc2VDbGFzcyA9IEJhc2VDbGFzc1xuICBleHBvcnRzLkxvY2tlciA9IExvY2tlclxuIiwibWlzYyA9IChyZXF1aXJlIFwiLi9taXNjLmNvZmZlZVwiKVxuQmFzZUNsYXNzID0gbWlzYy5CYXNlQ2xhc3NcbkxvY2tlciA9IG1pc2MuTG9ja2VyXG5FZGl0b3JzID0gKHJlcXVpcmUgXCIuL2VkaXRvcnMuY29mZmVlXCIpXG5cbiMgQWxsIGRlcGVuZGVuY2llcyAobGlrZSBZLlNlbGVjdGlvbnMpIHRvIG90aGVyIHR5cGVzICh0aGF0IGhhdmUgaXRzIG93blxuIyByZXBvc2l0b3J5KSBzaG91bGQgIGJlIGluY2x1ZGVkIGJ5IHRoZSB1c2VyIChpbiBvcmRlciB0byByZWR1Y2UgdGhlIGFtb3VudCBvZlxuIyBkb3dubG9hZGVkIGNvbnRlbnQpLlxuIyBXaXRoIGh0bWw1IGltcG9ydHMsIHdlIGNhbiBpbmNsdWRlIGl0IGF1dG9tYXRpY2FsbHkgdG9vLiBCdXQgd2l0aCB0aGUgb2xkXG4jIHNjcmlwdCB0YWdzIHRoaXMgaXMgdGhlIGJlc3Qgc29sdXRpb24gdGhhdCBjYW1lIHRvIG15IG1pbmQuXG5cbiMgQSBjbGFzcyBob2xkaW5nIHRoZSBpbmZvcm1hdGlvbiBhYm91dCByaWNoIHRleHRcbmNsYXNzIFlSaWNoVGV4dCBleHRlbmRzIEJhc2VDbGFzc1xuICAjIEBwYXJhbSBjb250ZW50IFtTdHJpbmddIGFuIGluaXRpYWwgc3RyaW5nXG4gICMgQHBhcmFtIGVkaXRvciBbRWRpdG9yXSBhbiBlZGl0b3IgaW5zdGFuY2VcbiAgIyBAcGFyYW0gYXV0aG9yIFtTdHJpbmddIHRoZSBuYW1lIG9mIHRoZSBsb2NhbCBhdXRob3JcbiAgY29uc3RydWN0b3I6IChlZGl0b3JfbmFtZSwgZWRpdG9yX2luc3RhbmNlKSAtPlxuICAgIEBsb2NrZXIgPSBuZXcgTG9ja2VyKClcblxuICAgIGlmIGVkaXRvcl9uYW1lPyBhbmQgZWRpdG9yX2luc3RhbmNlP1xuICAgICAgQF9iaW5kX2xhdGVyID1cbiAgICAgICAgbmFtZTogZWRpdG9yX25hbWVcbiAgICAgICAgaW5zdGFuY2U6IGVkaXRvcl9pbnN0YW5jZVxuXG4gICAgIyBUT0RPOiBnZW5lcmF0ZSBhIFVJRCAoeW91IGNhbiBnZXQgYSB1bmlxdWUgaWQgYnkgY2FsbGluZ1xuICAgICMgYEBfbW9kZWwuZ2V0VWlkKClgIC0gaXMgdGhpcyB3aGF0IHlvdSBtZWFuPylcbiAgICAjIEBhdXRob3IgPSBhdXRob3JcbiAgICAjIFRPRE86IGFzc2lnbiBhbiBpZCAvIGF1dGhvciBuYW1lIHRvIHRoZSByaWNoIHRleHQgaW5zdGFuY2UgZm9yIGF1dGhvcnNoaXBcblxuICAjXG4gICMgQmluZCB0aGUgUmljaFRleHQgdHlwZSB0byBhIHJpY2ggdGV4dCBlZGl0b3IgKGUuZy4gcXVpbGxqcylcbiAgI1xuICBiaW5kOiAoKS0+XG4gICAgIyBUT0RPOiBiaW5kIHRvIG11bHRpcGxlIGVkaXRvcnNcbiAgICBpZiBhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBFZGl0b3JzLkFic3RyYWN0RWRpdG9yXG4gICAgICAjIGlzIGFscmVhZHkgYW4gZWRpdG9yIVxuICAgICAgQGVkaXRvciA9IGFyZ3VtZW50c1swXVxuICAgIGVsc2VcbiAgICAgIFtlZGl0b3JfbmFtZSwgZWRpdG9yX2luc3RhbmNlXSA9IGFyZ3VtZW50c1xuICAgICAgaWYgQGVkaXRvcj8gYW5kIEBlZGl0b3IuZ2V0RWRpdG9yKCkgaXMgZWRpdG9yX2luc3RhbmNlXG4gICAgICAgICMgcmV0dXJuLCBpZiBAZWRpdG9yIGlzIGFscmVhZHkgYm91bmQhIChuZXZlciBiaW5kIHR3aWNlISlcbiAgICAgICAgcmV0dXJuXG4gICAgICBFZGl0b3IgPSBFZGl0b3JzW2VkaXRvcl9uYW1lXVxuICAgICAgaWYgRWRpdG9yP1xuICAgICAgICBAZWRpdG9yID0gbmV3IEVkaXRvciBlZGl0b3JfaW5zdGFuY2VcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyB0eXBlIG9mIGVkaXRvciBpcyBub3Qgc3VwcG9ydGVkISAoXCIgK1xuICAgICAgICAgIGVkaXRvcl9uYW1lICsgXCIpXCJcblxuICAgICMgVE9ETzogcGFyc2UgdGhlIGZvbGxvd2luZyBkaXJlY3RseSBmcm9tICRjaGFyYWN0ZXJzKyRzZWxlY3Rpb25zIChpbiBPKG4pKVxuICAgIEBlZGl0b3Iuc2V0Q29udGVudHNcbiAgICAgIG9wczogQGdldERlbHRhKClcblxuICAgICMgYmluZCB0aGUgcmVzdC4uXG4gICAgIyBUT0RPOiByZW1vdmUgb2JzZXJ2ZXJzLCB3aGVuIGVkaXRvciBpcyBvdmVyd3JpdHRlblxuICAgIEBlZGl0b3Iub2JzZXJ2ZUxvY2FsVGV4dCBAcGFzc0RlbHRhc1xuICAgIEBiaW5kRXZlbnRzVG9FZGl0b3IgQGVkaXRvclxuICAgIEBlZGl0b3Iub2JzZXJ2ZUxvY2FsQ3Vyc29yIEB1cGRhdGVDdXJzb3JQb3NpdGlvblxuXG4gICAgIyBwdWxsIGNoYW5nZXMgZnJvbSBxdWlsbCwgYmVmb3JlIG1lc3NhZ2UgaXMgcmVjZWl2ZWRcbiAgICAjIGFzIHN1Z2dlc3RlZCBodHRwczovL2Rpc2N1c3MucXVpbGxqcy5jb20vdC9wcm9ibGVtcy1pbi1jb2xsYWJvcmF0aXZlLWltcGxlbWVudGF0aW9uLzI1OFxuICAgICMgVE9ETzogbW92ZSB0aGlzIHRvIEVkaXRvcnMuY29mZmVlXG4gICAgQF9tb2RlbC5jb25uZWN0b3IucmVjZWl2ZV9oYW5kbGVycy51bnNoaWZ0ICgpPT5cbiAgICAgIEBlZGl0b3IuY2hlY2tVcGRhdGUoKVxuXG4gIGF0dGFjaFByb3ZpZGVyOiAoa2luZCwgZnVuKSAtPlxuICAgIEBfcHJvdmlkZXJzID0gQF9wcm92aWRlcnMgb3Ige31cbiAgICBAX3Byb3ZpZGVyc1traW5kXSA9IGZ1blxuXG4gIGdldERlbHRhOiAoKS0+XG4gICAgdGV4dF9jb250ZW50ID0gQF9tb2RlbC5nZXRDb250ZW50KCdjaGFyYWN0ZXJzJykudmFsKClcbiAgICAjIHRyYW5zZm9ybSBZLlNlbGVjdGlvbnMuZ2V0U2VsZWN0aW9ucygpIHRvIGEgZGVsdGFcbiAgICBleHBlY3RlZF9wb3MgPSAwXG4gICAgZGVsdGFzID0gW11cbiAgICBzZWxlY3Rpb25zID0gQF9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKVxuICAgIGZvciBzZWwgaW4gc2VsZWN0aW9ucy5nZXRTZWxlY3Rpb25zKEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikpXG4gICAgICAjICgrMSksIGJlY2F1c2UgaWYgd2Ugc2VsZWN0IGZyb20gMSB0byAxICh3aXRoIHktc2VsZWN0aW9ucyksIHRoZW4gdGhlXG4gICAgICAjIGxlbmd0aCBpcyAxXG4gICAgICBzZWxlY3Rpb25fbGVuZ3RoID0gc2VsLnRvIC0gc2VsLmZyb20gKyAxXG4gICAgICBpZiBleHBlY3RlZF9wb3MgaXNudCBzZWwuZnJvbVxuICAgICAgICAjIFRoZXJlIGlzIHVuc2VsZWN0ZWQgdGV4dC4gJHJldGFpbiB0byB0aGUgbmV4dCBzZWxlY3Rpb25cbiAgICAgICAgdW5zZWxlY3RlZF9pbnNlcnRfY29udGVudCA9IHRleHRfY29udGVudC5zcGxpY2UoXG4gICAgICAgICAgMCwgc2VsLmZyb20tZXhwZWN0ZWRfcG9zIClcbiAgICAgICAgICAuam9pbignJylcbiAgICAgICAgZGVsdGFzLnB1c2hcbiAgICAgICAgICBpbnNlcnQ6IHVuc2VsZWN0ZWRfaW5zZXJ0X2NvbnRlbnRcbiAgICAgICAgZXhwZWN0ZWRfcG9zICs9IHVuc2VsZWN0ZWRfaW5zZXJ0X2NvbnRlbnQubGVuZ3RoXG4gICAgICBpZiBleHBlY3RlZF9wb3MgaXNudCBzZWwuZnJvbVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIHBvcnRpb24gb2YgY29kZSBtdXN0IG5vdCBiZSByZWFjaGVkIGluIGdldERlbHRhIVwiXG4gICAgICBkZWx0YXMucHVzaFxuICAgICAgICBpbnNlcnQ6IHRleHRfY29udGVudC5zcGxpY2UoMCwgc2VsZWN0aW9uX2xlbmd0aCkuam9pbignJylcbiAgICAgICAgYXR0cmlidXRlczogc2VsLmF0dHJzXG4gICAgICBleHBlY3RlZF9wb3MgKz0gc2VsZWN0aW9uX2xlbmd0aFxuICAgIGlmIHRleHRfY29udGVudC5sZW5ndGggPiAwXG4gICAgICBkZWx0YXMucHVzaFxuICAgICAgICBpbnNlcnQ6IHRleHRfY29udGVudC5qb2luKCcnKVxuICAgIGRlbHRhc1xuXG4gIF9nZXRNb2RlbDogKFksIE9wZXJhdGlvbikgLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgICMgd2Ugc2F2ZSB0aGlzIHN0dWZmIGFzIF9zdGF0aWNfIGNvbnRlbnQgbm93LlxuICAgICAgIyBUaGVyZWZvcmUsIHlvdSBjYW4ndCBvdmVyd3JpdGUgaXQsIGFmdGVyIHlvdSBvbmNlIHNhdmVkIGl0LlxuICAgICAgIyBCdXQgb24gdGhlIHVwc2lkZSwgd2UgY2FuIGFsd2F5cyBtYWtlIHN1cmUsIHRoYXQgdGhleSBhcmUgZGVmaW5lZCFcbiAgICAgIGNvbnRlbnRfb3BlcmF0aW9ucyA9XG4gICAgICAgIHNlbGVjdGlvbnM6IG5ldyBZLlNlbGVjdGlvbnMoKVxuICAgICAgICBjaGFyYWN0ZXJzOiBuZXcgWS5MaXN0KClcbiAgICAgICAgY3Vyc29yczogbmV3IFkuT2JqZWN0KClcbiAgICAgIEBfbW9kZWwgPSBuZXcgT3BlcmF0aW9uLk1hcE1hbmFnZXIoQCwgbnVsbCwge30sIGNvbnRlbnRfb3BlcmF0aW9ucyApLmV4ZWN1dGUoKVxuXG4gICAgICBAX3NldE1vZGVsIEBfbW9kZWxcblxuICAgICAgaWYgQF9iaW5kX2xhdGVyP1xuICAgICAgICBFZGl0b3IgPSBFZGl0b3JzW0BfYmluZF9sYXRlci5uYW1lXVxuICAgICAgICBpZiBFZGl0b3I/XG4gICAgICAgICAgZWRpdG9yID0gbmV3IEVkaXRvciBAX2JpbmRfbGF0ZXIuaW5zdGFuY2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgdHlwZSBvZiBlZGl0b3IgaXMgbm90IHN1cHBvcnRlZCEgKFwiK2VkaXRvcl9uYW1lK1wiKSAtLSBmYXRhbCBlcnJvciFcIlxuICAgICAgICBAcGFzc0RlbHRhcyBlZGl0b3IuZ2V0Q29udGVudHMoKVxuICAgICAgICBAYmluZCBlZGl0b3JcbiAgICAgICAgZGVsZXRlIEBfYmluZF9sYXRlclxuXG4gICAgICAjIGxpc3RlbiB0byBldmVudHMgb24gdGhlIG1vZGVsIHVzaW5nIHRoZSBmdW5jdGlvbiBwcm9wYWdhdGVUb0VkaXRvclxuICAgICAgQF9tb2RlbC5vYnNlcnZlIEBwcm9wYWdhdGVUb0VkaXRvclxuICAgIHJldHVybiBAX21vZGVsXG5cbiAgX3NldE1vZGVsOiAobW9kZWwpIC0+XG4gICAgc3VwZXJcblxuICBfbmFtZTogXCJSaWNoVGV4dFwiXG5cbiAgZ2V0VGV4dDogKCktPlxuICAgIEBfbW9kZWwuZ2V0Q29udGVudCgnY2hhcmFjdGVycycpLnZhbCgpLmpvaW4oJycpXG5cbiAgIyBpbnNlcnQgb3VyIG93biBjdXJzb3IgaW4gdGhlIGN1cnNvcnMgb2JqZWN0XG4gICMgQHBhcmFtIHBvc2l0aW9uIFtJbnRlZ2VyXSB0aGUgcG9zaXRpb24gd2hlcmUgdG8gaW5zZXJ0IGl0XG4gIHNldEN1cnNvciA6IChwb3NpdGlvbikgLT5cbiAgICBAc2VsZkN1cnNvciA9IEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmKHBvc2l0aW9uKVxuICAgIEBfbW9kZWwuZ2V0Q29udGVudChcImN1cnNvcnNcIikudmFsKEBfbW9kZWwuSEIuZ2V0VXNlcklkKCksIEBzZWxmQ3Vyc29yKVxuXG5cbiAgIyBwYXNzIGRlbHRhcyB0byB0aGUgY2hhcmFjdGVyIGluc3RhbmNlXG4gICMgQHBhcmFtIGRlbHRhcyBbQXJyYXk8T2JqZWN0Pl0gYW4gYXJyYXkgb2YgZGVsdGFzIChzZWUgb3QtdHlwZXMgZm9yIG1vcmUgaW5mbylcbiAgcGFzc0RlbHRhcyA6IChkZWx0YXMpID0+IEBsb2NrZXIudHJ5ICgpPT5cbiAgICBwb3NpdGlvbiA9IDBcbiAgICBmb3IgZGVsdGEgaW4gZGVsdGFzXG4gICAgICBwb3NpdGlvbiA9IGRlbHRhSGVscGVyIEAsIGRlbHRhLCBwb3NpdGlvblxuXG4gICMgQG92ZXJyaWRlIHVwZGF0ZUN1cnNvclBvc2l0aW9uKGluZGV4KVxuICAjICAgdXBkYXRlIHRoZSBwb3NpdGlvbiBvZiBvdXIgY3Vyc29yIHRvIHRoZSBuZXcgb25lIHVzaW5nIGFuIGluZGV4XG4gICMgICBAcGFyYW0gaW5kZXggW0ludGVnZXJdIHRoZSBuZXcgaW5kZXhcbiAgIyBAb3ZlcnJpZGUgdXBkYXRlQ3Vyc29yUG9zaXRpb24oY2hhcmFjdGVyKVxuICAjICAgdXBkYXRlIHRoZSBwb3NpdGlvbiBvZiBvdXIgY3Vyc29yIHRvIHRoZSBuZXcgb25lIHVzaW5nIGEgY2hhcmFjdGVyXG4gICMgICBAcGFyYW0gY2hhcmFjdGVyIFtDaGFyYWN0ZXJdIHRoZSBuZXcgY2hhcmFjdGVyXG4gIHVwZGF0ZUN1cnNvclBvc2l0aW9uIDogKG9iaikgPT4gQGxvY2tlci50cnkgKCk9PlxuICAgIGlmIHR5cGVvZiBvYmogaXMgXCJudW1iZXJcIlxuICAgICAgQHNlbGZDdXJzb3IgPSBAX21vZGVsLmdldENvbnRlbnQoXCJjaGFyYWN0ZXJzXCIpLnJlZihvYmopXG4gICAgZWxzZVxuICAgICAgQHNlbGZDdXJzb3IgPSBvYmpcbiAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLnZhbChAX21vZGVsLkhCLmdldFVzZXJJZCgpLCBAc2VsZkN1cnNvcilcblxuICAjIGRlc2NyaWJlIGhvdyB0byBwcm9wYWdhdGUgeWpzIGV2ZW50cyB0byB0aGUgZWRpdG9yXG4gICMgVE9ETzogc2hvdWxkIGJlIHByaXZhdGUhXG4gIGJpbmRFdmVudHNUb0VkaXRvciA6IChlZGl0b3IpIC0+XG4gICAgIyB1cGRhdGUgdGhlIGVkaXRvciB3aGVuIHNvbWV0aGluZyBvbiB0aGUgJGNoYXJhY3RlcnMgaGFwcGVuc1xuICAgIEBfbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikub2JzZXJ2ZSAoZXZlbnRzKSA9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGRlbHRhID1cbiAgICAgICAgICBvcHM6IFtdXG5cbiAgICAgICAgaWYgZXZlbnQucG9zaXRpb24gPiAwXG4gICAgICAgICAgZGVsdGEub3BzLnB1c2gge3JldGFpbjogZXZlbnQucG9zaXRpb259XG5cbiAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImluc2VydFwiXG4gICAgICAgICAgZGVsdGEub3BzLnB1c2gge2luc2VydDogZXZlbnQudmFsdWV9XG5cbiAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICBkZWx0YS5vcHMucHVzaCB7ZGVsZXRlOiAxfVxuICAgICAgICAgICMgZGVsZXRlIGN1cnNvciwgaWYgaXQgcmVmZXJlbmNlcyB0byB0aGlzIHBvc2l0aW9uXG4gICAgICAgICAgZm9yIGN1cnNvcl9uYW1lLCBjdXJzb3JfcmVmIGluIEBfbW9kZWwuZ2V0Q29udGVudChcImN1cnNvcnNcIikudmFsKClcbiAgICAgICAgICAgIGlmIGN1cnNvcl9yZWYgaXMgZXZlbnQucmVmZXJlbmNlXG4gICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgIyB3ZSBoYXZlIHRvIGRlbGV0ZSB0aGUgY3Vyc29yIGlmIHRoZSByZWZlcmVuY2UgZG9lcyBub3QgZXhpc3QgYW55bW9yZVxuICAgICAgICAgICAgICAjIHRoZSBkb3duc2lkZSBvZiB0aGlzIGFwcHJvYWNoIGlzIHRoYXQgZXZlcnlvbmUgd2lsbCBzZW5kIHRoaXMgZGVsZXRlIGV2ZW50IVxuICAgICAgICAgICAgICAjIGluIHRoZSBmdXR1cmUsIHdlIGNvdWxkIHJlcGxhY2UgdGhlIGN1cnNvcnMsIHdpdGggYSB5LXNlbGVjdGlvbnNcbiAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKS0+XG4gICAgICAgICAgICAgICAgICBAX21vZGVsLmdldENvbnRlbnQoXCJjdXJzb3JzXCIpLmRlbGV0ZShjdXJzb3JfbmFtZSlcbiAgICAgICAgICAgICAgICAsIDApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBAZWRpdG9yLnVwZGF0ZUNvbnRlbnRzIGRlbHRhXG5cbiAgICAjIHVwZGF0ZSB0aGUgZWRpdG9yIHdoZW4gc29tZXRoaW5nIG9uIHRoZSAkc2VsZWN0aW9ucyBoYXBwZW5zXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKS5vYnNlcnZlIChldmVudCk9PiBAbG9ja2VyLnRyeSAoKT0+XG4gICAgICBhdHRycyA9IHt9XG4gICAgICBpZiBldmVudC50eXBlIGlzIFwic2VsZWN0XCJcbiAgICAgICAgZm9yIGF0dHIsdmFsIG9mIGV2ZW50LmF0dHJzXG4gICAgICAgICAgYXR0cnNbYXR0cl0gPSB2YWxcbiAgICAgIGVsc2UgIyBpcyBcInVuc2VsZWN0XCIhXG4gICAgICAgIGZvciBhdHRyIGluIGV2ZW50LmF0dHJzXG4gICAgICAgICAgYXR0cnNbYXR0cl0gPSBudWxsXG4gICAgICByZXRhaW4gPSBldmVudC5mcm9tLmdldFBvc2l0aW9uKClcbiAgICAgIHNlbGVjdGlvbl9sZW5ndGggPSBldmVudC50by5nZXRQb3NpdGlvbigpLWV2ZW50LmZyb20uZ2V0UG9zaXRpb24oKSsxXG4gICAgICBAZWRpdG9yLnVwZGF0ZUNvbnRlbnRzXG4gICAgICAgIG9wczogW1xuICAgICAgICAgIHtyZXRhaW46IHJldGFpbn0sXG4gICAgICAgICAge3JldGFpbjogc2VsZWN0aW9uX2xlbmd0aCwgYXR0cmlidXRlczogYXR0cnN9XG4gICAgICAgIF1cblxuICAgICMgdXBkYXRlIHRoZSBlZGl0b3Igd2hlbiB0aGUgY3Vyc29yIGlzIG1vdmVkXG4gICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS5vYnNlcnZlIChldmVudHMpPT4gQGxvY2tlci50cnkgKCk9PlxuICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICBpZiBldmVudC50eXBlIGlzIFwidXBkYXRlXCIgb3IgZXZlbnQudHlwZSBpcyBcImFkZFwiXG4gICAgICAgICAgYXV0aG9yID0gZXZlbnQuY2hhbmdlZEJ5XG4gICAgICAgICAgcmVmX3RvX2NoYXIgPSBldmVudC5vYmplY3QudmFsKGF1dGhvcilcbiAgICAgICAgICBpZiByZWZfdG9fY2hhciBpcyBudWxsXG4gICAgICAgICAgICBwb3NpdGlvbiA9IEBlZGl0b3IuZ2V0TGVuZ3RoKClcbiAgICAgICAgICBlbHNlIGlmIHJlZl90b19jaGFyP1xuICAgICAgICAgICAgaWYgcmVmX3RvX2NoYXIuaXNEZWxldGVkKClcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHBvc2l0aW9uID0gcmVmX3RvX2NoYXIuZ2V0UG9zaXRpb24oKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUud2FybiBcInJlZl90b19jaGFyIGlzIHVuZGVmaW5lZFwiXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgIHBhcmFtcyA9XG4gICAgICAgICAgICBpZDogYXV0aG9yXG4gICAgICAgICAgICBpbmRleDogcG9zaXRpb25cbiAgICAgICAgICAgIHRleHQ6IEBfcHJvdmlkZXJzPyBhbmQgQF9wcm92aWRlcnMubmFtZVByb3ZpZGVyKGF1dGhvcikgb3IgXCJEZWZhdWx0IHVzZXJcIlxuICAgICAgICAgICAgY29sb3I6IEBfcHJvdmlkZXJzPyBhbmQgQF9wcm92aWRlcnMuY29sb3JQcm92aWRlcihhdXRob3IpIG9yIFwiZ3JleVwiXG4gICAgICAgICAgQGVkaXRvci5zZXRDdXJzb3IgcGFyYW1zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZWRpdG9yLnJlbW92ZUN1cnNvciBldmVudC5uYW1lXG5cbiAgICBAX21vZGVsLmNvbm5lY3Rvci5vblVzZXJFdmVudCAoZXZlbnQpPT5cbiAgICAgIGlmIGV2ZW50LmFjdGlvbiBpcyBcInVzZXJMZWZ0XCJcbiAgICAgICAgQF9tb2RlbC5nZXRDb250ZW50KFwiY3Vyc29yc1wiKS5kZWxldGUoZXZlbnQudXNlcilcblxuICAjIEFwcGx5IGEgZGVsdGEgYW5kIHJldHVybiB0aGUgbmV3IHBvc2l0aW9uXG4gICMgQHBhcmFtIGRlbHRhIFtPYmplY3RdIGEgKnNpbmdsZSogZGVsdGEgKHNlZSBvdC10eXBlcyBmb3IgbW9yZSBpbmZvKVxuICAjIEBwYXJhbSBwb3NpdGlvbiBbSW50ZWdlcl0gc3RhcnQgcG9zaXRpb24gZm9yIHRoZSBkZWx0YSwgZGVmYXVsdDogMFxuICAjXG4gICMgQHJldHVybiBbSW50ZWdlcl0gdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJzb3IgYWZ0ZXIgcGFyc2luZyB0aGUgZGVsdGFcbiAgZGVsdGFIZWxwZXIgPSAodGhpc09iaiwgZGVsdGEsIHBvc2l0aW9uID0gMCkgLT5cbiAgICBpZiBkZWx0YT9cbiAgICAgIHNlbGVjdGlvbnMgPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKVxuICAgICAgZGVsdGFfdW5zZWxlY3Rpb25zID0gW11cbiAgICAgIGRlbHRhX3NlbGVjdGlvbnMgPSB7fVxuICAgICAgZm9yIG4sdiBvZiBkZWx0YS5hdHRyaWJ1dGVzXG4gICAgICAgIGlmIHY/XG4gICAgICAgICAgZGVsdGFfc2VsZWN0aW9uc1tuXSA9IHZcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlbHRhX3Vuc2VsZWN0aW9ucy5wdXNoIG5cblxuICAgICAgaWYgZGVsdGEuaW5zZXJ0P1xuICAgICAgICBpbnNlcnRfY29udGVudCA9IGRlbHRhLmluc2VydFxuICAgICAgICBjb250ZW50X2FycmF5ID1cbiAgICAgICAgICBpZiB0eXBlb2YgaW5zZXJ0X2NvbnRlbnQgaXMgXCJzdHJpbmdcIlxuICAgICAgICAgICAgaW5zZXJ0X2NvbnRlbnQuc3BsaXQoXCJcIilcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBpbnNlcnRfY29udGVudCBpcyBcIm51bWJlclwiXG4gICAgICAgICAgICBbaW5zZXJ0X2NvbnRlbnRdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiR290IGFuIHVuZXhwZWN0ZWQgdmFsdWUgaW4gZGVsdGEuaW5zZXJ0ISAoXCIgK1xuICAgICAgICAgICAgKHR5cGVvZiBjb250ZW50KSArIFwiKVwiXG4gICAgICAgIGluc2VydEhlbHBlciB0aGlzT2JqLCBwb3NpdGlvbiwgY29udGVudF9hcnJheVxuICAgICAgICBmcm9tID0gdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmIHBvc2l0aW9uXG4gICAgICAgIHRvID0gdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmKFxuICAgICAgICAgIHBvc2l0aW9uK2NvbnRlbnRfYXJyYXkubGVuZ3RoLTEpXG4gICAgICAgICMgaW1wb3J0YW50LCBmaXJzdCB1bnNlbGVjdCwgdGhlbiBzZWxlY3QhXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnVuc2VsZWN0KFxuICAgICAgICAgIGZyb20sIHRvLCBkZWx0YV91bnNlbGVjdGlvbnMpXG4gICAgICAgIHRoaXNPYmouX21vZGVsLmdldENvbnRlbnQoXCJzZWxlY3Rpb25zXCIpLnNlbGVjdChcbiAgICAgICAgICBmcm9tLCB0bywgZGVsdGFfc2VsZWN0aW9ucywgdHJ1ZSlcblxuXG4gICAgICAgIHJldHVybiBwb3NpdGlvbiArIGNvbnRlbnRfYXJyYXkubGVuZ3RoXG5cbiAgICAgIGVsc2UgaWYgZGVsdGEuZGVsZXRlP1xuICAgICAgICBkZWxldGVIZWxwZXIgdGhpc09iaiwgcG9zaXRpb24sIGRlbHRhLmRlbGV0ZVxuICAgICAgICByZXR1cm4gcG9zaXRpb25cblxuICAgICAgZWxzZSBpZiBkZWx0YS5yZXRhaW4/XG4gICAgICAgIHJldGFpbiA9IHBhcnNlSW50IGRlbHRhLnJldGFpblxuICAgICAgICBmcm9tID0gdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikucmVmKHBvc2l0aW9uKVxuICAgICAgICAjIHdlIHNldCBgcG9zaXRpb24rcmV0YWluLTFgLCAtMSBiZWNhdXNlIHdoZW4gc2VsZWN0aW5nIG9uZSBjaGFyLFxuICAgICAgICAjIFktc2VsZWN0aW9ucyB3aWxsIG9ubHkgbWFyayB0aGlzIG9uZSBjaGFyIChhcyBiZWdpbm5pbmcgYW5kIGVuZClcbiAgICAgICAgdG8gPSB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwiY2hhcmFjdGVyc1wiKS5yZWYocG9zaXRpb24gKyByZXRhaW4gLSAxKVxuICAgICAgICAjIGltcG9ydGFudCwgZmlyc3QgdW5zZWxlY3QsIHRoZW4gc2VsZWN0IVxuICAgICAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKS51bnNlbGVjdChcbiAgICAgICAgICBmcm9tLCB0bywgZGVsdGFfdW5zZWxlY3Rpb25zKVxuICAgICAgICB0aGlzT2JqLl9tb2RlbC5nZXRDb250ZW50KFwic2VsZWN0aW9uc1wiKS5zZWxlY3QoXG4gICAgICAgICAgZnJvbSwgdG8sIGRlbHRhX3NlbGVjdGlvbnMpXG5cblxuICAgICAgICByZXR1cm4gcG9zaXRpb24gKyByZXRhaW5cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoaXMgcGFydCBvZiBjb2RlIG11c3Qgbm90IGJlIHJlYWNoZWQhXCJcblxuICBpbnNlcnRIZWxwZXIgPSAodGhpc09iaiwgcG9zaXRpb24sIGNvbnRlbnRfYXJyYXkpIC0+XG4gICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikuaW5zZXJ0Q29udGVudHMgcG9zaXRpb24sIGNvbnRlbnRfYXJyYXlcblxuICBkZWxldGVIZWxwZXIgPSAodGhpc09iaiwgcG9zaXRpb24sIGxlbmd0aCA9IDEpIC0+XG4gICAgdGhpc09iai5fbW9kZWwuZ2V0Q29udGVudChcImNoYXJhY3RlcnNcIikuZGVsZXRlIHBvc2l0aW9uLCBsZW5ndGhcblxuaWYgd2luZG93P1xuICBpZiB3aW5kb3cuWT9cbiAgICB3aW5kb3cuWS5SaWNoVGV4dCA9IFlSaWNoVGV4dFxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3QgZmlyc3QgaW1wb3J0IFkhXCJcblxuaWYgbW9kdWxlP1xuICBtb2R1bGUuZXhwb3J0cyA9IFlSaWNoVGV4dFxuIl19
