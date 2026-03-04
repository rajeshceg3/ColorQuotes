class SoundService {
  private static instance: SoundService;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  private constructor() {
    // Cannot initialize AudioContext here because it requires a user gesture
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public init() {
    if (this.isInitialized) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or failed to initialize', e);
    }
  }

  private playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
       console.warn('Failed to play tone', e);
    }
  }

  public playPop() {
    this.playTone(400, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(600, 'sine', 0.15, 0.1), 50);
  }

  public playClick() {
    this.playTone(800, 'sine', 0.05, 0.05);
  }

  public playSwoosh() {
     if (!this.audioContext) return;
     try {
       if (this.audioContext.state === 'suspended') {
         this.audioContext.resume().catch(() => {});
       }

       const oscillator = this.audioContext.createOscillator();
       const gainNode = this.audioContext.createGain();

       oscillator.type = 'sine';
       oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
       oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

       gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

       oscillator.connect(gainNode);
       gainNode.connect(this.audioContext.destination);

       oscillator.start();
       oscillator.stop(this.audioContext.currentTime + 0.3);
     } catch (e) {
       console.warn('Failed to play swoosh', e);
     }
  }
}

export default SoundService;
