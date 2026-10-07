/**
 * Aditya Narayan Padhi - Windows 98 / 90s Retro Portfolio
 * Interactive OS Logic, Web Audio SFX, Taskbar, & Windows Window Manager
 */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // 1. RETRO WEB AUDIO API SYNTHESIZER (No external audio files needed!)
  // --------------------------------------------------------------------------
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Play standard 90s mechanical click
  function playClickSound() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // Play Windows 98 chord chime
  function playChordSound() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.06);
        osc.stop(audioCtx.currentTime + idx * 0.06 + 0.45);
      });
    } catch (e) {}
  }

  // Play Windows Error / Critical Stop Beep
  function playErrorSound() {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  // Audio Toggle Button in System Tray
  const btnAudioToggle = document.getElementById("btn-audio-toggle");
  const audioIcon = document.getElementById("audio-icon");
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioIcon.textContent = "🔊";
        btnAudioToggle.title = "Retro Sound Effects: ON";
        playClickSound();
      } else {
        audioIcon.textContent = "🔇";
        btnAudioToggle.title = "Retro Sound Effects: OFF";
      }
    });
  }

  // Add click sound to interactive elements
  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, .desktop-icon, .menu-item, .start-menu-item, .tech-tag, a.ql-button");
    if (target) {
      playClickSound();
    }
  });

  // --------------------------------------------------------------------------
  // 2. REAL-TIME SYSTEM TRAY CLOCK
  // --------------------------------------------------------------------------
  const taskbarClock = document.getElementById("taskbar-clock");
  function updateClock() {
    if (!taskbarClock) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour is 12
    taskbarClock.textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --------------------------------------------------------------------------
  // 3. WINDOW FOCUS & MANAGER
  // --------------------------------------------------------------------------
  const allWindows = document.querySelectorAll(".win98-window");
  const taskButtons = document.querySelectorAll(".task-button");

  function setActiveWindow(windowEl) {
    if (!windowEl) return;
    allWindows.forEach((win) => {
      const titleBar = win.querySelector(".win98-title-bar");
      if (win === windowEl) {
        win.classList.add("active-window");
        if (titleBar) {
          titleBar.style.background = "linear-gradient(90deg, #000080 0%, #1084d0 100%)";
        }
      } else {
        win.classList.remove("active-window");
        if (titleBar) {
          titleBar.style.background = "linear-gradient(90deg, #808080 0%, #b5b5b5 100%)";
        }
      }
    });

    // Sync taskbar button
    taskButtons.forEach((btn) => {
      if (btn.dataset.target === windowEl.id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Click on window focuses it
  allWindows.forEach((win) => {
    win.addEventListener("mousedown", () => {
      setActiveWindow(win);
    });
  });

  // Taskbar buttons switch or toggle windows
  taskButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetWin = document.getElementById(targetId);
      if (targetWin) {
        if (targetWin.classList.contains("hidden")) {
          targetWin.classList.remove("hidden");
          setActiveWindow(targetWin);
          targetWin.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (targetWin.classList.contains("active-window")) {
          // If already active, scroll into view
          targetWin.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setActiveWindow(targetWin);
          targetWin.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  });

  // Window title bar control buttons (Minimize, Maximize, Close)
  allWindows.forEach((win) => {
    const minBtn = win.querySelector(".win-btn-minimize");
    const maxBtn = win.querySelector(".win-btn-maximize");
    const closeBtn = win.querySelector(".win-btn-close");

    if (minBtn) {
      minBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        win.classList.add("hidden");
        const correspondingTaskBtn = document.querySelector(`.task-button[data-target="${win.id}"]`);
        if (correspondingTaskBtn) {
          correspondingTaskBtn.classList.remove("active");
        }
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        win.classList.toggle("maximized-state");
        if (win.classList.contains("maximized-state")) {
          maxBtn.textContent = "❐";
          maxBtn.title = "Restore";
        } else {
          maxBtn.textContent = "□";
          maxBtn.title = "Maximize";
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playErrorSound();
        const confirmClose = window.confirm(
          `System Notice: Are you sure you wish to terminate and close this program window (${win.id})?`
        );
        if (confirmClose) {
          win.classList.add("hidden");
          const taskBtn = document.querySelector(`.task-button[data-target="${win.id}"]`);
          if (taskBtn) taskBtn.classList.remove("active");
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 4. DESKTOP ICONS SHORTCUTS
  // --------------------------------------------------------------------------
  const desktopIcons = document.querySelectorAll(".desktop-icon");
  desktopIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const targetId = icon.dataset.target;
      if (targetId) {
        const targetWin = document.getElementById(targetId);
        if (targetWin) {
          targetWin.classList.remove("hidden");
          setActiveWindow(targetWin);
          targetWin.scrollIntoView({ behavior: "smooth", block: "center" });
          playChordSound();
        }
      }
    });
  });

  // Recycle Bin Icon
  const iconRecycle = document.getElementById("icon-recycle");
  if (iconRecycle) {
    iconRecycle.addEventListener("click", () => {
      playChordSound();
      alert("Recycle Bin:\n\n0 items found.\nAll compile bugs and runtime errors have been completely purged from Aditya's repositories!");
    });
  }

  // Guestbook Icon
  const iconGuestbook = document.getElementById("icon-guestbook");
  const modalGuestbook = document.getElementById("modal-guestbook");
  if (iconGuestbook && modalGuestbook) {
    iconGuestbook.addEventListener("click", () => {
      modalGuestbook.classList.remove("hidden");
      playChordSound();
    });
  }

  // --------------------------------------------------------------------------
  // 5. START MENU LOGIC
  // --------------------------------------------------------------------------
  const btnStart = document.getElementById("btn-start");
  const startMenu = document.getElementById("start-menu");

  if (btnStart && startMenu) {
    btnStart.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = btnStart.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        startMenu.classList.add("hidden");
        btnStart.classList.remove("active");
        btnStart.setAttribute("aria-expanded", "false");
      } else {
        startMenu.classList.remove("hidden");
        btnStart.classList.add("active");
        btnStart.setAttribute("aria-expanded", "true");
        playClickSound();
      }
    });

    // Close start menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!startMenu.contains(e.target) && !btnStart.contains(e.target)) {
        startMenu.classList.add("hidden");
        btnStart.classList.remove("active");
        btnStart.setAttribute("aria-expanded", "false");
      }
    });

    // Start menu item clicks
    const startItems = startMenu.querySelectorAll(".start-menu-item");
    startItems.forEach((item) => {
      item.addEventListener("click", () => {
        const targetId = item.dataset.target;
        if (targetId) {
          const win = document.getElementById(targetId);
          if (win) {
            win.classList.remove("hidden");
            setActiveWindow(win);
            win.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        startMenu.classList.add("hidden");
        btnStart.classList.remove("active");
        btnStart.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. SHUTDOWN MODAL LOGIC
  // --------------------------------------------------------------------------
  const modalShutdown = document.getElementById("modal-shutdown");
  const btnOpenShutdown = document.getElementById("btn-shutdown-modal");
  const startItemShutdown = document.getElementById("start-item-shutdown");
  const btnCloseShutdown = document.getElementById("btn-close-shutdown");
  const btnCancelShutdown = document.getElementById("btn-shutdown-cancel");
  const btnOkShutdown = document.getElementById("btn-shutdown-ok");
  const btnHelpShutdown = document.getElementById("btn-shutdown-help");

  function openShutdownModal() {
    if (modalShutdown) {
      modalShutdown.classList.remove("hidden");
      playChordSound();
      if (startMenu) startMenu.classList.add("hidden");
      if (btnStart) btnStart.classList.remove("active");
    }
  }

  function closeShutdownModal() {
    if (modalShutdown) {
      modalShutdown.classList.add("hidden");
    }
  }

  if (btnOpenShutdown) btnOpenShutdown.addEventListener("click", openShutdownModal);
  if (startItemShutdown) startItemShutdown.addEventListener("click", openShutdownModal);
  if (btnCloseShutdown) btnCloseShutdown.addEventListener("click", closeShutdownModal);
  if (btnCancelShutdown) btnCancelShutdown.addEventListener("click", closeShutdownModal);

  if (btnOkShutdown) {
    btnOkShutdown.addEventListener("click", () => {
      const selected = document.querySelector('input[name="shutdown-option"]:checked')?.value;
      if (selected === "mail") {
        window.location.href = "mailto:adityanarayanpadhi511@gmail.com";
      } else if (selected === "restart") {
        alert("Starting MS-DOS Prompt...\nC:\\> ECHO WELCOME TO ADITYA'S CLI\nC:\\>");
        location.reload();
      } else {
        alert("System operational. Enjoy browsing Aditya Narayan Padhi's portfolio!");
      }
      closeShutdownModal();
    });
  }

  if (btnHelpShutdown) {
    btnHelpShutdown.addEventListener("click", () => {
      alert("Windows 98 Help Assistant:\n\nTo contact Aditya Narayan Padhi directly, email adityanarayanpadhi511@gmail.com or visit his GitHub and LinkedIn profiles.");
    });
  }

  // --------------------------------------------------------------------------
  // 7. RUN COMMAND MODAL LOGIC
  // --------------------------------------------------------------------------
  const modalRun = document.getElementById("modal-run");
  const startItemRun = document.getElementById("start-item-run");
  const btnCloseRun = document.getElementById("btn-close-run");
  const btnCancelRun = document.getElementById("btn-run-cancel");
  const btnOkRun = document.getElementById("btn-run-ok");
  const runInput = document.getElementById("run-command-input");
  const btnBrowseRun = document.getElementById("btn-run-browse");

  if (startItemRun && modalRun) {
    startItemRun.addEventListener("click", () => {
      modalRun.classList.remove("hidden");
      playChordSound();
      if (runInput) runInput.focus();
    });
  }

  if (btnCloseRun && modalRun) btnCloseRun.addEventListener("click", () => modalRun.classList.add("hidden"));
  if (btnCancelRun && modalRun) btnCancelRun.addEventListener("click", () => modalRun.classList.add("hidden"));

  function handleRunExecution() {
    if (!runInput) return;
    const cmd = runInput.value.trim().toLowerCase();
    modalRun.classList.add("hidden");
    if (cmd === "github") {
      window.open("https://github.com/AdityaNarayanPadhi", "_blank");
    } else if (cmd === "linkedin") {
      window.open("https://www.linkedin.com/in/adityanarayanpadhi", "_blank");
    } else if (cmd === "email" || cmd === "mail") {
      window.location.href = "mailto:adityanarayanpadhi511@gmail.com";
    } else if (cmd === "education" || cmd === "education.txt") {
      const win = document.getElementById("window-education");
      if (win) { win.classList.remove("hidden"); setActiveWindow(win); win.scrollIntoView({ behavior: "smooth" }); }
    } else if (cmd === "control panel" || cmd === "cpl") {
      const win = document.getElementById("window-techstack");
      if (win) { win.classList.remove("hidden"); setActiveWindow(win); win.scrollIntoView({ behavior: "smooth" }); }
    } else {
      alert(`Executed command: "${cmd}". Operation completed successfully.`);
    }
  }

  if (btnOkRun) btnOkRun.addEventListener("click", handleRunExecution);
  if (runInput) {
    runInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleRunExecution();
    });
  }
  if (btnBrowseRun) {
    btnBrowseRun.addEventListener("click", () => {
      alert("Available commands: github, linkedin, email, education, control panel");
    });
  }

  // --------------------------------------------------------------------------
  // 8. GUESTBOOK MODAL LOGIC
  // --------------------------------------------------------------------------
  const btnCloseGuestbook = document.getElementById("btn-close-guestbook");
  const btnCancelGuestbook = document.getElementById("btn-cancel-guestbook");
  const guestbookForm = document.getElementById("guestbook-form");

  if (btnCloseGuestbook && modalGuestbook) {
    btnCloseGuestbook.addEventListener("click", () => modalGuestbook.classList.add("hidden"));
  }
  if (btnCancelGuestbook && modalGuestbook) {
    btnCancelGuestbook.addEventListener("click", () => modalGuestbook.classList.add("hidden"));
  }

  if (guestbookForm) {
    guestbookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const guestName = document.getElementById("guest-name")?.value || "Friend";
      playChordSound();
      alert(`Transmission Received!\n\nThank you, ${guestName}! Your message has been logged in Aditya's guestbook registry.`);
      guestbookForm.reset();
      modalGuestbook.classList.add("hidden");
    });
  }

  // --------------------------------------------------------------------------
  // 9. VISITOR COUNTER LOGIC
  // --------------------------------------------------------------------------
  const counterLastDigit = document.getElementById("counter-last-digit");
  try {
    let visitCount = localStorage.getItem("anp_visitor_count");
    if (!visitCount) {
      visitCount = 14829;
    } else {
      visitCount = parseInt(visitCount, 10) + 1;
    }
    localStorage.setItem("anp_visitor_count", visitCount);

    const formatted = String(visitCount).padStart(8, "0");
    const container = document.getElementById("visitor-counter");
    if (container) {
      container.innerHTML = formatted
        .split("")
        .map((digit) => `<span class="counter-num">${digit}</span>`)
        .join("");
    }
  } catch (err) {
    // LocalStorage restricted; default 00014829 is already displayed
  }
});
