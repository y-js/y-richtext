/**
 * Created by ccc on 4/28/15.
 */
var notifyConnection = function (event, authors) {
  'use strict';
  var opts, message, authorName;
  authorName = "An unknown user";
  if (authors[event.user])
    authorName = authors[event.user].name || authorName;

  if (event.action === 'userLeft') {
    message = authorName + ' left';
  } else if (event.action === 'userJoined') {
    message = authorName + ' joined';
  } else {
    console.log("Something weird happened", event);
  }

  opts = {
    title: "Connections",
    text: message,
    addclass: "stack-bottomright",
    //stack: stack_bottomright,
    nonblock: {
      nonblock: true,
      nonblock_opacity: 0.2
    },
    type: "info",
    styling: 'bootstrap3'
  };

  new PNotify(opts);
};

window.notify = {};
window.notify.connection = notifyConnection;
