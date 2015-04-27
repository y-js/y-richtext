if(Quill == null){
    alert("You must download quilljs! It needs to be in the same directory as y-richtext!");
}

colors = ['rgb(0, 0, 0)', 'rgb(230, 0, 0)', 'rgb(255, 153, 0)',
          'rgb(255, 255, 0)', 'rgb(0, 138, 0)', 'rgb(0, 102, 204)',
          'rgb(153, 51, 255)', 'rgb(255, 255, 255)', 'rgb(250, 204, 204)',
          'rgb(255, 235, 204)', 'rgb(255, 255, 204)', 'rgb(204, 232, 204)',
          'rgb(204, 224, 245)', 'rgb(235, 214, 255)', 'rgb(187, 187, 187)',
          'rgb(240, 102, 102)', 'rgb(255, 194, 102)', 'rgb(255, 255, 102)',
          'rgb(102, 185, 102)', 'rgb(102, 163, 224)', 'rgb(194, 133, 255)',
          'rgb(136, 136, 136)', 'rgb(161, 0, 0)', 'rgb(178, 107, 0)',
          'rgb(178, 178, 0)', 'rgb(0, 97, 0)', 'rgb(0, 71, 178)',
          'rgb(107, 36, 178)', 'rgb(68, 68, 68)', 'rgb(92, 0, 0)',
          'rgb(102, 61, 0)', 'rgb(102, 102, 0)', 'rgb(0, 55, 0)',
          'rgb(0, 41, 102)', 'rgb(61, 20, 102)'];

// Fill the palette
$('.ql-color, .ql-background').each(function() {
    generate = function(what) {
        return '<option value="' + what + '" label="' + what + '"></option>';
    };
    for (var i = 0; i < colors.length; i++) {
        console.log($(this));
        $(this).append(generate(colors[i]));
    }
});
var quill = new Quill('#editor', {
    modules: {
        'link-tooltip': true,
        'image-tooltip': true
    },
    theme: 'snow'
});
quill.addModule('toolbar', { container: '#toolbar' });
quill.addModule('multi-cursor', { timeout: 2500});
window.connector = new Y.WebRTC('sqfjqsmdlkjrhguemslkfjmlsdkjf',
                                {url: 'http://localhost:8888'});

// connector.debug = true;
window.y = new Y(connector);

checkConsistency = function() {
    deltas = editor.getDelta();
    quill_deltas = quill.getContents().ops;
    for (d in deltas) {
        delta = deltas[d];
        for (name in delta) {
            value = delta[name];
            quill_value = quill_deltas[d][name];
            if (value.constructor === Object) {
                for (n in value) {
                    if (value[n] !== quill_value[n]) {
                        return false;
                    }
                }
            } else if (value !== quill_value) {
                return false;
            }
        }
    }
    return true;
};

checkCursor = function() {
    cursor = editor.selfCursor.getPosition();
    quill_cursor = quill.getSelection().start;
    return cursor === quill_cursor;
}

// quill.on("text-change", function(){
//     if(editor != null && editor.getDelta != null){
//         console.log("Quill & y-richtext are equal: "+checkConsistency())
//     }
// });
// quill.on("selection-change", function() {
//     if (editor != null && editor.selfCursor != null) {
//         console.log("Quill & y-richtext cursor are equal: "+checkCursor());
//     }
// });

function fuzzy_cursor(n) {
    for (var i = 0; i < n; i++) {
        var m = Math.floor(Math.random() * quill.getLength());
        quill.setSelection(m, m);
    }
}
function fuzzy_insert(n) {
    N = 5;
    for (var i = 0; i < n; i++) {
        var m = Math.floor(Math.random() * quill.getLength());
        var j = Math.floor(Math.random() * 2);
        delta = {};
        delta.ops = [{retain: m}];
        var some = Math.min(
            Math.floor(Math.random() * (quill.getLength() - m)) +
                quill.getLength() - m,
            N);
        if (true) {//}j == 0 || quill.getLength() <= N) {
            var randLetter = (Math.random().toString(36) + '00000000000000000')
                    .slice(2, 2 + some);
            delta.ops.push({insert: randLetter});
        }
        else if (j == 1) {
            delta.ops.push({delete: some});
        }
        quill.setContents(delta);
    }
}

function fuzzy_all(n) {
    for (var i = 0; i < n; i++) {
        var which = Math.floor(Math.random() * 2);
        (which === 0) && fuzzy_cursor(1) || fuzzy_insert(1);
    }
}

// TODO: only for debugging
// y._model.HB.stopGarbageCollection();
// y._model.HB.setGarbageCollectTimeout(1500);

y.observe (function (events) {
    for (i in events) {
        if (events[i].name === 'editor') {
            y.val('editor').bind('QuillJs', quill);
            window.editor = y.val('editor');
        }
    }
});

connector.whenSynced(function(){
    if (y.val('editor') == null) {
        y.val('editor', new Y.RichText('QuillJs', quill));
    }
    y.val('editor').setAuthor($('#name').val());
});



$('#name')
    .click(function() {
        $(this).select();
    })
    .change(function() {
        console.log($(this).val());
        window.editor.setAuthor({name: $(this).val()});
    });
$('#toolbar .author-color')
    .change(function(ev) {
        window.editor.setAuthor({color: ev.target.value});
        $('#name').css('color', ev.target.value);
    });
cp = new ColorPicker($('#toolbar .author-color')[0]);
