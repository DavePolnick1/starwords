const letters = document.querySelectorAll('.letter');
const loadingDiv = document.getElementById('lightsaber');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;

  // Reload New Word
  const res = await fetch(
    'https://words.dev-apis.com/word-of-the-day?random=1'
  );
  // One Word per Day
  //const res = await fetch('https://words.dev-apis.com/word-of-the-day');
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  let done = false;
  setLoading(false);
  isLoading = false;

  console.log(word);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      // Do Nothing
      return;
    }

    isLoading = true;
    setLoading(true);
    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();
    const { validWord } = resObj;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('');
    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // Mark As Correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // Do Nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
      }
    }

    currentRow++;

    if (currentGuess === word) {
      alert('You Win!!!!!');
      document.querySelector('header').classList.add('winner');
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      alert(`You Lose :( The word was ${word}`);
      done = true;
    }
    currentGuess = '';
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  function markInvalidWord() {
    // alert('Not a valid word.');
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');

      setTimeout(function () {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
      }, 10);
    }
  }

  document.addEventListener('keydown', function handleKeyPress(event) {
    if (done || isLoading) {
      // Do Nothing
      return;
    }

    const action = event.key;

    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('thinking', isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();

///////////////////////////////////////////////////////////
// CANVAS STARFIELD
// DOM selectors
const stars = document.getElementById('stars');
const starsCtx = stars.getContext('2d');
const slider = document.querySelector('.slider input');
const output = document.querySelector('#speed');

// global variables
let screen,
  starsElements,
  starsParams = { speed: 2, number: 300, extinction: 4 };

// run stars
setupStars();
updateStars();

// star constructor
function Star() {
  this.x = Math.random() * stars.width;
  this.y = Math.random() * stars.height;
  this.z = Math.random() * stars.width;

  this.move = function () {
    this.z -= starsParams.speed;
    if (this.z <= 0) {
      this.z = stars.width;
    }
  };

  this.show = function () {
    let x, y, rad, opacity;
    x = (this.x - screen.c[0]) * (stars.width / this.z);
    x = x + screen.c[0];
    y = (this.y - screen.c[1]) * (stars.width / this.z);
    y = y + screen.c[1];
    rad = stars.width / this.z;
    opacity =
      rad > starsParams.extinction
        ? 1.5 * (2 - rad / starsParams.extinction)
        : 1;

    starsCtx.beginPath();
    starsCtx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
    starsCtx.arc(x, y, rad, 0, Math.PI * 2);
    starsCtx.fill();
  };
}

// setup <canvas>, create all the starts
function setupStars() {
  screen = {
    w: window.innerWidth,
    h: window.innerHeight,
    c: [window.innerWidth * 0.5, window.innerHeight * 0.5],
  };
  window.cancelAnimationFrame(updateStars);
  stars.width = screen.w;
  stars.height = screen.h;
  starsElements = [];
  for (let i = 0; i < starsParams.number; i++) {
    starsElements[i] = new Star();
  }
}

// redraw the frame
function updateStars() {
  starsCtx.fillStyle = 'black';
  starsCtx.fillRect(0, 0, stars.width, stars.height);
  starsElements.forEach(function (s) {
    s.show();
    s.move();
  });
  window.requestAnimationFrame(updateStars);
}
