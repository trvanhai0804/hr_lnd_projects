/* =====================================================================
   THE MEMORY BOOK — everything you may want to edit lives in this file.
   ===================================================================== */

/* The page the "Close the book" link returns to (the birthday room). */
const RETURN_PAGE = "index.html";

/* Cover and opening words */
const BOOK_TEXT = {
  coverTitle: "A Few Chapters Along the Way",
  coverSubtitle: "Some moments deserve another look.",
  intro: [
    "Some adventures are big.",
    "Some are small.",
    "And some are made from ordinary days we didn't realize we'd remember."
  ],
  introEnd: "Here are a few of ours."
};

/* One entry per year = one two-page spread. 2 to 8 photos each (up to 4 per page).
   - year / title   : the big handwritten heading and the line under it
   - note / noteBack: the sticky note (click it to flip); it sits on the right
                      page, or on the left page with  notePage: "left"
   - leftPhotos     : optional, how many photos go on the left page (1-4);
                      the rest go on the right page
   - photos         : src = image file, caption = the little handwritten line
     Optional extras on a photo:
       hidden: true      -> tucked underneath the photo before it; Anne has to
                            drag or click that photo aside to find it
       doNotClick: true  -> covered by a "DO NOT CLICK" note (of course she will)
       wide: true        -> a landscape frame for a wide photo, along the bottom
                            of its page; two or three wide photos on one page stack
                            top and bottom
   Images can be any size; they are cropped neatly to fit the Polaroid. */
const MEMORIES = [
  {
    year: "2022",
    title: "Where It Started",
    notePage: "left",
    leftPhotos: 3,
    note: "Day one: located the coffee machine. Priorities.",
    noteBack: "Still the most important discovery of the year.",
    photos: [
      // left page
      { src: "assets/memories/2022/photo-01.jpg", caption: "Look at us. So young. So unaware of the meetings ahead." },
      { src: "assets/memories/2022/photo-04.jpg", caption: "Somewhere between training and lunch." },
      { src: "assets/memories/2022/photo-05.jpg", caption: "Proof we were already a little bit silly." },
      // right page
      { src: "assets/memories/2022/photo-02.jpg", caption: "First week. Still learning everyone's names.", wide: true },
      { src: "assets/memories/2022/photo-03.jpg", caption: "Somehow this became a memory.", wide: true }
    ]
  },
  {
    year: "2023",
    title: "Getting the Hang of It",
    notePage: "left",
    leftPhotos: 4,
    note: "New rule: no meetings before coffee.",
    noteBack: "Rule broken on day two.",
    photos: [
      // left page: four square frames
      { src: "assets/memories/2023/photo-01.jpg", caption: "Evidence that we occasionally left the office." },
      { src: "assets/memories/2023/photo-02.jpg", caption: "The day we pretended to understand the new system." },
      { src: "assets/memories/2023/photo-03.jpg", caption: "Nobody asked us to smile. We did anyway." },
      { src: "assets/memories/2023/photo-04.jpg", caption: "Snack break. The most productive part of the day." },
      // right page: three wide frames
      { src: "assets/memories/2023/photo-05.jpg", caption: "Out of the office and loving it.", wide: true },
      { src: "assets/memories/2023/photo-06.jpg", caption: "Everyone fit in the picture. Barely.", wide: true },
      { src: "assets/memories/2023/photo-07.jpg", caption: "Still not sure how we all agreed on this.", wide: true }
    ]
  },
  {
    year: "2024",
    title: "Somewhere Along the Way...",
    notePage: "left",
    leftPhotos: 3,
    note: "Meeting at 9. Coffee at 8:59.",
    noteBack: "Coffee won. Coffee always wins.",
    photos: [
      // left page: three wide frames
      { src: "assets/memories/2024/photo-01.jpg", caption: "Another training survived.", wide: true },
      { src: "assets/memories/2024/photo-02.jpg", caption: "Nobody remembers what happened here. Probably for the best.", wide: true },
      { src: "assets/memories/2024/photo-03.jpg", caption: "Team lunch. The real reason we come in.", wide: true },
      // right page: two wide frames
      { src: "assets/memories/2024/photo-04.jpg", caption: "The view was nice. So was the company.", wide: true },
      { src: "assets/memories/2024/photo-05.jpg", caption: "Group photo attempt number four. The good one.", wide: true }
    ]
  },
  {
    year: "2025",
    title: "More Adventures",
    note: "Reminder: we are professionals.",
    noteBack: "Mostly.",
    photos: [
      { src: "assets/memories/2025/photo-01.jpg", caption: "This looked like a good idea at the time." },
      { src: "assets/memories/2025/photo-02.jpg", caption: "You were warned.", doNotClick: true },
      { src: "assets/memories/2025/photo-03.jpg", caption: "Proof we can smile before 9 a.m." },
      { src: "assets/memories/2025/photo-04.jpg", caption: "The deadline was yesterday. The smiles are real." }
    ]
  },
  {
    year: "2026",
    title: "And Here We Are",
    note: "Same desks. Better stories.",
    noteBack: "And the best is still ahead.",
    photos: [
      { src: "assets/memories/2026/photo-01.jpg", caption: "Still here. Still laughing." },
      { src: "assets/memories/2026/photo-04.jpg", caption: "You found the one we hid. Well done, detective.", hidden: true },
      { src: "assets/memories/2026/photo-02.jpg", caption: "A few years later and somehow even sillier." },
      { src: "assets/memories/2026/photo-03.jpg", caption: "One of the good days. There were a lot of those." }
    ]
  }
];

/* The blank "next year" page and the two new cats */
const FUTURE = {
  year: "2027",
  arrival: "Looks like the next adventure already has two new characters.",
  line1: "Some chapters haven't been written yet.",
  line2: "But this one already looks interesting."
};
/* Leave caption empty to use the cat names from js/config.js */
const CATS = [
  { src: "assets/memories/cats/cat-01.jpg", caption: "" },
  { src: "assets/memories/cats/cat-02.jpg", caption: "" }
];

/* The last page */
const FINAL = {
  heading: "To the next chapter...",
  lines: [
    "Happy Birthday, Anne.",
    "Here's to more good days, unexpected adventures, memories worth keeping, and whatever comes next.",
    "And with two cats joining the story...",
    "...things are probably about to get a lot more interesting."
  ],
  bottom: "Happy Birthday!",
  pen: "The next chapter begins..."
};
