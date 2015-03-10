function track() {
    console.log('In track');
    var selection = window.getSelection();

    var range = document.getSelection().getRangeAt(0),
        old = selection.anchorNode;
    var so = range.startOffset,
        eo = range.endOffset;

    old._y_xml.update();

    // // Replace the carret at the right position
    // var newRange = document.createRange();
    // newRange.selectNode(newer);
    // newRange.setStart(newer, so);
    // newRange.setEnd(newer, eo);

    // selection.removeAllRanges();
    // selection.addRange(newRange);
    console.log('Out track');
}



// Initialize Yjs variables
connector = new Y.XMPP().join('xml-xmpp-example', {syncMode: 'syncAll'});
var y = new Y(connector);

connector.debug = true;

// Set up shared object
connector.whenSynced(function() {
    if (y.val('dom') == null) {
        y.val('dom', new Y.Xml.Element($('#shared_div').get(0)));
    }
});
// Add callback to yjs
y.observe(function(events) {
    for (i in events) {
        if (events[i].type === 'add' || events[i].type === 'update') {
            if (events[i].name === 'dom') {
                // Replace by new dom
                $('#shared_div').replaceWith(y.val('dom').getDom());
            }
            $('#shared_div').on('input', track);
        }
        console.log(events[i]);
    }
});
