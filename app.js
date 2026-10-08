const $ = id => document.getElementById(id);
const birds = [...(window.BIRD_DATA || []), {
  id: 'tweety', name: 'Tweety Bird', image: 'assets/yellow-cartoon-bird.svg',
  source: '', credit: 'Original illustration', license: 'Original'
}];
const byId = Object.fromEntries(birds.map(bird => [bird.id, bird]));
const GAME_KEY = 'bird-battle-game-v1';
const SLIDES_KEY = 'bird-battle-slides-v2';
const defaultSlides = [{"title": "don't worry", "body": "God values you\n\nMatthew 6:25–26", "image": ""}, {"title": "matthew 6:25", "body": "“That is why I tell you not to worry about everyday life — whether you have enough food and drink, or enough clothes to wear. Isn't life more than food, and your body more than clothing?”", "image": ""}, {"title": "look at the birds", "body": "“Look at the birds. They don't plant or harvest or store food in barns, for your heavenly Father feeds them. And aren't you far more valuable to him than they are?”\n\nMatthew 6:26", "image": ""}, {"title": "who would win?", "body": "Bird Battle\nThe final challenger is the sparrow.", "image": ""}, {"title": "the sparrow", "body": "• Tiny: about 14–16 cm\n• Hops around, eats bugs and seeds\n• Sold for one copper coin", "image": ""}, {"title": "ever feel like a sparrow?", "body": "• Not chosen at school\n• Last one picked in PE\n• Not first honors\n• Not invited to the party\n• Nobody greeted you happy birthday", "image": ""}, {"title": "but God does", "body": "People didn't see the value in the sparrow.\nGod does.", "image": ""}, {"title": "matthew 10:29", "body": "“What is the price of two sparrows — one copper coin? But not a single sparrow can fall to the ground without your Father knowing it.”", "image": ""}, {"title": "matthew 10:30", "body": "“And the very hairs on your head are all numbered.”", "image": ""}, {"title": "matthew 10:31", "body": "“So don't be afraid; you are more valuable to God than a whole flock of sparrows.”", "image": ""}, {"title": "he chose us first", "body": "“But God showed his great love for us by sending Christ to die for us while we were still sinners.”\n\nRomans 5:8", "image": ""}, {"title": "matthew 6:19–20", "body": "“Don't store up treasures here on earth, where moths eat them and rust destroys them, and thieves break in and steal. Store your treasures in heaven.”", "image": ""}, {"title": "what's your treasure?", "body": "Why do we value what people think more than what God thinks about us?", "image": ""}, {"title": "so don't worry", "body": "• God sees you\n• God remembers you\n• God knows what happens to you\n• God loves you", "image": ""}, {"title": "when we worry", "body": "1. Remember: God values me\n2. Declare it: I am more valuable than a flock of sparrows\n3. Talk about it", "image": ""}, {"title": "small groups", "body": "1. What do you worry about?\n2. How can you bring that to God and release it to Him?", "image": ""}, {"title": "let's pray", "body": "", "image": ""}];

