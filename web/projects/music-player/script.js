alert("This music player features songs from the rhythm game Arcaea.\n\nMusic is credited to the respective composer. Cover art is © their respective owners — Arcaea song jackets are © lowiro.");

const playBtnWrapper = document.querySelector(".play");
const playBtn = playBtnWrapper.querySelector("img");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const progressContainer = document.getElementById("progress-container");
const progress = document.getElementById("progress");
const progressHead = document.getElementById("progress-head");
const currentTimeElem = document.getElementById("current-time");
const durationElem = document.getElementById("duration");
const titleElem = document.querySelector(".title");
const artistElem = document.querySelector(".artist");
const imageElem = document.querySelector(".cover-wrapper > img");
const modeBtn = document.querySelector(".mode");
const modeIcon = document.getElementById("mode-icon");
const tooltipEl = document.getElementById("mode-tooltip");

let isPlaying = false;
let songIndex = 0;
let playIntent = false;
let audio = null;
let pendingSeek = null;
let isDragging = false;
let tooltipTimeout = null;

// All songs in the player
const playlist = [
  {
    title: "エピクロスの虹はもう見えない",
    artist: "SYNC.ART'S feat.Misato",
    src: "https://www.dropbox.com/scl/fi/sbdzbsjnahwpoml20zhrb/_-_-chinise-tea-_-Hidden-Rainbows-of-Epicurus-_-MP3_320K.mp3?rlkey=guy7qojypu1g7bpzsejsihjtx&st=nsb43hje&raw=1",
    image: "https://www.dropbox.com/scl/fi/48mbrkymywgkv880s9vyf/Epicurus.jpg?rlkey=qq80h02ac8971qd7eezligkui&st=d86pw3w1&raw=1"
  },
  {
    title: "Purgatorium",
    artist: "しお月さま交響曲",
    src: "https://www.dropbox.com/scl/fi/kz8m3vlhnxfcm2y12byye/Purgatorium-MP3_320K.mp3?rlkey=jq80vu1u1jbcttvxfqkqtledj&st=osetzy0w&raw=1",
    image: "https://www.dropbox.com/scl/fi/w2hj0grg6082xm6fz11kx/Purgatorium.jpg?rlkey=yseknjgqjp96iqh2o1td050rr&st=uy0v5z8z&raw=1"
  },
  {
    title: "San Skia",
    artist: "ユアミトス",
    src: "https://www.dropbox.com/scl/fi/1cf1qzrpigmquumrvtr4m/Arcaea-san-skia-Lyric-Video-MP3_320K.mp3?rlkey=znew7hkxbe3swp8duh25wlr15&st=dfjsekw6&raw=1",
    image: "https://www.dropbox.com/scl/fi/m5ho93zxczac91t7shz86/San_skia.jpg?rlkey=mkilkf6fz0vewsesirovls64l&st=ajx7gvyk&raw=1"
  },
  {
    title: "SATISFACTION",
    artist: "P*Light & Dj Noriken feat. KMNZ",
    src: "https://www.dropbox.com/scl/fi/3r9jbx06p1kdas5sj3rfg/SATISFACTION-feat.-KMNZ-MP3_320K.mp3?rlkey=99p0j6qhm22788hnwg0xdqf5k&st=67ax8o8i&raw=1",
    image: "https://www.dropbox.com/scl/fi/rc38l4y4a236yj80ohsnl/Satisfaction.jpg?rlkey=vh2fidm4jsjksjiv92y8916hu&st=wx04fzpd&raw=1"
  },
  {
    title: "world.execute(me);",
    artist: "Mili",
    src: "https://www.dropbox.com/scl/fi/cuhomv0xm5fxl6grqyy5d/Mili-world.execute-me-_-MP3_320K.mp3?rlkey=cpwm5whddz8kgtdb56om9vsgv&st=b3y4hduh&raw=1",
    image: "https://www.dropbox.com/scl/fi/nek1lc3cv8r3n92k79d6d/World.execute-me.jpg?rlkey=59dmxzc7mqf7249khpc81w52q&st=s8tlbmvd&raw=1"
  },
  {
    title: "Dialnote",
    artist: "七草くりむ",
    src: "https://www.dropbox.com/scl/fi/jpqpzmkzbm3mrer0zvywd/ASMR-House-_-Off-Vocal-MP3_320K.mp3?rlkey=vyrvtuqzek2bh4whz2pjw1g2w&st=lgkwm2tj&raw=1",
    image: "https://www.dropbox.com/scl/fi/wsl27msq0a9ci0f22dfhn/Dialnote.jpg?rlkey=lad7jsufwpiv8upojuhmbtq5f&st=etc8trsc&raw=1"
  },
  {
    title: "Dematerialized",
    artist: "in love with a ghost",
    src: "https://www.dropbox.com/scl/fi/7kf1uumsvvg23qt2nk53c/Arcaea-Dematerialized.mp3?rlkey=qmdcnk03btinzkr3vtr3umwtd&st=7x1qwct3&raw=1",
    image: "https://www.dropbox.com/scl/fi/f6wv0j6ywan2hfw0kxpb4/Dematerialized.jpg?rlkey=ouvjwjwc91jlasiet7b3hm7c4&st=u8t758t0&raw=1"
  },
  {
    title: "Rugie",
    artist: "Feryquitous feat.Sennzai",
    src: "https://www.dropbox.com/scl/fi/zd46qpgnr2oq56t3xh3ig/Rugie-MP3_320K.mp3?rlkey=0n8otb56k0413dlo623r0b4iu&st=oott2sqe&raw=1",
    image: "https://www.dropbox.com/scl/fi/ui8zv5n5udqhlts7b6dh0/Rugie.jpg?rlkey=mkhrr9o90n8d37y0wlqepz4tz&st=bd6zcbwk&raw=1"
  }
];

