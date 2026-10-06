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
  introEnd: "Here are a few of ours.",
  // the portrait above "This book belongs to ..." (a cut-out PNG works best); "" to leave it out
  ownerPhoto: "assets/memories/anne/anne.png"
};

/* One entry per year = one two-page spread. 2 to 8 photos each (up to 4 per page).
   - year / title   : the big handwritten heading and the line under it
   - note / noteBack: the sticky note (click it to flip; "\n" starts a new line); it sits on the right
                      page, or on the left page with  notePage: "left"
   - leftPhotos     : optional, how many photos go on the left page (1-4);
                      the rest go on the right page
   - photos         : src = image file, caption = the little handwritten line
     Optional extras on a photo:
       hidden: true      -> tucked underneath the photo before it; Anne has to
                            drag or click that photo aside to find it
       doNotClick: true  -> covered by a "DO NOT CLICK" note (of course she will)
       smallCaption: true -> a slightly smaller caption, for a long line that
                            would otherwise not fit under the photo
       wide: true        -> a landscape frame for a wide photo, along the bottom
                            of its page; two or three wide photos on one page stack
                            top and bottom
       ratio: 4 / 3      -> the frame takes the photo's own shape (width / height),
                            so the whole photo shows: 4 / 3, 16 / 9, 3 / 4 ...
   - slots          : optional, place a year's frames by hand, each as
                      [left %, top %, width %, tilt degrees] on its page:
                      slots: { left: [...], right: [...], note: [left %, top %] }
   - rightPage      : optional, makes the right page a "still to come" page with
                      empty frames ({ label, slot }) and its own note (see 2026) */
/*
   Images can be any size; they are cropped neatly to fit the Polaroid
   (unless the photo has a ratio). */
const MEMORIES = [
  {
    year: "2022",
    title: "Where It Started",
    notePage: "left",
    leftPhotos: 3,
    note: "A few photos from where it all began.",
    noteBack: "Still the most important discovery of the year.",
    photos: [
      // left page
      { src: "assets/memories/2022/photo-01.jpg", caption: "Look at us. So young. So unaware of the meetings ahead.", smallCaption: true },
      { src: "assets/memories/2022/photo-04.jpg", caption: "Somewhere between training and lunch." },
      { src: "assets/memories/2022/photo-05.jpg", caption: "Proof we were already a little bit silly." },
      // right page
      { src: "assets/memories/2022/photo-02.jpg", caption: "Work brought us together.", wide: true },
      { src: "assets/memories/2022/photo-03.jpg", caption: "Somehow this became a memory.", wide: true }
    ]
  },
  {
    year: "2023",
    title: "Getting the Hang of It",
    notePage: "left",
    leftPhotos: 4,
    note: "By now, we knew each other better.",
    noteBack: "Possibly a little too well.",
    photos: [
      // left page: four square frames
      { src: "assets/memories/2023/photo-01.jpg", caption: "Team bonding. Very important work." },
      { src: "assets/memories/2023/photo-02.jpg", caption: "Another birthday. Still accepting cake." },
      { src: "assets/memories/2023/photo-03.jpg", caption: "Seatbelt on. Camera ready." },
      { src: "assets/memories/2023/photo-04.jpg", caption: "Three people. Three posing strategies." },
      // right page: three wide frames
      { src: "assets/memories/2023/photo-05.jpg", caption: "Proof we occasionally left the office.", wide: true },
      { src: "assets/memories/2023/photo-06.jpg", caption: "Everyone fit in the picture. Barely.", wide: true },
      { src: "assets/memories/2023/photo-07.jpg", caption: "We do work here. Occasionally.", wide: true }
    ]
  },
  {
    year: "2024",
    title: "Somewhere Along the Way...",
    notePage: "left",
    leftPhotos: 3,
    note: "Another year together.",
    noteBack: "Still working.\nStill posing.\nStill finding reasons to eat.",
    photos: [
      // left page: three wide frames
      { src: "assets/memories/2024/photo-01.jpg", caption: "Found a bridge. Took a group photo. Obviously.", wide: true },
      { src: "assets/memories/2024/photo-02.jpg", caption: "Nobody remembers what happened here. Probably for the best.", wide: true },
      { src: "assets/memories/2024/photo-03.jpg", caption: "Team lunch. The real reason we come in.", wide: true },
      // right page: two wide frames
      { src: "assets/memories/2024/photo-04.jpg", caption: "Meet the people who hear all our work stories.", wide: true },
      { src: "assets/memories/2024/photo-05.jpg", caption: "Group photo attempt number four. The good one.", wide: true }
    ]
  },
  {
    year: "2025",
    title: "More Adventures",
    note: "Reminder: we are professionals.",
    noteBack: "These photos may suggest otherwise.",
    leftPhotos: 3,
    // frames shaped to each photo (4:3, 16:9 and one portrait), placed by hand
    photos: [
      // left page
      { src: "assets/memories/2025/photo-01.jpg", caption: "Food arrived. So did everyone’s good mood.", ratio: 4 / 3 },
      { src: "assets/memories/2025/photo-05.jpg", caption: "Same people. Different table.", ratio: 3 / 4 },
      { src: "assets/memories/2025/photo-03.jpg", caption: "Cake at work. Attendance suddenly improved.", ratio: 16 / 9 },
      // right page
      { src: "assets/memories/2025/photo-02.jpg", caption: "One last meal. Plenty of stories.", doNotClick: true, ratio: 4 / 3 },
      { src: "assets/memories/2025/photo-04.jpg", caption: "Another birthday. We know the poses by now.", ratio: 16 / 9 }
    ],
    slots: {
      left: [[4, 27, 50, -3], [58, 23, 38, 4], [16, 63, 64, -1.5]],
      right: [[5, 4, 54, -2.5], [14, 47, 74, 2]],
      note: [65, 9]
    }
  },
  {
    // memories so far (left) ... with room for more (right)
    year: "2026",
    title: "Still Making Memories",
    notePage: "left",
    note: "Too busy making memories.\nApparently, less busy taking photos.",
    leftPhotos: 1,
    photos: [
      { src: "assets/memories/2026/photo-01.jpg", caption: "Yes, we still managed to get everyone in a photo.", ratio: 3460 / 2212 }
    ],
    slots: {
      left: [[7, 25, 84, -2]],
      note: [48, 73, "mid"]    // "mid" / "wide" = wider sticky notes
    },
    // the right page: empty frames for the rest of the year, and a note
    rightPage: {
      frames: [
        { label: "Next adventure goes here", slot: [7, 33, 46, -4] },
        { label: "Save room for something fun.", slot: [47, 63, 45, 5] }
      ],
      note: "Most of the year spent making things happen.\nStill time for more fun—and photos to fill these frames!",
      notePos: [6, 5],
      // the little doodles, out of the way of the note and the frames
      smilePos: [80, 20],
      sunPos: [66, 7]
    }
  }
];

/* The blank "next year" page and the two new cats */
const FUTURE = {
  show: false,   // true brings back the "2027 — ?" spread (with the paw prints and the cats) before the last page
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
    "And with all the effort you’ve put into your dream…",
    "...things are probably about to get a lot more interesting."
  ],
  bottom: "Happy Birthday!",
  pen: "The next chapter begins..."
};
