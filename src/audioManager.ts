export class AudioManager {
  private static instance: AudioManager;
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private talahonHitCount: number = 0;
  private omaHitCount: number = 0;
  private midGameVoicePlayed: boolean = false;
  private midGameVoiceTimer: number | null = null;

  private readonly SOUNDS = {
    opaSpawn: 'opa_aus_dem_weg.wav',
    opaHit: 'parkleuchte.wav',
    rockerSpawn: ['rocker_brum.wav', 'rocker_powerbank.wav', 'rocker_erscheint.wav'],
    talahonSpecialHit: 'walla_billah.wav',
    omaGameOver: 'oma_tschuessikofski.wav',
    omaHit9: 'und_tschuess.wav',
    omaMidGame: ['scharfe_sybille.wav', 'oma_guliguli.wav']
  };

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  private playVoice(soundPath: string): void {
    try {
      if (this.currentVoiceAudio) {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      }
      const audio = new Audio(soundPath);
      this.currentVoiceAudio = audio;
      audio.onended = () => {
        if (this.currentVoiceAudio === audio) this.currentVoiceAudio = null;
      };
      audio.play().catch(() => {});
    } catch (e) {}
  }

  public onGameStart(): void {
    this.talahonHitCount = 0;
    this.omaHitCount = 0;
    this.midGameVoicePlayed = false;
    if (this.midGameVoiceTimer) window.clearTimeout(this.midGameVoiceTimer);

    const delay = Math.floor(Math.random() * (40000 - 15000 + 1)) + 15000;
    this.midGameVoiceTimer = window.setTimeout(() => {
      if (!this.midGameVoicePlayed) {
        this.midGameVoicePlayed = true;
        const list = this.SOUNDS.omaMidGame;
        this.playVoice(list[Math.floor(Math.random() * list.length)]);
      }
    }, delay);
  }

  public onOpaSpawn(): void { this.playVoice(this.SOUNDS.opaSpawn); }
  public onOpaHit(): void { this.playVoice(this.SOUNDS.opaHit); }
  public onRockerSpawn(): void {
    const list = this.SOUNDS.rockerSpawn;
    this.playVoice(list[Math.floor(Math.random() * list.length)]);
  }
  public onTalahonHit(): void {
    this.talahonHitCount++;
    if (this.talahonHitCount % 10 === 0) this.playVoice(this.SOUNDS.talahonSpecialHit);
  }
  public onOmaHit(): void {
    this.omaHitCount++;
    if (this.omaHitCount % 9 === 0) this.playVoice(this.SOUNDS.omaHit9);
  }
  public onGameOver(): void {
    if (this.midGameVoiceTimer) window.clearTimeout(this.midGameVoiceTimer);
    this.playVoice(this.SOUNDS.omaGameOver);
  }
}
export const audioManager = AudioManager.getInstance();
