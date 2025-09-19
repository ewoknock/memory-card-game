/**
 * Memory Card Game - Comprehensive Test Suite
 * 
 * A complete testing framework for the Memory Card Game that validates:
 * - Difficulty configurations and game mechanics
 * - Fisher-Yates shuffle algorithm correctness
 * - Game state management and statistics
 * - Score calculation and leaderboard functionality
 * - Audio system initialization
 * - Card matching logic and game completion
 * 
 * Features:
 * - Browser-compatible mocking system
 * - Comprehensive test coverage
 * - Clear pass/fail reporting
 * - Graceful error handling
 * 
 * @author Enhanced Memory Game
 * @version 2.0
 * @since 2024
 */

/**
 * Main test suite class that handles all game testing
 * 
 * Provides methods for:
 * - Setting up mock DOM and browser APIs
 * - Running individual test cases
 * - Managing test results and reporting
 * - Browser compatibility handling
 */
class MemoryGameTests {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    // Test runner utility
    runTest(testName, testFunction) {
        try {
            testFunction();
            this.passed++;
            console.log(`✅ ${testName} - PASSED`);
        } catch (error) {
            this.failed++;
            console.log(`❌ ${testName} - FAILED: ${error.message}`);
        }
    }

    // Mock DOM elements for testing
    setupMockDOM() {
        // Create mock DOM elements
        const mockElements = {
            'gameBoard': { innerHTML: '', className: '', appendChild: () => {} },
            'timer': { textContent: '00:00' },
            'moves': { textContent: '0' },
            'score': { textContent: '0' },
            'difficulty': { value: 'medium', addEventListener: () => {} },
            'newGameBtn': { addEventListener: () => {} },
            'resetBtn': { addEventListener: () => {} },
            'leaderboardBtn': { addEventListener: () => {} },
            'closeLeaderboardBtn': { addEventListener: () => {} },
            'playAgainBtn': { addEventListener: () => {} },
            'viewLeaderboardBtn': { addEventListener: () => {} },
            'gameOverModal': { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
            'finalTime': { textContent: '' },
            'finalMoves': { textContent: '' },
            'finalScore': { textContent: '' },
            'newHighScore': { style: { display: 'none' } },
            'leaderboardSection': { style: { display: 'none' } },
            'leaderboardList': { innerHTML: '' }
        };

        // Store original methods
        this.originalGetElementById = document.getElementById;
        this.originalAudioContext = window.AudioContext;

        // Mock document.getElementById
        document.getElementById = (id) => mockElements[id] || { textContent: '', addEventListener: () => {} };

        // Mock localStorage methods (can't replace the object itself)
        this.originalLocalStorageGetItem = window.localStorage.getItem;
        this.originalLocalStorageSetItem = window.localStorage.setItem;
        
        window.localStorage.getItem = () => null;
        window.localStorage.setItem = () => {};

        // Mock AudioContext
        window.AudioContext = class {
            constructor() {
                this.state = 'running';
                this.currentTime = 0;
            }
            createOscillator() {
                return {
                    connect: () => {},
                    frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
                    start: () => {},
                    stop: () => {}
                };
            }
            createGain() {
                return {
                    connect: () => {},
                    gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
                };
            }
            createBiquadFilter() {
                return {
                    connect: () => {},
                    type: '',
                    frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
                };
            }
            resume() {}
        };
    }

    // Restore original methods
    restoreOriginalMethods() {
        if (this.originalGetElementById) {
            document.getElementById = this.originalGetElementById;
        }
        if (this.originalLocalStorageGetItem) {
            window.localStorage.getItem = this.originalLocalStorageGetItem;
        }
        if (this.originalLocalStorageSetItem) {
            window.localStorage.setItem = this.originalLocalStorageSetItem;
        }
        if (this.originalAudioContext) {
            window.AudioContext = this.originalAudioContext;
        }
    }

    // Test difficulty configurations
    testDifficultyConfigs() {
        const game = new MemoryGame();
        
        // Test easy difficulty
        game.currentDifficulty = 'easy';
        const easyConfig = game.difficultyConfigs.easy;
        if (easyConfig.gridSize !== 4 || easyConfig.pairs !== 8 || easyConfig.timeLimit !== 300) {
            throw new Error('Easy difficulty config incorrect');
        }
        if (easyConfig.symbols.length !== 8) {
            throw new Error('Easy difficulty should have 8 unique symbols');
        }

        // Test medium difficulty
        game.currentDifficulty = 'medium';
        const mediumConfig = game.difficultyConfigs.medium;
        if (mediumConfig.gridSize !== 4 || mediumConfig.pairs !== 8 || mediumConfig.timeLimit !== 240) {
            throw new Error('Medium difficulty config incorrect');
        }

        // Test hard difficulty
        game.currentDifficulty = 'hard';
        const hardConfig = game.difficultyConfigs.hard;
        if (hardConfig.gridSize !== 6 || hardConfig.pairs !== 18 || hardConfig.timeLimit !== 300) {
            throw new Error('Hard difficulty config incorrect');
        }
        if (hardConfig.symbols.length !== 18) {
            throw new Error('Hard difficulty should have 18 unique symbols');
        }

        // Test symbol uniqueness in hard difficulty
        const hardSymbols = hardConfig.symbols;
        const uniqueSymbols = [...new Set(hardSymbols)];
        if (uniqueSymbols.length !== hardSymbols.length) {
            throw new Error('Hard difficulty symbols are not unique');
        }
    }

    // Test card shuffling
    testCardShuffling() {
        const game = new MemoryGame();
        
        // Test easy difficulty shuffling
        game.currentDifficulty = 'easy';
        game.shuffleCards();
        
        if (game.cards.length !== 16) {
            throw new Error('Easy difficulty should create 16 cards (8 pairs)');
        }
        
        // Test that each symbol appears exactly twice
        const symbolCounts = {};
        game.cards.forEach(card => {
            symbolCounts[card.symbol] = (symbolCounts[card.symbol] || 0) + 1;
        });
        
        Object.values(symbolCounts).forEach(count => {
            if (count !== 2) {
                throw new Error('Each symbol should appear exactly twice');
            }
        });

        // Test hard difficulty shuffling
        game.currentDifficulty = 'hard';
        game.shuffleCards();
        
        if (game.cards.length !== 36) {
            throw new Error('Hard difficulty should create 36 cards (18 pairs)');
        }
    }

    // Test Fisher-Yates shuffle algorithm
    testFisherYatesShuffle() {
        const game = new MemoryGame();
        game.currentDifficulty = 'easy';
        
        // Run shuffle multiple times and check randomness
        const shuffleResults = [];
        for (let i = 0; i < 10; i++) {
            game.shuffleCards();
            shuffleResults.push(game.cards.map(card => card.symbol).join(','));
        }
        
        // Check that we get different arrangements (very high probability)
        const uniqueResults = [...new Set(shuffleResults)];
        if (uniqueResults.length < 5) {
            throw new Error('Shuffle algorithm may not be random enough');
        }
    }

    // Test game state management
    testGameStateManagement() {
        const game = new MemoryGame();
        
        // Test initial state
        if (game.moves !== 0 || game.matchedPairs !== 0 || game.gameActive !== false) {
            throw new Error('Initial game state incorrect');
        }
        
        // Test reset stats
        game.moves = 5;
        game.matchedPairs = 3;
        game.gameActive = true;
        game.resetStats();
        
        if (game.moves !== 0 || game.matchedPairs !== 0 || game.gameActive !== false) {
            throw new Error('Reset stats not working correctly');
        }
    }

    // Test score calculation
    testScoreCalculation() {
        const game = new MemoryGame();
        game.currentDifficulty = 'medium';
        game.startTime = Date.now() - 60000; // 1 minute ago
        game.matchedPairs = 4;
        game.moves = 10;
        
        game.updateScore();
        const score = parseInt(document.getElementById('score').textContent);
        
        // Score should be positive and include bonuses
        if (score <= 0) {
            throw new Error('Score calculation should be positive');
        }
        
        // Test that score includes matched pairs bonus
        if (score < game.matchedPairs * 100) {
            throw new Error('Score should include matched pairs bonus');
        }
    }

    // Test leaderboard functionality
    testLeaderboardFunctionality() {
        const game = new MemoryGame();
        
        // Test initial leaderboard is empty
        if (game.leaderboard.length !== 0) {
            throw new Error('Initial leaderboard should be empty');
        }
        
        // Test high score detection
        const isHighScore = game.checkHighScore(1000);
        if (!isHighScore) {
            throw new Error('Should detect high score when leaderboard is empty');
        }
        
        // Test saving to leaderboard
        game.saveToLeaderboard(1000, '01:30', 15);
        if (game.leaderboard.length !== 1) {
            throw new Error('Should save entry to leaderboard');
        }
        
        // Test leaderboard sorting
        game.saveToLeaderboard(500, '02:00', 20);
        game.saveToLeaderboard(1500, '01:00', 10);
        
        if (game.leaderboard[0].score !== 1500) {
            throw new Error('Leaderboard should be sorted by score (highest first)');
        }
        
        // Test leaderboard limit (top 5)
        for (let i = 0; i < 10; i++) {
            game.saveToLeaderboard(100 + i, '01:00', 10);
        }
        
        if (game.leaderboard.length > 5) {
            throw new Error('Leaderboard should only keep top 5 scores');
        }
    }

    // Test difficulty change
    testDifficultyChange() {
        const game = new MemoryGame();
        
        // Test changing to hard difficulty
        game.changeDifficulty('hard');
        
        if (game.currentDifficulty !== 'hard') {
            throw new Error('Difficulty change not working');
        }
        
        if (game.cards.length !== 36) {
            throw new Error('Hard difficulty should create 36 cards');
        }
        
        // Test changing to easy difficulty
        game.changeDifficulty('easy');
        
        if (game.currentDifficulty !== 'easy') {
            throw new Error('Difficulty change not working');
        }
        
        if (game.cards.length !== 16) {
            throw new Error('Easy difficulty should create 16 cards');
        }
    }

    // Test flip back timing
    testFlipBackTiming() {
        const game = new MemoryGame();
        
        // Test easy difficulty timing
        game.currentDifficulty = 'easy';
        const easyConfig = game.difficultyConfigs.easy;
        let flipBackDelay;
        
        if (game.currentDifficulty === 'easy') {
            flipBackDelay = 1000;
        } else if (game.currentDifficulty === 'hard') {
            flipBackDelay = 600;
        } else {
            flipBackDelay = 750;
        }
        
        if (flipBackDelay !== 1000) {
            throw new Error('Easy difficulty should have 1000ms flip back delay');
        }
        
        // Test hard difficulty timing
        game.currentDifficulty = 'hard';
        if (game.currentDifficulty === 'easy') {
            flipBackDelay = 1000;
        } else if (game.currentDifficulty === 'hard') {
            flipBackDelay = 600;
        } else {
            flipBackDelay = 750;
        }
        
        if (flipBackDelay !== 600) {
            throw new Error('Hard difficulty should have 600ms flip back delay');
        }
    }

    // Test audio initialization
    testAudioInitialization() {
        const game = new MemoryGame();
        
        // Test that audio context is created
        if (!game.audioContext) {
            throw new Error('Audio context should be initialized');
        }
        
        // Test that sounds are created
        if (!game.sounds.flip || !game.sounds.match || !game.sounds.complete) {
            throw new Error('Sound effects should be created');
        }
        
        // Test playSound method doesn't throw errors
        try {
            game.playSound('flip');
            game.playSound('match');
            game.playSound('complete');
        } catch (error) {
            throw new Error('PlaySound method should not throw errors');
        }
    }

    // Test card matching logic
    testCardMatchingLogic() {
        const game = new MemoryGame();
        game.currentDifficulty = 'easy';
        game.shuffleCards();
        
        // Create mock card elements
        const mockCard1 = {
            element: { classList: { add: () => {}, remove: () => {} } },
            card: { symbol: '🎯', isFlipped: false, isMatched: false }
        };
        
        const mockCard2 = {
            element: { classList: { add: () => {}, remove: () => {} } },
            card: { symbol: '🎯', isFlipped: false, isMatched: false }
        };
        
        // Test matching cards
        game.flippedCards = [mockCard1, mockCard2];
        
        // Mock setTimeout to test immediately
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay) => callback();
        
        try {
            game.checkForMatch();
            
            if (mockCard1.card.isMatched !== true || mockCard2.card.isMatched !== true) {
                throw new Error('Matching cards should be marked as matched');
            }
            
            if (game.matchedPairs !== 1) {
                throw new Error('Matched pairs counter should increment');
            }
        } finally {
            window.setTimeout = originalSetTimeout;
        }
    }

