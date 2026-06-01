/* =========================================================
   CONFIG FILE
   Most future changes should be made here.
   You can change name, photo, music, messages, and bubble/gift positions.
   ========================================================= */

const SITE_CONFIG = {
    personName: "Shival",
    mainTitle: "🎉 Happy Birthday! 🎉",
    photoUrl: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png",

    // For GitHub audio, raw.githubusercontent.com links usually work better.
    musicUrl: "https://raw.githubusercontent.com/trvanhai0804/birthday_surprise/refs/heads/main/birthday.mp3",
    musicVolume: 0.3,
    loopMusic: true,

    birthdayMessages: [
        "Wishing you a fantastic birthday filled with happiness, success and laughter.",
        "May your Power BI refreshes always succeed, your DAX measures work on the first try, and your dashboards load instantly! 😆",
        "🎂 Have an amazing year ahead! 🎂"
    ],

    emojis: ["🎂", "🎉", "🎈", "🥳", "🎁", "🍰", "😂"],
    confettiColors: ["#fff700", "#ff4d6d", "#00e5ff", "#7cff6b", "#ffffff", "#ff9f1c"],

    // Choose what appears after clicking start button.
    enableBubbles: true,
    enableGifts: false,
    enableEmojiRain: true,
    enableConfettiRain: true,

    bubbles: [
        { image: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png", x: "8vw", y: "18vh" },
        { image: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png", x: "82vw", y: "20vh" },
        { image: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png", x: "10vw", y: "70vh" },
        { image: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png", x: "82vw", y: "68vh" },
        { image: "https://i.ibb.co/nMfqmYQj/f560d4d4ef00.png", x: "46vw", y: "82vh" }
    ],

    gifts: [
        { message: "🎉 365 days of happiness unlocked!", x: "8vw", y: "18vh" },
        { message: "☕ Free birthday coffee from your team!", x: "82vw", y: "20vh" },
        { message: "📊 Your next DAX measure will work first try!", x: "10vw", y: "70vh" },
        { message: "😂 No Power BI bugs today!", x: "82vw", y: "68vh" },
        { message: "🎂 Birthday cake coupon unlocked!", x: "46vw", y: "82vh" }
    ]
};
