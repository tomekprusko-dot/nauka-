// Krótki sygnał na koniec przerwy, generowany w przeglądarce (bez pliku audio).
// iPhone pozwala odtworzyć dźwięk dopiero po stuknięciu w ekran, dlatego
// unlockAudio() wołamy przy odhaczeniu serii, a beep() później, z minutnika.
let context = null;

export function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!context) context = new AudioContextClass();
    if (context.state === "suspended") context.resume();
  } catch {
    context = null;
  }
}

export function beep() {
  if (!context) return;
  try {
    const start = context.currentTime;
    [0, 0.22, 0.44].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = index === 2 ? 1320 : 880;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.4, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.2);
    });
  } catch {
    // brak dźwięku to nie problem
  }
}
