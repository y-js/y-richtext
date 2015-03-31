# RTE is simple Rich Text grammar for collaborative editors

Its grammar is well defined:

```
rich_text = { words: [word] }
word = { word: string,
         left: [selection],
         right: [selection],
         richText: richText
       }

selection = { left: word,
              leftPos: number, // offset within word
              right: word,
              rightPos: number // offset within word
              style : Object
}
```

It basically describes a rich text as a non-empty list of words, modified by selections (that represent bold zones, italic zones, …).
