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

  // Freesound API token
  const freesoundToken = "yR6kFfp6Pas3OkMMco2wasasoz6kwwskGekKPknS";
  
  // Cache for audio clips
  const audioCache = {};
  // Tracks data from Freesound
  let tracks = [];
  // Track which sound was last played for each key
  const keyLastPlayed = {};

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

  // Fetch tracks from Freesound API
  async function fetchTracks() {
    try {
      // Fetch guitar sounds instead of bass drum
      const guitarResponse = await $.ajax({
        url: "https://freesound.org/apiv2/search/text/",
        method: "GET",
        data: {
          query: "guitar chord",
          token: freesoundToken,
          fields: "id,name,username,previews",
          page_size: 15,
          filter: "duration:[0 TO 3]" // Sounds up to 3 seconds
        }
      });

      // Process guitar results
      const guitarTracks = guitarResponse.results.map((sound, index) => {
        return {
          id: sound.id,
          title: sound.name,
          artist: sound.username,
          url: sound.previews["preview-lq-mp3"], // Low quality preview URL
          color: colors[index % colors.length],
          type: "guitar"
        };
      });

      // Fetch piano sounds
      const pianoResponse = await $.ajax({
        url: "https://freesound.org/apiv2/search/text/",
        method: "GET",
        data: {
          query: "piano note",
          token: freesoundToken,
          fields: "id,name,username,previews",
          page_size: 10,
          filter: "duration:[0 TO 3]" // Sounds up to 3 seconds
        }
      });

      // Process piano results
      const pianoTracks = pianoResponse.results.map((sound, index) => {
        return {
          id: sound.id,
          title: sound.name,
          artist: sound.username,
          url: sound.previews["preview-lq-mp3"], // Low quality preview URL
          color: colors[(index + 5) % colors.length],
          type: "piano"
        };
      });

      // Fetch synth sounds for more variety
      const synthResponse = await $.ajax({
        url: "https://freesound.org/apiv2/search/text/",
        method: "GET",
        data: {
          query: "synth",
          token: freesoundToken,
          fields: "id,name,username,previews",
          page_size: 10,
          filter: "duration:[0 TO 3]" // Sounds up to 3 seconds
        }
      });

      // Process synth results
      const synthTracks = synthResponse.results.map((sound, index) => {
        return {
          id: sound.id,
          title: sound.name,
          artist: sound.username,
          url: sound.previews["preview-lq-mp3"], // Low quality preview URL
          color: colors[(index + 10) % colors.length],
          type: "synth"
        };
      });

      // Combine all sounds
      const allTracks = [...guitarTracks, ...pianoTracks, ...synthTracks];
      
      console.log(`Loaded ${allTracks.length} sounds from Freesound API`);
      return allTracks;
    } catch (error) {
      console.error("Error fetching from Freesound API:", error);
      // Fall back to sample tracks if API fails
      return getSampleTracks();
    }
  }

  // Fallback function for sample tracks
  function getSampleTracks() {
    console.log("Using fallback sample tracks");
    return [
      {
        id: 1,
        title: "Guitar Chord A",
        artist: "Guitar Master",
        url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
        color: "#FF0000",
        type: "guitar"
      },
      {
        id: 2,
        title: "Electric Guitar Riff",
        artist: "Rock Star",
        url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
        color: "#00FF00",
        type: "guitar"
      },
      {
        id: 3,
        title: "Acoustic Strum",
        artist: "Folk Artist",
        url: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
        color: "#0000FF",
        type: "guitar"
      },
      {
        id: 4,
        title: "Smooth Jazz Piano",
        artist: "Piano Master",
        url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
        color: "#FFFF00",
        type: "piano"
      },
      {
        id: 5,
        title: "Synth Lead",
        artist: "Electronic Producer",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
        color: "#FF00FF",
        type: "synth"
      },
    ];
  }

  // Group tracks by type (guitar, piano, synth)
  function groupTracksByType(tracksData) {
    const grouped = {};
    
    tracksData.forEach(track => {
      if (!grouped[track.type]) {
        grouped[track.type] = [];
      }
      grouped[track.type].push(track);
    });
    
    return grouped;
  }

  // Preload audio from API tracks
  function preloadAudioFromTracks(tracksData) {
    tracksData.forEach((track, index) => {
      const audio = new Audio();
      audio.src = track.url;
      audio.preload = "auto";
      audioCache[index] = {
        audio: audio,
        track: track
      };
      
      // Handle loading errors
      audio.onerror = function() {
        console.error(`Error loading audio for track: ${track.title}`);
        // Remove from cache if loading fails
        delete audioCache[index];
      };
    });
  }

  // Play track for a key without repeating the same sound
  function playTrackForKey(key) {
    if (tracks.length === 0) return;

    // Group tracks by type
    const groupedTracks = groupTracksByType(tracks);
    
    // Assign instrument groups to different keyboard rows
    const keyRow = getKeyboardRow(key);
    let trackType;
    
    if (keyRow === 0) {
      trackType = "guitar"; // Top row (QWERTYUIOP) plays guitar
    } else if (keyRow === 1) {
      trackType = "piano";  // Middle row (ASDFGHJKL) plays piano
    } else {
      trackType = "synth";  // Bottom row (ZXCVBNM) plays synth
    }
    
    // Fall back to any sound if the preferred type isn't available
    const availableTracks = groupedTracks[trackType] || tracks;
    
    if (availableTracks.length === 0) return;
    
    // Get the index of the last played track for this key
    const lastIndex = keyLastPlayed[key] || -1;
    
    // Choose a new index different from the last one
    let newIndex;
    if (availableTracks.length === 1) {
      newIndex = 0;
    } else {
      do {
        newIndex = Math.floor(Math.random() * availableTracks.length);
      } while (newIndex === lastIndex && availableTracks.length > 1);
    }
    
    // Update the last played track for this key
    keyLastPlayed[key] = newIndex;
    
    const track = availableTracks[newIndex];
    
    // Find the audio in the cache that corresponds to this track
    let audio = null;
    let trackIndex = -1;
    
    for (let i = 0; i < Object.keys(audioCache).length; i++) {
      if (audioCache[i] && audioCache[i].track.id === track.id) {
        audio = audioCache[i].audio;
        trackIndex = i;
        break;
      }
    }
    
    // If we found the audio, play it
    if (audio) {
      // Stop any currently playing audio
      Object.values(audioCache).forEach((a) => {
        if (a && a.audio) {
          a.audio.pause();
          a.audio.currentTime = 0;
        }
      });

      // Play the audio
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        // Handle autoplay restrictions
        $("#track-info").html(
          `<strong>Click to enable audio</strong><br>Browser requires user interaction`
        ).css("opacity", 1);
      });

      // Show track info
      $("#track-info")
        .html(
          `<strong>${track.title}</strong><br>${track.artist} (${track.type})`
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
  
  // Get keyboard row for a key
  function getKeyboardRow(key) {
    const topRow = "QWERTYUIOP";
    const middleRow = "ASDFGHJKL";
    const bottomRow = "ZXCVBNM";
    
    if (topRow.includes(key)) return 0;
    if (middleRow.includes(key)) return 1;
    if (bottomRow.includes(key)) return 2;
    return 0;
  }

  // Create particle effect
  function createParticles(key) {
    const keyElement = $(`.key[data-key="${key}"]`);
    const keyPos = keyElement.offset();
    const keyWidth = keyElement.width();
    const keyHeight = keyElement.height();

    // Create 15 particles
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
      playTrackForKey(key);
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
    playTrackForKey(key);
  });

  $(document).on("mouseup touchend", ".key", function () {
    $(this).removeClass("active");
  });

  // Add click anywhere to enable audio (for browsers with autoplay restrictions)
  $(document).on("click", function() {
    // Create a silent audio element and play it to enable future audio
    const enableAudio = new Audio();
    enableAudio.play().catch(err => {});
  });

  // Initialize app
  async function initApp() {
    // Add background animations first
    createFloatingElements();

    // Initialize keyboard
    initializeKeyboard();

    // Fetch tracks
    try {
      $("#loading").html("<p>Connecting to Freesound API...</p>");
      tracks = await fetchTracks();

      // Now preload audio from the tracks
      preloadAudioFromTracks(tracks);

      $("#loading").fadeOut();
    } catch (error) {
      console.error("Error initializing app:", error);
      $("#loading").html("<p>Error loading sounds. Please refresh.</p>");
    }
  }

  initApp();
});