(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var YXml, dont_proxy, initialize_proxies, proxies_are_initialized, proxy_token;

YXml = (function() {
  function YXml(tag_or_dom, attributes) {
    var a, a_name, c, c_name, tagname, _classes, _i, _len, _ref;
    if (attributes == null) {
      attributes = {};
    }
    if (tag_or_dom == null) {

    } else if (tag_or_dom.constructor === String) {
      tagname = tag_or_dom;
      this._xml = {};
      this._xml.children = [];
      this._xml.tagname = tagname;
      if (attributes.constructor !== Object) {
        throw new Error("The attributes must be specified as a Object");
      }
      for (a_name in attributes) {
        a = attributes[a_name];
        if (a.constructor !== String) {
          throw new Error("The attributes must be of type String!");
        }
      }
      this._xml.attributes = attributes;
      this._xml.classes = {};
      _classes = this._xml.attributes["class"];
      delete this._xml.attributes["class"];
      if (_classes != null) {
        _ref = _classes.split(" ");
        for (c = _i = 0, _len = _ref.length; _i < _len; c = ++_i) {
          c_name = _ref[c];
          if (c.length > 0) {
            this._xml.classes[c_name] = c;
          }
        }
      }
      void 0;
    } else if (tag_or_dom instanceof Element) {
      this._dom = tag_or_dom;
      this._xml = {};
    }
  }

  YXml.prototype._name = "Xml";

  YXml.prototype._getModel = function(Y, ops) {
    var attribute, c, child, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    if (this._model == null) {
      if (this._dom != null) {
        this._xml.tagname = this._dom.tagName.toLowerCase();
        this._xml.attributes = {};
        this._xml.classes = {};
        _ref = this._dom.attributes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          if (attribute.name === "class") {
            _ref1 = attribute.value.split(" ");
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              c = _ref1[_j];
              this._xml.classes[c] = true;
            }
          } else {
            this._xml.attributes[attribute.name] = attribute.value;
          }
        }
        this._xml.children = [];
        _ref2 = this._dom.childNodes;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          child = _ref2[_k];
          if (child.nodeType === child.TEXT_NODE) {
            this._xml.children.push(child.textContent);
          } else {
            this._xml.children.push(new YXml(child));
          }
        }
      }
      this._model = new ops.MapManager(this).execute();
      this._model.val("attributes", new Y.Object(this._xml.attributes));
      this._model.val("classes", new Y.Object(this._xml.classes));
      this._model.val("tagname", this._xml.tagname);
      this._model.val("children", new Y.List(this._xml.children));
      if (this._xml.parent != null) {
        this._model.val("parent", this._xml.parent);
      }
      if (this._dom != null) {
        this.getDom();
      }
      this._setModel(this._model);
    }
    return this._model;
  };

  YXml.prototype._setModel = function(_model) {
    this._model = _model;
    this._model.observe(function(events) {
      var c, children, event, i, parent, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        if (event.name === "parent" && event.type !== "add") {
          parent = event.oldValue;
          children = (_ref = parent._model.val("children")) != null ? _ref.val() : void 0;
          if (children != null) {
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (i = _j = 0, _len1 = children.length; _j < _len1; i = ++_j) {
                c = children[i];
                if (c === this) {
                  parent._model.val("children")["delete"](i);
                  break;
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    return delete this._xml;
  };

  YXml.prototype._setParent = function(parent) {
    if (parent instanceof YXml) {
      if (this._model != null) {
        this.remove();
        return this._model.val("parent", parent);
      } else {
        return this._xml.parent = parent;
      }
    } else {
      throw new Error("parent must be of type Y.Xml!");
    }
  };

  YXml.prototype.toString = function() {
    var child, name, value, xml, _i, _len, _ref, _ref1;
    xml = "<" + this._model.val("tagname");
    _ref = this.attr();
    for (name in _ref) {
      value = _ref[name];
      xml += " " + name + '="' + value + '"';
    }
    xml += ">";
    _ref1 = this._model.val("children").val();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      child = _ref1[_i];
      xml += child.toString();
    }
    xml += '</' + this._model.val("tagname") + '>';
    return xml;
  };

  YXml.prototype.attr = function(name, value) {
    var attrs, c, classes, cs, _i, _len;
    if (arguments.length > 1) {
      if (value.constructor !== String) {
        throw new Error("The attributes must be of type String!");
      }
      if (name === "class") {
        classes = value.split(" ");
        cs = {};
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          c = classes[_i];
          cs[c] = true;
        }
        this._model.val("classes", new this._model.custom_types.Object(cs));
      } else {
        this._model.val("attributes").val(name, value);
      }
      return this;
    } else if (arguments.length > 0) {
      if (name === "class") {
        return Object.keys(this._model.val("classes").val()).join(" ");
      } else {
        return this._model.val("attributes").val(name);
      }
    } else {
      attrs = this._model.val("attributes").val();
      classes = Object.keys(this._model.val("classes").val()).join(" ");
      if (classes.length > 0) {
        attrs["class"] = classes;
      }
      return attrs;
    }
  };

  YXml.prototype.addClass = function(names) {
    var name, _i, _len, _ref;
    _ref = names.split(" ");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      this._model.val("classes").val(name, true);
    }
    return this;
  };

  YXml.prototype.after = function() {
    var c, content, contents, parent, position, _i, _j, _len, _len1, _ref;
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    _ref = parent.getChildren();
    for (position = _i = 0, _len = _ref.length; _i < _len; position = ++_i) {
      c = _ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
      content = arguments[_j];
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position + 1, contents);
  };

  YXml.prototype.append = function() {
    var content, _i, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").push(content);
    }
    return this;
  };

  YXml.prototype.before = function() {
    var c, content, contents, parent, position, _i, _j, _len, _len1, _ref;
    parent = this._model.val("parent");
    if (parent == null) {
      throw new Error("This Xml Element must not have siblings! (for it does not have a parent)");
    }
    _ref = parent.getChildren();
    for (position = _i = 0, _len = _ref.length; _i < _len; position = ++_i) {
      c = _ref[position];
      if (c === this) {
        break;
      }
    }
    contents = [];
    for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
      content = arguments[_j];
      if (content instanceof YXml) {
        content._setParent(this._model.val("parent"));
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      contents.push(content);
    }
    return parent._model.val("children").insertContents(position, contents);
  };

  YXml.prototype.empty = function() {
    var child, children, _i, _len, _ref, _results;
    children = this._model.val("children");
    _ref = children.val();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.constructor === String) {
        _results.push(children["delete"](0));
      } else {
        _results.push(child.remove());
      }
    }
    return _results;
  };

  YXml.prototype.hasClass = function(className) {
    if (this._model.val("classes").val(className) != null) {
      return true;
    } else {
      return false;
    }
  };

  YXml.prototype.prepend = function() {
    var content, _i, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      content = arguments[_i];
      if (content instanceof YXml) {
        content._setParent(this);
      } else if (content.constructor !== String) {
        throw new Error("Y.Xml.after expects instances of YXml or String as a parameter");
      }
      this._model.val("children").insert(0, content);
    }
    return this;
  };

  YXml.prototype.remove = function() {
    var parent;
    parent = this._model["delete"]("parent");
    return this;
  };

  YXml.prototype.removeAttr = function(attrName) {
    if (attrName === "class") {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      this._model.val("attributes")["delete"](attrName);
    }
    return this;
  };

  YXml.prototype.removeClass = function() {
    var className, _i, _len;
    if (arguments.length === 0) {
      this._model.val("classes", new this._model.custom_types.Object());
    } else {
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        className = arguments[_i];
        this._model.val("classes")["delete"](className);
      }
    }
    return this;
  };

  YXml.prototype.toggleClass = function() {
    var className, classes, _i, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      className = arguments[_i];
      classes = this._model.val("classes");
      if (classes.val(className) != null) {
        classes["delete"](className);
      } else {
        classes.val(className, true);
      }
    }
    return this;
  };

  YXml.prototype.getParent = function() {
    return this._model.val("parent");
  };

  YXml.prototype.getChildren = function() {
    return this._model.val("children").val();
  };

  YXml.prototype.getPosition = function() {
    var c, i, parent, _i, _len, _ref;
    parent = this._model.val("parent");
    if (parent != null) {
      _ref = parent._model.val("children").val();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        c = _ref[i];
        if (c === this) {
          return i;
        }
      }
      throw new Error("This is not a child of its parent (should not happen in Y.Xml!)");
    } else {
      return null;
    }
  };

  YXml.prototype.getDom = function() {
    var attr_name, attr_value, child, dom, i, setClasses, that, _i, _len, _ref, _ref1;
    if (this._dom == null) {
      this._dom = document.createElement(this._model.val("tagname"));
      _ref = this.attr();
      for (attr_name in _ref) {
        attr_value = _ref[attr_name];
        this._dom.setAttribute(attr_name, attr_value);
      }
      _ref1 = this.getChildren();
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        child = _ref1[i];
        if (child.constructor === String) {
          dom = document.createTextNode(child);
        } else {
          dom = child.getDom();
        }
        this._dom.insertBefore(dom);
      }
    }
    that = this;
    if (this._dom._y_xml == null) {
      this._dom._y_xml = this;
      initialize_proxies.call(this);
      this._model.val("children").observe(function(events) {
        var children, deleted, event, newNode, rightNode, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "insert") {
            if (event.value.constructor === String) {
              newNode = document.createTextNode(event.value);
            } else {
              newNode = event.value.getDom();
              event.value._setParent(that);
            }
            children = that._dom.childNodes;
            if (children.length === event.position) {
              rightNode = null;
            } else {
              rightNode = children[event.position];
            }
            _results.push(dont_proxy(function() {
              return that._dom.insertBefore(newNode, rightNode);
            }));
          } else if (event.type === "delete") {
            deleted = event.oldValue.getDom();
            _results.push(dont_proxy(function() {
              return that._dom.removeChild(deleted);
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      this._model.val("attributes").observe(function(events) {
        var event, newval, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "add" || event.type === "update") {
            newval = event.object.val(event.name);
            _results.push(dont_proxy(function() {
              return that._dom.setAttribute(event.name, newval);
            }));
          } else if (event.type === "delete") {
            _results.push(dont_proxy(function() {
              return that._dom.removeAttribute(event.name);
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      setClasses = function() {
        return that._model.val("classes").observe(function(events) {
          var event, _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
            event = events[_j];
            if (event.type === "add" || event.type === "update") {
              _results.push(dont_proxy(function() {
                return that._dom.classList.add(event.name);
              }));
            } else if (event.type === "delete") {
              _results.push(dont_proxy(function() {
                return that._dom.classList.remove(event.name);
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      };
      setClasses();
      this._model.observe(function(events) {
        var event, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = events.length; _j < _len1; _j++) {
          event = events[_j];
          if (event.type === "add" || event.type === "update") {
            dont_proxy(function() {
              var classes;
              classes = that.attr("class");
              if ((classes == null) || classes === "") {
                return that._dom.removeAttribute("class");
              } else {
                return that._dom.setAttribute("class", that.attr("class"));
              }
            });
            _results.push(setClasses());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
    return this._dom;
  };

  return YXml;

})();

proxies_are_initialized = false;

proxy_token = false;

dont_proxy = function(f) {
  var e;
  proxy_token = true;
  try {
    f();
  } catch (_error) {
    e = _error;
    proxy_token = false;
    throw new Error(e);
  }
  return proxy_token = false;
};

initialize_proxies = function() {
  var f_add, f_remove, insertBefore, removeChild, replaceChild, that, _proxy;
  _proxy = function(f_name, f, source, y) {
    var old_f;
    if (source == null) {
      source = Element.prototype;
    }
    old_f = source[f_name];
    return source[f_name] = function() {
      if ((!((y != null) || (this._y_xml != null))) || proxy_token) {
        return old_f.apply(this, arguments);
      } else if (this._y_xml != null) {
        return f.apply(this._y_xml, arguments);
      } else {
        return f.apply(y, arguments);
      }
    };
  };
  that = this;
  f_add = function(c) {
    return that.addClass(c);
  };
  _proxy("add", f_add, this._dom.classList, this);
  f_remove = function(c) {
    return that.removeClass(c);
  };
  _proxy("remove", f_remove, this._dom.classList, this);
  this._dom.__defineSetter__('className', function(val) {
    return that.attr('class', val);
  });
  this._dom.__defineGetter__('className', function() {
    return that.attr('class');
  });
  this._dom.__defineSetter__('textContent', function(val) {
    that.empty();
    if (val !== "") {
      return that.append(val);
    }
  });
  if (proxies_are_initialized) {
    return;
  }
  proxies_are_initialized = true;
  insertBefore = function(insertedNode_s, adjacentNode) {
    var child, new_childs, pos;
    if (adjacentNode != null) {
      pos = adjacentNode._y_xml.getPosition();
    } else {
      pos = this.getChildren().length;
    }
    new_childs = [];
    if (insertedNode_s.nodeType === insertedNode_s.DOCUMENT_FRAGMENT_NODE) {
      child = insertedNode_s.firstChild;
      while (child != null) {
        new_childs.push(child);
        child = child.nextSibling;
      }
    } else {
      new_childs.push(insertedNode_s);
    }
    new_childs = new_childs.map(function(child) {
      if (child._y_xml != null) {
        return child._y_xml;
      } else if (child.nodeType === child.TEXT_NODE) {
        return child.textContent;
      } else {
        return new YXml(child);
      }
    });
    return this._model.val("children").insertContents(pos, new_childs);
  };
  _proxy('insertBefore', insertBefore);
  _proxy('appendChild', insertBefore);
  _proxy('removeAttribute', function(name) {
    return this.removeAttr(name);
  });
  _proxy('setAttribute', function(name, value) {
    return this.attr(name, value);
  });
  removeChild = function(node) {
    return node._y_xml.remove();
  };
  _proxy('removeChild', removeChild);
  replaceChild = function(insertedNode, replacedNode) {
    insertBefore.call(this, insertedNode, replacedNode);
    return removeChild.call(this, replacedNode);
  };
  return _proxy('replaceChild', replaceChild);
};

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    window.Y.Xml = YXml;
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YXml;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NvZGlvL3dvcmtzcGFjZS95LXhtbC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jb2Rpby93b3Jrc3BhY2UveS14bWwvbGliL3kteG1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsMEVBQUE7O0FBQUE7QUFFZSxFQUFBLGNBQUMsVUFBRCxFQUFhLFVBQWIsR0FBQTtBQUNYLFFBQUEsdURBQUE7O01BRHdCLGFBQWE7S0FDckM7QUFBQSxJQUFBLElBQU8sa0JBQVA7QUFBQTtLQUFBLE1BRUssSUFBRyxVQUFVLENBQUMsV0FBWCxLQUEwQixNQUE3QjtBQUNILE1BQUEsT0FBQSxHQUFVLFVBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxFQURSLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixHQUFpQixFQUZqQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sR0FBZ0IsT0FOaEIsQ0FBQTtBQU9BLE1BQUEsSUFBRyxVQUFVLENBQUMsV0FBWCxLQUE0QixNQUEvQjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sOENBQU4sQ0FBVixDQURGO09BUEE7QUFTQSxXQUFBLG9CQUFBOytCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsQ0FBQyxXQUFGLEtBQW1CLE1BQXRCO0FBQ0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sd0NBQU4sQ0FBVixDQURGO1NBREY7QUFBQSxPQVRBO0FBQUEsTUFZQSxJQUFDLENBQUEsSUFBSSxDQUFDLFVBQU4sR0FBbUIsVUFabkIsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLEdBQWdCLEVBYmhCLENBQUE7QUFBQSxNQWNBLFFBQUEsR0FBVyxJQUFDLENBQUEsSUFB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QVUsSUFBQSxLQUFBLENBQU0sMEJBQU4sQ0FBVixDQUhGO0dBREY7Q0EzZEE7O0FBaWVBLElBQUcsZ0RBQUg7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQWpCLENBREY7Q0FqZUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgWVhtbFxuXG4gIGNvbnN0cnVjdG9yOiAodGFnX29yX2RvbSwgYXR0cmlidXRlcyA9IHt9KS0+XG4gICAgaWYgbm90IHRhZ19vcl9kb20/XG4gICAgICAjIG5vcFxuICAgIGVsc2UgaWYgdGFnX29yX2RvbS5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgIHRhZ25hbWUgPSB0YWdfb3JfZG9tXG4gICAgICBAX3htbCA9IHt9XG4gICAgICBAX3htbC5jaGlsZHJlbiA9IFtdXG4gICAgICAjVE9ETzogSG93IHRvIGZvcmNlIHRoZSB1c2VyIHRvIHNwZWNpZnkgcGFyYW1ldGVycz9cbiAgICAgICNpZiBub3QgdGFnbmFtZT9cbiAgICAgICMgIHRocm93IG5ldyBFcnJvciBcIllvdSBtdXN0IHNwZWNpZnkgYSB0YWduYW1lXCJcbiAgICAgIEBfeG1sLnRhZ25hbWUgPSB0YWduYW1lXG4gICAgICBpZiBhdHRyaWJ1dGVzLmNvbnN0cnVjdG9yIGlzbnQgT2JqZWN0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlRoZSBhdHRyaWJ1dGVzIG11c3QgYmUgc3BlY2lmaWVkIGFzIGEgT2JqZWN0XCJcbiAgICAgIGZvciBhX25hbWUsIGEgb2YgYXR0cmlidXRlc1xuICAgICAgICBpZiBhLmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhlIGF0dHJpYnV0ZXMgbXVzdCBiZSBvZiB0eXBlIFN0cmluZyFcIlxuICAgICAgQF94bWwuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNcbiAgICAgIEBfeG1sLmNsYXNzZXMgPSB7fVxuICAgICAgX2NsYXNzZXMgPSBAX3htbC5hdHRyaWJ1dGVzLmNsYXNzXG4gICAgICBkZWxldGUgQF94bWwuYXR0cmlidXRlcy5jbGFzc1xuICAgICAgaWYgX2NsYXNzZXM/XG4gICAgICAgIGZvciBjX25hbWUsIGMgaW4gX2NsYXNzZXMuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgaWYgYy5sZW5ndGggPiAwXG4gICAgICAgICAgICBAX3htbC5jbGFzc2VzW2NfbmFtZV0gPSBjXG4gICAgICB1bmRlZmluZWRcbiAgICBlbHNlIGlmIHRhZ19vcl9kb20gaW5zdGFuY2VvZiBFbGVtZW50XG4gICAgICBAX2RvbSA9IHRhZ19vcl9kb21cbiAgICAgIEBfeG1sID0ge31cblxuXG5cbiAgX25hbWU6IFwiWG1sXCJcblxuICBfZ2V0TW9kZWw6IChZLCBvcHMpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAX3htbC50YWduYW1lID0gQF9kb20udGFnTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIEBfeG1sLmF0dHJpYnV0ZXMgPSB7fVxuICAgICAgICBAX3htbC5jbGFzc2VzID0ge31cbiAgICAgICAgZm9yIGF0dHJpYnV0ZSBpbiBAX2RvbS5hdHRyaWJ1dGVzXG4gICAgICAgICAgaWYgYXR0cmlidXRlLm5hbWUgaXMgXCJjbGFzc1wiXG4gICAgICAgICAgICBmb3IgYyBpbiBhdHRyaWJ1dGUudmFsdWUuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgICAgIEBfeG1sLmNsYXNzZXNbY10gPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQF94bWwuYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWVcbiAgICAgICAgQF94bWwuY2hpbGRyZW4gPSBbXVxuICAgICAgICBmb3IgY2hpbGQgaW4gQF9kb20uY2hpbGROb2Rlc1xuICAgICAgICAgIGlmIGNoaWxkLm5vZGVUeXBlIGlzIGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICAgICAgQF94bWwuY2hpbGRyZW4ucHVzaCBjaGlsZC50ZXh0Q29udGVudFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBfeG1sLmNoaWxkcmVuLnB1c2gobmV3IFlYbWwoY2hpbGQpKVxuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTWFwTWFuYWdlcihAKS5leGVjdXRlKClcbiAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiLCBuZXcgWS5PYmplY3QoQF94bWwuYXR0cmlidXRlcykpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIiwgbmV3IFkuT2JqZWN0KEBfeG1sLmNsYXNzZXMpKVxuICAgICAgQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIsIEBfeG1sLnRhZ25hbWUpXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIsIG5ldyBZLkxpc3QoQF94bWwuY2hpbGRyZW4pKVxuICAgICAgaWYgQF94bWwucGFyZW50P1xuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBAX3htbC5wYXJlbnQpXG5cbiAgICAgIGlmIEBfZG9tP1xuICAgICAgICBAZ2V0RG9tKCkgIyB0d28gd2F5IGJpbmQgZG9tIHRvIHRoaXMgeG1sIHR5cGVcblxuICAgICAgQF9zZXRNb2RlbCBAX21vZGVsXG5cbiAgICBAX21vZGVsXG5cbiAgX3NldE1vZGVsOiAoQF9tb2RlbCktPlxuICAgIEBfbW9kZWwub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgIGlmIGV2ZW50Lm5hbWUgaXMgXCJwYXJlbnRcIiBhbmQgZXZlbnQudHlwZSBpc250IFwiYWRkXCJcbiAgICAgICAgICBwYXJlbnQgPSBldmVudC5vbGRWYWx1ZVxuICAgICAgICAgIGNoaWxkcmVuID0gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKT8udmFsKClcbiAgICAgICAgICBpZiBjaGlsZHJlbj9cbiAgICAgICAgICAgIGZvciBjLGkgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgICAgaWYgYyBpcyBAXG4gICAgICAgICAgICAgICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5kZWxldGUgaVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgZGVsZXRlIEBfeG1sXG5cbiAgX3NldFBhcmVudDogKHBhcmVudCktPlxuICAgIGlmIHBhcmVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgIGlmIEBfbW9kZWw/XG4gICAgICAgIEByZW1vdmUoKVxuICAgICAgICBAX21vZGVsLnZhbChcInBhcmVudFwiLCBwYXJlbnQpXG4gICAgICBlbHNlXG4gICAgICAgIEBfeG1sLnBhcmVudCA9IHBhcmVudFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcInBhcmVudCBtdXN0IGJlIG9mIHR5cGUgWS5YbWwhXCJcblxuICB0b1N0cmluZzogKCktPlxuICAgIHhtbCA9IFwiPFwiK0BfbW9kZWwudmFsKFwidGFnbmFtZVwiKVxuICAgIGZvciBuYW1lLCB2YWx1ZSBvZiBAYXR0cigpXG4gICAgICB4bWwgKz0gXCIgXCIrbmFtZSsnPVwiJyt2YWx1ZSsnXCInXG4gICAgeG1sICs9IFwiPlwiXG4gICAgZm9yIGNoaWxkIGluIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikudmFsKClcbiAgICAgIHhtbCArPSBjaGlsZC50b1N0cmluZygpXG4gICAgeG1sICs9ICc8LycrQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKyc+J1xuICAgIHhtbFxuXG4gICNcbiAgIyBHZXQvc2V0IHRoZSBhdHRyaWJ1dGUocykgb2YgdGhpcyBlbGVtZW50LlxuICAjIC5hdHRyKClcbiAgIyAuYXR0cihuYW1lKVxuICAjIC5hdHRyKG5hbWUsIHZhbHVlKVxuICAjXG4gIGF0dHI6IChuYW1lLCB2YWx1ZSktPlxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICBpZiB2YWx1ZS5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGUgYXR0cmlidXRlcyBtdXN0IGJlIG9mIHR5cGUgU3RyaW5nIVwiXG4gICAgICBpZiBuYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICBjbGFzc2VzID0gdmFsdWUuc3BsaXQoXCIgXCIpXG4gICAgICAgIGNzID0ge31cbiAgICAgICAgZm9yIGMgaW4gY2xhc3Nlc1xuICAgICAgICAgIGNzW2NdID0gdHJ1ZVxuXG4gICAgICAgIEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiLCBuZXcgQF9tb2RlbC5jdXN0b21fdHlwZXMuT2JqZWN0KGNzKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQF9tb2RlbC52YWwoXCJhdHRyaWJ1dGVzXCIpLnZhbChuYW1lLCB2YWx1ZSlcbiAgICAgIEBcbiAgICBlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPiAwXG4gICAgICBpZiBuYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgICBPYmplY3Qua2V5cyhAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKCkpLmpvaW4oXCIgXCIpXG4gICAgICBlbHNlXG4gICAgICAgIEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwobmFtZSlcbiAgICBlbHNlXG4gICAgICBhdHRycyA9IEBfbW9kZWwudmFsKFwiYXR0cmlidXRlc1wiKS52YWwoKVxuICAgICAgY2xhc3NlcyA9IE9iamVjdC5rZXlzKEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS52YWwoKSkuam9pbihcIiBcIilcbiAgICAgIGlmIGNsYXNzZXMubGVuZ3RoID4gMFxuICAgICAgICBhdHRyc1tcImNsYXNzXCJdID0gY2xhc3Nlc1xuICAgICAgYXR0cnNcblxuICAjXG4gICMgQWRkcyB0aGUgc3BlY2lmaWVkIGNsYXNzKGVzKSB0byB0aGlzIGVsZW1lbnRcbiAgI1xuICBhZGRDbGFzczogKG5hbWVzKS0+XG4gICAgZm9yIG5hbWUgaW4gbmFtZXMuc3BsaXQoXCIgXCIpXG4gICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikudmFsKG5hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBJbnNlcnQgY29udGVudCwgc3BlY2lmaWVkIGJ5IHRoZSBwYXJhbWV0ZXIsIGFmdGVyIHRoaXMgZWxlbWVudFxuICAjIC5hZnRlcihjb250ZW50IFssIGNvbnRlbnRdKVxuICAjXG4gIGFmdGVyOiAoKS0+XG4gICAgcGFyZW50ID0gQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcbiAgICBpZiBub3QgcGFyZW50P1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBYbWwgRWxlbWVudCBtdXN0IG5vdCBoYXZlIHNpYmxpbmdzISAoZm9yIGl0IGRvZXMgbm90IGhhdmUgYSBwYXJlbnQpXCJcblxuICAgICMgZmluZCB0aGUgcG9zaXRpb24gb2YgdGhpcyBlbGVtZW50XG4gICAgZm9yIGMscG9zaXRpb24gaW4gcGFyZW50LmdldENoaWxkcmVuKClcbiAgICAgIGlmIGMgaXMgQFxuICAgICAgICBicmVha1xuXG4gICAgY29udGVudHMgPSBbXVxuICAgIGZvciBjb250ZW50IGluIGFyZ3VtZW50c1xuICAgICAgaWYgY29udGVudCBpbnN0YW5jZW9mIFlYbWxcbiAgICAgICAgY29udGVudC5fc2V0UGFyZW50KEBfbW9kZWwudmFsKFwicGFyZW50XCIpKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIGNvbnRlbnRzLnB1c2ggY29udGVudFxuXG4gICAgcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS5pbnNlcnRDb250ZW50cyhwb3NpdGlvbisxLCBjb250ZW50cylcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCB0byB0aGUgZW5kIG9mIHRoaXMgZWxlbWVudFxuICAjIC5hcHBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBhcHBlbmQ6ICgpLT5cbiAgICBmb3IgY29udGVudCBpbiBhcmd1bWVudHNcbiAgICAgIGlmIGNvbnRlbnQgaW5zdGFuY2VvZiBZWG1sXG4gICAgICAgIGNvbnRlbnQuX3NldFBhcmVudChAKVxuICAgICAgZWxzZSBpZiBjb250ZW50LmNvbnN0cnVjdG9yIGlzbnQgU3RyaW5nXG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuWG1sLmFmdGVyIGV4cGVjdHMgaW5zdGFuY2VzIG9mIFlYbWwgb3IgU3RyaW5nIGFzIGEgcGFyYW1ldGVyXCJcbiAgICAgIEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIikucHVzaChjb250ZW50KVxuICAgIEBcblxuICAjXG4gICMgSW5zZXJ0IGNvbnRlbnQsIHNwZWNpZmllZCBieSB0aGUgcGFyYW1ldGVyLCBhZnRlciB0aGlzIGVsZW1lbnRcbiAgIyAuYWZ0ZXIoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBiZWZvcmU6ICgpLT5cbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIG5vdCBwYXJlbnQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJUaGlzIFhtbCBFbGVtZW50IG11c3Qgbm90IGhhdmUgc2libGluZ3MhIChmb3IgaXQgZG9lcyBub3QgaGF2ZSBhIHBhcmVudClcIlxuXG4gICAgIyBmaW5kIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGVsZW1lbnRcbiAgICBmb3IgYyxwb3NpdGlvbiBpbiBwYXJlbnQuZ2V0Q2hpbGRyZW4oKVxuICAgICAgaWYgYyBpcyBAXG4gICAgICAgIGJyZWFrXG5cbiAgICBjb250ZW50cyA9IFtdXG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQF9tb2RlbC52YWwoXCJwYXJlbnRcIikpXG4gICAgICBlbHNlIGlmIGNvbnRlbnQuY29uc3RydWN0b3IgaXNudCBTdHJpbmdcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5YbWwuYWZ0ZXIgZXhwZWN0cyBpbnN0YW5jZXMgb2YgWVhtbCBvciBTdHJpbmcgYXMgYSBwYXJhbWV0ZXJcIlxuICAgICAgY29udGVudHMucHVzaCBjb250ZW50XG5cbiAgICBwYXJlbnQuX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzKHBvc2l0aW9uLCBjb250ZW50cylcblxuICAjXG4gICMgUmVtb3ZlIGFsbCBjaGlsZCBub2RlcyBvZiB0aGUgc2V0IG9mIG1hdGNoZWQgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxuICAjIC5lbXB0eSgpXG4gICNcbiAgZW1wdHk6ICgpLT5cbiAgICAjIFRPRE86IGRvIGl0IGxpa2UgdGhpcyA6IEBfbW9kZWwudmFsKFwiY2hpbGRyZW5cIiwgbmV3IFkuTGlzdCgpKVxuICAgIGNoaWxkcmVuID0gQF9tb2RlbC52YWwoXCJjaGlsZHJlblwiKVxuICAgIGZvciBjaGlsZCBpbiBjaGlsZHJlbi52YWwoKVxuICAgICAgaWYgY2hpbGQuY29uc3RydWN0b3IgaXMgU3RyaW5nXG4gICAgICAgIGNoaWxkcmVuLmRlbGV0ZSgwKVxuICAgICAgZWxzZVxuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuXG4gICNcbiAgIyBEZXRlcm1pbmUgd2hldGhlciBhbnkgb2YgdGhlIG1hdGNoZWQgZWxlbWVudHMgYXJlIGFzc2lnbmVkIHRoZSBnaXZlbiBjbGFzcy5cbiAgIyAuaGFzQ2xhc3MoY2xhc3NOYW1lKVxuICAjXG4gIGhhc0NsYXNzOiAoY2xhc3NOYW1lKS0+XG4gICAgaWYgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIpLnZhbChjbGFzc05hbWUpP1xuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgI1xuICAjIEluc2VydCBjb250ZW50LCBzcGVjaWZpZWQgYnkgdGhlIHBhcmFtZXRlciwgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIGVsZW1lbnQuXG4gICMgLnByZXBlbmQoY29udGVudCBbLCBjb250ZW50XSlcbiAgI1xuICBwcmVwZW5kOiAoKS0+XG4gICAgZm9yIGNvbnRlbnQgaW4gYXJndW1lbnRzXG4gICAgICBpZiBjb250ZW50IGluc3RhbmNlb2YgWVhtbFxuICAgICAgICBjb250ZW50Ll9zZXRQYXJlbnQoQClcbiAgICAgIGVsc2UgaWYgY29udGVudC5jb25zdHJ1Y3RvciBpc250IFN0cmluZ1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLlhtbC5hZnRlciBleHBlY3RzIGluc3RhbmNlcyBvZiBZWG1sIG9yIFN0cmluZyBhcyBhIHBhcmFtZXRlclwiXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydCgwLCBjb250ZW50KVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIHRoZSBET01cbiAgIyAucmVtb3ZlKClcbiAgI1xuICByZW1vdmU6ICgpLT5cbiAgICBwYXJlbnQgPSBAX21vZGVsLmRlbGV0ZShcInBhcmVudFwiKVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIGFuIGF0dHJpYnV0ZSBmcm9tIHRoaXMgZWxlbWVudFxuICAjIC5yZW1vdmVBdHRyKGF0dHJOYW1lKVxuICAjXG4gIHJlbW92ZUF0dHI6IChhdHRyTmFtZSktPlxuICAgIGlmIGF0dHJOYW1lIGlzIFwiY2xhc3NcIlxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikuZGVsZXRlKGF0dHJOYW1lKVxuICAgIEBcblxuICAjXG4gICMgUmVtb3ZlIGEgc2luZ2xlIGNsYXNzLCBtdWx0aXBsZSBjbGFzc2VzLCBvciBhbGwgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudFxuICAjIC5yZW1vdmVDbGFzcyhbY2xhc3NOYW1lXSlcbiAgI1xuICByZW1vdmVDbGFzczogKCktPlxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggaXMgMFxuICAgICAgQF9tb2RlbC52YWwoXCJjbGFzc2VzXCIsIG5ldyBAX21vZGVsLmN1c3RvbV90eXBlcy5PYmplY3QoKSlcbiAgICBlbHNlXG4gICAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgICBAX21vZGVsLnZhbChcImNsYXNzZXNcIikuZGVsZXRlKGNsYXNzTmFtZSlcbiAgICBAXG5cbiAgI1xuICAjIEFkZCBvciByZW1vdmUgb25lIG9yIG1vcmUgY2xhc3NlcyBmcm9tIHRoaXMgZWxlbWVudCxcbiAgIyBkZXBlbmRpbmcgb24gZWl0aGVyIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBzdGF0ZSBhcmd1bWVudC5cbiAgIyAudG9nZ2xlQ2xhc3MoW2NsYXNzTmFtZV0pXG4gICNcbiAgdG9nZ2xlQ2xhc3M6ICgpLT5cbiAgICBmb3IgY2xhc3NOYW1lIGluIGFyZ3VtZW50c1xuICAgICAgY2xhc3NlcyA9IEBfbW9kZWwudmFsKFwiY2xhc3Nlc1wiKVxuICAgICAgaWYgY2xhc3Nlcy52YWwoY2xhc3NOYW1lKT9cbiAgICAgICAgY2xhc3Nlcy5kZWxldGUoY2xhc3NOYW1lKVxuICAgICAgZWxzZVxuICAgICAgICBjbGFzc2VzLnZhbChjbGFzc05hbWUsIHRydWUpXG4gICAgQFxuXG4gICNcbiAgIyBHZXQgdGhlIHBhcmVudCBvZiB0aGlzIEVsZW1lbnRcbiAgIyBATm90ZTogRXZlcnkgWE1MIGVsZW1lbnQgY2FuIG9ubHkgaGF2ZSBvbmUgcGFyZW50XG4gICMgLmdldFBhcmVudCgpXG4gICNcbiAgZ2V0UGFyZW50OiAoKS0+XG4gICAgQF9tb2RlbC52YWwoXCJwYXJlbnRcIilcblxuICAjXG4gICMgR2V0IGFsbCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBYTUwgRWxlbWVudCBhcyBhbiBBcnJheVxuICAjIEBOb3RlOiBUaGUgY2hpbGRyZW4gYXJlIGVpdGhlciBvZiB0eXBlIFkuWG1sIG9yIFN0cmluZ1xuICAjIC5nZXRDaGlsZHJlbigpXG4gICNcbiAgZ2V0Q2hpbGRyZW46ICgpLT5cbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLnZhbCgpXG5cbiAgZ2V0UG9zaXRpb246ICgpLT5cbiAgICBwYXJlbnQgPSBAX21vZGVsLnZhbChcInBhcmVudFwiKVxuICAgIGlmIHBhcmVudD9cbiAgICAgIGZvciBjLGkgaW4gcGFyZW50Ll9tb2RlbC52YWwoXCJjaGlsZHJlblwiKS52YWwoKVxuICAgICAgICBpZiBjIGlzIEBcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiVGhpcyBpcyBub3QgYSBjaGlsZCBvZiBpdHMgcGFyZW50IChzaG91bGQgbm90IGhhcHBlbiBpbiBZLlhtbCEpXCJcbiAgICBlbHNlXG4gICAgICBudWxsXG5cblxuICBnZXREb206ICgpLT5cbiAgICBpZiBub3QgQF9kb20/XG4gICAgICBAX2RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoQF9tb2RlbC52YWwoXCJ0YWduYW1lXCIpKVxuXG4gICAgICAjIHNldCB0aGUgYXR0cmlidXRlcyBfYW5kXyB0aGUgY2xhc3NlcyAoQHNlZSAuYXR0cigpKVxuICAgICAgZm9yIGF0dHJfbmFtZSwgYXR0cl92YWx1ZSBvZiBAYXR0cigpXG4gICAgICAgIEBfZG9tLnNldEF0dHJpYnV0ZSBhdHRyX25hbWUsIGF0dHJfdmFsdWVcbiAgICAgIGZvciBjaGlsZCxpIGluIEBnZXRDaGlsZHJlbigpXG4gICAgICAgIGlmIGNoaWxkLmNvbnN0cnVjdG9yIGlzIFN0cmluZ1xuICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlIGNoaWxkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkb20gPSBjaGlsZC5nZXREb20oKVxuICAgICAgICBAX2RvbS5pbnNlcnRCZWZvcmUgZG9tXG5cbiAgICB0aGF0ID0gQFxuXG4gICAgaWYgKG5vdCBAX2RvbS5feV94bWw/KVxuICAgICAgQF9kb20uX3lfeG1sID0gQFxuICAgICAgaW5pdGlhbGl6ZV9wcm94aWVzLmNhbGwgQFxuXG4gICAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLm9ic2VydmUgKGV2ZW50cyktPlxuICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgaWYgZXZlbnQudHlwZSBpcyBcImluc2VydFwiXG4gICAgICAgICAgICBpZiBldmVudC52YWx1ZS5jb25zdHJ1Y3RvciBpcyBTdHJpbmdcbiAgICAgICAgICAgICAgbmV3Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LnZhbHVlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBuZXdOb2RlID0gZXZlbnQudmFsdWUuZ2V0RG9tKClcbiAgICAgICAgICAgICAgZXZlbnQudmFsdWUuX3NldFBhcmVudCB0aGF0XG4gICAgICAgICAgICBjaGlsZHJlbiA9IHRoYXQuX2RvbS5jaGlsZE5vZGVzXG4gICAgICAgICAgICBpZiBjaGlsZHJlbi5sZW5ndGggaXMgZXZlbnQucG9zaXRpb25cbiAgICAgICAgICAgICAgcmlnaHROb2RlID0gbnVsbFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByaWdodE5vZGUgPSBjaGlsZHJlbltldmVudC5wb3NpdGlvbl1cblxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5pbnNlcnRCZWZvcmUgbmV3Tm9kZSwgcmlnaHROb2RlXG4gICAgICAgICAgZWxzZSBpZiBldmVudC50eXBlIGlzIFwiZGVsZXRlXCJcbiAgICAgICAgICAgIGRlbGV0ZWQgPSBldmVudC5vbGRWYWx1ZS5nZXREb20oKVxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVDaGlsZCBkZWxldGVkXG4gICAgICBAX21vZGVsLnZhbChcImF0dHJpYnV0ZXNcIikub2JzZXJ2ZSAoZXZlbnRzKS0+XG4gICAgICAgIGZvciBldmVudCBpbiBldmVudHNcbiAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICBuZXd2YWwgPSBldmVudC5vYmplY3QudmFsKGV2ZW50Lm5hbWUpXG4gICAgICAgICAgICBkb250X3Byb3h5ICgpLT5cbiAgICAgICAgICAgICAgdGhhdC5fZG9tLnNldEF0dHJpYnV0ZSBldmVudC5uYW1lLCBuZXd2YWxcbiAgICAgICAgICBlbHNlIGlmIGV2ZW50LnR5cGUgaXMgXCJkZWxldGVcIlxuICAgICAgICAgICAgZG9udF9wcm94eSAoKS0+XG4gICAgICAgICAgICAgIHRoYXQuX2RvbS5yZW1vdmVBdHRyaWJ1dGUgZXZlbnQubmFtZVxuICAgICAgc2V0Q2xhc3NlcyA9ICgpLT5cbiAgICAgICAgdGhhdC5fbW9kZWwudmFsKFwiY2xhc3Nlc1wiKS5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiBldmVudC50eXBlIGlzIFwiYWRkXCIgb3IgZXZlbnQudHlwZSBpcyBcInVwZGF0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QuYWRkIGV2ZW50Lm5hbWUgIyBjbGFzc2VzIGFyZSBzdG9yZWQgYXMgdGhlIGtleXNcbiAgICAgICAgICAgIGVsc2UgaWYgZXZlbnQudHlwZSBpcyBcImRlbGV0ZVwiXG4gICAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5jbGFzc0xpc3QucmVtb3ZlIGV2ZW50Lm5hbWVcbiAgICAgIHNldENsYXNzZXMoKVxuICAgICAgQF9tb2RlbC5vYnNlcnZlIChldmVudHMpLT5cbiAgICAgICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgICAgIGlmIGV2ZW50LnR5cGUgaXMgXCJhZGRcIiBvciBldmVudC50eXBlIGlzIFwidXBkYXRlXCJcbiAgICAgICAgICAgIGRvbnRfcHJveHkgKCktPlxuICAgICAgICAgICAgICBjbGFzc2VzID0gdGhhdC5hdHRyKFwiY2xhc3NcIilcbiAgICAgICAgICAgICAgaWYgKG5vdCBjbGFzc2VzPykgb3IgY2xhc3NlcyBpcyBcIlwiXG4gICAgICAgICAgICAgICAgdGhhdC5fZG9tLnJlbW92ZUF0dHJpYnV0ZSBcImNsYXNzXCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoYXQuX2RvbS5zZXRBdHRyaWJ1dGUgXCJjbGFzc1wiLCB0aGF0LmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgc2V0Q2xhc3NlcygpXG5cbiAgICBAX2RvbVxuXG5wcm94aWVzX2FyZV9pbml0aWFsaXplZCA9IGZhbHNlXG4jIHNvbWUgZG9tIGltcGxlbWVudGF0aW9ucyBtYXkgY2FsbCBhbm90aGVyIGRvbS5tZXRob2QgdGhhdCBzaW11bGF0ZXMgdGhlIGJlaGF2aW9yIG9mIGFub3RoZXIuXG4jIEZvciBleGFtcGxlIHhtbC5pbnNlcnRDaGlsZChkb20pICwgd2ljaCBpbnNlcnRzIGFuIGVsZW1lbnQgYXQgdGhlIGVuZCwgYW5kIHhtbC5pbnNlcnRBZnRlcihkb20sbnVsbCkgd2ljaCBkb2VzIHRoZSBzYW1lXG4jIEJ1dCBZJ3MgcHJveHkgbWF5IGJlIGNhbGxlZCBvbmx5IG9uY2UhXG5wcm94eV90b2tlbiA9IGZhbHNlXG5kb250X3Byb3h5ID0gKGYpLT5cbiAgcHJveHlfdG9rZW4gPSB0cnVlXG4gIHRyeVxuICAgIGYoKVxuICBjYXRjaCBlXG4gICAgcHJveHlfdG9rZW4gPSBmYWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBlXG4gIHByb3h5X3Rva2VuID0gZmFsc2VcblxuaW5pdGlhbGl6ZV9wcm94aWVzID0gKCktPlxuXG4gIF9wcm94eSA9IChmX25hbWUsIGYsIHNvdXJjZSA9IEVsZW1lbnQucHJvdG90eXBlLCB5KS0+XG4gICAgb2xkX2YgPSBzb3VyY2VbZl9uYW1lXVxuICAgIHNvdXJjZVtmX25hbWVdID0gKCktPlxuICAgICAgaWYgKG5vdCAoeT8gb3IgQF95X3htbD8pKSBvciBwcm94eV90b2tlblxuICAgICAgICBvbGRfZi5hcHBseSB0aGlzLCBhcmd1bWVudHNcbiAgICAgIGVsc2UgaWYgQF95X3htbD9cbiAgICAgICAgZi5hcHBseSBAX3lfeG1sLCBhcmd1bWVudHNcbiAgICAgIGVsc2VcbiAgICAgICAgZi5hcHBseSB5LCBhcmd1bWVudHNcblxuICB0aGF0ID0gdGhpc1xuICBmX2FkZCA9IChjKS0+XG4gICAgdGhhdC5hZGRDbGFzcyBjXG4gIF9wcm94eSBcImFkZFwiLCBmX2FkZCwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgZl9yZW1vdmUgPSAoYyktPlxuICAgIHRoYXQucmVtb3ZlQ2xhc3MgY1xuXG4gIF9wcm94eSBcInJlbW92ZVwiLCBmX3JlbW92ZSwgQF9kb20uY2xhc3NMaXN0LCBAXG5cbiAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAnY2xhc3NOYW1lJywgKHZhbCktPlxuICAgIHRoYXQuYXR0cignY2xhc3MnLCB2YWwpXG4gIEBfZG9tLl9fZGVmaW5lR2V0dGVyX18gJ2NsYXNzTmFtZScsICgpLT5cbiAgICB0aGF0LmF0dHIoJ2NsYXNzJylcbiAgQF9kb20uX19kZWZpbmVTZXR0ZXJfXyAndGV4dENvbnRlbnQnLCAodmFsKS0+XG4gICAgIyByZW1vdmUgYWxsIG5vZGVzXG4gICAgdGhhdC5lbXB0eSgpXG5cbiAgICAjIGluc2VydCB3b3JkIGNvbnRlbnRcbiAgICBpZiB2YWwgaXNudCBcIlwiXG4gICAgICB0aGF0LmFwcGVuZCB2YWxcblxuXG4gIGlmIHByb3hpZXNfYXJlX2luaXRpYWxpemVkXG4gICAgcmV0dXJuXG4gIHByb3hpZXNfYXJlX2luaXRpYWxpemVkID0gdHJ1ZVxuXG4gICMgdGhlIGZvbGxvd2luZyBtZXRob2RzIGFyZSBpbml0aWFsaXplZCBvbiBwcm90b3R5cGVzIGFuZCB0aGVyZWZvcmUgdGhleSBuZWVkIHRvIGJlIHdyaXR0ZW4gb25seSBvbmNlIVxuXG4gIGluc2VydEJlZm9yZSA9IChpbnNlcnRlZE5vZGVfcywgYWRqYWNlbnROb2RlKS0+XG4gICAgaWYgYWRqYWNlbnROb2RlP1xuICAgICAgcG9zID0gYWRqYWNlbnROb2RlLl95X3htbC5nZXRQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgcG9zID0gQGdldENoaWxkcmVuKCkubGVuZ3RoXG5cbiAgICBuZXdfY2hpbGRzID0gW11cbiAgICBpZiBpbnNlcnRlZE5vZGVfcy5ub2RlVHlwZSBpcyBpbnNlcnRlZE5vZGVfcy5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFXG4gICAgICBjaGlsZCA9IGluc2VydGVkTm9kZV9zLmZpcnN0Q2hpbGRcbiAgICAgIHdoaWxlIGNoaWxkP1xuICAgICAgICBuZXdfY2hpbGRzLnB1c2ggY2hpbGRcbiAgICAgICAgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZ1xuICAgIGVsc2VcbiAgICAgIG5ld19jaGlsZHMucHVzaCBpbnNlcnRlZE5vZGVfc1xuICAgIG5ld19jaGlsZHMgPSBuZXdfY2hpbGRzLm1hcCAoY2hpbGQpLT5cbiAgICAgIGlmIGNoaWxkLl95X3htbD9cbiAgICAgICAgY2hpbGQuX3lfeG1sXG4gICAgICBlbHNlIGlmIGNoaWxkLm5vZGVUeXBlID09IGNoaWxkLlRFWFRfTk9ERVxuICAgICAgICBjaGlsZC50ZXh0Q29udGVudFxuICAgICAgZWxzZVxuICAgICAgICBuZXcgWVhtbChjaGlsZClcbiAgICBAX21vZGVsLnZhbChcImNoaWxkcmVuXCIpLmluc2VydENvbnRlbnRzIHBvcywgbmV3X2NoaWxkc1xuXG4gIF9wcm94eSAnaW5zZXJ0QmVmb3JlJywgaW5zZXJ0QmVmb3JlXG4gIF9wcm94eSAnYXBwZW5kQ2hpbGQnLCBpbnNlcnRCZWZvcmVcbiAgX3Byb3h5ICdyZW1vdmVBdHRyaWJ1dGUnLCAobmFtZSktPlxuICAgIEByZW1vdmVBdHRyIG5hbWVcbiAgX3Byb3h5ICdzZXRBdHRyaWJ1dGUnLCAobmFtZSwgdmFsdWUpLT5cbiAgICBAYXR0ciBuYW1lLCB2YWx1ZVxuXG4gIHJlbW92ZUNoaWxkID0gKG5vZGUpLT5cbiAgICBub2RlLl95X3htbC5yZW1vdmUoKVxuICBfcHJveHkgJ3JlbW92ZUNoaWxkJywgcmVtb3ZlQ2hpbGRcbiAgcmVwbGFjZUNoaWxkID0gKGluc2VydGVkTm9kZSwgcmVwbGFjZWROb2RlKS0+ICMgVE9ETzogaGFuZGxlIHJlcGxhY2Ugd2l0aCByZXBsYWNlIGJlaGF2aW9yLi4uXG4gICAgaW5zZXJ0QmVmb3JlLmNhbGwgdGhpcywgaW5zZXJ0ZWROb2RlLCByZXBsYWNlZE5vZGVcbiAgICByZW1vdmVDaGlsZC5jYWxsIHRoaXMsIHJlcGxhY2VkTm9kZVxuICBfcHJveHkgJ3JlcGxhY2VDaGlsZCcsIHJlcGxhY2VDaGlsZFxuXG5pZiB3aW5kb3c/XG4gIGlmIHdpbmRvdy5ZP1xuICAgIHdpbmRvdy5ZLlhtbCA9IFlYbWxcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBcIllvdSBtdXN0IGZpcnN0IGltcG9ydCBZIVwiXG5cbmlmIG1vZHVsZT9cbiAgbW9kdWxlLmV4cG9ydHMgPSBZWG1sXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