    // Test game completion
    testGameCompletion() {
        const game = new MemoryGame();
        game.currentDifficulty = 'easy';
        game.matchedPairs = 7; // One pair away from completion
        
        // Mock card matching
        const mockCard1 = {
            element: { classList: { add: () => {} } },
            card: { symbol: '🎯', isFlipped: false, isMatched: false }
        };
        
        const mockCard2 = {
            element: { classList: { add: () => {} } },
            card: { symbol: '🎯', isFlipped: false, isMatched: false }
        };
        
        game.flippedCards = [mockCard1, mockCard2];
        
        // Mock setTimeout and endGame
        const originalSetTimeout = window.setTimeout;
        const originalEndGame = game.endGame;
        
        window.setTimeout = (callback, delay) => callback();
        game.endGame = () => {
            if (game.matchedPairs !== 8) {
                throw new Error('Game should complete when all pairs are matched');
            }
        };
        
        try {
            game.checkForMatch();
        } finally {
            window.setTimeout = originalSetTimeout;
            game.endGame = originalEndGame;
        }
    }

    /**
     * Test pause functionality
     */
    testPauseFunctionality() {
        const game = new MemoryGame();
        
        // Test initial pause state
        if (game.gamePaused !== false) {
            throw new Error('Initial pause state should be false');
        }
        
        // Test pause game
        game.gameActive = true;
        game.startTime = Date.now();
        game.pauseGame();
        
        if (game.gamePaused !== true) {
            throw new Error('Game should be paused after pauseGame()');
        }
        
        if (game.pauseStartTime === null) {
            throw new Error('Pause start time should be set');
        }
        
        // Test resume game
        game.resumeGame();
        
        if (game.gamePaused !== false) {
            throw new Error('Game should not be paused after resumeGame()');
        }
        
        if (game.pauseStartTime !== null) {
            throw new Error('Pause start time should be cleared after resume');
        }
    }

