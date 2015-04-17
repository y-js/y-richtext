var quill = new Quill('#editor', {
    modules: {
        'multi-cursor': true,
        'link-tooltip': true
    },
    theme: 'snow'
});
quill.addModule('toolbar', { container: '#toolbar' });
window.connector = new Y.XMPP().join('sqfjqsmdlkjrhguemslkfjmlsdkjf');
/* window.connector = new Y.WebRTC('sqfjqsmdlkjrhguemslkfjmlsdkjf',
    {url: 'http://localhost:8888'}); */
// connector.debug = true;
window.y = new Y(connector);

y.observe (function (events) {
    for (i in events){
        if(events[i].name === 'editor'){
            // TODO delete!
            if(y.val('editor')._model.val("selections") == null){
              return
            }
            y.val('editor').bind('QuillJs', quill);
        }
    }
});

connector.whenSynced(function(){
    if(y.val('editor') == null){
        y.val('editor', new Y.RichText());
    }
});
