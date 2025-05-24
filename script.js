const API_KEY = '3cd56ce235dea4b38d199e435cbb2f9d';
const API_BASE = 'https://api.themoviedb.org/3';
let currentPage = 1;
let currentCategory = 'trending';
let currentGenre = '';
let darkMode = true;

const movieContainer = document.getElementById('movieContainer');
const favoriteContainer = document.getElementById('favoriteContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const genreSelect = document.getElementById('genreSelect');
const categorySelect = document.getElementById('categorySelect');
const toggleTheme = document.getElementById('toggleTheme');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.getElementById('closeModal');

const themeSelector = document.getElementById('themeSelector');
themeSelector.addEventListener('change', (e) => {
    const theme = e.target.value;

    document.body.className = ''; // Clear existing theme
    document.body.classList.add(`${theme}-theme`);
});

genreSelect.onchange = () => {
  currentGenre = genreSelect.value;
  searchInput.value = '';
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
};

categorySelect.onchange = () => {
  currentCategory = categorySelect.value;
  currentGenre = ''; // Reset genre when category changes
  genreSelect.value = '';
  searchInput.value = '';
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
};



async function fetchGenres() {
  const res = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();
  data.genres.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    genreSelect.appendChild(opt);
  });
}

async function fetchMovies(page = 1) {
  let url;

  if (searchInput.value) {
    url = `${API_BASE}/search/movie?api_key=${API_KEY}&query=${searchInput.value}&page=${page}`;
  } else if (currentGenre) {
    url = `${API_BASE}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenre}&page=${page}`;
  } else if (currentCategory === 'trending') {
    url = `${API_BASE}/trending/movie/day?api_key=${API_KEY}&page=${page}`;
  } else {
    url = `${API_BASE}/movie/${currentCategory}?api_key=${API_KEY}&page=${page}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  displayMovies(data.results);
}


function displayMovies(movies) {
  movies.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'movie';
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
      <button class="favorite-btn" onclick="addToFavorites(${movie.id})">+ Favorite</button>
    `;
    div.onclick = () => showDetails(movie.id);
    movieContainer.appendChild(div);
  });
}

async function showDetails(movieId) {
  const [movieRes, creditsRes] = await Promise.all([
    fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`),
    fetch(`${API_BASE}/movie/${movieId}/credits?api_key=${API_KEY}`)
  ]);
  
  const movie = await movieRes.json();
  const credits = await creditsRes.json();

  const trailer = movie.videos.results.find(v => v.type === 'Trailer');
  const topCast = credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
  const director = credits.crew.find(p => p.job === 'Director');

  modalDetails.innerHTML = `
    <h2>${movie.title}</h2>
    <p><strong>Director:</strong> ${director ? `<a href="#" onclick="searchPerson('${director.name}')">${director.name}</a>` : 'N/A'}</p>
    <p><strong>Top Cast:</strong> ${topCast}</p>
    <p>${movie.overview}</p>
    ${trailer ? `<iframe id="trailer" width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : 'No trailer available'}
  `;
  modal.style.display = 'block';
}

function searchPerson(name) {
  searchInput.value = name;
  modal.style.display = 'none';
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
}

function addToFavorites(movieId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(movieId)) {
    favorites.push(movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
  }
}

async function loadFavorites() {
  favoriteContainer.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  for (let id of favorites) {
    const res = await fetch(`${API_BASE}/movie/${id}?api_key=${API_KEY}`);
    const movie = await res.json();
    const div = document.createElement('div');
    div.className = 'movie';
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
    `;
    div.onclick = () => showDetails(movie.id);
    favoriteContainer.appendChild(div);
  }
}


async function showTrivia() {
  const res = await fetch(`${API_BASE}/movie/top_rated?api_key=${API_KEY}&page=1`);
  const data = await res.json();
  const movie = data.results[Math.floor(Math.random() * data.results.length)];
  
  const question = `Which year was "${movie.title}" released?`;
  const correct = movie.release_date.split('-')[0];
  const options = shuffle([correct, correct - 1, correct - 2, correct - 3]);

  document.getElementById('triviaBox').innerHTML = `
    <p><strong>${question}</strong></p>
    ${options.map(y => `<button onclick="checkAnswer('${y}', '${correct}')">${y}</button>`).join('')}
  `;
}

function checkAnswer(answer, correct) {
  alert(answer === correct ? '✅ Correct!' : `❌ Wrong! The correct answer is ${correct}`);
}

function shuffle(arr) {
  return arr.sort(() => 0.5 - Math.random());
}


searchBtn.onclick = () => {
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
};

genreSelect.onchange = () => {
  currentGenre = genreSelect.value;
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
};

categorySelect.onchange = () => {
  currentCategory = categorySelect.value;
  movieContainer.innerHTML = '';
  currentPage = 1;
  fetchMovies();
};


loadMoreBtn.onclick = () => {
  currentPage++;
  fetchMovies(currentPage);
};

closeModal.onclick = () => {
  modal.style.display = 'none';
  modalDetails.innerHTML = ''; // remove trailer
};


window.onclick = e => {
  if (e.target === modal) modal.style.display = 'none';
};

fetchGenres();
fetchMovies();
loadFavorites();
