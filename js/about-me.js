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