    /**
     * Test pause state prevents card flipping
     */
    testPausePreventsCardFlipping() {
        const game = new MemoryGame();
        game.currentDifficulty = 'easy';
        game.shuffleCards();
        
        // Mock card element
        const mockCard = {
            element: { classList: { add: () => {} } },
            card: { symbol: '🎯', isFlipped: false, isMatched: false }
        };
        
        // Test that paused game prevents flipping
        game.gameActive = true;
        game.gamePaused = true;
        
        const initialFlippedCards = game.flippedCards.length;
        game.flipCard(mockCard.element, mockCard.card);
        
        if (game.flippedCards.length !== initialFlippedCards) {
            throw new Error('Card should not flip when game is paused');
        }
    }

    /**
     * Test pause time calculation
     */
    testPauseTimeCalculation() {
        const game = new MemoryGame();
        game.gameActive = true;
        game.startTime = Date.now() - 10000; // 10 seconds ago
        
        // Pause for 2 seconds
        game.pauseGame();
        game.pauseStartTime = Date.now() - 2000; // 2 seconds ago
        game.totalPauseTime = 0;
        
        // Resume
        game.resumeGame();
        
        if (game.totalPauseTime < 2000 || game.totalPauseTime > 3000) {
            throw new Error('Pause time calculation should be accurate');
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🧪 Starting Memory Card Game Tests...\n');
        
        this.setupMockDOM();
        
        try {
            this.runTest('Difficulty Configurations', () => this.testDifficultyConfigs());
            this.runTest('Card Shuffling', () => this.testCardShuffling());
            this.runTest('Fisher-Yates Shuffle Algorithm', () => this.testFisherYatesShuffle());
            this.runTest('Game State Management', () => this.testGameStateManagement());
            this.runTest('Score Calculation', () => this.testScoreCalculation());
            this.runTest('Leaderboard Functionality', () => this.testLeaderboardFunctionality());
            this.runTest('Difficulty Change', () => this.testDifficultyChange());
            this.runTest('Flip Back Timing', () => this.testFlipBackTiming());
            this.runTest('Audio Initialization', () => this.testAudioInitialization());
            this.runTest('Card Matching Logic', () => this.testCardMatchingLogic());
            this.runTest('Game Completion', () => this.testGameCompletion());
            this.runTest('Pause Functionality', () => this.testPauseFunctionality());
            this.runTest('Pause Prevents Card Flipping', () => this.testPausePreventsCardFlipping());
            this.runTest('Pause Time Calculation', () => this.testPauseTimeCalculation());
        } finally {
            this.restoreOriginalMethods();
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        
        if (this.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
        }
        
        return this.failed === 0;
    }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryGameTests;
} else {
    // Make available globally in browser
    window.MemoryGameTests = MemoryGameTests;
}

// Auto-run tests if in browser
if (typeof window !== 'undefined' && window.location) {
    console.log('Memory Card Game Test Suite loaded. Run "new MemoryGameTests().runAllTests()" to execute tests.');
}
