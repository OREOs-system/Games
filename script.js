let favorites = JSON.parse(localStorage.getItem('oreoHubFavorites') || '[]');
let isLightTheme = false;

// Device capability detection for mobile/desktop mode optimization
function detectDeviceCapabilities() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDesktopMode = window.innerWidth > 768 && isMobile;

  // Add classes to body for CSS targeting
  document.body.classList.toggle('touch-device', isTouchDevice);
  document.body.classList.toggle('desktop-mode-mobile', isDesktopMode);

  return { isTouchDevice, isMobile, isDesktopMode };
}
let searchTimeout;

// Enhanced play function with better animations
function play(btn) {
  const originalText = btn.innerHTML;
  const originalTransform = btn.style.transform;

  // Add click animation
  btn.style.transform = originalTransform + ' scale(0.95)';
  setTimeout(() => {
    btn.style.transform = originalTransform;
  }, 150);

  btn.innerHTML = '<span class="loading"></span>LOADING...';
  btn.disabled = true;
  btn.style.background = 'linear-gradient(135deg, #666, #999)';

  const linkElement = btn.nextElementSibling;
  const link = linkElement ? linkElement.href : '#';

  // Simulate loading time for better UX
  setTimeout(() => {
    if (link && link !== '#') {
      window.location.href = link;
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.background = '';
  }, 2000);
}

// Enhanced search with debouncing
function searchGame() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const input = document.querySelector('.search').value.toLowerCase();
    const selectedCategory = document.querySelector('.filter').value.toLowerCase();
    const isFavoritesOnly = selectedCategory === 'favorites';

    const cards = document.querySelectorAll('.card');
    let visibleCount = 0;

    cards.forEach((card, index) => {
      const name = card.dataset.name.toLowerCase();
      const category = card.dataset.category.toLowerCase();
      const matchesSearch = name.includes(input);
      const matchesCategory = selectedCategory === 'all' ||
        (isFavoritesOnly && favorites.includes(card.dataset.name)) ||
        category === selectedCategory;
      const shouldShow = matchesSearch && matchesCategory;

      if (shouldShow) {
        visibleCount++;
        setTimeout(() => {
          card.classList.remove('hidden');
          card.classList.add('show');
          card.style.animation = 'cardEntrance 0.6s ease-out';
        }, index * 50); // Staggered animation
      } else {
        card.classList.add('hidden');
        card.classList.remove('show');
        card.style.animation = '';
      }
    });

    const filterMessage = document.getElementById('filterMessage');
    filterMessage.classList.toggle('hidden', visibleCount !== 0);

    updateStats();
  }, 300); // Debounce delay
}

function clearFilters() {
  document.querySelector('.search').value = '';
  document.querySelector('.filter').value = 'all';
  searchGame();
}

function toggleTheme() {
  const toggleBtn = document.querySelector('.toggle');
  const icon = toggleBtn.querySelector('i');

  // Add transition animation
  document.body.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  document.body.style.filter = 'brightness(0.8)';

  setTimeout(() => {
    document.body.classList.toggle('light');
    isLightTheme = !isLightTheme;

    if (isLightTheme) {
      icon.className = 'fas fa-sun';
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i> <span>Light</span>';
    } else {
      icon.className = 'fas fa-moon';
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i> <span>Theme</span>';
    }

    // Save theme preference
    localStorage.setItem('oreoHubTheme', isLightTheme ? 'light' : 'dark');

    // Reset transition
    setTimeout(() => {
      document.body.style.filter = '';
      document.body.style.transition = '';
    }, 300);
  }, 150);
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
    // Add success animation
    el.style.animation = 'none';
    setTimeout(() => {
      el.style.animation = 'bounce 0.8s ease, heartPulse 1s ease-in-out';
    }, 10);

    // Create floating hearts
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createFloatingHeart(el);
      }, i * 200);
    }
  } else {
    el.textContent = '☆';
    favorites = favorites.filter(fav => fav !== gameName);
    el.style.animation = 'none';
    setTimeout(() => {
      el.style.animation = 'bounce 0.6s ease';
    }, 10);
  }

  localStorage.setItem('oreoHubFavorites', JSON.stringify(favorites));
  updateStats();
}

function createFloatingHeart(element) {
  const heart = document.createElement('div');
  heart.textContent = '♥';
  heart.style.position = 'absolute';
  heart.style.left = element.offsetLeft + 'px';
  heart.style.top = element.offsetTop + 'px';
  heart.style.color = '#ff6b6b';
  heart.style.fontSize = '20px';
  heart.style.pointerEvents = 'none';
  heart.style.zIndex = '1000';
  heart.style.animation = 'floatHeart 1s ease-out forwards';

  element.parentElement.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 1000);
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

