// FocusFlight Application
class FocusFlight {
    constructor() {
        this.data = {
            totalMiles: 0,
            flightsCompleted: 0,
            achievements: [],
            unlockedCities: ['newyork', 'boston', 'sanfrancisco', 'losangeles', 'chicago', 'detroit'],
            unlockedSeats: ['economy', 'business']
        };
        
        this.session = {
            active: false,
            paused: false,
            duration: 25,
            elapsed: 0,
            seatClass: 'economy',
            route: 'newyork-boston',
            timer: null,
            startTime: null
        };

        this.achievements = [
            { id: 'first-flight', name: 'First Flight', desc: 'Complete your first focus session', icon: '🎯', requirement: 1 },
            { id: 'frequent-flyer', name: 'Frequent Flyer', desc: 'Complete 10 flights', icon: '✈️', requirement: 10 },
            { id: 'globe-trotter', name: 'Globe Trotter', desc: 'Complete 25 flights', icon: '🌍', requirement: 25 },
            { id: 'mile-high-club', name: 'Mile High Club', desc: 'Earn 100 miles', icon: '💯', requirement: 100 },
            { id: 'sky-master', name: 'Sky Master', desc: 'Earn 500 miles', icon: '⭐', requirement: 500 },
            { id: 'aviation-legend', name: 'Aviation Legend', desc: 'Earn 1000 miles', icon: '👑', requirement: 1000 }
        ];

        this.cities = [
            { id: 'newyork', name: 'New York', icon: '🗽', requirement: 0 },
            { id: 'boston', name: 'Boston', icon: '🏛️', requirement: 0 },
            { id: 'sanfrancisco', name: 'San Francisco', icon: '🌉', requirement: 0 },
            { id: 'losangeles', name: 'Los Angeles', icon: '🌴', requirement: 0 },
            { id: 'chicago', name: 'Chicago', icon: '🏙️', requirement: 0 },
            { id: 'detroit', name: 'Detroit', icon: '🚗', requirement: 0 },
            { id: 'miami', name: 'Miami', icon: '🏖️', requirement: 250 },
            { id: 'orlando', name: 'Orlando', icon: '🎢', requirement: 250 },
            { id: 'seattle', name: 'Seattle', icon: '☕', requirement: 500 },
            { id: 'portland', name: 'Portland', icon: '🌲', requirement: 500 },
            { id: 'london', name: 'London', icon: '🇬🇧', requirement: 1000 },
            { id: 'paris', name: 'Paris', icon: '🇫🇷', requirement: 1000 }
        ];

        this.routes = {
            'newyork-boston': { from: 'New York', to: 'Boston', fromCity: 'newyork', toCity: 'boston' },
            'sanfrancisco-losangeles': { from: 'San Francisco', to: 'Los Angeles', fromCity: 'sanfrancisco', toCity: 'losangeles' },
            'chicago-detroit': { from: 'Chicago', to: 'Detroit', fromCity: 'chicago', toCity: 'detroit' },
            'miami-orlando': { from: 'Miami', to: 'Orlando', fromCity: 'miami', toCity: 'orlando' },
            'seattle-portland': { from: 'Seattle', to: 'Portland', fromCity: 'seattle', toCity: 'portland' },
            'newyork-london': { from: 'New York', to: 'London', fromCity: 'newyork', toCity: 'london' }
        };

        this.init();
    }

    init() {
        this.loadData();
        this.updateUI();
        this.renderAchievements();
        this.renderCities();
        this.attachEventListeners();
        this.checkUnlocks();
    }

