# RTE is simple Rich Text grammar for collaborative editors

Its grammar is well defined:

```ocaml
type RTE = ((paragraph|embed)*p_properties)+
type p_properties = p_property*
type p*property = list | align | width
type align = left | right | center
type list = bullet | enum | null
type width = int
type embed = (video|audio | picture)*source
type paragraph = (char * c*properties)+
type c_properties = c_property*
type c_property = font | font_size | bold | italics | underline
                | strikethrough | color | background | author | author_cursor
```

It basically describes a RTE as a non-empty list of paragraphs or embeded media such as videos or pictures.
Each paragraph can be formatted to change it into a list, to change its alignement, …
The paragraphs are made of strings, each character has a set of properties, such as bold, italic, color, …
