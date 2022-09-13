export const sounds = {} as Record<string, Sound>;

class Sound {
  audio = new Audio();

  static load(src: string) {
    const sound = new Sound();
    sound.audio.src = src;
    sound.audio.volume = 0.4;
    return new Promise((resolve) => {
      sound.audio.onloadeddata = () => {
        resolve(sound);
      };
    });
  }

  play() {
    this.audio.play();
  }
}

export function loadSounds() {
  const promises = [];
  const soundResources: Record<string, string> = {
    'paddle_hit': '/resources/sounds/paddle_hit.wav',
    'score': '/resources/sounds/score.wav',
    'wall_hit': '/resources/sounds/wall_hit.wav'
  };
  for (const key in soundResources) {
    promises.push(
      Sound.load(soundResources[key]).then((sound: Sound) => {
        sounds[key] = sound;
      })
    );
  }
  
  return Promise.all(promises);
}