    loadData() {
        const saved = localStorage.getItem('focusFlight');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.data = { ...this.data, ...parsed };
        }
    }

    saveData() {
        localStorage.setItem('focusFlight', JSON.stringify(this.data));
    }

    updateUI() {
        document.getElementById('totalMiles').textContent = this.data.totalMiles;
        document.getElementById('flightsCompleted').textContent = this.data.flightsCompleted;
    }

    attachEventListeners() {
        document.getElementById('startFlight').addEventListener('click', () => this.startFlight());
        document.getElementById('pauseFlight').addEventListener('click', () => this.togglePause());
        document.getElementById('cancelFlight').addEventListener('click', () => this.cancelFlight());
        
        // Update miles calculation when duration or seat class changes
        document.getElementById('duration').addEventListener('change', () => this.updateMilesPreview());
        document.querySelectorAll('input[name="seatClass"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateMilesPreview());
        });
    }

    updateMilesPreview() {
        // This could show estimated miles in the UI
    }

    getSeatMultiplier(seatClass) {
        const multipliers = {
            'economy': 1,
            'business': 1.5,
            'first': 2
        };
        return multipliers[seatClass] || 1;
    }

    startFlight() {
        const duration = parseInt(document.getElementById('duration').value);
        const seatClass = document.querySelector('input[name="seatClass"]:checked').value;
        const route = document.getElementById('route').value;

        this.session = {
            active: true,
            paused: false,
            duration: duration,
            elapsed: 0,
            seatClass: seatClass,
            route: route,
            timer: null,
            startTime: Date.now()
        };

        // Update UI
        document.getElementById('bookingSection').classList.add('hidden');
        document.getElementById('flightSection').classList.remove('hidden');

        const routeInfo = this.routes[route];
        document.getElementById('flightRoute').textContent = `${routeInfo.from} → ${routeInfo.to}`;
        document.getElementById('currentClass').textContent = seatClass.charAt(0).toUpperCase() + seatClass.slice(1);
        
        const baseMiles = duration;
        const multiplier = this.getSeatMultiplier(seatClass);
        const totalMiles = Math.round(baseMiles * multiplier);
        document.getElementById('milesToEarn').textContent = totalMiles;

        // Update map labels
        document.querySelector('#flightMap text:nth-of-type(1)').textContent = routeInfo.from;
        document.querySelector('#flightMap text:nth-of-type(2)').textContent = routeInfo.to;

        // Start the timer
        this.runTimer();
    }

    runTimer() {
        const updateInterval = 100; // Update every 100ms for smooth animation
        
        this.session.timer = setInterval(() => {
            if (!this.session.paused) {
                this.session.elapsed += updateInterval / 1000;
                
                const remainingSeconds = Math.max(0, this.session.duration * 60 - this.session.elapsed);
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = Math.floor(remainingSeconds % 60);
                
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Update progress bar
                const progress = (this.session.elapsed / (this.session.duration * 60)) * 100;
                document.getElementById('progressBar').style.width = `${Math.min(progress, 100)}%`;
                
                // Update plane position
                const planeProgress = Math.min(progress / 100, 1);
                const startX = 100;
                const endX = 700;
                const planeX = startX + (endX - startX) * planeProgress;
                document.getElementById('plane').setAttribute('x', planeX);
                
                // Check if completed
                if (remainingSeconds <= 0) {
                    this.completeFlight();
                }
            }
        }, updateInterval);
    }

    togglePause() {
        this.session.paused = !this.session.paused;
        const btn = document.getElementById('pauseFlight');
        btn.textContent = this.session.paused ? '▶️ Resume' : '⏸️ Pause';
    }

    cancelFlight() {
        if (confirm('Are you sure you want to cancel this flight? You will not earn any miles.')) {
            this.endFlight(false);
        }
    }

    completeFlight() {
        this.endFlight(true);
    }

    endFlight(completed) {
        clearInterval(this.session.timer);
        
        if (completed) {
            // Award miles
            const baseMiles = this.session.duration;
            const multiplier = this.getSeatMultiplier(this.session.seatClass);
            const earnedMiles = Math.round(baseMiles * multiplier);
            
            this.data.totalMiles += earnedMiles;
            this.data.flightsCompleted += 1;
            
            this.saveData();
            this.updateUI();
            this.checkAchievements();
            this.checkUnlocks();
            this.renderAchievements();
            this.renderCities();
            
            // Show completion message
            alert(`🎉 Flight Completed!\n\nYou earned ${earnedMiles} miles!\nTotal Miles: ${this.data.totalMiles}`);
        }
        
        // Reset UI
        document.getElementById('bookingSection').classList.remove('hidden');
        document.getElementById('flightSection').classList.add('hidden');
        
        // Reset plane position
        document.getElementById('plane').setAttribute('x', '100');
        document.getElementById('progressBar').style.width = '0%';
        
        this.session.active = false;
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.data.achievements.includes(achievement.id)) {
                let qualified = false;
                
                if (achievement.id === 'first-flight' || achievement.id === 'frequent-flyer' || 
                    achievement.id === 'globe-trotter') {
                    qualified = this.data.flightsCompleted >= achievement.requirement;
                } else if (achievement.id === 'mile-high-club' || achievement.id === 'sky-master' || 
                           achievement.id === 'aviation-legend') {
                    qualified = this.data.totalMiles >= achievement.requirement;
                }
                
                if (qualified) {
                    this.data.achievements.push(achievement.id);
                    this.showAchievementNotification(achievement);
                }
            }
        });
    }

    showAchievementNotification(achievement) {
        alert(`🏆 Achievement Unlocked!\n\n${achievement.icon} ${achievement.name}\n${achievement.desc}`);
    }

    checkUnlocks() {
        // Check seat class unlocks
        if (this.data.totalMiles >= 500 && !this.data.unlockedSeats.includes('first')) {
            this.data.unlockedSeats.push('first');
            const firstClassRadio = document.getElementById('first');
            firstClassRadio.disabled = false;
            firstClassRadio.parentElement.classList.remove('locked');
        }
        
        // Check city unlocks
        this.cities.forEach(city => {
            if (this.data.totalMiles >= city.requirement && !this.data.unlockedCities.includes(city.id)) {
                this.data.unlockedCities.push(city.id);
            }
        });
        
        // Update route options
        const routeSelect = document.getElementById('route');
        Array.from(routeSelect.options).forEach(option => {
            const routeId = option.value;
            if (routeId && this.routes[routeId]) {
                const route = this.routes[routeId];
                const fromUnlocked = this.data.unlockedCities.includes(route.fromCity);
                const toUnlocked = this.data.unlockedCities.includes(route.toCity);
                
                if (fromUnlocked && toUnlocked) {
                    option.disabled = false;
                    option.textContent = `${route.from} → ${route.to}`;
                }
            }
        });
    }

    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        grid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const unlocked = this.data.achievements.includes(achievement.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
            
            let requirementText = '';
            if (!unlocked) {
                if (achievement.id.includes('flight')) {
                    requirementText = `<div class="achievement-desc">${this.data.flightsCompleted}/${achievement.requirement} flights</div>`;
                } else {
                    requirementText = `<div class="achievement-desc">${this.data.totalMiles}/${achievement.requirement} miles</div>`;
                }
            }
            
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                ${requirementText}
            `;
            
            grid.appendChild(card);
        });
    }

    renderCities() {
        const grid = document.getElementById('citiesGrid');
        grid.innerHTML = '';
        
        this.cities.forEach(city => {
            const unlocked = this.data.unlockedCities.includes(city.id);
            const card = document.createElement('div');
            card.className = `city-card ${unlocked ? 'unlocked' : 'locked'}`;
            
            card.innerHTML = `
                <div class="city-icon">${city.icon}</div>
                <div class="city-name">${city.name}</div>
                ${!unlocked ? `<div class="city-requirement">🔒 ${city.requirement} miles</div>` : ''}
            `;
            
            grid.appendChild(card);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FocusFlight();
});
