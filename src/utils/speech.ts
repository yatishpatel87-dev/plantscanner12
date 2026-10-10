export const speakText = (text: string, lang: 'gu' | 'en' = 'gu'): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'gu') {
      const guVoice = voices.find(v => v.lang.startsWith('gu') || v.lang.includes('GU'));
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('HI'));
      if (guVoice) {
        utterance.voice = guVoice;
        utterance.lang = guVoice.lang;
      } else if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.lang = hiVoice.lang;
      } else {
        utterance.lang = 'gu-IN';
      }
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.lang = 'en-US';
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
