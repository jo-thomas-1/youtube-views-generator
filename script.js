/**
 * <iframe 
 *    width="560" 
 *    height="315" 
 *    src="https://www.youtube.com/embed/270uk6uw9XE?si=sdxU9r5_2bGv89vE" 
 *    title="YouTube video player" 
 *    frameborder="0" 
 *    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
 *    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
 * </iframe> 
 */


/**
 * @fileoverview Main logic for the Views Generator application.
 * Handles dynamic DOM manipulation, JSON file parsing, and YouTube iFrame 
 * generation with security origin compliance.
 * * @version 1.2.0
 * @author Jo Thomas - https://github.com/jo-thomas-1/
 *
 * @fileoverview Updated script with Validation, Clear All, and Back to Top logic.
 */

/** @type {number} Global counter to ensure unique IDs for dynamic URL fields. */
let fieldCounter = 1;

/**
 * Adds a new url_input component to the form container.
 * Can be initialized with a value (used for JSON imports).
 * * @param {string} [defaultValue=""] The URL to pre-populate in the input.
 * @return {void}
 */
function addField(defaultValue = "") {
    const container = document.getElementById('url-container');
    const id = fieldCounter++;
    
    // Create the wrapper div for the input and its control buttons
    const newGroup = document.createElement('div');
    newGroup.className = 'input-group mb-3 url-input-group';
    newGroup.id = `group_${id}`;

    // Standard url_input structure with dynamic ID assignment
    newGroup.innerHTML = `
        <input type="url" 
               class="form-control url-input" 
               id="input_field_${id}" 
               placeholder="https://www.youtube.com/watch?v=..."
               value="${defaultValue}"
               required>
        <button class="btn btn-primary" type="button" onclick="addField()" title="Add another field">
            <strong>+</strong>
        </button>
        <button class="btn btn-outline-danger" type="button" onclick="removeField('group_${id}')" title="Remove field">
            &times;
        </button>
    `;

    container.appendChild(newGroup);
}

/**
 * Removes a specific input group from the DOM.
 * @param {string} groupId The unique ID of the element to be removed.
 * @return {void}
 */
function removeField(groupId) {
    const element = document.getElementById(groupId);
    if (element) {
        element.remove();
    }
}

/**
 * Parses the user-provided JSON file to automate URL entry.
 * Validates that the file is a JSON array of strings.
 * @return {void}
 */
function handleFileImport() {
    const fileInput = document.getElementById('importLinks');
    const feedback = document.getElementById('importFeedback');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a valid JSON file first.");
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!Array.isArray(data)) {
                throw new Error("Data format error: Expected an array of URLs.");
            }

            // Optimization: Fill the first default field if it's currently empty
            const firstInput = document.getElementById('input_field_0');
            let startIdx = 0;
            if (firstInput && firstInput.value.trim() === "") {
                firstInput.value = data[0];
                startIdx = 1;
            }

            // Generate subsequent fields for the remaining URLs in the array
            for (let i = startIdx; i < data.length; i++) {
                addField(data[i]);
            }

            feedback.innerHTML = `<span class="text-success small">✔ Successfully imported ${data.length} links.</span>`;
            
        } catch (error) {
            console.error("JSON Import Failed:", error);
            feedback.innerHTML = `<span class="text-danger small">✘ Error: Invalid JSON format.</span>`;
        }
    };

    reader.readAsText(file);
}

/**
 * Extracts the 11-character YouTube Video ID from various URL formats.
 * Supports standard (watch?v=), short (youtu.be/), and Shorts (/shorts/).
 * * @param {string} url The raw URL string from the input field.
 * @return {?string} The video ID if valid, otherwise null.
 */
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Main execution function triggered by form submission.
 * Validates URLs, constructs the secure iFrame, and handles UI transitions.
 * Includes auto-scroll and dynamic placeholder management.
 * * @param {Event} event The form submission event.
 * @return {void}
 */
function handleGeneration(event) {
  event.preventDefault();
  const displayArea = document.getElementById('video-display-area');
  const inputElements = document.querySelectorAll('.url-input');
  
  // Simple validation check before processing
  let hasValidUrl = false;
  displayArea.innerHTML = '';

  const currentOrigin = window.location.origin !== 'null' ? window.location.origin : '*';
  console.group("Views Generator Diagnostic");
  console.log("Current Origin:", currentOrigin);

  if (currentOrigin === 'null' || currentOrigin.startsWith('file://')) {
    console.warn("WARNING: Running from a local file (file://) often triggers Error 153. Try using a local server (like Live Server in VS Code).");
  }

  inputElements.forEach((input, index) => {
    const videoId = getYouTubeId(input.value.trim());
    if (videoId) {
      console.group(`Processing Field ${index}: ID = ${videoId}`);
      hasValidUrl = true;
      const iframe = document.createElement('iframe');
      const params = new URLSearchParams({
          autoplay: 1, mute: 1, loop: 1, playlist: videoId, enablejsapi: 1, origin: currentOrigin
      });
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
      iframe.width = "320"; iframe.height = "180";
      iframe.frameBorder = "0";
      iframe.allow = "autoplay; encrypted-media";
      displayArea.appendChild(iframe);
      console.log(`Generated Iframe URL for Field ${index}:`, iframe.src);
      console.groupEnd();
    }
  });

  if (hasValidUrl) {
      displayArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
      displayArea.innerHTML = `
          <div class="text-center py-5 w-100">
              <h4 class="text-secondary opacity-50">Waiting for input url...</h4>
              <div class="alert alert-warning d-inline-block mt-3">Please enter at least one valid YouTube URL.</div>
          </div>`;
  }
  console.groupEnd();
}

// --- Event Listeners for new UI features ---

document.addEventListener('DOMContentLoaded', () => {
    const backToTop = document.getElementById('backToTop');
    const clearBtn = document.getElementById('clearAllBtn');

    // Show/Hide Back to Top button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });

    // Scroll back to top logic
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Clear all logic
    clearBtn.addEventListener('click', clearAll);
    
    // Existing listeners...
    document.getElementById('importBtn').addEventListener('click', handleFileImport);
    document.getElementById('viewsForm').addEventListener('submit', handleGeneration);
});

/**
 * Event Listener Assignments
 * Ensures all interactive elements are bound to their respective logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Import button trigger
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', handleFileImport);
    }

    // Form submission trigger
    const mainForm = document.getElementById('viewsForm');
    if (mainForm) {
        mainForm.addEventListener('submit', handleGeneration);
    }
});

/**
 * Resets the entire application state.
 */
function clearAll() {
    if (confirm("Are you sure you want to clear all inputs and generated videos?")) {
        const container = document.getElementById('url-container');
        const displayArea = document.getElementById('video-display-area');
        
        // Reset to exactly one empty field
        container.innerHTML = `
            <div class="input-group mb-3 url-input-group" id="group_0">
                <input type="url" class="form-control url-input" id="input_field_0" 
                       placeholder="https://www.youtube.com/watch?v=..." required>
                <button class="btn btn-primary" type="button" onclick="addField()"><strong>+</strong></button>
            </div>`;
        
        // Restore placeholder
        displayArea.innerHTML = '<h4 class="text-secondary opacity-50 py-5">Waiting for input url...</h4>';

        // clear import status
        document.getElementById('importFeedback').innerHTML = 'Upload ".json" file containing array of URLs.';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}