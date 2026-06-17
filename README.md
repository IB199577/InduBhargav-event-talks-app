# BigQuery Release Pulse

A premium, modern, glassmorphic dashboard application to track, analyze, filter, and share Google Cloud BigQuery release updates. Built with **Python Flask** on the backend and **Vanilla HTML, CSS, and JavaScript** on the frontend.

## 🚀 Live Demo & Repository
* **GitHub Repository**: [https://github.com/IB199577/InduBhargav-event-talks-app](https://github.com/IB199577/InduBhargav-event-talks-app)

---

## ✨ Features

* **Glassmorphic User Interface**: Sleek dark and light theme toggles with smooth transitions, modern typography, and rich visual badging.
* **Auto-Categorizing Feed Parser**: Connects to the official GCP BigQuery Atom XML feed and splits updates into specific badges:
  * `Feature` (Green)
  * `Issue` (Red)
  * `Announcement` (Sky Blue)
  * `Change` (Purple)
  * `Deprecation` (Orange)
* **Outbound Traffic Cache**: An in-memory cache system that retains updates for 30 minutes, lowering network overhead and preventing rate limiting, with automatic cache fallback if GCP feeds are unreachable.
* **Advanced Real-Time Filtering**: Instant client-side full-text search matching across update descriptions, titles, dates, or types.
* **Interactive Social Media Publisher**:
  * **Quick Tweet**: Formats a clean single-update tweet draft with official source links.
  * **Multi-Note Composer**: Allows stacking multiple updates together.
  * **Visual Char Counter**: Displays remaining tweet space with a dynamic progress ring that shifts warnings dynamically as the 280-character limit is approached.
  * **Clipboard Copy**: Direct copy-to-clipboard tool.

---

## 🛠️ Tech Stack
* **Backend**: Python 3, Flask
* **Frontend**: HTML5, CSS3 (Vanilla design tokens, CSS variables, glassmorphic filters), JavaScript (ES6 State engine)
* **Libraries used**: `xml.etree.ElementTree`, `html.parser` (no bloated external packages required)

---

## ⚙️ Quick Start

### 1. Prerequisites
Ensure you have Python 3.x installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/IB199577/InduBhargav-event-talks-app.git
cd InduBhargav-event-talks-app
pip install flask
```

### 3. Run the Server
Start the development server:
```bash
python app.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser to view the application.

---

## 📁 Directory Structure

```
├── static/
│   ├── css/
│   │   └── styles.css       # Layout variables, animations, glassmorphism, & dark/light rules
│   └── js/
│       └── main.js          # Core client state-store, filters, and Tweet builder logic
├── templates/
│   └── index.html           # Main semantic HTML5 template
├── .gitignore               # Standard environment & temporary ignore definitions
├── app.py                   # Flask server, feed grabber, caching rules, & REST APIs
└── README.md                # Project documentation
```

---

## 📜 License
This project is open-source and available under the MIT License.
