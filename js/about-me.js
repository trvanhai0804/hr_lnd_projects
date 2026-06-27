const cards = document.querySelectorAll(".client-talk-item");
const backBtn = document.querySelector(".back");
const fwdBtn = document.querySelector(".fwd");

let activeIndex = 0;
let autoSlide;

function getIndex(index) {
  if (index < 0) {
    return cards.length + index;
  }

  if (index >= cards.length) {
    return index - cards.length;
  }

  return index;
}

function updateSlider() {
  cards.forEach((card) => {
    card.className = "client-talk-item";
  });

  cards[getIndex(activeIndex)].classList.add("active");
  cards[getIndex(activeIndex - 1)].classList.add("left");
  cards[getIndex(activeIndex + 1)].classList.add("right");
  cards[getIndex(activeIndex - 2)].classList.add("far-left");
  cards[getIndex(activeIndex + 2)].classList.add("far-right");
}

function nextSlide() {
  activeIndex++;

  if (activeIndex >= cards.length) {
    activeIndex = 0;
  }

  updateSlider();
}

function previousSlide() {
  activeIndex--;

  if (activeIndex < 0) {
    activeIndex = cards.length - 1;
  }

  updateSlider();
}

function startAutoSlide() {
  autoSlide = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

fwdBtn.addEventListener("click", () => {
  nextSlide();
  resetAutoSlide();
});

backBtn.addEventListener("click", () => {
  previousSlide();
  resetAutoSlide();
});

updateSlider();
startAutoSlide();

const flyingBook = document.getElementById("flyingBook");

let x = 100;
let y = 100;
let targetX = 300;
let targetY = 200;

function moveBookRandomly() {
  const padding = 60;

  targetX = Math.random() * (window.innerWidth - padding * 2) + padding;
  targetY = Math.random() * (window.innerHeight - padding * 2) + padding;
}

function animateBook() {
  x += (targetX - x) * 0.015;
  y += (targetY - y) * 0.015;

  flyingBook.style.left = `${x}px`;
  flyingBook.style.top = `${y}px`;
  flyingBook.style.transform = `rotate(${Math.sin(Date.now() / 300) * 12}deg)`;

  requestAnimationFrame(animateBook);
}

flyingBook.addEventListener("click", () => {
  flyingBook.classList.add("show-message");

  setTimeout(() => {
    flyingBook.classList.remove("show-message");
  }, 1200);
});

setInterval(moveBookRandomly, 1800);
moveBookRandomly();
animateBook();

const person = document.getElementById("gamePerson");
const steps = document.querySelectorAll(".step");

steps.forEach((step) => {
  step.addEventListener("click", () => {
    steps.forEach((s) => s.classList.remove("active"));
    step.classList.add("active");

    person.classList.add("walking");

    person.style.left = `${step.dataset.x}px`;
    person.style.top = `${step.dataset.y}px`;

    setTimeout(() => {
      person.classList.remove("walking");
    }, 850);
  });
});
