// Music Generator - Creates a happy, jolly fishing theme
function generateHappyMusic() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple happy melody loop
    function playNote(frequency, duration, time) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    // Happy fishing melody - C Major scale
    const melody = [
        { freq: 261.63, duration: 0.4 },  // C
        { freq: 329.63, duration: 0.4 },  // E
        { freq: 392.00, duration: 0.4 },  // G
        { freq: 523.25, duration: 0.8 },  // C high
        { freq: 392.00, duration: 0.4 },  // G
        { freq: 329.63, duration: 0.4 },  // E
        { freq: 261.63, duration: 0.8 },  // C
        { freq: 329.63, duration: 0.4 },  // E
        { freq: 392.00, duration: 0.4 },  // G
        { freq: 440.00, duration: 0.4 },  // A
        { freq: 523.25, duration: 0.8 },  // C high
    ];
    
    let currentTime = audioContext.currentTime;
    
    for (let note of melody) {
        playNote(note.freq, note.duration, currentTime);
        currentTime += note.duration;
    }
    
    // Schedule next loop
    setTimeout(() => generateHappyMusic(), (currentTime - audioContext.currentTime) * 1000);
}

// Initialize music on user interaction
let musicStarted = false;
let musicEnabled = true;

function initializeMusic() {
    if (!musicStarted) {
        musicStarted = true;
        try {
            generateHappyMusic();
        } catch (e) {
            console.log('Audio context not available');
        }
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    const btn = document.getElementById('musicBtn');
    
    if (musicEnabled) {
        btn.innerHTML = '🔊 Music ON';
        btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
        if (!musicStarted) {
            initializeMusic();
        }
    } else {
        btn.innerHTML = '🔇 Music OFF';
        btn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
    }
}

// Start music on first user interaction
document.addEventListener('click', initializeMusic, { once: true });
document.addEventListener('keydown', initializeMusic, { once: true });
document.addEventListener('touchstart', initializeMusic, { once: true });
