// Speech Recognition Voice Input & Text-To-Speech Read Aloud Integration
class VoiceInputEngine {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
        }
    }

    startListening(targetInputId, statusElemId, lang = "en") {
        const inputElem = document.getElementById(targetInputId);
        const statusElem = document.getElementById(statusElemId);
        
        if (!this.recognition) {
            // Fallback simulation if browser does not support Web Speech API
            if (statusElem) statusElem.innerText = "🎤 Simulated Voice Input: Dictating details...";
            
            setTimeout(() => {
                const simulatedTexts = [
                    "Wearing a navy blue jacket, black jeans, white sneakers. Last seen near central train station.",
                    "Child wearing red t-shirt and yellow cap, last seen in children park area.",
                    "Elderly person wearing traditional white dhoti, green shirt with silver watch."
                ];
                const sample = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
                if (inputElem) {
                    inputElem.value = (inputElem.value ? inputElem.value + " " : "") + sample;
                }
                if (statusElem) statusElem.innerText = "✅ Voice dictation completed.";
            }, 1200);
            return;
        }

        let langCode = "en-US";
        if (lang === "ta") langCode = "ta-IN";
        if (lang === "hi") langCode = "hi-IN";
        
        this.recognition.lang = langCode;

        this.recognition.onstart = () => {
            this.isListening = true;
            if (statusElem) statusElem.innerText = "🎙️ Listening... Speak into microphone";
        };

        this.recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (inputElem) {
                inputElem.value = transcript;
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            if (statusElem) statusElem.innerText = "⚠️ Voice error: " + event.error;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (statusElem) statusElem.innerText = "✅ Speech recognition complete.";
        };

        this.recognition.start();
    }

    speakText(text, lang = "en") {
        if (!("speechSynthesis" in window)) {
            if (window.showToast) window.showToast("Text-to-Speech read aloud not supported in this browser.", "info");
            return;
        }
        window.speechSynthesis.cancel(); // Stop any active speech
        const utterance = new SpeechSynthesisUtterance(text);
        if (lang === "ta") utterance.lang = "ta-IN";
        else if (lang === "hi") utterance.lang = "hi-IN";
        else utterance.lang = "en-US";

        window.speechSynthesis.speak(utterance);
        if (window.showToast) window.showToast("🔊 Reading instructions aloud...", "info");
    }
}

const voiceEngine = new VoiceInputEngine();

function speakInstructions() {
    const title = document.getElementById("aiGuidanceTitle")?.innerText || "AI Assistance and Guidance";
    const body = document.getElementById("aiGuidanceText")?.innerText || "Fill in all fields. Aliases help match across languages.";
    voiceEngine.speakText(`${title}. ${body}`, currentLang);
}
