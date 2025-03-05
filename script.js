let synth = window.speechSynthesis;
let voices = [];
let currentUtterance;

function populateVoices() {
    voices = synth.getVoices();
    const voiceSelect = document.getElementById("voice-select");
    voiceSelect.innerHTML = ''; // Clear old options

    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
}

function speakText() {
    const text = document.getElementById("text-input").value;
    const language = document.getElementById("language").value;
    const selectedVoiceIndex = document.getElementById("voice-select").value;
    const rate = document.getElementById("rate").value;

    if (text.trim() === '') {
        alert('Please enter text to convert to speech.');
        return;
    }

    stopText();  // Stop any existing speech

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = language;
    currentUtterance.voice = voices[selectedVoiceIndex];
    currentUtterance.rate = parseFloat(rate);

    synth.speak(currentUtterance);
}

function pauseText() {
    synth.pause();
}

function resumeText() {
    synth.resume();
}

function stopText() {
    synth.cancel();
}

document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
        const text = await file.text();
        document.getElementById("text-input").value = text;
    } else if (file.type === "application/pdf") {
        readPDF(file);
    } else {
        alert("Only .txt or .pdf files are supported.");
    }
});

async function readPDF(file) {
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.min.mjs');

    const reader = new FileReader();
    reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        document.getElementById("text-input").value = text;
    };
    reader.readAsArrayBuffer(file);
}
