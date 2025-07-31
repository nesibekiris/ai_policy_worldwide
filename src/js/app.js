/**
 * Global AI Governance Map - Main Application
 * Interactive world map visualization of AI policies and regulations
 */

class AIGovernanceMap {
  constructor() {
    this.countries = [];
    this.tooltip = null;
    this.markers = [];
    this.currentFilter = 'all';
    
    this.init();
  }

  async init() {
    try {
      await this.loadCountryData();
      this.setupMap();
      this.setupInteractions();
      this.setupAnimations();
      this.generateCountryCards();
      
      console.log('AI Governance Map initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Governance Map:', error);
    }
  }

  async loadCountryData() {
    try {
      const response = await fetch('./src/data/countries.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.countries = data.countries;
    } catch (error) {
      console.error('Failed to load country data:', error);
      // Fallback to embedded data if fetch fails
      this.countries = this.getFallbackData();
    }
  }

  getFallbackData() {
    // Fallback data in case JSON file can't be loaded
    return [
      {
        id: "usa",
        name: "United States",
        flag: "🇺🇸",
        status: "implementing",
        approach: "innovation",
        statusText: "Implementing - Innovation Dominance Strategy",
        approachText: "Innovation-First",
        position: { top: "35%", left: "20%" }
      },
      {
        id: "eu",
        name: "European Union",
        flag: "🇪🇺",
        status: "active",
        approach: "comprehensive",
        statusText: "Active - World's First Comprehensive AI Law",
        approachText: "Comprehensive Regulation",
        position: { top: "30%", left: "50%" }
      },
      {
        id: "china",
        name: "China",
        flag: "🇨🇳",
        status: "active",
        approach: "state-led",
        statusText: "Active - State-Led Comprehensive Control",
        approachText: "State-Led",
        position: { top: "35%", left: "75%" }
      }
    ];
  }

  setupMap() {
    const mapContainer = document.querySelector('.world-map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    this.tooltip.id = 'tooltip';
    document.body.appendChild(this.tooltip);

    // Create country markers
    this.countries.forEach(country => {
      const marker = this.createCountryMarker(country);
      mapContainer.appendChild(marker);
      this.markers.push(marker);
    });

    this.enhanceMapBackground();
  }

  createCountryMarker(country) {
    const marker = document.createElement('div');
    marker.className = `country-marker ${country.id} ${country.status} ${country.approach}`;
    marker.style.top = country.position.top;
    marker.style.left = country.position.left;
    marker.textContent = country.flag;
    marker.setAttribute('data-country', country.name);
    marker.setAttribute('data-id', country.id);
    
    return marker;
  }

  setupInteractions() {
    this.markers.forEach(marker => {
      marker.addEventListener('mouseenter', (e) => this.showTooltip(e));
      marker.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
      marker.addEventListener('mouseleave', () => this.hideTooltip());
      marker.addEventListener('click', (e) => this.handleMarkerClick(e));
    });

    // Setup filter buttons if they exist
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });
  }

  showTooltip(event) {
    const countryName = event.target.getAttribute('data-country');
    const country = this.countries.find(c => c.name === countryName);
    
    if (country && this.tooltip) {
      const statusDotClass = this.getStatusDotClass(country.status);
      
      this.tooltip.innerHTML = `
        <h4>${country.name}</h4>
        <div class="status">
          <div class="status-dot ${statusDotClass}"></div>
          <span>${country.statusText}</span>
        </div>
        <p><strong>Approach:</strong> ${country.approachText}</p>
        ${country.legislation && country.legislation[0] ? 
          `<p><strong>Key Legislation:</strong> ${country.legislation[0].name}</p>` : ''}
        ${country.penalties ? `<p><strong>Penalties:</strong> ${country.penalties}</p>` : ''}
        ${country.investment ? `<p><strong>Investment:</strong> ${country.investment.amount}</p>` : ''}
        ${country.details ? `<p style="margin-top: 8px; font-size: 13px; color: #cbd5e0;">${country.details}</p>` : ''}
      `;
      this.tooltip.classList.add('show');
    }
  }

  updateTooltipPosition(event) {
    if (this.tooltip) {
      this.tooltip.style.left = event.pageX + 15 + 'px';
      this.tooltip.style.top = event.pageY - 10 + 'px';
    }
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('show');
    }
  }

  handleMarkerClick(event) {
    const countryName = event.target.getAttribute('data-country');
    this.scrollToCountryCard(countryName);
  }

  scrollToCountryCard(countryName) {
    const cards = document.querySelectorAll('.country-card');
    cards.forEach(card => {
      const cardTitle = card.querySelector('h3')?.textContent;
      if (cardTitle === countryName) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.highlightCard(card);
      }
    });
  }

  highlightCard(card) {
    card.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
    card.style.transform = 'translateY(-15px) scale(1.02)';
    
    setTimeout(() => {
      card.style.boxShadow = '';
      card.style.transform = '';
    }, 2000);
  }

  handleFilter(event) {
    const filter = event.target.getAttribute('data-filter') || 'all';
    this.currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter markers and cards
    this.applyFilter(filter);
  }

  applyFilter(filter) {
    this.markers.forEach(marker => {
      const countryId = marker.getAttribute('data-id');
      const country = this.countries.find(c => c.id === countryId);
      
      if (this.shouldShowCountry(country, filter)) {
        marker.style.display = 'flex';
        marker.style.opacity = '1';
      } else {
        marker.style.display = 'none';
        marker.style.opacity = '0.3';
      }
    });

    // Filter country cards
    const cards = document.querySelectorAll('.country-card');
    cards.forEach(card => {
      const countryName = card.querySelector('h3')?.textContent;
      const country = this.countries.find(c => c.name === countryName);
      
      if (this.shouldShowCountry(country, filter)) {
        card.style.display = 'block';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  }

  shouldShowCountry(country, filter) {
    if (!country) return false;
    
    switch (filter) {
      case 'all':
        return true;
      case 'major-power':
        return country.category === 'major-power';
      case 'regional-leader':
        return country.category === 'regional-leader';
      case 'emerging-leader':
        return country.category === 'emerging-leader';
      case 'active':
        return country.status === 'active';
      case 'comprehensive':
        return country.approach === 'comprehensive';
      default:
        return true;
    }
  }

  getStatusDotClass(status) {
    const statusMap = {
      'active': 'status-active',
      'implementing': 'status-implementing',
      'planning': 'status-planning',
      'voluntary': 'status-voluntary'
    };
    return statusMap[status] || 'status-voluntary';
  }

  setupAnimations() {
    // Add pulsing animation to markers
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .country-marker {
        animation: pulse 3s infinite;
      }
      
      .country-marker:hover {
        animation: none;
      }
      
      @keyframes fadeIn {
        from {
