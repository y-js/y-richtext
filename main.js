function track() {
    console.log('In track');
    var selection = window.getSelection();
    var old = selection.anchorNode;

    // Every shared dom object has a property _y_xml, whereby old.
    // y_xml.getDom() === dom
    // The Y.Xml.Text Type now has an update function.
    // It graps the current content of the Text Dom Element and updates itself.
    old._y_xml.update()

    console.log('Out track');
}

// Initialize Yjs variables
var connector = new Y.WebRTC('xml-webrtc-debug'); //, {url: config.server});
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
            // Track the changes on the shared div
            $('#shared_div').on('input', function() {
                track();
            });
        }
        console.log(events[i]);
    }
});