// Enhanced scroll animations
function handleScroll() {
  const cards = document.querySelectorAll('.card');
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;

  cards.forEach((card, index) => {
    const cardTop = card.offsetTop;
    const cardHeight = card.offsetHeight;

    if (scrollTop + windowHeight > cardTop + 100 && scrollTop < cardTop + cardHeight) {
      card.classList.add('show');

      // Add parallax effect
      const parallaxOffset = (scrollTop - cardTop) * 0.1;
      card.style.transform = `translateY(${parallaxOffset}px)`;
    }
  });

  // Animate stats on scroll
  const stats = document.querySelector('.stats');
  if (stats) {
    const statsTop = stats.offsetTop;
    if (scrollTop + windowHeight > statsTop + 50) {
      stats.style.animation = 'fadeInUp 1s ease-out';
    }
  }
}

// Add smooth scrolling for navigation
function smoothScrollToSection(sectionId) {
  const section = document.getElementById(sectionId) || document.querySelector(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Add loading animation for page load
function showPageLoadAnimation() {
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(20px)';

  setTimeout(() => {
    document.body.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  }, 100);
}

// Enhanced mobile/desktop mode detection and handling
function detectDeviceCapabilities() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDesktopMode = window.innerWidth > 768 && isMobile; // Likely desktop mode on mobile

  document.body.classList.toggle('touch-device', isTouchDevice);
  document.body.classList.toggle('desktop-mode-mobile', isDesktopMode);

  return { isTouchDevice, isMobile, isDesktopMode };
}
function createParticles(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  // Handle both mouse and touch events
  const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
  const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const particleCount = detectDeviceCapabilities().isTouchDevice ? 6 : 8; // Fewer particles on touch for performance

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--x', (Math.random() - 0.5) * 120 + 'px');
    particle.style.setProperty('--y', (Math.random() - 0.5) * 120 + 'px');

    // Random colors for particles
    const colors = [var(--accent), var(--secondary-accent), var(--tertiary-accent)];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    card.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Enhanced modal functionality
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
  modalImage.alt = name;
  modalDescription.textContent = description;
  modalCategory.textContent = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  playBtn.onclick = () => play(playBtn);

  // Update the hidden link
  playBtn.nextElementSibling.href = link;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Add entrance animation
  modal.style.animation = 'none';
  setTimeout(() => {
    modal.style.animation = 'fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }, 10);
}

function closeModal() {
  const modal = document.getElementById('gameModal');
  modal.style.animation = 'fadeIn 0.3s ease reverse';
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }, 300);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  showPageLoadAnimation();
  loadFavorites();
  loadTheme();
  updateStats();

  // Add scroll listener with throttling
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 16); // ~60fps
  });

  // Add particle effects to cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', createParticles);
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('.favorite')) {
        openModal(card);
      }
    });

    // Add touch support for mobile
    card.addEventListener('touchstart', (e) => {
      e.preventDefault();
      createParticles(e.touches[0]);
    });
  });

  // Add smooth scrolling to sections
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      smoothScrollToSection(target);
    });
  });

  // Enhanced keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.search');
      searchInput.focus();
      searchInput.select();
    }

    // Escape to close modal or clear search
    if (e.key === 'Escape') {
      const modal = document.getElementById('gameModal');
      const searchInput = document.querySelector('.search');

      if (modal.style.display === 'block') {
        closeModal();
      } else if (document.activeElement === searchInput) {
        searchInput.blur();
        clearFilters();
      }
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const visibleCards = document.querySelectorAll('.card:not(.hidden)');
      const currentFocus = document.activeElement;

      if (currentFocus && currentFocus.closest('.card')) {
        const currentCard = currentFocus.closest('.card');
        const currentIndex = Array.from(visibleCards).indexOf(currentCard);
        let nextIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = Math.min(currentIndex + 1, visibleCards.length - 1);
        } else {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        visibleCards[nextIndex].focus();
        visibleCards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (visibleCards.length > 0) {
        visibleCards[0].focus();
      }
    }
  });

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
      closeModal();
    }
  };

  // Add resize listener for responsive adjustments
  window.addEventListener('resize', function() {
    // Recalculate positions if needed
    handleScroll();
  });

  // Back to top button functionality
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
  }

  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Trigger initial animations
  setTimeout(() => {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('show');
    });
  }, 500);
});