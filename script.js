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
  } else if (currentCategory === 'trending') {
    url = `${API_BASE}/trending/movie/day?api_key=${API_KEY}&page=${page}`;
  } else {
    url = `${API_BASE}/movie/${currentCategory}?api_key=${API_KEY}&page=${page}`;
  }
  if (currentGenre) url += `&with_genres=${currentGenre}`;

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
  const res = await fetch(`${API_BASE}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`);
  const movie = await res.json();
  const trailer = movie.videos.results.find(v => v.type === 'Trailer');
  modalDetails.innerHTML = `
    <h2>${movie.title}</h2>
    <p>${movie.overview}</p>
    ${trailer ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : 'No trailer available'}
  `;
  modal.style.display = 'block';
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

toggleTheme.onclick = () => {
  document.body.classList.toggle('light-mode');
};

loadMoreBtn.onclick = () => {
  currentPage++;
  fetchMovies(currentPage);
};

closeModal.onclick = () => {
  modal.style.display = 'none';
};

window.onclick = e => {
  if (e.target === modal) modal.style.display = 'none';
};

fetchGenres();
fetchMovies();
loadFavorites();
