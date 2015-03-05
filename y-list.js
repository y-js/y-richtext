(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var YList;

YList = (function() {
  function YList(list) {
    if (list == null) {
      this._list = [];
    } else if (list.constructor === Array) {
      this._list = list;
    } else {
      throw new Error("Y.List expects an Array as a parameter");
    }
  }

  YList.prototype._name = "List";

  YList.prototype._getModel = function(types, ops) {
    if (this._model == null) {
      this._model = new ops.ListManager(this).execute();
      this._model.insert(0, this._list);
    }
    delete this._list;
    return this._model;
  };

  YList.prototype._setModel = function(_model) {
    this._model = _model;
    return delete this._list;
  };

  YList.prototype.val = function() {
    return this._model.val.apply(this._model, arguments);
  };

  YList.prototype.observe = function() {
    this._model.observe.apply(this._model, arguments);
    return this;
  };

  YList.prototype.unobserve = function() {
    this._model.unobserve.apply(this._model, arguments);
    return this;
  };

  YList.prototype.insert = function(position, content) {
    if (typeof position !== "number") {
      throw new Error("Y.List.insert expects a Number as the first parameter!");
    }
    this._model.insert(position, [content]);
    return this;
  };

  YList.prototype.insertContents = function(position, contents) {
    if (typeof position !== "number") {
      throw new Error("Y.List.insert expects a Number as the first parameter!");
    }
    this._model.insert(position, contents);
    return this;
  };

  YList.prototype["delete"] = function(position, length) {
    this._model["delete"](position, length);
    return this;
  };

  YList.prototype.push = function(content) {
    this._model.push(content);
    return this;
  };

  return YList;

})();

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    window.Y.List = YList;
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YList;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NvZGlvL3dvcmtzcGFjZS95LWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvY29kaW8vd29ya3NwYWNlL3ktbGlzdC9saWIveS1saXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsS0FBQTs7QUFBQTtBQU1lLEVBQUEsZUFBQyxJQUFELEdBQUE7QUFDWCxJQUFBLElBQU8sWUFBUDtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFULENBREY7S0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsS0FBb0IsS0FBdkI7QUFDSCxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBVCxDQURHO0tBQUEsTUFBQTtBQUdILFlBQVUsSUFBQSxLQUFBLENBQU0sd0NBQU4sQ0FBVixDQUhHO0tBSE07RUFBQSxDQUFiOztBQUFBLGtCQVFBLEtBQUEsR0FBTyxNQVJQLENBQUE7O0FBQUEsa0JBVUEsU0FBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNULElBQUEsSUFBTyxtQkFBUDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQWtCLENBQUMsT0FBbkIsQ0FBQSxDQUFkLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLENBQWYsRUFBa0IsSUFBQyxDQUFBLEtBQW5CLENBREEsQ0FERjtLQUFBO0FBQUEsSUFHQSxNQUFBLENBQUEsSUFBUSxDQUFBLEtBSFIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxPQUxRO0VBQUEsQ0FWWCxDQUFBOztBQUFBLGtCQWlCQSxTQUFBLEdBQVcsU0FBRSxNQUFGLEdBQUE7QUFDVCxJQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtXQUFBLE1BQUEsQ0FBQSxJQUFRLENBQUEsTUFEQztFQUFBLENBakJYLENBQUE7O0FBQUEsa0JBb0JBLEdBQUEsR0FBSyxTQUFBLEdBQUE7V0FDSCxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxNQUFuQixFQUEyQixTQUEzQixFQURHO0VBQUEsQ0FwQkwsQ0FBQTs7QUFBQSxrQkF1QkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBaEIsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLFNBQS9CLENBQUEsQ0FBQTtXQUNBLEtBRk87RUFBQSxDQXZCVCxDQUFBOztBQUFBLGtCQTJCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFsQixDQUF3QixJQUFDLENBQUEsTUFBekIsRUFBaUMsU0FBakMsQ0FBQSxDQUFBO1dBQ0EsS0FGUztFQUFBLENBM0JYLENBQUE7O0FBQUEsa0JBb0NBLE1BQUEsR0FBUSxTQUFDLFFBQUQsRUFBVyxPQUFYLEdBQUE7QUFDTixJQUFBLElBQUcsTUFBQSxDQUFBLFFBQUEsS0FBcUIsUUFBeEI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdEQUFOLENBQVYsQ0FERjtLQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmLEVBQXlCLENBQUMsT0FBRCxDQUF6QixDQUZBLENBQUE7V0FHQSxLQUpNO0VBQUEsQ0FwQ1IsQ0FBQTs7QUFBQSxrQkEwQ0EsY0FBQSxHQUFnQixTQUFDLFFBQUQsRUFBVyxRQUFYLEdBQUE7QUFDZCxJQUFBLElBQUcsTUFBQSxDQUFBLFFBQUEsS0FBcUIsUUFBeEI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdEQUFOLENBQVYsQ0FERjtLQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmLEVBQXlCLFFBQXpCLENBRkEsQ0FBQTtXQUdBLEtBSmM7RUFBQSxDQTFDaEIsQ0FBQTs7QUFBQSxrQkFnREEsU0FBQSxHQUFRLFNBQUMsUUFBRCxFQUFXLE1BQVgsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFELENBQVAsQ0FBZSxRQUFmLEVBQXlCLE1BQXpCLENBQUEsQ0FBQTtXQUNBLEtBRk07RUFBQSxDQWhEUixDQUFBOztBQUFBLGtCQW9EQSxJQUFBLEdBQU0sU0FBQyxPQUFELEdBQUE7QUFDSixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBQSxDQUFBO1dBQ0EsS0FGSTtFQUFBLENBcEROLENBQUE7O2VBQUE7O0lBTkYsQ0FBQTs7QUE4REEsSUFBRyxnREFBSDtBQUNFLEVBQUEsSUFBRyxnQkFBSDtBQUNFLElBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFULEdBQWdCLEtBQWhCLENBREY7R0FBQSxNQUFBO0FBR0UsVUFBVSxJQUFBLEtBQUEsQ0FBTSwwQkFBTixDQUFWLENBSEY7R0FERjtDQTlEQTs7QUFvRUEsSUFBRyxnREFBSDtBQUNFLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBakIsQ0FERjtDQXBFQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBZTGlzdFxuXG4gICNcbiAgIyBAcHJpdmF0ZVxuICAjIEBwYXJhbSB7T2JqZWN0fSB1aWQgQSB1bmlxdWUgaWRlbnRpZmllci4gSWYgdWlkIGlzIHVuZGVmaW5lZCwgYSBuZXcgdWlkIHdpbGwgYmUgY3JlYXRlZC5cbiAgI1xuICBjb25zdHJ1Y3RvcjogKGxpc3QpLT5cbiAgICBpZiBub3QgbGlzdD9cbiAgICAgIEBfbGlzdCA9IFtdXG4gICAgZWxzZSBpZiBsaXN0LmNvbnN0cnVjdG9yIGlzIEFycmF5XG4gICAgICBAX2xpc3QgPSBsaXN0XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5MaXN0IGV4cGVjdHMgYW4gQXJyYXkgYXMgYSBwYXJhbWV0ZXJcIlxuXG4gIF9uYW1lOiBcIkxpc3RcIlxuXG4gIF9nZXRNb2RlbDogKHR5cGVzLCBvcHMpLT5cbiAgICBpZiBub3QgQF9tb2RlbD9cbiAgICAgIEBfbW9kZWwgPSBuZXcgb3BzLkxpc3RNYW5hZ2VyKEApLmV4ZWN1dGUoKVxuICAgICAgQF9tb2RlbC5pbnNlcnQgMCwgQF9saXN0XG4gICAgZGVsZXRlIEBfbGlzdFxuICAgIEBfbW9kZWxcblxuICBfc2V0TW9kZWw6IChAX21vZGVsKS0+XG4gICAgZGVsZXRlIEBfbGlzdFxuXG4gIHZhbDogKCktPlxuICAgIEBfbW9kZWwudmFsLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xuXG4gIG9ic2VydmU6ICgpLT5cbiAgICBAX21vZGVsLm9ic2VydmUuYXBwbHkgQF9tb2RlbCwgYXJndW1lbnRzXG4gICAgQFxuXG4gIHVub2JzZXJ2ZTogKCktPlxuICAgIEBfbW9kZWwudW5vYnNlcnZlLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xuICAgIEBcblxuICAjXG4gICMgSW5zZXJ0cyBhbiBPYmplY3QgaW50byB0aGUgbGlzdC5cbiAgI1xuICAjIEByZXR1cm4ge0xpc3RNYW5hZ2VyIFR5cGV9IFRoaXMgU3RyaW5nIG9iamVjdC5cbiAgI1xuICBpbnNlcnQ6IChwb3NpdGlvbiwgY29udGVudCktPlxuICAgIGlmIHR5cGVvZiBwb3NpdGlvbiBpc250IFwibnVtYmVyXCJcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuTGlzdC5pbnNlcnQgZXhwZWN0cyBhIE51bWJlciBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyIVwiXG4gICAgQF9tb2RlbC5pbnNlcnQgcG9zaXRpb24sIFtjb250ZW50XVxuICAgIEBcblxuICBpbnNlcnRDb250ZW50czogKHBvc2l0aW9uLCBjb250ZW50cyktPlxuICAgIGlmIHR5cGVvZiBwb3NpdGlvbiBpc250IFwibnVtYmVyXCJcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIlkuTGlzdC5pbnNlcnQgZXhwZWN0cyBhIE51bWJlciBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyIVwiXG4gICAgQF9tb2RlbC5pbnNlcnQgcG9zaXRpb24sIGNvbnRlbnRzXG4gICAgQFxuXG4gIGRlbGV0ZTogKHBvc2l0aW9uLCBsZW5ndGgpLT5cbiAgICBAX21vZGVsLmRlbGV0ZSBwb3NpdGlvbiwgbGVuZ3RoXG4gICAgQFxuXG4gIHB1c2g6IChjb250ZW50KS0+XG4gICAgQF9tb2RlbC5wdXNoIGNvbnRlbnRcbiAgICBAXG5cbmlmIHdpbmRvdz9cbiAgaWYgd2luZG93Llk/XG4gICAgd2luZG93LlkuTGlzdCA9IFlMaXN0XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJZb3UgbXVzdCBmaXJzdCBpbXBvcnQgWSFcIlxuXG5pZiBtb2R1bGU/XG4gIG1vZHVsZS5leHBvcnRzID0gWUxpc3RcblxuXG5cblxuXG5cblxuXG5cblxuIl19
