// js/calendar.js - Complete School Calendar System

// ============ EVENT DATA STORAGE ============
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedEventId = null;
let currentFilter = 'all';

// Event types with colors
const eventTypes = {
    academic: { name: '📚 Academic', color: '#4A90E2', bg: '#E8F0FE' },
    exam: { name: '📝 Exam', color: '#E74C3C', bg: '#FEE8E6' },
    holiday: { name: '🎉 Holiday', color: '#2ECC71', bg: '#E8F8F0' },
    meeting: { name: '👥 Meeting', color: '#F39C12', bg: '#FEF5E8' },
    sport: { name: '⚽ Sports', color: '#9B59B6', bg: '#F3E8FF' },
    other: { name: '📌 Other', color: '#95A5A6', bg: '#F5F5F5' }
};

// Load events from localStorage
function loadEvents() {
    const events = localStorage.getItem('school_events');
    return events ? JSON.parse(events) : [];
}

// Save events to localStorage
function saveEvents(events) {
    localStorage.setItem('school_events', JSON.stringify(events));
}

// Add new event
function addEvent(eventData) {
    const events = loadEvents();
    const newEvent = {
        id: Date.now(),
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    events.push(newEvent);
    saveEvents(events);
    renderCalendar(currentYear, currentMonth, currentFilter);
    showToast('Event added successfully!', 'success');
    return newEvent;
}

// Update existing event
function updateEvent(eventId, updatedData) {
    const events = loadEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
        events[index] = { ...events[index], ...updatedData, updatedAt: new Date().toISOString() };
        saveEvents(events);
        renderCalendar(currentYear, currentMonth, currentFilter);
        showToast('Event updated successfully!', 'success');
    }
}

// Delete event
function deleteEvent(eventId) {
    const events = loadEvents();
    const filtered = events.filter(e => e.id !== eventId);
    saveEvents(filtered);
    renderCalendar(currentYear, currentMonth, currentFilter);
    closeEventModal();
    showToast('Event deleted successfully!', 'success');
}

// Get events for a specific date
function getEventsForDate(year, month, day) {
    const events = loadEvents();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
}