// Loads the covers of songs in the background
playlist.forEach((song) => {
  const img = new Image();
  img.src = song.image;
});

// Load the songs in the background
const audios = playlist.map((song, index) => {
  const audioEl = document.createElement("audio");
  audioEl.id = `audio${index}`;
  audioEl.src = song.src;
  audioEl.preload = "auto";
  document.body.appendChild(audioEl);
  return audioEl;
});

// Play Modes
const modes = [
  {
    name: "Playlist Loop",
    icon: "https://www.dropbox.com/scl/fi/1ur7denkvmb5r4s70yr4c/Playlist Loop.svg?rlkey=zwk8rs5ylesc6brgnai8b8v67&st=xiri84zy&raw=1"
  },
  {
    name: "Single Loop",
    icon: "https://www.dropbox.com/scl/fi/ggix2d771gwbjqu6n0gjj/loop.svg?rlkey=lotbrgbzv3ujusonvj0u572mz&st=b89gni6k&raw=1"
  },
  {
    name: "Shuffle",
    icon: "https://www.dropbox.com/scl/fi/jx8k614i9lji0qs0f0jdl/shuffle.svg?rlkey=nkvx1rgkg10qb34brevg7owyx&st=ab1rulli&raw=1"
  }
];

let modeIndex = 0; // default mode: Playlist Loop

function handleEnd() {
  const mode = modes[modeIndex].name;
  const wasPlaying = isPlaying; // remember if playback was active
  if (mode === "Playlist Loop") {
    const nextIndex = (songIndex + 1) % playlist.length;
    loadSong(nextIndex);
    if (wasPlaying) tryPlayAudio();
  } else if (mode === "Single Loop") {
    loadSong(songIndex);
    if (wasPlaying) tryPlayAudio();
  } else if (mode === "Shuffle") {
    let newIndex;
    if (playlist.length <= 1) {
      newIndex = songIndex;
    } else {
      do {
        newIndex = Math.floor(Math.random() * playlist.length);
      } while (newIndex === songIndex);
    }
    loadSong(newIndex);
    if (wasPlaying) tryPlayAudio();
  }
}

// Update mode icons
function updateModeUI() {
  const mode = modes[modeIndex];
  modeIcon.src = mode.icon;
  modeBtn.title = `Mode: ${mode.name}`;
}

// Show tooltip message of mode change
function showTooltip(modeName) {
  tooltipEl.textContent = modeName;
  tooltipEl.classList.add("show");
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => {
    tooltipEl.classList.remove("show");
  }, 2000);
}

// Change mode
function cycleMode() {
  modeIndex = (modeIndex + 1) % modes.length;
  updateModeUI();
  showTooltip(modes[modeIndex].name);
}

// Set proper song length and timestamp
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Loads songs, updates UI elements, resets audio state and sets up event listeners
function loadSong(index) {
  pendingSeek = null;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener("timeupdate", updateProgress);
    audio.removeEventListener("ended", handleEnd);
    audio.onloadedmetadata = null;
  }

  songIndex = index;
  audio = audios[songIndex];
  playIntent = isPlaying;
  isPlaying = false;

  const song = playlist[index];
  titleElem.textContent = song.title;
  artistElem.childNodes[0].textContent = song.artist + " ";
  imageElem.src = song.image;

  progress.style.width = "0%";
  progressHead.style.left = "0%";
  currentTimeElem.textContent = "00:00";
  durationElem.textContent = "00:00";
  updatePlayIcon(false);
  playBtnWrapper.classList.add("disabled");

  const applyPendingSeekIfAny = () => {
    if (
      pendingSeek !== null &&
      audio &&
      audio.duration &&
      Number.isFinite(audio.duration)
    ) {
      audio.currentTime = Math.min(Math.max(pendingSeek, 0), audio.duration);
      pendingSeek = null;
    }
  };

  if (audio.readyState >= 1) {
    durationElem.textContent = formatTime(audio.duration);
    playBtnWrapper.classList.remove("disabled");
    updateProgress();
    applyPendingSeekIfAny();
    if (playIntent) tryPlayAudio();
  } else {
    audio.onloadedmetadata = () => {
      durationElem.textContent = formatTime(audio.duration);
      playBtnWrapper.classList.remove("disabled");
      updateProgress();
      applyPendingSeekIfAny();
      if (playIntent) tryPlayAudio();
    };
  }

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", handleEnd);

  updateProgress();
}

