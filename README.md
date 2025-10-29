# 🌍 Global AI Governance Interactive Map 2025

An interactive policy intelligence dashboard that visualises how nations regulate and invest in artificial intelligence. The project now ships with a lightweight Node.js backend so the homepage pulls live policy data from an API instead of relying on hard-coded markup.

## 🚀 Live Demo

> Clone the repository and run it locally to explore the interactive experience.

## 📊 Key Features

- **Interactive World Map** with animated, clickable policy markers
- **Dynamic Tooltips** populated from JSON data served by an API endpoint
- **Express.js Backend** that exposes reusable policy data for future integrations
- **Responsive UI** designed with modern gradients, glassmorphism, and accessible markup
- **Companion Regulations Page** for deep dives into national frameworks

## 🛠️ Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES2020+)
- **Backend:** Node.js with Express 4
- **Data:** Structured JSON stored in `src/data/countries.json`
- **Tooling:** ESLint, Prettier (optional) and npm scripts for local development

## 📦 Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/global-ai-governance-map.git
   cd global-ai-governance-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the interactive site**
   ```bash
   npm start
   ```

   The development server runs at [http://localhost:3000](http://localhost:3000) and serves both the static site and the `/api/countries` endpoint.

## 🔌 API Endpoints

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/api/countries`   | Returns the structured list of AI governance profiles used across the site |

The API reads directly from `src/data/countries.json`, so updating that file automatically refreshes map markers and tooltips.

## 📁 Project Structure

```
ai_policy_worldwide/
├── assets/
│   └── images/
│       ├── preview.png
│       └── world-map.svg
├── index.html
├── regulations.html
├── server.js
├── src/
│   ├── data/
│   │   └── countries.json
│   ├── js/
│   │   └── app.js
│   └── styles/
│       └── main.css
├── package.json
└── README.md
```

## 🎯 Customisation Tips

- **Add a new country**: Append the details to `src/data/countries.json` (including `position` for map coordinates). The map will render the marker automatically.
- **Tune marker styling**: Adjust gradients and animation timing in the CSS definitions inside `index.html` or `src/styles/main.css`.
- **Extend the API**: Add new Express routes in `server.js` to surface additional datasets (e.g., regulations, timelines, investments).

## 📈 Roadmap Ideas

- Enrich `/api/countries` with timeline events for each jurisdiction
- Persist updates via a lightweight admin interface
- Generate comparative analytics views from the shared API layer

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 🙏 Acknowledgements

- Policy research and copy by [TechLetter.co](https://techletter.co)
- Emoji flags courtesy of the Unicode Consortium
- Inspiration from global AI governance research communities
