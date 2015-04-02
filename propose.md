# New proposal for rich-text type

## Problem
The previous representation of the rich-text type had already reached its limits. The idea was to separate the content (Words) from the formatting (Selections). It was defined as follow:

    Words = {
        word: string,
        left: [selection], # the selections starting at this word
        right: [selection], # the selections ending at this word

    }

    Selections = {
        left: word,
        leftPos: number,
        right :word,
        rightPos: number,
        style: object
    }

    RichText = {
        words: [Words],
        selections: [Selections]
    }

The main problem is that it's quite hard to determine the behaviour of the selection if a word gets updated from another peer. Let's see another problem to really see where the issue lies.

If we have the following text: "Longsword *is* a *kind* of sword" and two peers, A and B.
At a certain moment, these actions are triggered:
- A: set " a " to bold, resulting in the merge of three selections, A now has
  "Longsword *is a kind* of sword"
- B:  unset bold on "is", B now has
  "Longsword is a *kind* of sword"

Now if these modifications are sent, what should happen? A has lost the memory of the selection on *kind* and B has no memory of *is*. So we could imagine to store all the previous modifications, but what happend when theire's 100's of concurrent users creating and deleting selections? The list of past selections grows bigger and bigger.

## Proposed solution
On the other side, Yjs objects.that are deleted aren't deleted immediately. They are destroyed by a garbage collector when it is known for sure that no peer can make modifications prior to the deletion of the object. Using this, it is possible to imagine an ordered list of actions, very similar to operational transforms (https://github.com/ottypes/docs) that result in the creation of selections (formatting). The list is garbage collected so it doesn't grow indefinitely. To prevent the issue of relative adressing within word, strings are stored as a list of characters, and selections are pointing at the object holding each character.

The structure of the text-type would then be:

    Char = {
        val: string,
        left: [selection],
        right: [selection],
    }
    Selection = {
        left: char,
        right: char,
        style: object
    }
    Characters = {
        characters: [char]
    }
    RichText = {
        characters: Characters,
        selections: [Selections]
    }

## Deltas and state
The state of the selections is represented by an object, called **state**. The state holds all the selections. Each selection can create **deltas** that modify the state. The deltas fall under the following constraints:
- they can be applied on any state
- they can reversed, each delta holding enough information for it. Therefore
  ```
  apply(delta);
  undo(delta);
  ```
  does nothing.

Thus, if `f`, `g`, and `h` are three deltas, represented as mathematical functions applied to a state `S`, and two users A and B apply modifications as follow (left to right is time):

    A|  f             g
    B|         h

the state after propagation of all changes is then `S(A) = f ∘ g ∘ g⁻¹ ∘ h ∘ g (S) = f ∘ h ∘ g (S)` and for B `S(B) = h ∘ h⁻¹ ∘ f ∘ h ∘ g = f ∘ h ∘ g (S)`.
Here we see that the order in which deltas are applied is important.
Yjs is responsible for handling correctly the ordered list of deltas and apply them to the state of each user in the *right order*.

## Integration with text editors
Some editors, like (Quilljs)[http://quilljs.com/] have already a support for operational-transform representation and can be very easily bound to our system. For other editors, it is necessary to intercept the modifications made and convert them into operational transform. It is for now much easier to use an editor like quilljs.
