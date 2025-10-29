const API_ENDPOINT = '/api/countries';

class AIGovernanceMap {
  constructor({ mapSelector, tooltipSelector }) {
    this.mapElement = document.querySelector(mapSelector);
    this.tooltipElement = document.querySelector(tooltipSelector) || this.createTooltip();
    this.countries = [];
    this.markers = [];
  }

  async init() {
    if (!this.mapElement) {
      console.warn('Policy map container not found – skipping map initialisation.');
      return;
    }

    await this.loadCountryData();
    this.renderMarkers();
  }

  async loadCountryData() {
    try {
      const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data?.countries)) {
        throw new Error('Countries payload missing or invalid.');
      }

      this.countries = data.countries;
    } catch (error) {
      console.error('Failed to fetch countries from API, using fallback data.', error);
      this.countries = this.getFallbackData();
    }
  }

  renderMarkers() {
    this.clearExistingMarkers();

    this.countries
      .filter((country) => country?.position)
      .forEach((country) => {
        const marker = this.createMarker(country);
        this.mapElement.appendChild(marker);
        this.markers.push({ element: marker, country });
      });

    this.attachMarkerInteractions();
  }

  clearExistingMarkers() {
    this.markers.forEach(({ element }) => element.remove());
    this.markers = [];
  }

  createMarker(country) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `country-marker ${country.id} ${country.status} ${country.approach}`;
    marker.style.top = country.position.top;
    marker.style.left = country.position.left;
    marker.textContent = country.flag;
    marker.dataset.countryId = country.id;
    marker.dataset.countryName = country.name;
    marker.setAttribute('aria-label', `${country.name}: ${country.statusText || country.status}`);

    return marker;
  }

  attachMarkerInteractions() {
    this.markers.forEach(({ element, country }) => {
      element.addEventListener('mouseenter', (event) => {
        this.showTooltip(country, event);
      });

      element.addEventListener('mousemove', (event) => {
        this.updateTooltipPosition(event.pageX, event.pageY);
      });

      element.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      element.addEventListener('focus', (event) => {
        this.showTooltip(country, event);
      });

      element.addEventListener('blur', () => {
        this.hideTooltip();
      });

      element.addEventListener('click', () => {
        this.navigateToDetails(country);
      });

      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.navigateToDetails(country);
        }
      });
    });
  }

  showTooltip(country, event) {
    if (!this.tooltipElement) {
      return;
    }

    const statusClass = this.getStatusDotClass(country.status);
    const keyLegislation = country.legislation?.[0]?.name;
    const details = country.details || country.approachText;

    this.tooltipElement.innerHTML = `
      <h4>${country.name}</h4>
      <div class="status">
        <div class="status-dot ${statusClass}"></div>
        <span>${country.statusText || ''}</span>
      </div>
      <p><strong>Approach:</strong> ${country.approachText || ''}</p>
      ${keyLegislation ? `<p><strong>Key Legislation:</strong> ${keyLegislation}</p>` : ''}
      ${country.penalties ? `<p><strong>Penalties:</strong> ${country.penalties}</p>` : ''}
      ${country.investment?.amount ? `<p><strong>Investment:</strong> ${country.investment.amount}</p>` : ''}
      ${details ? `<p style="margin-top: 8px; font-size: 13px; color: #cbd5e0;">${details}</p>` : ''}
    `;

    this.tooltipElement.classList.add('show');

    const targetElement = event?.currentTarget || event?.target || null;
    const hasMousePosition = typeof MouseEvent !== 'undefined' && event instanceof MouseEvent;
    const fallbackPosition = elementCenter(targetElement);

    const pageX = hasMousePosition ? event.pageX : fallbackPosition.x;
    const pageY = hasMousePosition ? event.pageY : fallbackPosition.y;

    this.updateTooltipPosition(pageX, pageY);
  }

  updateTooltipPosition(pageX, pageY) {
    if (!this.tooltipElement) {
      return;
    }

    this.tooltipElement.style.left = `${pageX + 15}px`;
    this.tooltipElement.style.top = `${pageY - 10}px`;
  }

  hideTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.classList.remove('show');
    }
  }

  navigateToDetails(country) {
    if (!country?.id) {
      return;
    }

    window.location.href = `regulations.html#${country.id}`;
  }

  getStatusDotClass(status) {
    const statusMap = {
      active: 'status-active',
      implementing: 'status-implementing',
      planning: 'status-planning',
      voluntary: 'status-voluntary'
    };

    return statusMap[status] || 'status-voluntary';
  }

  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.id = 'tooltip';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
    return tooltip;
  }

  getFallbackData() {
    return [
      {
        id: 'usa',
        name: 'United States',
        flag: '🇺🇸',
        status: 'implementing',
        approach: 'innovation',
        statusText: 'Implementing - Innovation Dominance Strategy',
        approachText: 'Innovation-First',
        penalties: 'None (Federal)',
        position: { top: '35%', left: '20%' }
      },
      {
        id: 'eu',
        name: 'European Union',
        flag: '🇪🇺',
        status: 'active',
        approach: 'comprehensive',
        statusText: "Active - World's First Comprehensive AI Law",
        approachText: 'Comprehensive Regulation',
        penalties: '€35M or 7% of global turnover',
        position: { top: '30%', left: '50%' }
      },
      {
        id: 'china',
        name: 'China',
        flag: '🇨🇳',
        status: 'active',
        approach: 'state-led',
        statusText: 'Active - State-Led Comprehensive Control',
        approachText: 'State-Led',
        position: { top: '35%', left: '75%' }
      }
    ];
  }
}

function elementCenter(target) {
  const rect = target?.getBoundingClientRect();
  if (!rect) {
    return { x: 0, y: 0 };
  }

  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY
  };
}

function setupMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const openButton = document.querySelector('.mobile-menu-btn');
  const closeButton = mobileMenu?.querySelector('.mobile-menu-close');

  if (!mobileMenu || !openButton) {
    return;
  }

  const applyMenuState = (isOpen) => {
    mobileMenu.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    openButton.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  openButton.addEventListener('click', () => {
    const nextState = !mobileMenu.classList.contains('active');
    applyMenuState(nextState);
  });

  closeButton?.addEventListener('click', () => applyMenuState(false));

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => applyMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
      applyMenuState(false);
    }
  });

  applyMenuState(false);
}

function setupSmoothScrolling() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setupTimelineScrollIndicator() {
  const track = document.querySelector('.timeline-track');
  if (!track) {
    return;
  }

  track.addEventListener('scroll', () => {
    const indicator = document.querySelector('[data-timeline-indicator]');
    if (!indicator) {
      return;
    }

    const progress = track.scrollLeft / (track.scrollWidth - track.clientWidth);
    indicator.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  });
}

function ensureAnimations() {
  if (document.getElementById('map-animations')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'map-animations';
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .country-marker {
      animation: pulse 3s infinite;
    }

    .country-marker:hover,
    .country-marker:focus {
      animation: none;
      outline: none;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  const map = new AIGovernanceMap({ mapSelector: '#policyMap', tooltipSelector: '#tooltip' });
  map.init().catch((error) => {
    console.error('Error initialising the AI governance map:', error);
  });

  setupMobileMenu();
  setupSmoothScrolling();
  setupTimelineScrollIndicator();
  ensureAnimations();
});

export default AIGovernanceMap;
