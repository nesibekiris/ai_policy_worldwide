class AIGovernanceMap {
  constructor() {
    this.countries = [];
    this.mapContainer = null;
    this.fallbackContainer = null;

    this.statusColors = {
      active: '#48bb78',
      implementing: '#ed8936',
      planning: '#4299e1',
      voluntary: '#9f7aea'
    };

    this.approachBorders = {
      comprehensive: '#e53e3e',
      innovation: '#00d4ff',
      'state-led': '#ed8936',
      balanced: '#48bb78'
    };
  }

  async init() {
    this.cacheDom();
    this.setupGlobalInteractions();

    await this.loadCountryData();
    this.initializeMap();
  }

  cacheDom() {
    this.mapContainer = document.getElementById('policy-world-map');
    this.fallbackContainer = document.getElementById('mapFallback');
  }

  setupGlobalInteractions() {
    this.setupSmoothScroll();
  }

  setupSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', event => {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  async loadCountryData() {
    try {
      const response = await fetch('./src/data/countries.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch countries.json: ${response.status}`);
      }

      const data = await response.json();
      this.countries = Array.isArray(data?.countries) ? data.countries : [];
    } catch (error) {
      console.error('Unable to load country data. Falling back to embedded dataset.', error);
      this.countries = this.getFallbackData();
    }
  }

  getFallbackData() {
    return [
      {
        id: 'usa',
        name: 'United States',
        status: 'implementing',
        approach: 'innovation',
        category: 'major-power',
        statusText: "Implementing - Innovation Dominance Strategy",
        approachText: 'Innovation-First'
      },
      {
        id: 'eu',
        name: 'European Union',
        status: 'active',
        approach: 'comprehensive',
        category: 'major-power',
        statusText: "Active - World's First Comprehensive AI Law",
        approachText: 'Comprehensive Regulation'
      },
      {
        id: 'china',
        name: 'China',
        status: 'active',
        approach: 'state-led',
        category: 'major-power',
        statusText: 'Active - State-Led Comprehensive Control',
        approachText: 'State-Led'
      }
    ];
  }

  initializeMap() {
    if (!this.mapContainer) {
      console.warn('Policy world map container not found.');
      return;
    }

    if (!window.simplemaps_worldmap || typeof window.simplemaps_worldmap !== 'object') {
      this.showFallback('Interactive map failed to load.');
      return;
    }

    const locations = this.createLocations();
    if (!locations || Object.keys(locations).length === 0) {
      this.showFallback('No country data available for the interactive map.');
      return;
    }

    window.simplemaps_worldmap_mapdata = {
      main_settings: {
        div: 'policy-world-map',
        width: 'responsive',
        background_color: '#0f1534',
        background_transparent: 'yes',
        border_color: '#1f2937',
        popups: 'detect',
        state_description: 'AI governance data unavailable',
        state_color: '#1f2547',
        state_hover_color: '#27315d',
        border_size: 0.7,
        all_states_inactive: 'yes',
        all_states_zoomable: 'no',
        location_description: 'Click to view detailed AI policy overview',
        location_color: '#00d4ff',
        location_opacity: 0.92,
        location_hover_opacity: 1,
        location_url: 'regulations.html',
        location_type: 'circle',
        location_border_color: '#ffffff',
        location_border: 3,
        location_hover_border: 4,
        location_size: 30,
        location_label: 'no',
        label_color: '#ffffff',
        label_hover_color: '#ffffff',
        hide_labels: 'yes',
        zoom: 'no',
        popup_font: 'Inter, Arial, sans-serif'
      },
      state_specific: {},
      locations,
      labels: {},
      regions: {},
      data: {}
    };

    this.setupMapHooks();

    if (typeof window.simplemaps_worldmap.load === 'function') {
      window.simplemaps_worldmap.load();
    } else if (typeof window.simplemaps_worldmap.refresh === 'function') {
      window.simplemaps_worldmap.refresh();
    }

    this.hideFallback();
  }

  createLocations() {
    const locations = {};

    this.countries.forEach((country, index) => {
      const coords = this.getCoordinates(country.id);
      if (!coords) {
        console.warn(`Coordinates not found for country id: ${country.id}`);
        return;
      }

      const statusColor = this.statusColors[country.status] || '#9f7aea';
      const borderColor = this.approachBorders[country.approach] || '#00d4ff';

      locations[index] = {
        name: country.name,
        lat: coords.lat,
        lng: coords.lng,
        description: this.buildLocationDescription(country),
        color: statusColor,
        hover_color: statusColor,
        opacity: 0.95,
        size: this.getMarkerSize(country.category),
        type: 'circle',
        border_color: borderColor,
        border: 3,
        hover_border: 4,
        url: `regulations.html#${this.createSlug(country.name)}`,
        target: 'same_window'
      };
    });

    return locations;
  }

  getMarkerSize(category) {
    switch (category) {
      case 'major-power':
        return 50;
      case 'regional-leader':
        return 40;
      default:
        return 32;
    }
  }

  buildLocationDescription(country) {
    const statusLine = country.statusText || '';
    const approachLine = country.approachText || '';
    const legislation = Array.isArray(country.legislation) && country.legislation.length > 0
      ? country.legislation[0].name
      : null;

    const highlights = Array.isArray(country.highlights)
      ? country.highlights.slice(0, 2)
      : [];

    const details = [
      statusLine ? `<p><strong>Status:</strong> ${statusLine}</p>` : '',
      approachLine ? `<p><strong>Approach:</strong> ${approachLine}</p>` : '',
      legislation ? `<p><strong>Key Legislation:</strong> ${legislation}</p>` : '',
      country.penalties ? `<p><strong>Penalties:</strong> ${country.penalties}</p>` : '',
      country.investment?.amount ? `<p><strong>Investment:</strong> ${country.investment.amount}</p>` : ''
    ].filter(Boolean).join('');

    const highlightsMarkup = highlights.length
      ? `<ul>${highlights.map(item => `<li>${item}</li>`).join('')}</ul>`
      : '';

    return `
      <div class="map-popup">
        <h4>${country.name}</h4>
        ${details}
        ${highlightsMarkup}
        <p class="map-popup-link">View full policy profile →</p>
      </div>
    `;
  }

  getCoordinates(id) {
    const coordinates = {
      usa: { lat: 38.0, lng: -97.0 },
      eu: { lat: 50.1, lng: 10.0 },
      china: { lat: 35.8, lng: 104.1 },
      japan: { lat: 36.2, lng: 138.3 },
      'south-korea': { lat: 36.5, lng: 127.8 },
      singapore: { lat: 1.3521, lng: 103.8198 },
      uk: { lat: 55.0, lng: -3.2 },
      canada: { lat: 56.1, lng: -106.3 },
      australia: { lat: -25.3, lng: 133.8 },
      india: { lat: 20.6, lng: 78.9 },
      brazil: { lat: -10.8, lng: -53.1 },
      uae: { lat: 23.4, lng: 53.8 }
    };

    return coordinates[id] || null;
  }

  createSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  setupMapHooks() {
    const simpleMap = window.simplemaps_worldmap;
    if (!simpleMap || !simpleMap.hooks) {
      return;
    }

    simpleMap.hooks.click_location = id => {
      const dataset = simpleMap.data?.locations || window.simplemaps_worldmap_mapdata?.locations || {};
      const location = dataset?.[id];
      if (location?.url) {
        window.location.href = location.url;
      }
    };

    simpleMap.hooks.over_location = id => {
      const dataset = simpleMap.data?.locations || window.simplemaps_worldmap_mapdata?.locations || {};
      const location = dataset?.[id];
      if (location) {
        this.mapContainer?.setAttribute('data-active-country', location.name);
      }
    };

    simpleMap.hooks.out_location = () => {
      this.mapContainer?.removeAttribute('data-active-country');
    };
  }

  showFallback(message) {
    if (this.fallbackContainer) {
      this.fallbackContainer.hidden = false;
      if (message) {
        const paragraph = this.fallbackContainer.querySelector('p');
        if (paragraph) {
          paragraph.textContent = message;
        }
      }
    }

    if (this.mapContainer) {
      this.mapContainer.setAttribute('aria-hidden', 'true');
    }
  }

  hideFallback() {
    if (this.fallbackContainer) {
      this.fallbackContainer.hidden = true;
    }

    if (this.mapContainer) {
      this.mapContainer.removeAttribute('aria-hidden');
    }
  }
}

function bootstrapApp() {
  const app = new AIGovernanceMap();
  app.init();
}

document.addEventListener('DOMContentLoaded', bootstrapApp);
