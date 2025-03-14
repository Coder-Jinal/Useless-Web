$(document).ready(function () {
  // Configuration
  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const colors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
    "#FF1493",
    "#00FFFF",
    "#7FFFD4",
    "#FF69B4",
    "#FFA500",
  ];

  // Cache for audio clips
  const audioCache = {};
  // Mock tracks data (this would come from your server that interacts with Bandcamp API)
  let tracks = [];

  // Create floating background elements
  function createFloatingElements() {
    const container = $("#background-elements");

    // Create floating elements
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 100 + 50;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 20 + 10;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const element = $('<div class="floating-element"></div>');
      element.css({
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: `${posY}%`,
        backgroundColor: color,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      });

      container.append(element);
    }
  }

  // Initialize keyboard
  function initializeKeyboard() {
    const keyboard = $("#keyboard");
    keys.split("").forEach((key) => {
      keyboard.append(`<div class="key" data-key="${key}">${key}</div>`);
    });
  }

  // Mock function to simulate fetching tracks from server
  // In a real app, this would call your server endpoint that handles Bandcamp API auth
  function fetchTracks() {
    return new Promise((resolve) => {
      // Simulating API delay
      setTimeout(() => {
        // This is mock data - your server would get real data from Bandcamp
        const mockTracks = [
          {
            id: 1,
            title: "Funky Beat",
            artist: "DJ Cool",
            url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
            color: "#FF0000",
          },
          {
            id: 2,
            title: "Electric Dreams",
            artist: "Synth Wave",
            url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
            color: "#00FF00",
          },
          {
            id: 3,
            title: "Bass Drop",
            artist: "Dubstep Master",
            url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
            color: "#0000FF",
          },
          {
            id: 4,
            title: "Smooth Jazz",
            artist: "Saxophone King",
            url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
            color: "#FFFF00",
          },
          {
            id: 5,
            title: "Rock Anthem",
            artist: "Guitar Hero",
            url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
            color: "#FF00FF",
          },
        ];
        resolve(mockTracks);
      }, 2000);
    });
  }

  // Preload audio from API tracks
  function preloadAudioFromTracks(tracksData) {
    tracksData.forEach((track, index) => {
      const audio = new Audio();
      audio.src = track.url;
      audio.preload = "auto";
      audioCache[index] = audio;
    });
  }

  // Play random track
  function playRandomTrack(key) {
    if (tracks.length === 0) return;

    // Get random track
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const track = tracks[randomIndex];

    // Map key to audio clip
    const audioIndex = key.charCodeAt(0) % Object.keys(audioCache).length;
    const audio = audioCache[audioIndex];

    // Stop any currently playing audio
    Object.values(audioCache).forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });

    // Play the audio
    if (audio) {
      audio.currentTime = 0;
      audio.play();

      // Show track info
      $("#track-info")
        .html(
          ` <strong>${track.title}</strong><br>${track.artist}`
        )
        .css("opacity", 1);

      // Hide track info after 3 seconds
      setTimeout(() => {
        $("#track-info").css("opacity", 0);
      }, 3000);

      // Change background color
      document.body.style.backgroundColor = track.color;

      // Create particles
      createParticles(key);
    }
  }

  // Create particle effect
  function createParticles(key) {
    const keyElement = $(`.key[data-key="${key}"]`);
    const keyPos = keyElement.offset();
    const keyWidth = keyElement.width();
    const keyHeight = keyElement.height();

    // Create 10 particles
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 10 + 5;
      const x = keyPos.left + keyWidth / 2 + (Math.random() - 0.5) * 20;
      const y = keyPos.top + keyHeight / 2 + (Math.random() - 0.5) * 20;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particle = $('<div class="particle"></div>');
      $("#particles").append(particle);

      particle.css({
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: color,
        opacity: 0,
      });

      // Animate particles
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;
      const destX = x + Math.cos(angle) * speed;
      const destY = y + Math.sin(angle) * speed;

      particle.animate(
        {
          left: `${destX}px`,
          top: `${destY}px`,
          opacity: 0.8,
        },
        200,
        function () {
          $(this).animate(
            {
              opacity: 0,
            },
            800,
            function () {
              $(this).remove();
            }
          );
        }
      );
    }
  }

  // Handle keyboard events
  $(document).on("keydown", function (e) {
    const key = e.key.toUpperCase();
    if (keys.includes(key)) {
      $(`.key[data-key="${key}"]`).addClass("active");
      playRandomTrack(key);
    }
  });

  $(document).on("keyup", function (e) {
    const key = e.key.toUpperCase();
    if (keys.includes(key)) {
      $(`.key[data-key="${key}"]`).removeClass("active");
    }
  });

  // Handle click events for mobile/touch devices
  $(document).on("mousedown touchstart", ".key", function () {
    const key = $(this).data("key");
    $(this).addClass("active");
    playRandomTrack(key);
  });

  $(document).on("mouseup touchend", ".key", function () {
    $(this).removeClass("active");
  });

  // Initialize app
  async function initApp() {
    // Add background animations first
    createFloatingElements();

    // Initialize keyboard
    initializeKeyboard();

    // Fetch tracks
    try {
      tracks = await fetchTracks();

      // Now preload audio from the actual tracks (instead of separate sample files)
      preloadAudioFromTracks(tracks);

      $("#loading").fadeOut();
    } catch (error) {
      console.error("Error fetching tracks:", error);
      $("#loading").html("<p>Error loading music. Please refresh.</p>");
    }
  }

  initApp();
});
