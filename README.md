# Sinta AI Scraper

An advanced Hybrid AI Scraper designed to extract and organize publication data from Sinta and Scopus journals seamlessly. This project leverages local LLMs and highly optimized regex parsing to deliver lightning-fast, zero-cost intelligence for researchers.

## Project Architecture

```text
scraper/
├── docs/
│   └── PRD.md         # Product Requirements Document
├── public/
│   ├── index.html     # Main application interface
│   └── styles.css     # Global stylesheets and UI components
├── src/
│   └── script.js      # Core frontend logic and data fetching
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation
```

## Features
- **Lightning Fast Extraction:** 99% Regex precision combined with 1% AI fallback for complex cost narratives.
- **Zero API Costs:** Runs completely locally using Ollama (Llama 3.1).
- **Direct Contacts:** Instantly parses Editor emails, Telegram links, and WhatsApp numbers.

## Usage
1. Clone the repository.
2. Serve the `public/index.html` file using any static file server.
3. Access the dashboard to explore journal APCs, waivers, and quartile rankings in real-time.