// ============ CALENDAR RENDERING ============
function renderCalendar(year, month, filterType = 'all') {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    let events = loadEvents();
    if (filterType !== 'all') {
        events = events.filter(e => e.type === filterType);
    }

    let html = `
        <div class="calendar-wrapper">
            <div class="calendar-controls">
                <button class="calendar-nav" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <h2 class="calendar-title">${monthNames[month]} ${year}</h2>
                <button class="calendar-nav" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                <button class="calendar-today" onclick="goToToday()">Today</button>
            </div>
            
            <div class="calendar-filters">
                <button class="filter-btn ${filterType === 'all' ? 'active' : ''}" data-filter="all" onclick="filterEvents('all')">All</button>
                ${Object.entries(eventTypes).map(([key, val]) => `
                    <button class="filter-btn ${filterType === key ? 'active' : ''}" data-filter="${key}" onclick="filterEvents('${key}')" style="border-left-color: ${val.color}">
                        ${val.name}
                    </button>
                `).join('')}
            </div>
            
            <div class="calendar-weekdays">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div class="calendar-days">
    `;

    for (let i = 0; i < startWeekday; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = isTodayDate(year, month, day);

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" onclick="openDayModal(${year}, ${month}, ${day})">
                <span class="day-number">${day}</span>
                <div class="day-events">
                    ${dayEvents.slice(0, 2).map(event => `
                        <div class="event-badge" style="background: ${eventTypes[event.type]?.bg || '#F5F5F5'}; border-left-color: ${eventTypes[event.type]?.color || '#95A5A6'}" 
                             onclick="event.stopPropagation(); openEventDetails(${event.id})">
                            <span style="color: ${eventTypes[event.type]?.color || '#95A5A6'}">●</span>
                            ${event.title.length > 15 ? event.title.substring(0, 12) + '...' : event.title}
                        </div>
                    `).join('')}
                    ${dayEvents.length > 2 ? `<div class="more-events" onclick="event.stopPropagation(); openDayModal(${year}, ${month}, ${day})">+${dayEvents.length - 2} more</div>` : ''}
                </div>
            </div>
        `;
    }

    html += `</div></div>`;
    container.innerHTML = html;
}

function isTodayDate(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

// ============ MODAL DIALOGS ============
function openDayModal(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const events = getEventsForDate(year, month, day);
    const dateObj = new Date(year, month, day);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

    const modalHtml = `
        <div class="modal-overlay" id="dayModal">
            <div class="modal-container day-modal">
                <div class="modal-header">
                    <h3>${weekday}, ${monthName} ${day}, ${year}</h3>
                    <button class="modal-close" onclick="closeDayModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="day-events-list">
                        ${events.length === 0 ? '<p class="no-events">No events scheduled for this day</p>' : ''}
                        ${events.map(event => `
                            <div class="event-card" style="border-left-color: ${eventTypes[event.type]?.color || '#95A5A6'}" onclick="openEventDetails(${event.id})">
                                <div class="event-time"><i class="fas fa-clock"></i> ${event.time || 'All day'}</div>
                                <div class="event-title">${event.title}</div>
                                ${event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
                                <div class="event-type"><span style="background: ${eventTypes[event.type]?.bg || '#F5F5F5'}; color: ${eventTypes[event.type]?.color || '#95A5A6'}">${eventTypes[event.type]?.name || 'Other'}</span></div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-primary add-event-btn" onclick="closeDayModal(); openAddEventModal('${dateStr}')">
                        <i class="fas fa-plus"></i> Add Event
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openAddEventModal(defaultDate = null) {
    const today = new Date().toISOString().split('T')[0];
    const modalHtml = `
        <div class="modal-overlay" id="addEventModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> Add New Event</h3>
                    <button class="modal-close" onclick="closeAddEventModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="eventForm" onsubmit="submitEvent(event)">
                        <div class="form-group">
                            <label>Event Title *</label>
                            <input type="text" id="eventTitle" placeholder="e.g., Parent-Teacher Meeting" required>
                        </div>
                        <div class="form-group">
                            <label>Event Type</label>
                            <select id="eventType">
                                ${Object.entries(eventTypes).map(([key, val]) => `
                                    <option value="${key}">${val.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="eventDate" value="${defaultDate || today}" required>
                            </div>
                            <div class="form-group">
                                <label>Time (optional)</label>
                                <input type="time" id="eventTime">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" id="eventLocation" placeholder="e.g., School Hall, Room 201">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="eventDesc" rows="3" placeholder="Event details..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-outline" onclick="closeAddEventModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Event</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openEventDetails(eventId) {
    const events = loadEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    selectedEventId = eventId;
    const eventType = eventTypes[event.type] || eventTypes.other;

    const modalHtml = `
        <div class="modal-overlay" id="eventDetailModal">
            <div class="modal-container event-detail">
                <div class="modal-header" style="background: ${eventType.bg}">
                    <h3 style="color: ${eventType.color}">${event.title}</h3>
                    <button class="modal-close" onclick="closeEventModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="event-detail-info">
                        <div class="detail-row"><i class="fas fa-calendar-alt"></i><span>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        ${event.time ? `<div class="detail-row"><i class="fas fa-clock"></i><span>${event.time}</span></div>` : ''}
                        ${event.location ? `<div class="detail-row"><i class="fas fa-map-marker-alt"></i><span>${event.location}</span></div>` : ''}
                        <div class="detail-row"><i class="fas fa-tag"></i><span style="background: ${eventType.bg}; color: ${eventType.color}; padding: 4px 12px; border-radius: 20px;">${eventType.name}</span></div>
                        ${event.description ? `<div class="detail-row description"><i class="fas fa-align-left"></i><p>${event.description}</p></div>` : ''}
                    </div>
                    <div class="modal-actions">
                        <button class="btn-outline" onclick="copyToGoogleCalendar(${event.id})"><i class="fab fa-google"></i> Google Calendar</button>
                        <button class="btn-outline" onclick="editEvent(${event.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-danger" onclick="deleteEvent(${event.id})"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function editEvent(eventId) {
    const events = loadEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    closeEventModal();

    const modalHtml = `
        <div class="modal-overlay" id="editEventModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Event</h3>
                    <button class="modal-close" onclick="closeEditEventModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editEventForm" onsubmit="updateEventSubmit(event, ${eventId})">
                        <div class="form-group"><label>Event Title *</label><input type="text" id="editEventTitle" value="${event.title.replace(/"/g, '&quot;')}" required></div>
                        <div class="form-group"><label>Event Type</label><select id="editEventType">${Object.entries(eventTypes).map(([key, val]) => `<option value="${key}" ${event.type === key ? 'selected' : ''}>${val.name}</option>`).join('')}</select></div>
                        <div class="form-row"><div class="form-group"><label>Date *</label><input type="date" id="editEventDate" value="${event.date}" required></div><div class="form-group"><label>Time</label><input type="time" id="editEventTime" value="${event.time || ''}"></div></div>
                        <div class="form-group"><label>Location</label><input type="text" id="editEventLocation" value="${event.location || ''}"></div>
                        <div class="form-group"><label>Description</label><textarea id="editEventDesc" rows="3">${event.description || ''}</textarea></div>
                        <div class="form-actions"><button type="button" class="btn-outline" onclick="closeEditEventModal()">Cancel</button><button type="submit" class="btn-primary">Update Event</button></div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitEvent(e) {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value || null,
        location: document.getElementById('eventLocation').value || null,
        description: document.getElementById('eventDesc').value || null
    };
    if (!eventData.title || !eventData.date) { showToast('Please fill all required fields', 'error'); return; }
    addEvent(eventData);
    closeAddEventModal();
    if (typeof displayUpcomingEvents !== 'undefined') displayUpcomingEvents();
}

function updateEventSubmit(e, eventId) {
    e.preventDefault();
    const updatedData = {
        title: document.getElementById('editEventTitle').value,
        type: document.getElementById('editEventType').value,
        date: document.getElementById('editEventDate').value,
        time: document.getElementById('editEventTime').value || null,
        location: document.getElementById('editEventLocation').value || null,
        description: document.getElementById('editEventDesc').value || null
    };
    updateEvent(eventId, updatedData);
    closeEditEventModal();
    if (typeof displayUpcomingEvents !== 'undefined') displayUpcomingEvents();
}

function copyToGoogleCalendar(eventId) {
    const events = loadEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const startDate = new Date(event.date);
    const endDate = new Date(event.date);
    if (event.time) { const [hours, minutes] = event.time.split(':'); startDate.setHours(parseInt(hours), parseInt(minutes)); endDate.setHours(parseInt(hours) + 1, parseInt(minutes)); }
    else { endDate.setDate(endDate.getDate() + 1); }
    const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\./g, '');
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}&sf=true&output=xml`;
    window.open(googleUrl, '_blank');
    showToast('Opening Google Calendar...', 'info');
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth, currentFilter);
}

function goToToday() {
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    renderCalendar(currentYear, currentMonth, currentFilter);
}

function filterEvents(type) {
    currentFilter = type;
    renderCalendar(currentYear, currentMonth, type);
}

function closeDayModal() { const modal = document.getElementById('dayModal'); if (modal) modal.remove(); }
function closeAddEventModal() { const modal = document.getElementById('addEventModal'); if (modal) modal.remove(); }
function closeEditEventModal() { const modal = document.getElementById('editEventModal'); if (modal) modal.remove(); }
function closeEventModal() { const modal = document.getElementById('eventDetailModal'); if (modal) modal.remove(); }

function showToast(message, type) {
    let toast = document.getElementById('calendarToast');
    if (!toast) { toast = document.createElement('div'); toast.id = 'calendarToast'; document.body.appendChild(toast); }
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    toast.style.display = 'flex';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Initialize with sample events if none exist
document.addEventListener('DOMContentLoaded', () => {
    const events = loadEvents();
    if (events.length === 0) {
        const today = new Date();
        const sampleEvents = [
            { title: 'Parent-Teacher Meeting', type: 'meeting', date: getDateString(0, 5), time: '14:00', location: 'School Hall', description: 'Annual parent-teacher conference' },
            { title: 'Mathematics Exam', type: 'exam', date: getDateString(0, 8), time: '09:00', location: 'Room 201', description: 'Final term exam - Grade 10' },
            { title: 'Sports Day', type: 'sport', date: getDateString(0, 12), time: null, location: 'Sports Field', description: 'Annual sports competition' },
            { title: 'School Holiday', type: 'holiday', date: getDateString(0, 15), time: null, location: null, description: 'Public holiday - no classes' },
            { title: 'Staff Meeting', type: 'meeting', date: getDateString(0, 3), time: '15:30', location: 'Staff Room', description: 'Monthly staff briefing' },
            { title: 'Science Fair', type: 'academic', date: getDateString(0, 10), time: '10:00', location: 'Science Lab', description: 'Student science projects exhibition' }
        ];
        sampleEvents.forEach(event => addEvent(event));
    }
    renderCalendar(currentYear, currentMonth, 'all');
});

function getDateString(monthOffset, dayOffset) {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(dayOffset);
    return date.toISOString().split('T')[0];
}