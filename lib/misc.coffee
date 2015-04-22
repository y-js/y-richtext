class Locker
  constructor: () ->
    @is_locked = false

  try: (fun) ->
    if @is_locked
      return

    @is_locked = true
    ret = do fun
    @is_locked = false
    return ret

# a basic class with generic getter / setter function
class BaseClass
  constructor: ->
    # ownProperty is unsafe. Rather put it on a dedicated property like..
    @_tmp_model = {}

  # Try to find the property in @_model, else return the
  # tmp_model
  _get: (prop) ->
    if not @_model?
      @_tmp_model[prop]
    else
      @_model.val(prop)
  # Try to set the property in @_model, else set the
  # tmp_model
  _set: (prop, val) ->
    if not @_model?
      @_tmp_model[prop] = val
    else
      @_model.val(prop, val)

  # since we already assume that any instance of BaseClass uses a MapManager
  # We can create it here, to save lines of code
  _getModel: (Y, Operation)->
    if not @_model?
      @_model = new Operation.MapManager(@).execute()
      for key, value of @_tmp_model
        @_model.val(key, value)
    @_model

  _setModel: (@_model)->
    delete @_tmp_model

if module?
  exports.BaseClass = BaseClass
  exports.Locker = Locker
