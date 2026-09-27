/* =====================================================================
   A Small Adventure Awaits — personal settings
   Edit this file to personalise the game. No other file needs changing.
   ===================================================================== */
window.CONFIG = {
  name: 'Anne',

  /* The little kitten who guides the player through the adventure */
  guide: { name: 'Pip' },

  /* Photo frame in the birthday room.
     Put pictures in the folder assets/photos. Either name them 1.jpg, 2.jpg,
     3.png ... (run assets/photos/number-my-photos.bat to do this for you),
     or list their file names here, e.g. photos: ['beach.jpg', 'cats.png'] */
  photos: [],

  /* The three presents in the birthday room. Each one opens an HTML page from
     the folder assets/gift in a pop-up window. 'from' is who brings it:
     'one' and 'two' are the cats below, 'pip' is the kitten guide (always last). */
  gifts: [
    { file: 'gift1_garden.html', from: 'one' },
    { file: 'gift2_clover.html', from: 'two' },
    { file: 'gift3_wish.html', from: 'pip' }
  ],

  /* The soft-black book on the party table. Put its HTML page in the folder
     assets/book and write the file name here, e.g. file: 'book.html'.
     While this is empty, clicking the book just shows a friendly message. */
  book: { file: '', title: 'A book for Anne' },
  photoSeconds: 2,

  /* The two cats. Change the colours to match the real cats.
     pattern: 'tabby' | 'tuxedo' | 'solid' | 'calico'
     fur       – main coat colour
     furLight  – sunlit side of the coat
     furDark   – shadow side of the coat (and tabby stripes)
     belly     – chest, muzzle and paws (white for tuxedo cats)
     eye       – iris colour                                               */
  cats: {
    one: {
      name: 'Pepper',
      role: 'The Mastermind',
      pattern: 'tuxedo',
      fur: '#4a4d54', furLight: '#747a85', furDark: '#26282d',
      belly: '#f1ede4', eye: '#a8cf5c', nose: '#d99a96'
    },
    two: {
      name: 'Biscuit',
      role: 'The Chaotic Assistant',
      pattern: 'tabby',
      fur: '#d88a47', furLight: '#f2bd7c', furDark: '#9e5723',
      belly: '#f7e6cb', eye: '#e6aa2e', nose: '#e79c92'
    }
  }
};