function readSaved(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { alert('This browser could not save that change. Download a slide backup to keep your work.'); }
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function newGame() {
  const first = Math.random() < .5 ? ['toucan', 'macaw'] : ['macaw', 'toucan'];
  const rest = shuffle(birds.map(bird => bird.id).filter(id => !['toucan', 'macaw', 'sparrow'].includes(id)));
  game = { roster: [...first, ...rest, 'sparrow'], index: 1, left: first[0], right: first[1], winner: null, history: [] };
  save(GAME_KEY, game);
  renderGame();
}
function validGame(value) {
  return value && Array.isArray(value.roster) && value.roster.length === birds.length && value.roster.at(-1) === 'sparrow' &&
    value.roster.every(id => byId[id]) && Number.isInteger(value.index) && value.index >= 1 && value.index < value.roster.length;
}
// Preload and decode every bird photo up front so a matchup's picture and name change together.
const imageReady = {};
function preload(bird) {
  if (!imageReady[bird.id]) {
    const img = new Image();
    img.src = bird.image;
    imageReady[bird.id] = (img.decode ? img.decode() : new Promise(r => { img.onload = img.onerror = r; })).catch(() => {});
    imageReady[bird.id].img = img;
  }
  return imageReady[bird.id];
}
birds.forEach(preload);
let renderToken = 0;

let game = readSaved(GAME_KEY);
if (!validGame(game)) newGame();


function setBird(side, bird) {
  const el = $(side + 'Image');
  if (el.dataset.bird !== bird.id) { el.src = bird.image; el.dataset.bird = bird.id; }
  $(side + 'Image').alt = bird.name;
  $(side + 'Name').textContent = bird.name;
  $(side + 'Bird').setAttribute('aria-label', 'Choose ' + bird.name + ' as winner');
}
function renderGame() {
  if (!game) return;
  const done = Boolean(game.winner);
  $('matchup').classList.toggle('hidden', done);
  $('champion').classList.toggle('hidden', !done);
  $('slidesAfterButton').classList.toggle('hidden', !done);
  $('undoButton').disabled = !game.history.length;
  $('undoButton').style.opacity = game.history.length ? '1' : '.4';
  if (done) {
    renderToken++;
    const winner = byId[game.winner];
    $('roundPill').textContent = 'FINAL RESULT';
    $('gameStatus').textContent = `${game.roster.length - 1} matchups played`;
    $('champion').replaceChildren();
    const trophy = document.createElement('div'); trophy.className = 'trophy'; trophy.textContent = '🏆';
    const label = document.createElement('div'); label.className = 'champion-label'; label.textContent = 'THE PEOPLE HAVE DECIDED';
    const image = document.createElement('img'); image.src = winner.image; image.alt = winner.name;
    const heading = document.createElement('h2'); heading.textContent = winner.name + ' wins!';
    $('champion').append(trophy, label, image, heading);
  } else {
    const token = ++renderToken, L = byId[game.left], R = byId[game.right];
    const show = () => { if (token === renderToken) { setBird('left', L); setBird('right', R); } };
    Promise.race([Promise.all([preload(L), preload(R)]), new Promise(r => setTimeout(r, 1500))]).then(show);
    $('roundPill').textContent = game.index === game.roster.length - 1 ? 'FINAL ROUND' : `ROUND ${game.index}`;
    $('gameStatus').textContent = game.index === game.roster.length - 1
      ? 'Sparrow is the final challenger.'
      : `${game.roster.length - 1 - game.index} challengers still to come`;
  }
}
function pick(side) {
  if (game.winner) return;
  game.history.push({ index: game.index, left: game.left, right: game.right, winner: game.winner });
  const chosen = game[side];
  if (game.index === game.roster.length - 1) game.winner = chosen;
  else { game.index++; game.left = chosen; game.right = game.roster[game.index]; }
  save(GAME_KEY, game); renderGame();
}
$('leftBird').addEventListener('click', () => pick('left'));
$('rightBird').addEventListener('click', () => pick('right'));
$('undoButton').addEventListener('click', () => {
  if (!game.history.length) return;
  Object.assign(game, game.history.pop()); save(GAME_KEY, game); renderGame();
});
$('restartButton').addEventListener('click', () => {
  const btn = $('restartButton');
  if (game.history.length && !btn.dataset.armed) {
    btn.dataset.armed = '1'; const label = btn.textContent; btn.textContent = 'Click again to clear results';
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = label; }, 3500);
    return;
  }
  if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = '↻ New game'; }
  newGame();
});

