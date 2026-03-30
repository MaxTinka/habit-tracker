// Habit Tracker - Web App
// Track daily habits, streaks, and consistency

// Data structure
let habits = [];

// DOM Elements
const habitsList = document.getElementById('habitsList');
const currentStreakSpan = document.getElementById('currentStreak');
const bestStreakSpan = document.getElementById('bestStreak');
const totalCompletionsSpan = document.getElementById('totalCompletions');
const completionRateSpan = document.getElementById('completionRate');
const currentDateSpan = document.getElementById('currentDate');
const habitNameInput = document.getElementById('habitName');
const habitColorSelect = document.getElementById('habitColor');
const addHabitBtn = document.getElementById('addHabitBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');

// Helper: Get today's date as YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Helper: Get last 7 days
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Helper: Format date for display
function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Helper: Get day abbreviation
function getDayAbbr(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem('habitTracker');
    if (stored) {
        habits = JSON.parse(stored);
    } else {
        // Sample habits for demo
        habits = [
            {
                id: Date.now(),
                name: 'Morning Meditation',
                color: '#667eea',
                completions: {}
            },
            {
                id: Date.now() + 1,
                name: 'Read 30 Minutes',
                color: '#48bb78',
                completions: {}
            },
            {
                id: Date.now() + 2,
                name: 'Drink Water',
                color: '#4299e1',
                completions: {}
            }
        ];
        saveData();
    }
    render();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('habitTracker', JSON.stringify(habits));
    updateStats();
}

// Add new habit
function addHabit() {
    const name = habitNameInput.value.trim();
    if (name === '') {
        alert('Please enter a habit name');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        color: habitColorSelect.value,
        completions: {}
    };
    
    habits.push(newHabit);
    habitNameInput.value = '';
    saveData();
    render();
}

// Delete habit
function deleteHabit(id) {
    if (confirm('Delete this habit? All progress will be lost.')) {
        habits = habits.filter(h => h.id !== id);
        saveData();
        render();
    }
}

// Toggle completion for a habit on a specific day
function toggleCompletion(habitId, date) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        if (habit.completions[date]) {
            delete habit.completions[date];
        } else {
            habit.completions[date] = true;
        }
        saveData();
        render();
    }
}

// Calculate current streak
function calculateCurrentStreak() {
    let streak = 0;
    const today = getTodayDate();
    let checkDate = new Date();
    
    for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        
        // Check if any habit was completed on this day
        let anyCompleted = false;
        for (const habit of habits) {
            if (habit.completions[dateStr]) {
                anyCompleted = true;
                break;
            }
        }
        
        if (anyCompleted) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Calculate best streak
function calculateBestStreak() {
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Go through last 365 days
    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        let anyCompleted = false;
        for (const habit of habits) {
            if (habit.completions[dateStr]) {
                anyCompleted = true;
                break;
            }
        }
        
        if (anyCompleted) {
            currentStreak++;
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
            }
        } else {
            currentStreak = 0;
        }
    }
    
    return maxStreak;
}

// Calculate total completions
function calculateTotalCompletions() {
    let total = 0;
    for (const habit of habits) {
        total += Object.keys(habit.completions).length;
    }
    return total;
}

// Calculate completion rate (percentage of possible completions)
function calculateCompletionRate() {
    let totalCompletions = 0;
    let totalPossible = 0;
    
    for (const habit of habits) {
        totalCompletions += Object.keys(habit.completions).length;
        totalPossible += 30; // Last 30 days max
    }
    
    if (totalPossible === 0) return 0;
    return Math.round((totalCompletions / totalPossible) * 100);
}

// Update statistics
function updateStats() {
    const currentStreak = calculateCurrentStreak();
    const bestStreak = calculateBestStreak();
    const totalCompletions = calculateTotalCompletions();
    const completionRate = calculateCompletionRate();
    
    currentStreakSpan.textContent = currentStreak;
    bestStreakSpan.textContent = bestStreak;
    totalCompletionsSpan.textContent = totalCompletions;
    completionRateSpan.textContent = `${completionRate}%`;
}

// Reset all data
function resetAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL habits and progress. This cannot be undone. Are you sure?')) {
        habits = [];
        saveData();
        render();
    }
}

// Export data to JSON
function exportData() {
    const dataStr = JSON.stringify(habits, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${getTodayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Render the habits list
function render() {
    // Update current date display
    const today = new Date();
    currentDateSpan.textContent = formatDisplayDate(getTodayDate());
    
    const last7Days = getLast7Days();
    
    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <p>No habits yet. Add your first habit above!</p>
            </div>
        `;
        updateStats();
        return;
    }
    
    habitsList.innerHTML = habits.map(habit => {
        return `
            <div class="habit-card" style="border-left-color: ${habit.color}">
                <div class="habit-header">
                    <span class="habit-name">
                        <i class="fas fa-circle" style="color: ${habit.color}; font-size: 12px;"></i>
                        ${escapeHtml(habit.name)}
                    </span>
                    <div class="habit-actions">
                        <button class="delete-habit" onclick="deleteHabit(${habit.id})">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="week-grid">
                    ${last7Days.map(date => {
                        const isCompleted = habit.completions[date];
                        return `
                            <button class="day-btn ${isCompleted ? 'completed' : ''}" 
                                    onclick="toggleCompletion(${habit.id}, '${date}')"
                                    title="${formatDisplayDate(date)}">
                                <span>${getDayAbbr(date)}</span>
                                <span>${isCompleted ? '✓' : '○'}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    updateStats();
}

// Simple escape function to prevent XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event Listeners
addHabitBtn.addEventListener('click', addHabit);
habitNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});
resetBtn.addEventListener('click', resetAllData);
exportBtn.addEventListener('click', exportData);

// Make functions global for onclick handlers
window.deleteHabit = deleteHabit;
window.toggleCompletion = toggleCompletion;

// Initialize
loadData();
