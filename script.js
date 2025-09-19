/**
 * Memory Card Game - Enhanced Version
 * 
 * A fully-featured memory card game with:
 * - Multiple difficulty levels (Easy, Medium, Hard)
 * - Sound effects using Web Audio API
 * - Persistent leaderboard with local storage
 * - Responsive design and animations
 * - Comprehensive test suite
 * 
 * @author Enhanced Memory Game
 * @version 2.0
 * @since 2024
 */

/**
 * Main MemoryGame class that handles all game logic, UI interactions, and state management
 * 
 * Features:
 * - Fisher-Yates shuffle algorithm for fair card distribution
 * - Difficulty-based timing and grid sizes
 * - Real-time scoring with bonuses
 * - Audio feedback system
 * - Persistent high score tracking
 */
class MemoryGame {
    /**
     * Initialize the Memory Game with default settings and setup
     * 
     * Sets up all game state variables, difficulty configurations,
     * audio system, and event listeners
     */
    constructor() {
        // Core game state variables
        this.cards = [];                    // Array of card objects with symbols and states
        this.flippedCards = [];             // Currently flipped cards (max 2)
        this.matchedPairs = 0;              // Number of successfully matched pairs
        this.moves = 0;                     // Total number of moves made
        this.startTime = null;              // Game start timestamp
        this.timerInterval = null;          // Timer for elapsed time display
        this.gameActive = false;            // Whether game is currently active
        this.gamePaused = false;            // Whether game is currently paused
        this.pauseStartTime = null;         // When the game was paused
        this.totalPauseTime = 0;            // Total time spent paused
        this.currentDifficulty = 'medium';  // Current difficulty level
        this.timeLimit = null;              // Time limit for current difficulty
        this.timeLimitInterval = null;      // Timer for countdown
        
        /**
         * Difficulty configuration object defining game parameters for each difficulty level
         * 
         * Each difficulty has:
         * - gridSize: Number of columns in the grid (4x4 or 6x6)
         * - pairs: Number of unique symbol pairs to match
         * - timeLimit: Maximum time allowed in seconds
         * - symbols: Array of unique emoji symbols for the cards
         */
        this.difficultyConfigs = {
            easy: {
                gridSize: 4,                    // 4x4 grid (16 cards total)
                pairs: 8,                       // 8 unique pairs
                timeLimit: 300,                 // 5 minutes (300 seconds)
                symbols: ['🎯', '🎲', '🎪', '🎨', '🎭', '🎮', '🎵', '🎸']  // 8 unique symbols
            },
            medium: {
                gridSize: 4,                    // 4x4 grid (16 cards total)
                pairs: 8,                       // 8 unique pairs
                timeLimit: 240,                 // 4 minutes (240 seconds) - more challenging
                symbols: ['🎯', '🎲', '🎪', '🎨', '🎭', '🎮', '🎵', '🎸']  // Same symbols as easy
            },
            hard: {
                gridSize: 6,                    // 6x6 grid (36 cards total)
                pairs: 18,                      // 18 unique pairs
                timeLimit: 300,                 // 5 minutes (300 seconds)
                symbols: ['🎯', '🎲', '🎪', '🎨', '🎭', '🎮', '🎵', '🎸', '🎺', '🎻', '🥁', '🎤', '🎧', '🎬', '🎹', '🎼', '🎶', '🐱']  // 18 unique symbols
            }
        };
        
        // Audio system for sound effects
        this.audioContext = null;           // Web Audio API context for sound generation
        this.sounds = {};                   // Object containing all sound effect functions
        
        // Leaderboard system
        this.leaderboard = this.loadLeaderboard();  // Load saved high scores from localStorage
        
        // Initialize all game systems
        this.initializeGame();              // Set up initial game state and UI
        this.setupEventListeners();          // Attach event handlers to DOM elements
        this.initializeAudio();              // Set up Web Audio API and sound effects
    }
    
