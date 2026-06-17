// State Management
let appState = {
    notes: [],         // Raw parsed notes from server
    filteredNotes: [], // Filtered subset
    searchTerm: '',
    typeFilter: 'all',
    theme: 'dark',     // default theme
    composerText: '',  // active tweet composer text
    maxTweetLength: 280,
    loading: false
};

// SVG Icons (stored as strings to avoid external asset dependencies)
const icons = {
    twitter: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    plus: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`,
    copy: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"/></svg>`,
    check: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`,
    refresh: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>`,
    search: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
    sun: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21.75M21.75 12H19.5M4.5 12H2.25m17.942-7.078l-1.59 1.59M5.002 18.998l-1.59 1.59m16.24-1.59l-1.59-1.59M5.002 5.002l-1.59-1.59M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/></svg>`,
    moon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 12.83A9.53 9.53 0 0112 21.75 9.75 9.75 0 012.25 12c0-4.07 2.54-7.57 6.11-9.05a.75.75 0 01.91.95A7.25 7.25 0 0018.75 13a7.25 7.25 0 003.86-1.08.75.75 0 01.91.91z"/></svg>`,
    empty: `<svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/></svg>`
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupEventListeners();
    fetchNotes();
    updateComposerProgress();
});

// Theme Setup
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        appState.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        appState.theme = 'light';
    }
    
    applyTheme();
}

function applyTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (appState.theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = icons.moon;
        themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
        document.body.classList.remove('light-theme');
        themeToggleBtn.innerHTML = icons.sun;
        themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
}

function toggleTheme() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);
    applyTheme();
}

// Event Listeners
function setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Search Input (immediate filtering with light debounce)
    let searchTimeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            appState.searchTerm = e.target.value.toLowerCase().trim();
            filterNotes();
        }, 150);
    });
    
    // Type Filter Select
    document.getElementById('type-filter').addEventListener('change', (e) => {
        appState.typeFilter = e.target.value;
        filterNotes();
    });
    
    // Refresh Button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        refreshNotes();
    });
    
    // Composer Textarea input
    const composerTextarea = document.getElementById('composer-textarea');
    composerTextarea.addEventListener('input', (e) => {
        appState.composerText = e.target.value;
        updateComposerProgress();
    });
    
    // Composer Copy Button
    document.getElementById('composer-copy').addEventListener('click', () => {
        copyComposerText();
    });
    
    // Composer Tweet Button
    document.getElementById('composer-tweet').addEventListener('click', () => {
        tweetComposerText();
    });

    // Export CSV Button
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
}

// Fetch Notes from local backend API
async function fetchNotes() {
    setLoading(true);
    try {
        const response = await fetch('/api/notes');
        const result = await response.json();
        
        if (result.data) {
            appState.notes = result.data;
            updateLastFetched(result.last_fetched, result.source);
            filterNotes();
        } else {
            showError("Failed to parse feed data");
        }
    } catch (err) {
        showError("Network error fetching release notes");
        console.error(err);
    } finally {
        setLoading(false);
    }
}

