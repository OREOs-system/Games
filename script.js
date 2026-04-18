let favorites = JSON.parse(localStorage.getItem('oreoHubFavorites') || '[]');
let isLightTheme = false;

function play(btn) {
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="loading"></span>LOADING...';
  btn.disabled = true;

  const linkElement = btn.nextElementSibling;
  const link = linkElement ? linkElement.href : '#';

  // Simulate loading time for better UX
  setTimeout(() => {
    if (link && link !== '#') {
      window.open(link, '_blank');
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 1500);
}

function searchGame() {
  const input = document.querySelector('.search').value.toLowerCase();
  const selectedCategory = document.querySelector('.filter').value.toLowerCase();
  const isFavoritesOnly = selectedCategory === 'favorites';

  document.querySelectorAll('.card').forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category.toLowerCase();
    const matchesSearch = name.includes(input);
    const matchesCategory = selectedCategory === 'all' ||
      (isFavoritesOnly && favorites.includes(card.dataset.name)) ||
      category === selectedCategory;
    const shouldShow = matchesSearch && matchesCategory;

    card.classList.toggle('hidden', !shouldShow);
    card.classList.toggle('show', shouldShow);

    if (shouldShow) {
      card.style.animation = 'cardEntrance 0.4s ease-out';
    } else {
      card.style.animation = '';
    }
  });

  const visibleCards = document.querySelectorAll('.card:not(.hidden)');
  document.getElementById('filterMessage').classList.toggle('hidden', visibleCards.length !== 0);
  updateStats();
}

function clearFilters() {
  document.querySelector('.search').value = '';
  document.querySelector('.filter').value = 'all';
  searchGame();
}

function toggleTheme() {
  document.body.classList.toggle('light');
  isLightTheme = !isLightTheme;

  const toggleBtn = document.querySelector('.toggle');
  const icon = toggleBtn.querySelector('i');

  if (isLightTheme) {
    icon.className = 'fas fa-sun';
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
  } else {
    icon.className = 'fas fa-moon';
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i> <span>Theme</span>';
  }

  // Save theme preference
  localStorage.setItem('oreoHubTheme', isLightTheme ? 'light' : 'dark');
}

function fav(el) {
  const card = el.closest('.card');
  const gameName = card.dataset.name;

  el.classList.toggle('active');

  if (el.classList.contains('active')) {
    el.textContent = '★';
    if (!favorites.includes(gameName)) {
      favorites.push(gameName);
    }
  } else {
    el.textContent = '☆';
    favorites = favorites.filter(fav => fav !== gameName);
  }

  localStorage.setItem('oreoHubFavorites', JSON.stringify(favorites));
  updateStats();

  // Add heart animation
  el.style.animation = 'none';
  setTimeout(() => {
    el.style.animation = 'bounce 0.6s ease';
  }, 10);
}

function updateStats() {
  const allCards = document.querySelectorAll('.card');
  const visibleCards = document.querySelectorAll('.card:not(.hidden)');
  const publicCards = document.querySelectorAll('.section:first-child .card:not(.hidden)');
  const privateCards = document.querySelectorAll('.section:last-child .card:not(.hidden)');

  document.getElementById('totalGames').textContent = allCards.length;
  document.getElementById('visibleGames').textContent = visibleCards.length;
  document.getElementById('publicServers').textContent = publicCards.length;
  document.getElementById('privateServers').textContent = privateCards.length;
  document.getElementById('favoritesCount').textContent = favorites.length;
}

function loadFavorites() {
  favorites.forEach(gameName => {
    const cards = document.querySelectorAll(`[data-name="${gameName}"]`);
    cards.forEach(card => {
      const favBtn = card.querySelector('.favorite');
      if (favBtn) {
        favBtn.classList.add('active');
        favBtn.textContent = '★';
      }
    });
  });
}

function loadTheme() {
  const savedTheme = localStorage.getItem('oreoHubTheme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    isLightTheme = true;
    const toggleBtn = document.querySelector('.toggle');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
  }
}

// Add scroll animations
function handleScroll() {
  const cards = document.querySelectorAll('.card');
  const scrollTop = window.pageYOffset;

  cards.forEach((card, index) => {
    const cardTop = card.offsetTop;
    const windowHeight = window.innerHeight;

    if (scrollTop + windowHeight > cardTop + 100) {
      card.classList.add('show');
    }
  });
}

// Add particle effect on hover
function createParticles(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
    particle.style.setProperty('--y', (Math.random() - 0.5) * 100 + 'px');
    card.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Modal functionality
function openModal(card) {
  const modal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalImage = document.getElementById('modalImage');
  const modalDescription = document.getElementById('modalDescription');
  const modalCategory = document.getElementById('modalCategory');
  const playBtn = document.getElementById('modalPlayBtn');

  const name = card.dataset.name;
  const category = card.dataset.category;
  const description = card.querySelector('.card-description').textContent;
  const imageSrc = card.querySelector('img').src;
  const link = card.querySelector('a').href;

  modalTitle.textContent = name.toUpperCase();
  modalImage.src = imageSrc;
  modalDescription.textContent = description;
  modalCategory.textContent = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  playBtn.onclick = () => play(playBtn);

  // Update the hidden link
  playBtn.nextElementSibling.href = link;

  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('gameModal').style.display = 'none';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadFavorites();
  loadTheme();
  updateStats();

  // Add scroll listener
  window.addEventListener('scroll', handleScroll);

  // Add particle effects to cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', createParticles);
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('.favorite')) {
        openModal(card);
      }
    });
  });

  // Add smooth scrolling to sections
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      document.querySelector('.search').focus();
    }
    if (e.key === 'Escape') {
      document.querySelector('.search').blur();
      closeModal();
    }
  });

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
      closeModal();
    }
  }
});

// Trigger initial animations
setTimeout(() => {
  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('show');
  });
}, 100);