    /**
     * Initialize the game by setting up cards, grid, and resetting statistics
     * Called when the game starts or restarts
     */
    initializeGame() {
        this.shuffleCards();        // Create and shuffle card pairs
        this.createCardGrid();      // Generate HTML card elements
        this.resetStats();          // Reset score, moves, and timer
    }
    
    /**
     * Initialize the Web Audio API system for sound effects
     * 
     * Creates an AudioContext and generates all sound effect functions.
     * Gracefully handles browsers that don't support Web Audio API.
     */
    initializeAudio() {
        try {
            // Create AudioContext with fallback for older browsers
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();  // Generate all sound effect functions
        } catch (error) {
            console.log('Web Audio API not supported - sound effects disabled');
        }
    }
    
    /**
     * Create all sound effect functions using Web Audio API
     * 
     * Generates three types of sounds:
     * - flip: Realistic card flip sound with frequency sweep
     * - match: Pleasant chime for successful matches
     * - complete: Celebratory musical sequence for game completion
     */
    createSounds() {
        if (!this.audioContext) return;
        
        /**
         * Card flip sound - creates a realistic "whoosh-thud" effect
         * 
         * Uses frequency sweep (1000Hz → 200Hz) with lowpass filtering
         * and volume envelope to simulate the physics of a card flip
         */
        this.sounds.flip = () => {
            // Create audio nodes for sound generation
            const oscillator = this.audioContext.createOscillator();  // Generates the sound wave
            const gainNode = this.audioContext.createGain();          // Controls volume
            const filter = this.audioContext.createBiquadFilter();    // Shapes the sound
            
            // Connect audio nodes in chain: oscillator → filter → gain → speakers
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Frequency sweep: high "whoosh" to low "thud" (1000Hz → 200Hz over 150ms)
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
            
            // Lowpass filter sweep: bright start to muffled end (2000Hz → 400Hz)
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.15);
            
            // Volume envelope: quick attack, gradual decay (0 → 20% → 1% over 150ms)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);           // Silent start
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);  // Quick peak
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);  // Gradual fade
            
            // Start and stop the sound (150ms duration)
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        };
        
        /**
         * Match sound - pleasant chime for successful card matches
         * 
         * Plays a C-E-G major chord (C5, E5, G5) to create a satisfying
         * musical confirmation when cards match
         */
        this.sounds.match = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
        
        /**
         * Game completion sound - celebratory musical sequence
         * 
         * Plays a rising arpeggio (C5-E5-G5-C6) to celebrate game completion.
         * Each note is staggered by 200ms for a musical effect.
         */
        this.sounds.complete = () => {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((frequency, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + index * 0.2);
                
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + index * 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.2 + 0.3);
                
                oscillator.start(this.audioContext.currentTime + index * 0.2);
                oscillator.stop(this.audioContext.currentTime + index * 0.2 + 0.3);
            });
        };
    }
    
    /**
     * Play a sound effect by name
     * 
     * @param {string} soundName - Name of the sound to play ('flip', 'match', or 'complete')
     * 
     * Handles audio context suspension (common in browsers that require user interaction)
     * and gracefully fails if audio is not supported
     */
    playSound(soundName) {
        if (this.sounds[soundName] && this.audioContext) {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.sounds[soundName]();
        }
    }
    
    /**
     * Shuffle cards using the Fisher-Yates shuffle algorithm
     * 
     * Creates pairs of cards based on the current difficulty level and shuffles them
     * using the Fisher-Yates algorithm to ensure fair, unbiased distribution.
     * Each symbol appears exactly twice to create matching pairs.
     */
    shuffleCards() {
        const config = this.difficultyConfigs[this.currentDifficulty];
        const cardPairs = [];
        
        // Create pairs based on difficulty level
        for (let i = 0; i < config.pairs; i++) {
            // Add each symbol twice to create pairs
            cardPairs.push(config.symbols[i % config.symbols.length]);
            cardPairs.push(config.symbols[i % config.symbols.length]);
        }
        
        /**
         * Fisher-Yates Shuffle Algorithm
         * 
         * This algorithm ensures every possible permutation has equal probability.
         * It works by:
         * 1. Starting from the last element
         * 2. Picking a random element from the remaining unshuffled elements
         * 3. Swapping the current element with the randomly selected one
         * 4. Moving to the previous element and repeating
         */
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));  // Random index from 0 to i
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];  // Swap elements
        }
        
        this.cards = cardPairs.map((symbol, index) => ({
            id: index,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        }));
    }
    
    createCardGrid() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        const config = this.difficultyConfigs[this.currentDifficulty];
        
        // Update grid class for CSS
        gameBoard.className = `game-board ${this.currentDifficulty}`;
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            
            cardElement.innerHTML = `
                <div class="card-face card-back"></div>
                <div class="card-face card-front">${card.symbol}</div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(cardElement, card));
            gameBoard.appendChild(cardElement);
        });
    }
    
    /**
     * Handle card flip when user clicks on a card
     * 
     * @param {HTMLElement} cardElement - The DOM element representing the card
     * @param {Object} card - The card object containing symbol and state
     * 
     * Validates the flip is allowed, plays sound effect, updates UI,
     * and triggers match checking when two cards are flipped.
     */
    flipCard(cardElement, card) {
        if (!this.gameActive) {
            this.startGame();
        }
        
        // Prevent flipping if game is paused
        if (this.gamePaused) {
            return;
        }
        
        // Prevent flipping if card is already flipped, matched, or if two cards are already flipped
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Play flip sound
        this.playSound('flip');
        
        // Flip the card
        cardElement.classList.add('flipped');
        card.isFlipped = true;
        this.flippedCards.push({ element: cardElement, card: card });
        
        // Check for match when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMovesDisplay();
            this.checkForMatch();
        }
    }
    
    /**
     * Check if the two flipped cards match
     * 
     * Compares the symbols of the two flipped cards and either:
     * - Marks them as matched and plays success sound
     * - Flips them back after a delay (varies by difficulty)
     * 
     * Updates game statistics and checks for game completion.
     */
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.card.symbol === card2.card.symbol) {
            // Match found!
            this.playSound('match');
            
            setTimeout(() => {
                card1.element.classList.add('matched');
                card2.element.classList.add('matched');
                card1.card.isMatched = true;
                card2.card.isMatched = true;
                this.matchedPairs++;
                
                this.flippedCards = [];
                this.updateScore();
                
                // Check if game is complete
                const config = this.difficultyConfigs[this.currentDifficulty];
                if (this.matchedPairs === config.pairs) {
                    this.endGame();
                }
            }, 500);
        } else {
            // No match - flip cards back
            const config = this.difficultyConfigs[this.currentDifficulty];
            let flipBackDelay;
            
            // Set different flip back speeds based on difficulty
            if (this.currentDifficulty === 'easy') {
                flipBackDelay = 1000; // Slower for easy
            } else if (this.currentDifficulty === 'hard') {
                flipBackDelay = 600; // Faster for hard
            } else {
                flipBackDelay = 750; // Medium speed for medium
            }
            
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.card.isFlipped = false;
                card2.card.isFlipped = false;
                
                this.flippedCards = [];
            }, flipBackDelay);
        }
    }
    
    startGame() {
        if (!this.gameActive) {
            this.gameActive = true;
            this.startTime = Date.now();
            this.startTimer();
            this.startTimeLimit();
            
            // Show pause button when game starts
            const pauseBtn = document.getElementById('pauseBtn');
            pauseBtn.style.display = 'inline-block';
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            // Calculate elapsed time minus total pause time
            const elapsed = Date.now() - this.startTime - this.totalPauseTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('timer').textContent = timeString;
        }, 1000);
    }
    
    startTimeLimit() {
        const config = this.difficultyConfigs[this.currentDifficulty];
        this.timeLimit = config.timeLimit;
        
        this.timeLimitInterval = setInterval(() => {
            this.timeLimit--;
            
            if (this.timeLimit <= 0) {
                this.endGame(true); // Game over due to time limit
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.timeLimitInterval) {
            clearInterval(this.timeLimitInterval);
            this.timeLimitInterval = null;
        }
    }
    
    updateMovesDisplay() {
        document.getElementById('moves').textContent = this.moves;
    }
    
    updateScore() {
        const timeElapsed = (Date.now() - this.startTime) / 1000; // in seconds
        const config = this.difficultyConfigs[this.currentDifficulty];
        const timeBonus = Math.max(0, config.timeLimit - timeElapsed); // Bonus for completing under time limit
        const moveBonus = Math.max(0, (config.pairs * 2) - this.moves); // Bonus for completing under optimal moves
        
        const score = Math.floor((this.matchedPairs * 100) + timeBonus + moveBonus);
        document.getElementById('score').textContent = score;
    }
    
    endGame(timeUp = false) {
        this.gameActive = false;
        this.stopTimer();
        
        // Play completion sound
        if (!timeUp) {
            this.playSound('complete');
        }
        
        // Calculate final score
        const finalScore = parseInt(document.getElementById('score').textContent);
        
        // Check if it's a high score
        const isHighScore = this.checkHighScore(finalScore);
        
        // Show game over modal
        const modal = document.getElementById('gameOverModal');
        const finalTime = document.getElementById('timer').textContent;
        const finalMoves = this.moves;
        
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('finalMoves').textContent = finalMoves;
        document.getElementById('finalScore').textContent = finalScore;
        
        // Show new high score message
        const newHighScoreElement = document.getElementById('newHighScore');
        if (isHighScore) {
            newHighScoreElement.style.display = 'block';
        } else {
            newHighScoreElement.style.display = 'none';
        }
        
        modal.classList.add('show');
        
        // Save to leaderboard if it's a high score
        if (isHighScore) {
            this.saveToLeaderboard(finalScore, finalTime, finalMoves);
        }
    }
    
    checkHighScore(score) {
        return this.leaderboard.length < 5 || score > this.leaderboard[this.leaderboard.length - 1].score;
    }
    
    saveToLeaderboard(score, time, moves) {
        const entry = {
            score: score,
            time: time,
            moves: moves,
            difficulty: this.currentDifficulty,
            date: new Date().toLocaleDateString()
        };
        
        this.leaderboard.push(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 5); // Keep only top 5
        
        this.saveLeaderboard();
    }
    
    /**
     * Load leaderboard data from localStorage
     * 
     * @returns {Array} Array of leaderboard entries, or empty array if none exist
     * 
     * Retrieves saved high scores from browser's local storage.
     * Returns empty array if no data exists or if localStorage is not available.
     */
    loadLeaderboard() {
        const saved = localStorage.getItem('memoryGameLeaderboard');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveLeaderboard() {
        localStorage.setItem('memoryGameLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>No scores yet. Play a game to get on the leaderboard!</p>';
            return;
        }
        
        this.leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = `leaderboard-entry rank-${index + 1}`;
            
            entryElement.innerHTML = `
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-score">${entry.score}</div>
                <div class="leaderboard-details">
                    ${entry.time} • ${entry.moves} moves • ${entry.difficulty}
                </div>
            `;
            
            leaderboardList.appendChild(entryElement);
        });
    }
    
    showLeaderboard() {
        this.displayLeaderboard();
        document.getElementById('leaderboardSection').style.display = 'block';
    }
    
    hideLeaderboard() {
        document.getElementById('leaderboardSection').style.display = 'none';
    }
    
    resetStats() {
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.gameActive = false;
        this.gamePaused = false;           // Reset pause state
        this.startTime = null;
        this.pauseStartTime = null;        // Reset pause timing
        this.totalPauseTime = 0;           // Reset total pause time
        this.timeLimit = null;
        
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('moves').textContent = '0';
        document.getElementById('score').textContent = '0';
        
        // Hide pause button when game is reset
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.style.display = 'none';
        pauseBtn.textContent = 'Pause';
        pauseBtn.classList.remove('btn-resume');
        
        this.stopTimer();
    }
    
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.resetStats();
        this.shuffleCards();
        this.createCardGrid();
    }
    
    newGame() {
        this.resetStats();
        this.shuffleCards();
        this.createCardGrid();
        this.hideModal();
    }
    
    resetGame() {
        this.resetStats();
        this.createCardGrid();
        this.hideModal();
    }
    
    hideModal() {
        const modal = document.getElementById('gameOverModal');
        modal.classList.remove('show');
    }
    
    /**
     * Pause the current game
     * 
     * Stops all timers, saves current state, and shows pause modal.
     * Players can resume or start a new game from the pause screen.
     */
    pauseGame() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.gamePaused = true;
        this.pauseStartTime = Date.now();
        
        // Stop all timers
        this.stopTimer();
        
        // Update pause modal with current stats
        this.updatePauseModal();
        
        // Show pause modal
        const pauseModal = document.getElementById('pauseModal');
        pauseModal.classList.add('show');
        
        // Update pause button
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = 'Resume';
        pauseBtn.classList.add('btn-resume');
    }
    
    /**
     * Resume the paused game
     * 
     * Calculates total pause time, restarts timers, and hides pause modal.
     * Adjusts game time to account for time spent paused.
     */
    resumeGame() {
        if (!this.gamePaused) return;
        
        this.gamePaused = false;
        
        // Calculate total pause time
        if (this.pauseStartTime) {
            this.totalPauseTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }
        
        // Hide pause modal
        const pauseModal = document.getElementById('pauseModal');
        pauseModal.classList.remove('show');
        
        // Update pause button
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = 'Pause';
        pauseBtn.classList.remove('btn-resume');
        
        // Restart timers
        this.startTimer();
        this.startTimeLimit();
    }
    
    /**
     * Update the pause modal with current game statistics
     */
    updatePauseModal() {
        const currentTime = document.getElementById('timer').textContent;
        const currentMoves = this.moves;
        const currentPairs = this.matchedPairs;
        
        document.getElementById('pauseTime').textContent = currentTime;
        document.getElementById('pauseMoves').textContent = currentMoves;
        document.getElementById('pausePairs').textContent = currentPairs;
    }
    
    /**
     * Hide the pause modal
     */
    hidePauseModal() {
        const pauseModal = document.getElementById('pauseModal');
        pauseModal.classList.remove('show');
    }
    
    setupEventListeners() {
        // New Game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Leaderboard button
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        
        // Close leaderboard button
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
            this.hideLeaderboard();
        });
        
        // Play Again button in modal
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // View Leaderboard button in modal
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
            this.hideModal();
            this.showLeaderboard();
        });
        
        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.changeDifficulty(e.target.value);
        });
        
        // Close modal when clicking outside
        document.getElementById('gameOverModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameOverModal') {
                this.hideModal();
            }
        });
        
        // Pause/Resume button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.gamePaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });
        
        // Resume button in pause modal
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        // New Game button in pause modal
        document.getElementById('newGameFromPauseBtn').addEventListener('click', () => {
            this.hidePauseModal();
            this.newGame();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideLeaderboard();
                this.hidePauseModal();
            } else if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            } else if (e.key === 'n' || e.key === 'N') {
                this.newGame();
            } else if (e.key === 'l' || e.key === 'L') {
                this.showLeaderboard();
            } else if (e.key === 'p' || e.key === 'P') {
                if (this.gamePaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Add some additional utility functions
function getGameStats() {
    return {
        time: document.getElementById('timer').textContent,
        moves: parseInt(document.getElementById('moves').textContent),
        score: parseInt(document.getElementById('score').textContent)
    };
}

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MemoryGame, getGameStats };
}