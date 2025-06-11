document.addEventListener('DOMContentLoaded', () => {
    const messages = document.getElementById('messages');
    const input = document.getElementById('input');
    const sendButton = document.getElementById('send');
    const micButton = document.getElementById('mic');
    const toggleDarkMode = document.getElementById('dark-mode-toggle');
    
    // Use your server's IP:PORT
    const SERVER_URL = 'http://192.168.0.102:3002/ask';

    micButton.addEventListener('click', () => {
        startRecognition();
    });

    // Speech Recognition Function
    function startRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            sendMessage(transcript);
        };

        recognition.start();
    }

    // Unified Send Message Function
    function sendMessage(message) {
        if (!message.trim()) return;

        addMessage('You', message);
        input.value = '';

        fetch(SERVER_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ question: message })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`Server error: ${err.message}`);
                });
            }
            return response.json();
        })
        .then(data => {
            addMessage('Mseek', data.answer);
            readAloud(data.answer);
        })
        .catch(error => {
            console.error('Error:', error);
            addMessage('Error', 'Failed to get response');
        });
    }

    // Event Listeners
    sendButton.addEventListener('click', () => {
        sendMessage(input.value.trim());
    });

    // Dark Mode Toggle Functionality
    toggleDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Apply dark mode if previously enabled
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Helper Functions
    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.textContent = `${sender}: ${text}`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function readAloud(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        }
    }
});
