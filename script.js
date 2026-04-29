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
 * @author Gemini AI
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
 * Validates URLs, constructs the secure iFrame, and updates the output section.
 * * @param {Event} event The form submission event.
 * @return {void}
 */
function handleGeneration(event) {
    event.preventDefault(); // Stop page reload

    const displayArea = document.getElementById('video-display-area');
    const inputElements = document.querySelectorAll('.url-input');
    
    // Clear previous session output
    displayArea.innerHTML = '';

    // Verify origin for YouTube API handshake (fixes Error 153)
    const currentOrigin = window.location.origin !== 'null' ? window.location.origin : '*';

    inputElements.forEach((input) => {
        const rawUrl = input.value.trim();
        const videoId = getYouTubeId(rawUrl);

        if (videoId) {
            const iframe = document.createElement('iframe');
            
            // Using 'youtube-nocookie.com' for enhanced privacy and bypass of some config errors
            const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
            
            // URL Parameter Construction:
            // 1. autoplay=1: Starts video immediately.
            // 2. mute=1: Required for autoplay permissions.
            // 3. loop=1 & playlist: Enables infinite looping.
            // 4. enablejsapi=1 & origin: Handshake for Error 153 prevention.
            const params = new URLSearchParams({
                autoplay: 1,
                mute: 1,
                loop: 1,
                playlist: videoId,
                enablejsapi: 1,
                origin: currentOrigin
            });

            iframe.src = `${baseUrl}?${params.toString()}`;
            iframe.width = "320";
            iframe.height = "180";
            iframe.title = "YouTube Video Player";
            iframe.frameBorder = "0";
            
            // Standard security and permission attributes
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            
            displayArea.appendChild(iframe);
        }
    });

    // Provide feedback if no valid videos were processed
    if (displayArea.children.length === 0) {
        displayArea.innerHTML = '<div class="alert alert-warning">No valid YouTube IDs detected. Check your URLs.</div>';
    }
}

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