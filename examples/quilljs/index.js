if(Quill == null){
  alert("You must download quilljs! It needs to be in the same directory as y-richtext!");
}

var quill = new Quill('#editor', {
    modules: {
        'multi-cursor': true,
        'link-tooltip': true,
        'image-tooltip': true
    },
    theme: 'snow'
});
quill.addModule('toolbar', { container: '#toolbar' });
window.connector = new Y.WebRTC('thisisMYroom');

// connector.debug = true;
window.y = new Y(connector);

checkConsistency = function(){
  deltas = editor.getDelta()
  quill_deltas = quill.getContents().ops
  for(d in deltas){
    delta = deltas[d]
    for(name in delta){
      value = delta[name]
      quill_value = quill_deltas[d][name]
      if(value.constructor === Object){
        for(n in value){
          if(value[n] !== quill_value[n]){
            return false
          }
        }
      } else if(value !== quill_value){
        return false
      }
    }
  }
  return true
}

quill.on("text-change", function(){
  window.setTimeout(function(){
    if(editor != null && editor.getDelta != null){
      console.log("Quill & y-richtext are equal: "+checkConsistency())
    }
  },0)
})


// TODO: only for debugging
y._model.HB.stopGarbageCollection()
y.observe (function (events) {
    for (i in events){
        if(events[i].name === 'editor'){
            y.val('editor').bind('QuillJs', quill);
            window.editor = y.val('editor')
        }
    }
});

connector.whenSynced(function(){
    if(y.val('editor') == null){
        y.val('editor', new Y.RichText("QuillJs", quill));
    }
});
