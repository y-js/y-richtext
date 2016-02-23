
# Rich Text type for [Yjs](https://github.com/y-js/yjs)

## Use it!
Retrieve y-richtext and [Quill](quilljs.com) Editor with bower

```
bower install y-richtext quill --save
```

You can bind the richtext type to any [Quill](quilljs.com) instance. Look on their homepage on how to extend [Quill](quilljs.com).

## Example
```
Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: 'richtext-example18',
    debug: true
    //url: 'http://127.0.0.1:1234'
  },
  sourceDir: '/bower_components',
  share: {
    richtext: 'Richtext' // y.share.richtext is of type Y.Richtext
  }
}).then(function (y) {
  window.yquill = y

  // create quill element
  window.quill = new Quill('#editor', {
    modules: {
      'toolbar': { container: '#toolbar' },
      'link-tooltip': true
    },
    theme: 'snow'
  })
  // bind quill to richtext type
  y.share.richtext.bind(window.quill)
})
```

### RichText Object

##### Reference
* .bind(editor)
  * Bind this type to an rich text editor. (Currently, only QuillJs is supported)
  * `.bind(editor)` does not preserve the existing value of the bound editor

## Contribution
We thank [Veeting](https://www.veeting.com/) and [Linagora](https://www.linagora.com/) who sponsored this work, and agreed to publish it as Open Source.

## License
Yjs and the RichText type are licensed under the [MIT License](./LICENSE).

- Corentin Cadiou <corentin.cadiou@linagora.com>
- Kevin Jahns <kevin.jahns@rwth-aachen.de>