// Force reload/refresh notes (ignores cache)
async function refreshNotes() {
    setLoading(true);
    try {
        // Spin the refresh icon
        const refreshIcon = document.querySelector('#refresh-btn svg');
        if (refreshIcon) refreshIcon.style.animation = 'spin 1s infinite linear';
        
        const response = await fetch('/api/refresh', { method: 'POST' });
        const result = await response.json();
        
        if (result.data) {
            appState.notes = result.data;
            updateLastFetched(result.last_fetched, result.source);
            filterNotes();
        } else {
            showError("Failed to refresh feed data");
        }
    } catch (err) {
        showError("Network error refreshing release notes");
        console.error(err);
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    appState.loading = isLoading;
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const refreshBtn = document.getElementById('refresh-btn');
    
    if (isLoading) {
        statusDot.className = 'status-dot loading';
        statusText.textContent = 'Updating...';
        refreshBtn.disabled = true;
        
        // Show loading spinner in feed
        document.getElementById('feed-container').innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Fetching BigQuery Release Notes...</p>
            </div>
        `;
    } else {
        statusDot.className = 'status-dot';
        refreshBtn.disabled = false;
    }
}

function updateLastFetched(timestampStr, source) {
    const statusText = document.getElementById('status-text');
    if (!timestampStr) return;
    
    const date = new Date(timestampStr);
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sourceLabel = source.includes('cache') ? ' (Cached)' : ' (Live)';
    statusText.textContent = `Updated at ${timeFormatted}${sourceLabel}`;
}

function showError(message) {
    document.getElementById('feed-container').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon" style="color: var(--color-issue)">⚠️</div>
            <h2>Something went wrong</h2>
            <p>${message}</p>
            <button class="btn-primary" onclick="fetchNotes()" style="margin-top: 1rem;">Try Again</button>
        </div>
    `;
}

// Filter notes according to active states (Search, Type)
function filterNotes() {
    let filtered = [];
    
    appState.notes.forEach(day => {
        let matchingUpdates = day.updates.filter(update => {
            // Check Type filter
            const typeMatch = appState.typeFilter === 'all' || 
                              update.type.toLowerCase() === appState.typeFilter.toLowerCase();
            
            // Check Search Term (searches type name or update text content)
            const textMatch = !appState.searchTerm || 
                              update.type.toLowerCase().includes(appState.searchTerm) || 
                              update.text.toLowerCase().includes(appState.searchTerm) ||
                              day.date.toLowerCase().includes(appState.searchTerm);
                              
            return typeMatch && textMatch;
        });
        
        if (matchingUpdates.length > 0) {
            filtered.push({
                ...day,
                updates: matchingUpdates
            });
        }
    });
    
    appState.filteredNotes = filtered;
    renderStats();
    renderFeed();
}

// Render Header Analytics Stats
function renderStats() {
    let datesCount = appState.filteredNotes.length;
    let featureCount = 0;
    let issueCount = 0;
    let otherCount = 0;
    
    appState.filteredNotes.forEach(day => {
        day.updates.forEach(up => {
            const t = up.type.toLowerCase();
            if (t.includes('feature')) {
                featureCount++;
            } else if (t.includes('issue') || t.includes('deprecat')) {
                issueCount++;
            } else {
                otherCount++;
            }
        });
    });
    
    document.getElementById('stat-dates').textContent = datesCount;
    document.getElementById('stat-features').textContent = featureCount;
    document.getElementById('stat-issues').textContent = issueCount;
    document.getElementById('stat-others').textContent = otherCount;
}

// Render Grouped Feed
function renderFeed() {
    const container = document.getElementById('feed-container');
    
    if (appState.filteredNotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.empty}</div>
                <h2>No release notes found</h2>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    let htmlContent = '';
    
    appState.filteredNotes.forEach((day, dayIdx) => {
        htmlContent += `
            <div class="feed-day">
                <div class="day-header">
                    <h2 class="day-title">${day.date}</h2>
                    <div class="day-line"></div>
                    <a href="${day.link}" target="_blank" class="day-source-link" title="Open official release notes page">
                        Official Docs ↗
                    </a>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        `;
        
        day.updates.forEach((update, updateIdx) => {
            const badgeClass = getBadgeClass(update.type);
            const dateRef = day.date;
            
            htmlContent += `
                <div class="note-card">
                    <div class="note-header">
                        <span class="badge ${badgeClass}">${update.type}</span>
                        <div class="note-actions">
                            <button class="btn-action copy-card-btn" onclick="copyCardText('${escapeHtml(update.type)}', '${escapeHtml(dateRef)}', '${escapeHtml(update.text)}', this)" title="Copy note text to clipboard">
                                ${icons.copy} Copy
                            </button>
                            <button class="btn-action tweet-btn" onclick="composeSingle('${escapeHtml(update.type)}', '${escapeHtml(dateRef)}', '${escapeHtml(update.text)}', '${escapeHtml(day.link)}')">
                                ${icons.twitter} Tweet
                            </button>
                            <button class="btn-action compose-btn" onclick="appendComposerText('${escapeHtml(update.type)}', '${escapeHtml(dateRef)}', '${escapeHtml(update.text)}')">
                                ${icons.plus} Add
                            </button>
                        </div>
                    </div>
                    <div class="note-body">
                        ${update.content}
                    </div>
                </div>
            `;
        });
        
        htmlContent += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = htmlContent;
}

// Badge coloring utility mapping
function getBadgeClass(type) {
    const t = type.toLowerCase();
    if (t.includes('feature')) return 'feature';
    if (t.includes('issue')) return 'issue';
    if (t.includes('announcement')) return 'announcement';
    if (t.includes('change')) return 'change';
    if (t.includes('deprecat')) return 'deprecation';
    return 'update';
}

// Append a release note details block to composer text area
function appendComposerText(type, date, text) {
    const composerTextarea = document.getElementById('composer-textarea');
    let summary = text;
    
    // Truncate text nicely to fit space in composer if too long
    if (summary.length > 180) {
        summary = summary.substring(0, 177) + '...';
    }
    
    const addition = `📢 BigQuery [${type}] (${date}): ${summary}\n\n`;
    
    // Append or set the value
    if (appState.composerText === '') {
        appState.composerText = addition + `#BigQuery #GoogleCloud`;
    } else {
        // Strip out hashtags, insert new update, then append hashtags at end
        let currentText = appState.composerText;
        const hashtags = "#BigQuery #GoogleCloud";
        
        if (currentText.includes(hashtags)) {
            currentText = currentText.replace(hashtags, "").trim();
        }
        
        appState.composerText = currentText + `\n\n` + addition + hashtags;
    }
    
    composerTextarea.value = appState.composerText;
    updateComposerProgress();
    
    // Visual glow animation to highlight compiler update
    const composerSidebar = document.querySelector('.composer-sidebar');
    composerSidebar.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4)';
    setTimeout(() => {
        composerSidebar.style.boxShadow = '';
    }, 800);
}

// Single-click compose and tweet launcher (sets text and alerts user)
function composeSingle(type, date, text, link) {
    const cleanedLink = link ? link.split('#')[0] : '';
    let summary = text;
    if (summary.length > 160) {
        summary = summary.substring(0, 157) + '...';
    }
    
    appState.composerText = `📢 BigQuery [${type}] (${date}):\n${summary}\n\nRead details: ${cleanedLink}\n#BigQuery #GCP`;
    
    const composerTextarea = document.getElementById('composer-textarea');
    composerTextarea.value = appState.composerText;
    updateComposerProgress();
    
    // Smooth scroll to composer on smaller screens
    if (window.innerWidth <= 1024) {
        document.querySelector('.composer-sidebar').scrollIntoView({ behavior: 'smooth' });
    }
}

// Update Composer Progress details (ring progress, counters)
function updateComposerProgress() {
    const length = appState.composerText.length;
    const remaining = appState.maxTweetLength - length;
    const counterElement = document.getElementById('composer-char-count');
    const ringCircle = document.getElementById('char-ring-circle');
    const tweetBtn = document.getElementById('composer-tweet');
    
    // Update counter text
    counterElement.textContent = remaining;
    
    // Circular character progress bar maths
    const radius = 10;
    const circumference = 2 * Math.PI * radius; // ~62.83
    
    // Percent limit
    const percentage = Math.min(length / appState.maxTweetLength, 1);
    const offset = circumference - (percentage * circumference);
    
    ringCircle.style.strokeDashoffset = offset;
    
    // Adjust colors based on usage limits
    const charCounterGroup = document.getElementById('char-counter-group');
    if (remaining < 0) {
        charCounterGroup.className = 'char-counter error';
        ringCircle.style.stroke = 'var(--color-issue)';
        tweetBtn.disabled = true;
    } else if (remaining <= 30) {
        charCounterGroup.className = 'char-counter warning';
        ringCircle.style.stroke = 'var(--color-deprecation)';
        tweetBtn.disabled = false;
    } else {
        charCounterGroup.className = 'char-counter';
        ringCircle.style.stroke = 'var(--color-primary)';
        tweetBtn.disabled = length === 0;
    }
}

// Copy Composer Text to Clipboard
async function copyComposerText() {
    if (!appState.composerText) return;
    
    const copyBtn = document.getElementById('composer-copy');
    const originalHTML = copyBtn.innerHTML;
    
    try {
        await navigator.clipboard.writeText(appState.composerText);
        
        // Success animation
        copyBtn.innerHTML = `${icons.check} Copied!`;
        copyBtn.style.borderColor = 'var(--color-feature)';
        copyBtn.style.color = 'var(--color-feature)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
        }, 2000);
    } catch (err) {
        console.error("Clipboard copy failed: ", err);
    }
}

// Trigger X Web Intent URL
function tweetComposerText() {
    if (!appState.composerText || appState.composerText.length > appState.maxTweetLength) return;
    
    const encodedText = encodeURIComponent(appState.composerText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(twitterUrl, '_blank');
}

// Utility to Escape HTML special entities
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "\\n");
}

// Copy single release note card text to clipboard
async function copyCardText(type, date, text, btnElement) {
    const fullText = `📢 BigQuery [${type}] (${date}):\n${text}`;
    const originalHTML = btnElement.innerHTML;
    
    try {
        await navigator.clipboard.writeText(fullText);
        btnElement.innerHTML = `${icons.check} Copied!`;
        btnElement.style.borderColor = 'var(--color-feature)';
        btnElement.style.color = 'var(--color-feature)';
        
        setTimeout(() => {
            btnElement.innerHTML = originalHTML;
            btnElement.style.borderColor = '';
            btnElement.style.color = '';
        }, 2000);
    } catch (err) {
        console.error("Card text copy failed: ", err);
    }
}

// Export the filtered release notes as CSV
function exportToCSV() {
    if (appState.filteredNotes.length === 0) return;
    
    let csvRows = [];
    // Header
    csvRows.push(["Date", "Type", "Update Text", "Link"]);
    
    appState.filteredNotes.forEach(day => {
        day.updates.forEach(update => {
            csvRows.push([day.date, update.type, update.text, day.link]);
        });
    });
    
    // Format rows as CSV content
    const csvContent = csvRows.map(row => 
        row.map(value => `"${(value || '').replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bigquery_release_notes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
