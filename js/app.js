/* =========================================================
   MAIN JAVASCRIPT FILE
   Normally, you only edit this file when adding new features.
   For simple content changes, edit js/config.js instead.
   ========================================================= */

let openedGifts = 0;
let backgroundMusic;
let emojiTimer;
let confettiTimer;

const elements = {
    startCard: document.getElementById("startCard"),
    birthdayCard: document.getElementById("birthdayCard"),
    giftMessage: document.getElementById("giftMessage"),
    startButton: document.getElementById("startButton"),
    birthdayTitle: document.getElementById("birthdayTitle"),
    birthdayName: document.getElementById("birthdayName"),
    birthdayPhoto: document.getElementById("birthdayPhoto"),
    birthdayMessages: document.getElementById("birthdayMessages")
};

initializePage();

elements.startButton.addEventListener("click", startSurprise);

function initializePage() {
    elements.birthdayTitle.textContent = SITE_CONFIG.mainTitle;
    elements.birthdayName.textContent = SITE_CONFIG.personName;
    elements.birthdayPhoto.src = SITE_CONFIG.photoUrl;

    elements.birthdayMessages.innerHTML = SITE_CONFIG.birthdayMessages
        .map(message => `<p>${message}</p>`)
        .join("");
}

function startSurprise() {
    elements.startCard.classList.add("hidden");
    elements.birthdayCard.classList.remove("hidden");
    elements.giftMessage.classList.remove("hidden");

    playMusic();

    if (SITE_CONFIG.enableEmojiRain) createEmojis();
    if (SITE_CONFIG.enableConfettiRain) createConfetti();
    if (SITE_CONFIG.enableBubbles) createFloatingBubbles();
    if (SITE_CONFIG.enableGifts) createFloatingGifts();
}

function playMusic() {
    backgroundMusic = new Audio(SITE_CONFIG.musicUrl);
    backgroundMusic.volume = SITE_CONFIG.musicVolume;
    backgroundMusic.loop = SITE_CONFIG.loopMusic;
    backgroundMusic.play().catch(() => {
        console.log("Music could not start automatically. User interaction may be required by the browser.");
    });
}

function createFloatingGifts() {
    SITE_CONFIG.gifts.forEach((gift, index) => {
        const box = document.createElement("div");

        box.className = "floating-gift";
        box.innerHTML = "🎁";
        box.style.left = gift.x;
        box.style.top = gift.y;
        box.style.animationDelay = `${index * 0.4}s`;

        box.addEventListener("click", () => openGift(box, gift.message));
        document.body.appendChild(box);
    });
}

function openGift(box, message) {
    if (box.classList.contains("opened")) return;

    box.classList.add("opened");
    box.innerHTML = "🎉";
    openedGifts++;

    elements.giftMessage.innerHTML = message;
    giftBurst(box);

    if (openedGifts === SITE_CONFIG.gifts.length) {
        setTimeout(() => {
            elements.giftMessage.innerHTML = "🎉 ALL GIFTS OPENED! HAPPY BIRTHDAY! 🎉";
            bigCelebration();
        }, 700);
    }
}

function giftBurst(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();

    for (let i = 0; i < 45; i++) {
        const confetti = document.createElement("div");

        confetti.className = "confetti";
        confetti.style.left = `${rect.left + rect.width / 2}px`;
        confetti.style.top = `${rect.top + rect.height / 2}px`;
        confetti.style.background = getRandomItem(SITE_CONFIG.confettiColors);
        confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
        confetti.style.transform = `translate(${Math.random() * 240 - 120}px, ${Math.random() * 240 - 120}px) rotate(${Math.random() * 720}deg)`;

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

function bigCelebration() {
    for (let i = 0; i < 250; i++) {
        const confetti = document.createElement("div");

        confetti.className = "confetti";
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.background = getRandomItem(SITE_CONFIG.confettiColors);
        confetti.style.animationDuration = `${1 + Math.random() * 3}s`;

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

function createEmojis() {
    emojiTimer = setInterval(() => {
        const emoji = document.createElement("div");

        emoji.className = "emoji";
        emoji.innerHTML = getRandomItem(SITE_CONFIG.emojis);
        emoji.style.left = `${Math.random() * 100}vw`;
        emoji.style.animationDuration = `${4 + Math.random() * 4}s`;

        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 8000);
    }, 300);
}

function createConfetti() {
    confettiTimer = setInterval(() => {
        for (let i = 0; i < 12; i++) {
            const confetti = document.createElement("div");

            confetti.className = "confetti";
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.background = getRandomItem(SITE_CONFIG.confettiColors);
            confetti.style.animationDuration = `${2 + Math.random() * 3}s`;

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }, 250);
}

function createFloatingBubbles() {
    SITE_CONFIG.bubbles.forEach((item, index) => {
        const bubble = document.createElement("div");

        bubble.className = "bubble";
        bubble.style.left = item.x;
        bubble.style.top = item.y;
        bubble.style.animationDelay = `${index * 0.4}s`;

        bubble.addEventListener("click", () => popBubble(bubble, item.image));
        document.body.appendChild(bubble);
    });
}

function popBubble(bubble, imageUrl) {
    if (bubble.classList.contains("popped")) return;

    bubble.classList.add("popped");

    const rect = bubble.getBoundingClientRect();
    const image = document.createElement("img");

    image.className = "revealed-image";
    image.src = imageUrl;
    image.style.left = `${rect.left - 25}px`;
    image.style.top = `${rect.top - 25}px`;

    document.body.appendChild(image);
    giftBurst(bubble);

    setTimeout(() => bubble.remove(), 300);
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