let slides = readSaved(SLIDES_KEY);
if (!Array.isArray(slides) || !slides.length) slides = defaultSlides.map(slide => ({ ...slide }));
slides = slides.filter(slide => slide && typeof slide.title === 'string' && typeof slide.body === 'string').map(slide => ({ title: slide.title, body: slide.body, image: typeof slide.image === 'string' ? slide.image : '' }));
if (!slides.length) slides = defaultSlides.map(slide => ({ ...slide }));
let slideIndex = 0;
let editing = true;
function saveSlides() { save(SLIDES_KEY, slides); }
function updateSlideList() {
  $('slideList').replaceChildren();
  slides.forEach((slide, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'slide-item' + (i === slideIndex ? ' active' : '');
    const number = document.createElement('span'); number.textContent = String(i + 1).padStart(2, '0');
    const title = document.createElement('span'); title.textContent = slide.title || 'Untitled slide';
    button.append(number, title); button.addEventListener('click', () => { slideIndex = i; renderSlides(); }); $('slideList').append(button);
  });
}
function renderSlides() {
  slideIndex = Math.min(Math.max(slideIndex, 0), slides.length - 1);
  const slide = slides[slideIndex];
  updateSlideList();
  $('slideTitle').value = slide.title;
  $('slideBody').value = slide.body;
  $('slideImage').value = slide.image.startsWith('data:') ? '' : slide.image;
  $('previewTitle').textContent = slide.title || 'Untitled slide';
  $('previewBody').textContent = slide.body;
  $('slideCanvas').classList.toggle('has-image', Boolean(slide.image));
  $('previewImage').classList.toggle('hidden', !slide.image);
  if (slide.image) $('previewImage').src = slide.image;
  $('slideNumber').textContent = String(slideIndex + 1).padStart(2, '0');
  $('slidePosition').textContent = `${slideIndex + 1} / ${slides.length}`;
  $('prevSlide').disabled = slideIndex === 0;
  $('nextSlide').disabled = slideIndex === slides.length - 1;
  $('editorPanel').classList.toggle('hidden', !editing);
  $('editToggle').textContent = editing ? 'Done editing' : 'Edit slides';
}
function updateCurrent(field, value) { slides[slideIndex][field] = value; saveSlides(); renderPreviewOnly(); }
function renderPreviewOnly() {
  const slide = slides[slideIndex];
  $('previewTitle').textContent = slide.title || 'Untitled slide'; $('previewBody').textContent = slide.body;
  $('slideCanvas').classList.toggle('has-image', Boolean(slide.image));
  $('previewImage').classList.toggle('hidden', !slide.image);
  if (slide.image) $('previewImage').src = slide.image;
  updateSlideList();
}
$('slideTitle').addEventListener('input', event => updateCurrent('title', event.target.value));
$('slideBody').addEventListener('input', event => updateCurrent('body', event.target.value));
$('slideImage').addEventListener('change', event => { updateCurrent('image', event.target.value.trim()); renderSlides(); });
$('slideUpload').addEventListener('change', event => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      updateCurrent('image', canvas.toDataURL('image/jpeg', .78)); renderSlides();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file); event.target.value = '';
});
$('addSlide').addEventListener('click', () => { slides.splice(slideIndex + 1, 0, { title: '', body: '', image: '' }); slideIndex++; saveSlides(); renderSlides(); $('slideTitle').focus(); });
$('duplicateSlide').addEventListener('click', () => { slides.splice(slideIndex + 1, 0, { ...slides[slideIndex] }); slideIndex++; saveSlides(); renderSlides(); });
$('deleteSlide').addEventListener('click', () => { if (slides.length === 1) { slides[0] = { title: '', body: '', image: '' }; } else { slides.splice(slideIndex, 1); slideIndex = Math.min(slideIndex, slides.length - 1); } saveSlides(); renderSlides(); });
$('prevSlide').addEventListener('click', () => { if (slideIndex > 0) { slideIndex--; renderSlides(); } });
$('nextSlide').addEventListener('click', () => { if (slideIndex < slides.length - 1) { slideIndex++; renderSlides(); } });
$('editToggle').addEventListener('click', () => { editing = !editing; renderSlides(); });
$('presentButton').addEventListener('click', () => { editing = false; document.body.classList.add('presentation-mode'); $('exitPresent').classList.remove('hidden'); renderSlides(); document.documentElement.requestFullscreen?.().catch(() => {}); });
function exitPresent() { document.body.classList.remove('presentation-mode'); $('exitPresent').classList.add('hidden'); if (document.fullscreenElement) document.exitFullscreen?.(); editing = true; renderSlides(); }
$('exitPresent').addEventListener('click', exitPresent);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('presentation-mode')) exitPresent();
  if (!document.body.classList.contains('presentation-mode')) return;
  if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); $('nextSlide').click(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); $('prevSlide').click(); }
});
$('exportSlides').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ version: 1, slides }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'bird-battle-slides.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});
$('importSlides').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.slides) || !data.slides.length || !data.slides.every(slide => typeof slide.title === 'string' && typeof slide.body === 'string')) throw Error('Invalid backup');
    slides = data.slides.map(slide => ({ title: slide.title, body: slide.body, image: typeof slide.image === 'string' ? slide.image : '' }));
    slideIndex = 0; saveSlides(); renderSlides();
  } catch { alert('That file is not a valid slide backup.'); }
  event.target.value = '';
});

function showView(view) {
  if (document.body.classList.contains('presentation-mode')) exitPresent();
  $('gameView').classList.toggle('hidden', view !== 'game'); $('slidesView').classList.toggle('hidden', view !== 'slides');
  $('gameTab').classList.toggle('active', view === 'game'); $('slidesTab').classList.toggle('active', view === 'slides');
  if (view === 'slides') renderSlides();
}
$('gameTab').addEventListener('click', () => showView('game'));
$('slidesTab').addEventListener('click', () => showView('slides'));
$('slidesAfterButton').addEventListener('click', () => showView('slides'));

birds.filter(bird => bird.source).forEach(bird => {
  const item = document.createElement('li'); const link = document.createElement('a'); link.href = bird.source; link.target = '_blank'; link.rel = 'noopener'; link.textContent = bird.name;
  item.append(link, document.createTextNode(` — ${bird.credit} · ${bird.license}`)); $('creditsList').append(item);
});
$('creditsButton').addEventListener('click', () => $('creditsDialog').showModal());
$('closeCredits').addEventListener('click', () => $('creditsDialog').close());
renderGame(); renderSlides();
