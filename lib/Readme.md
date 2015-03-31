# RTE is simple Rich Text grammar for collaborative editors

Its grammar is defined as follow:

```
richText = { words: [word],
             selections: [selection]
            }
word = { word: string,
         left: [selection],
         right: [selection],
         richText: richText
       }

selection = { left: word,
              leftPos: number, // offset within word
              right: word,
              rightPos: number, // offset within word
              style : Object,
              richText: richText
}
```

It basically describes a rich text as a non-empty list of words, modified by selections (that represent bold zones, italic zones, …).
