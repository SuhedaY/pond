import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import vocabularyCategories  from './data/vocabulary.json';

console.log(vocabularyCategories);

// Add FrequencyIndicator component
const FrequencyIndicator = ({ frequency }) => {
  const getFrequencyLevel = (freq) => {
    if (freq <= 2) return { filled: 2 };
    if (freq <= 4) return { filled: 4 };
    return { filled: 7 };
  };

  const { filled } = getFrequencyLevel(frequency);

  return (
    <View style={styles.frequencyContainer}>
      <View style={styles.frequencyHeader}>
        <Text style={styles.frequencyTitle}>Word frequency</Text>
      </View>
      <View style={styles.frequencyBar}>
        <Text style={styles.frequencyLabel}>rarely</Text>
        <View style={styles.frequencyBoxes}>
          {[...Array(7)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.frequencyBox,
                i < filled ? styles.frequencyBoxFilled : styles.frequencyBoxEmpty
              ]}
            />
          ))}
        </View>
        <Text style={styles.frequencyLabel}>frequently</Text>
      </View>
    </View>
  );
};

// Add WordDecomposition component
const WordDecomposition = ({ decomposition, decompositionMeaning }) => {
  return (
    <View style={styles.decompositionContainer}>
      <Text style={styles.decompositionTitle}>Word Breakdown:</Text>
      {decomposition.map((part, index) => (
        <View key={index} style={styles.decompositionItem}>
          <Text style={styles.decompositionPart}>{part}</Text>
          <Text style={styles.decompositionArrow}>→</Text>
          <Text style={styles.decompositionMeaning}>{decompositionMeaning[index]}</Text>
        </View>
      ))}
    </View>
  );
};

// Add ConnectedWords component
const ConnectedWords = ({ connectedWords }) => {
  return (
    <View style={styles.connectedWordsContainer}>
      <Text style={styles.connectedWordsTitle}>Connected Words:</Text>
      <View style={styles.connectedWordsList}>
        {connectedWords.map((word, index) => (
          <Text key={index} style={styles.connectedWord}>
            {word}
          </Text>
        ))}
      </View>
    </View>
  );
};

const GermanVocabGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [currentWord, setCurrentWord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [feedback, setFeedback] = useState('');
  const [showEnhancedInfo, setShowEnhancedInfo] = useState(false); // Add this state
  const [usedWords, setUsedWords] = useState([]);
  const inputRef = useRef(null);
  const [awaitNext, setAwaitNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  


  // Flatten all categories into one large word pool
  const words = Object.values(vocabularyCategories).flat();

  const getRandomWord = () => {
    const availableWords = words.filter(word => !usedWords.includes(word.german));
    
    if (availableWords.length === 0) {
      // Reset if all words have been used
      setUsedWords([]);
      return words[Math.floor(Math.random() * words.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(180);
    setUserAnswer('');
    setFeedback('');
    setShowEnhancedInfo(false); // Add this
    setUsedWords([]);
    setCurrentWord(getRandomWord());
  };

    const checkAnswer = () => {
      if (!currentWord || !userAnswer.trim()) return;
    
      const isCorrect = userAnswer.toLowerCase().trim() === currentWord.english.toLowerCase();
    
      // Set feedback based on correctness
      setFeedback(isCorrect ? '✓ Richtig!' : `✗ ${currentWord.german} = ${currentWord.english}`);
      
      // Update score only if correct
      if (isCorrect) {
        setScore(prev => prev + 10);
      }
    
      // Always show breakdown info and pause timer
      setShowEnhancedInfo(true);
      setAwaitNext(true);
      setIsPaused(true);
    };


  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isPaused) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState('gameOver');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, isPaused]);



  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentWord]);

  if (gameState === 'menu') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.menuContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>German Vocab</Text>
              <Text style={styles.subtitle}>B1-B2 Level Practice</Text>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How to play:</Text>
              <Text style={styles.instructionItem}>• Translate German to English</Text>
              <Text style={styles.instructionItem}>• 3 minutes timer</Text>
              <Text style={styles.instructionItem}>• Type and press Submit</Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#faf5ff" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.finalScore}>{score}</Text>
              <Text style={styles.scoreLabel}>Final Score</Text>
            </View>

            <TouchableOpacity
              style={styles.playAgainButton}
              onPress={() => {
                setUserAnswer('');
                setFeedback('');
                setShowEnhancedInfo(false);
                setAwaitNext(false);
                setIsPaused(false); // ← resume timer
                setUsedWords(prev => [...prev, currentWord.german]);
                setCurrentWord(getRandomWord());
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gameContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
            </View>
            <View style={styles.scoreDisplayContainer}>
              <Text style={styles.scoreDisplay}>{score}</Text>
            </View>
          </View>

          <View style={styles.wordContainer}>
            <Text style={styles.germanWord}>{currentWord?.german}</Text>
            <Text style={styles.translateText}>Translate to English</Text>
            
            {currentWord?.example && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>"{currentWord.example}"</Text>
              </View>
            )}

            {/* Add FrequencyIndicator here */}
            {currentWord && <FrequencyIndicator frequency={currentWord.frequency || 3} />}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer..."
              placeholderTextColor="#9ca3af"
              editable={gameState === 'playing'}
              returnKeyType="done"
              onSubmitEditing={checkAnswer}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={checkAnswer}
              disabled={gameState !== 'playing'}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {feedback ? (
            <View style={[
              styles.feedbackContainer,
              feedback.includes('✓') ? styles.correctFeedback : styles.incorrectFeedback
            ]}>
              <Text style={[
                styles.feedbackText,
                feedback.includes('✓') ? styles.correctFeedbackText : styles.incorrectFeedbackText
              ]}>
                {feedback}
              </Text>
            </View>
          ) : null}

          {/* Add enhanced info components here */}
          {showEnhancedInfo && currentWord && (
            <View style={styles.enhancedInfoContainer}>
              {currentWord.decomposition && (
                <WordDecomposition 
                  decomposition={currentWord.decomposition}
                  decompositionMeaning={currentWord.decompositionMeaning}
                />
              )}
              {currentWord.connectedWords && (
                <ConnectedWords connectedWords={currentWord.connectedWords} />
              )}
            </View>
          )}
          {awaitNext && (
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: 16 }]}
              onPress={() => {
                setUserAnswer('');
                setFeedback('');
                setShowEnhancedInfo(false);
                setAwaitNext(false);
                setIsPaused(false); // ✅ Resume the timer
                setUsedWords(prev => [...prev, currentWord.german]);
                setCurrentWord(getRandomWord());
                if (inputRef.current) inputRef.current.focus();
              }}
            >
              <Text style={styles.submitButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  menuContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#2563eb',
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameOverContainer: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 16,
  },
  scoreContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    minWidth: 120,
  },
  finalScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  playAgainButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    alignItems: 'flex-start',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  scoreDisplayContainer: {
    alignItems: 'flex-end',
  },
  scoreDisplay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  wordContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  germanWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  translateText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  exampleContainer: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    width: '100%',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  correctFeedback: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  incorrectFeedback: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  correctFeedbackText: {
    color: '#15803d',
  },
  incorrectFeedbackText: {
    color: '#dc2626',
  },
  // New styles for added components
  frequencyContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    width: '100%',
  },
  frequencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  frequencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  frequencyInfo: {
    fontSize: 12,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  frequencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  frequencyBoxes: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
    justifyContent: 'center',
  },
  frequencyBox: {
    width: 24,
    height: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  frequencyBoxFilled: {
    backgroundColor: '#3b82f6',
  },
  frequencyBoxEmpty: {
    backgroundColor: '#ffffff',
  },
  enhancedInfoContainer: {
    marginTop: 16,
  },

  
  decompositionContainer: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  decompositionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
  },
  decompositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  decompositionPart: {
    backgroundColor: '#bbf7d0',
    color: '#15803d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  decompositionArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  decompositionMeaning: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  connectedWordsContainer: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
  },
  connectedWordsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  connectedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectedWord: {
    backgroundColor: '#bfdbfe',
    color: '#1d4ed8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default function App() {
  return <GermanVocabGame />;
}