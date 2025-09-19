# Memory Card Matching Game

A fun and interactive memory card matching game built with HTML, CSS, and JavaScript utilizing Cursor AI's Agent.

## Features

- **4x4 Grid**: 16 cards arranged in a 4x4 grid with 8 matching pairs
- **Card Flipping**: Click cards to flip them and reveal their symbols
- **Matching Logic**: Find matching pairs to keep them face up
- **Timer**: Track how long it takes to complete the game
- **Move Counter**: Count the number of card flips made
- **Scoring System**: Points based on matches found, time bonus, and move efficiency
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Beautiful card flip animations and visual feedback

## How to Play

1. **Start the Game**: Click on any card to begin the timer
2. **Find Matches**: Click two cards to flip them and see their symbols
3. **Match Pairs**: If the symbols match, the cards stay face up
4. **Complete the Game**: Find all 8 matching pairs to win
5. **Track Performance**: Monitor your time, moves, and score

## Controls

- **New Game**: Start a completely new game with shuffled cards
- **Reset**: Reset the current game without shuffling
- **Keyboard Shortcuts**:
  - 'P' - Pause game
  - `R` - Reset current game
  - `N` - New game
  - `Escape` - Close game over modal

## Scoring System

- **Base Score**: 100 points per matched pair (800 points total)
- **Time Bonus**: Extra points for completing under 5 minutes
- **Move Bonus**: Extra points for completing under 20 moves
- **Final Score**: Base score + time bonus + move bonus

## File Structure

```
memory-card-game/
├── index.html      # Main HTML structure
├── style.css       # Styling and animations
├── script.js       # Game logic and functionality
└── README.md       # This file
```

## Getting Started

1. Open `index.html` in your web browser
2. Start playing by clicking on any card
3. Have fun and try to beat your best score!

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Customization

You can easily customize the game by:

- **Changing Card Symbols**: Modify the `cardSymbols` array in `script.js`
- **Adjusting Grid Size**: Change the grid from 4x4 to any size
- **Modifying Scoring**: Update the scoring algorithm in the `updateScore()` method
- **Styling**: Customize colors, fonts, and animations in `style.css`

## Technical Details

- **Pure JavaScript**: No external dependencies
- **ES6 Classes**: Modern JavaScript class-based architecture
- **CSS Grid**: Responsive layout using CSS Grid
- **CSS Animations**: Smooth transitions and hover effects
- **Local Storage**: Ready for future high score persistence

Enjoy playing the Memory Card Game! 🎯🎲🎪
