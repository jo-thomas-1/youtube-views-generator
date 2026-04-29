# youtube-views-generator

A lightweight, high-performance web application designed for simultaneous YouTube video playback. Built with a focus on clean UX and security compliance, this tool allows users to manage multiple video streams through a unified, responsive interface.

## 🚀 Key Features

- **Dynamic URL Management:** Add or remove video input fields on the fly to scale your viewing session.
- **Bulk JSON Import:** Streamline your workflow by uploading a `.json` file containing an array of YouTube URLs.
- **Intelligent Auto-Scroll:** Upon generating videos, the interface automatically smoothly scrolls to the output section for immediate feedback.
- **Secure Embedding:** Utilizes the `youtube-nocookie.com` endpoint and origin-aware parameters to prevent playback errors (like Error 153) and enhance privacy.
- **State Control:** Features a "Clear All" utility to reset the application state and memory instantly.
- **UX Polish:** Includes a floating "Back to Top" button and real-time console logging for debugging and performance monitoring.

## 🛠️ Technical Stack

- **Frontend:** HTML5, CSS3 (Custom animations), JavaScript (ES6+).
- **Framework:** [Bootstrap 5.3.0](https://getbootstrap.com/) for responsive grid layouts and UI components.
- **Logic:** Vanilla JS DOM manipulation and File API for JSON processing.

## 🚀 Execution Guide (Local Hosting)

Because this application communicates with YouTube's secure embedding servers, it should be run from a local server environment rather than by opening the `.html` file directly in your browser. This ensures that the `origin` parameter is correctly passed to the YouTube API.

### Option 1: Using Python 3 (Recommended)

Python comes with a built-in server module that is perfect for testing this application.

1. **Open your terminal or command prompt.**
2. **Navigate to the project folder:**
   ```bash
   cd path/to/your/views-generator
   ```
3. **Start the server:**
   ```bash
   python -m http.server 8000
   ```
4.  **Access the app:** Open your browser and go to:http://localhost:8000

### Option 2: Using VS Code "Live Server"

If you are using Visual Studio Code:

1. Install the Live Server extension by Ritwick Dey.
2. Right-click index.html in your file explorer.
3. Select "Open with Live Server".

## 📋 Usage Instructions

*   **Manual Input:** Paste a YouTube URL and click the **+** button to add more fields.
*   **Bulk Import:** Upload a .json file containing an array of strings.
*   **Generate:** Click the **Generate** button to render all video players.
*   **Clear All:** Resets the form and stops all active video streams.

## 👤 Author

**Jo Thomas** - [GitHub Profile](https://github.com/jo-thomas-1/)

## ⚖️ License

Licensed under the GNU General Public License v3.0.
