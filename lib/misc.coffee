
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

    _setModel: (@_model)->
      delete @_tmp_model


  ###
  # Simple class that contains a word and links to the selections pointing
  # to it
  #
  class Word extends BaseClass

    #
    ## TODO: explain what this does. Can I use it somewhere?
    ### ### ### ### ### ### ### ### ### ### ### ### ### ### ### ###
    ##
    #
    diffToDelta: (target)->
      if source == null
        source = @word
      info = [[]]
      for i in [0..source.length]
        info[i] = []
        for j in [0..target.length]
          info[i][j] = {val: 0}
          info[0][j].val = j
        info[i][0].val = i

      for tgt, j in target
        for src, i in source
          if src == tgt
            info[i+1][j+1] =
              val: info[i][j].val # don't think that this will work..
              delta: [{retain: 1}]

            info[i+1][j+1].prev = [i,j]

          else
            # delete letter i from source
            del = info[i][j+1].val + 1
            # insert letter at position j
            ins = info[i+1][j].val + 1
            # substitute letter i with letter j
          subs = info[i][j].val + 1
          min = Math.min del, ins, subs

          if min == del
            info[i+1][j+1] =
              prev: [i, j+1]
              delta: [{delete: 1}]
          else if min == ins
            info[i+1][j+1] =
              prev: [i+1, j]
              delta: [{insert: target[j]}]
          if min == subs
            info[i+1][j+1]=
              prev: [i, j]
              delta: [{delete:1}, {insert: target[j]}]
          info[i+1][j+1].val = min
    info

    # convert the array to a list of deltas
    i = info.length-1
    j = info[0].length-1
    dist = info[i][j].val
    ops = []
    while dist > 0
      [previ, prevj] = info[i][j].prev
      dist = info[previ][prevj].val

      ops.push.apply(ops, info[i][j].delta.reverse())

      [i, j] = [previ, prevj]
    {ops: ops.reverse()}
###

if module?
  module.exports.BaseClass = BaseClass
