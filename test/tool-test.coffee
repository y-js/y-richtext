chai      = require('chai')
expect    = chai.expect
should    = chai.should()
sinon     = require('sinon')
sinonChai = require('sinon-chai')
_         = require("underscore")

chai.use(sinonChai)

_ = require '../lib/_.coffee'
arr = [1,2,3,4,5,6]
boolArr = [true, false, false, false]

describe 'isFunction', ->
  aFunction = () -> "foo"
  notAFunction = {foo: "bar"}
  it 'should say yeah!', ->
    (_.isFunction aFunction).should.be.true
  it 'should say ow:(!', ->
    (_.isFunction notAFunction).should.be.false
    (_.isFunction 5).should.be.false
    (_.isFunction "Hey, look, I pretend I'm a function!").should.be.false

describe 'any', ->
  it 'should answer true', ->
    (_.any boolArr).should.be.true
    comp = (e) -> (e > 5)
    (_.any arr, comp).should.be.true
  it 'should answer false', ->
    (_.any arr, (e) -> e>7).should.be.false

describe 'all', ->
  it 'should answer false', ->
    (_.any arr, (e) -> e >= 1).should.be.true

  it 'should answer true', ->
    (_.all boolArr).should.be.false
    (_.all arr, (e) -> e>5).should.be.false

describe 'equals', ->
  objs = []
  objs[0] = {foo: "bar", bar: "foo"}
  objs[1] = {bar: "foo", foo: "bar"}
  objs[2] = {foo: "notreallybar", bar:"reallyfoo"}
  objs[3] = {off: "topic"}
  objs[4] = {foo: "bar", bar: "foo", foobar: "barfoo"}
  it 'should pass', ->
    for obj1, key1 in objs
      for obj2, key2 in objs[key1..]

        if (obj1 == objs[0] and obj2 == objs[1]) or
           (obj1 == obj2)
          console.log obj1, "==", obj2
          (_.equals obj1, obj2).should.be.true
        else
          console.log obj1, "!=", obj2
          (_.equals obj1, obj2).should.be.false

describe 'hasNull', ->
  nullObjs=[]

  nullObjs[0] = {foo: 'bar', bar:null}
  nullObjs[1] = {foo: null}
  nullObjs[2] = {foo: 'bar', bar:"null"}
  nullObjs[3] = {foo: "null"}

  objs = []
  objs[0] = {foo: "bar", bar:"reallyfoo"}
  objs[1] = {off: "topic"}
  objs[2] = {}
  it 'should answer true', ->
    for nullObj in nullObjs
      (_.hasNull nullObj).should.be.true
  it 'should answer false', ->
    for obj in objs
      (_.hasNull obj).should.be.false




