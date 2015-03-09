$(document).ready(function() {
    CKEDITOR.replace("shared_div");

    connector = new Y.WebRTC("xml-webrtc-example"); //, {url: config.server});
    connector.debug = true;
    y = new Y(connector);

    connector.whenSynced(function(){
        if(y.val("dom") == null){
            // check if dom was already assigned
            window.shared_div = document.querySelector("#shared_div");
            y.val("dom", new Y.Xml(window.shared_div));
        }
        if(y.val("body") == null){
            y.val("body", $("iframe").contents().find("body").html());
        }
        var p = document.createElement("b");
        shared_div.insertBefore(p,null);
    });
    y.observe(function(events){
        for(i in events){
            if(events[i].type === "add" || events[i].type === "update") {
                if (events[i].name === "dom") {
                    console.log(events[i]);
                    document.querySelector("#shared_div").remove();
                    window.shared_div = y.val("dom").getDom();
                    var body = document.querySelector("body");
                    body.insertBefore(window.shared_div, body.firstChild);
                }
                if (events[i].name === "body") {
                    console.log("Updating body");
                    $("iframe").contents().find("body").html(y.val("body"));
                }
            }
        }
    });
    $("iframe").contents().find("body").on("input", function(){
        console.log("Event detected.");
        y.val("body", $(this).html());
    });
});
