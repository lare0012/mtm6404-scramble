/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

const { useState, useEffect } = React

// The list of words for the game.
// No spaces or special characters. At least 10 words.
const WORDS = [
  'react',
  'javascript',
  'component',
  'browser',
  'function',
  'variable',
  'keyboard',
  'developer',
  'element',
  'internet',
  'website',
  'programming',
  'application',
  'interface',
  'framework',
  'gaming',
]

// Game settings
const MAX_STRIKES = 3
const MAX_PASSES = 3
const STORAGE_KEY = 'scramble-game'

// Build a fresh game state: a shuffled copy of the words,
// with scrambled versions, and reset counters.
function newGame () {
  const words = shuffle(WORDS)
  return {
    words: words,                 // remaining words to guess
    scrambled: shuffle(words[0]), // scrambled version of the current word
    points: 0,
    strikes: 0,
    passes: MAX_PASSES
  }
}

function App () {
  // Load saved progress from local storage, or start a new game.
  const [game, setGame] = useState(function () {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : newGame()
  })

  // The player's current guess.
  const [guess, setGuess] = useState('')

  // Feedback message after each guess ("Correct!" / "Incorrect.").
  const [message, setMessage] = useState('')

  // Save progress to local storage whenever the game changes.
  useEffect(function () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  }, [game])

  // The game is over when there are no words left OR strikes are maxed out.
  const isOver = game.words.length === 0 || game.strikes >= MAX_STRIKES

  // Move to the next word by removing the current one from the list.
  function nextWord (current) {
    const remaining = current.words.slice(1)
    return {
      ...current,
      words: remaining,
      scrambled: remaining.length > 0 ? shuffle(remaining[0]) : ''
    }
  }

  // Handle the guess form submission (Enter key or button).
  function handleSubmit (event) {
    event.preventDefault() // stop the page from refreshing

    const answer = game.words[0]

    if (guess.trim().toLowerCase() === answer.toLowerCase()) {
      // Correct: add a point and advance to a new scrambled word.
      const advanced = nextWord(game)
      advanced.points = game.points + 1
      setGame(advanced)
      setMessage('Correct!')
    } else {
      // Incorrect: add a strike and keep the same scrambled word.
      setGame({ ...game, strikes: game.strikes + 1 })
      setMessage('Incorrect.')
    }

    setGuess('') // clear the textbox after every guess
  }

  // Handle the pass button: skip the current word if passes remain.
  function handlePass () {
    if (game.passes > 0) {
      const advanced = nextWord(game)
      advanced.passes = game.passes - 1
      setGame(advanced)
      setMessage('Word passed.')
      setGuess('')
    }
  }

  // Restart the game without refreshing the page.
  function handlePlayAgain () {
    setGame(newGame())
    setMessage('')
    setGuess('')
  }

  // Game over screen.
  if (isOver) {
    const won = game.words.length === 0
    return (
      <div className="scramble">
        <h1>Scramble</h1>
        <h2>Game Over</h2>
        <p>{won ? 'You made it through all the words!' : 'You reached the maximum number of strikes.'}</p>
        <p className="score">Final Score: {game.points}</p>
        <button onClick={handlePlayAgain}>Play Again</button>
      </div>
    )
  }

  // Main game screen.
  return (
    <div className="scramble">
      <h1>Scramble</h1>

      <p className="scrambled-word">{game.scrambled}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={guess}
          onChange={function (e) { setGuess(e.target.value) }}
          placeholder="Type your guess and hit Enter"
          autoFocus
        />
      </form>

      <button onClick={handlePass} disabled={game.passes === 0}>
        Pass ({game.passes} left)
      </button>

      {message && <p className="message">{message}</p>}

      <div className="stats">
        <span>Points: {game.points}</span>
        <span>Strikes: {game.strikes} / {MAX_STRIKES}</span>
        <span>Words left: {game.words.length}</span>
      </div>
    </div>
  )
}

// Render the app.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