// Updates progress bar and current time during playback
function updateProgress() {
  if (!audio || !audio.duration || isDragging) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${percent}%`;
  progressHead.style.left = `${percent}%`;
  currentTimeElem.textContent = formatTime(audio.currentTime);
}

// Tries playing the current audio and handles success or failure
function tryPlayAudio() {
  audio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayIcon(true);
    })
    .catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Play error:", error);
      }
      isPlaying = false;
      updatePlayIcon(false);
    });
}

// Updates play/pause button icon based on playback state
function updatePlayIcon(playing) {
  if (playing) {
    playBtn.src =
      "https://www.dropbox.com/scl/fi/24ammpipe0el8h0mxdz0u/play.svg?rlkey=ykjyvto3op92euzv7h77joj4i&st=w021wojb&raw=1";
    playBtnWrapper.style.paddingLeft = "6px";
  } else {
    playBtn.src =
      "https://www.dropbox.com/scl/fi/6k5hbmznf3so1xqs8xdy8/pause.svg?rlkey=ce82i9ln4hjncpzmui7yp2s8k&st=xaiih7m5&raw=1";
    playBtnWrapper.style.paddingLeft = "9px";
  }
}

// Moves to the next song in the playlist
function nextSong() {
  songIndex = (songIndex + 1) % playlist.length;
  loadSong(songIndex);
}

// Moves to the previous song in the playlist
function prevSong() {
  songIndex = (songIndex - 1 + playlist.length) % playlist.length;
  loadSong(songIndex);
}

// Toggles between playing and pausing current song. Plays all audios at first for once to prevent autoplay errors
let hasPrimed = false;

async function togglePlayPause() {
  if (playBtnWrapper.classList.contains("disabled")) return;

  if (!hasPrimed) {
    await Promise.all(
      audios.map(audio => audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {}))
    );
    hasPrimed = true;
  }

  if (isPlaying) {
    playIntent = false;
    audio.pause();
    isPlaying = false;
    updatePlayIcon(false);
  } else {
    playIntent = true;
    tryPlayAudio();
    }
  }

// Calculates seek position in the song from drag or clicks in the progress slider
function seekFromClientX(clientX) {
  const rect = progressContainer.getBoundingClientRect();
  const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  if (!audio || !audio.duration || !Number.isFinite(audio.duration)) {
    progress.style.width = `0%`;
    progressHead.style.left = `0%`;
    currentTimeElem.textContent = formatTime(0);
    return 0;
      }
  const percent = offsetX / rect.width;
  const seekTime = percent * audio.duration;
  progress.style.width = `${percent * 100}%`;
  progressHead.style.left = `${percent * 100}%`;
  currentTimeElem.textContent = formatTime(seekTime);
  return seekTime;
}

progressContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  seekFromClientX(e.clientX);
});

window.addEventListener("mousemove", (e) => {
  if (isDragging) seekFromClientX(e.clientX);
    });

window.addEventListener("mouseup", (e) => {
  if (isDragging) {
    const desired = seekFromClientX(e.clientX);
    if (audio && audio.duration && Number.isFinite(audio.duration)) {
      audio.currentTime = desired;
      pendingSeek = null;
    } else {
      pendingSeek = desired;
    }
    isDragging = false;
  }
});

progressContainer.addEventListener("touchstart", (e) => {
  isDragging = true;
  seekFromClientX(e.touches[0].clientX);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  if (isDragging) seekFromClientX(e.touches[0].clientX);
}, { passive: true });

window.addEventListener("touchend", (e) => {
  if (isDragging) {
    const desired = seekFromClientX(e.changedTouches[0].clientX);
    if (audio && audio.duration && Number.isFinite(audio.duration)) {
      audio.currentTime = desired;
      pendingSeek = null;
    } else {
      pendingSeek = desired;
    }
    isDragging = false;
  }
}, { passive: true });

playBtnWrapper.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
modeBtn.addEventListener("click", cycleMode);

// Initialize the UI
updateModeUI();
loadSong(songIndex);