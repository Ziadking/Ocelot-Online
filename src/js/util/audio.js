// audio
// --------------------------------------------------------------------------------- //

var audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
  var oscillator = audioContext.createOscillator();
  var gain = audioContext.createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  gain.gain.value = 0.1;
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
