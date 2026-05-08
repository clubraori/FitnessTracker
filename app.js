(function () {
  const STORAGE_KEY = "blockkeeper-fitness-tracker-v1";
  const CLOUD_CONFIG_KEY = "blockkeeper-cloud-config-v1";
  const APP_VERSION = 2;
  const DEFAULT_SESSION_MINUTES = 40;
  const DEFAULT_BODY_WEIGHT = "82.5";
  const HISTORY_WINDOW_DAYS = 30;
  const CLOUD_SYNC_DEBOUNCE_MS = 1800;

  const VIEW_OPTIONS = [
    { id: "today", label: "Today" },
    { id: "history", label: "History" },
    { id: "checkins", label: "Check-Ins" },
    { id: "insights", label: "Insights" }
  ];

  const WEATHER_CODE_LABELS = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm"
  };

  const LEGACY_DAY_MAP = {
    "upper-push": {
      offset: 0,
      title: "Upper Body Push + Cardio",
      focusTags: ["push", "chest", "shoulders", "triceps"]
    },
    "lower-body": {
      offset: 1,
      title: "Lower Body + Cardio",
      focusTags: ["lower", "quads", "hamstrings", "glutes"]
    },
    "pull-day": {
      offset: 3,
      title: "Pull Day + Cardio",
      focusTags: ["pull", "back", "biceps"]
    },
    "full-body": {
      offset: 4,
      title: "Full Body Strength + Cardio",
      focusTags: ["full-body", "push", "pull", "lower"]
    },
    conditioning: {
      offset: 5,
      title: "Conditioning Strength + Longer Cardio",
      focusTags: ["conditioning", "conditioning-strength", "core"]
    }
  };

  const EXERCISE_POOLS = {
    pushMain: [
      { id: "barbell-bench-press", name: "Barbell Bench Press", starterMultiplier: 0.58, increment: 2.5, progressionMode: "load-first", tags: ["push", "chest"] },
      { id: "dumbbell-bench-press", name: "Dumbbell Bench Press", starterMultiplier: 0.5, increment: 2, progressionMode: "load-first", tags: ["push", "chest"] },
      { id: "machine-chest-press", name: "Machine Chest Press", starterMultiplier: 0.62, increment: 2.5, progressionMode: "load-first", tags: ["push", "chest"] },
      { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", starterMultiplier: 0.42, increment: 2, progressionMode: "load-first", tags: ["push", "upper-chest"] }
    ],
    shoulderPress: [
      { id: "standing-dumbbell-press", name: "Standing Dumbbell Press", starterMultiplier: 0.32, increment: 1, progressionMode: "load-first", tags: ["push", "shoulders"] },
      { id: "machine-shoulder-press", name: "Machine Shoulder Press", starterMultiplier: 0.4, increment: 2, progressionMode: "load-first", tags: ["push", "shoulders"] },
      { id: "arnold-press", name: "Arnold Press", starterMultiplier: 0.28, increment: 1, progressionMode: "reps-first", tags: ["push", "shoulders"] }
    ],
    chestAccessory: [
      { id: "cable-fly", name: "Cable Fly", starterMultiplier: 0.18, increment: 2.5, progressionMode: "reps-first", tags: ["push", "chest"] },
      { id: "push-ups", name: "Push-Ups", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["push", "chest"], bodyweight: true },
      { id: "machine-incline-press", name: "Machine Incline Press", starterMultiplier: 0.5, increment: 2.5, progressionMode: "load-first", tags: ["push", "chest"] }
    ],
    triceps: [
      { id: "rope-pushdown", name: "Rope Pushdown", starterMultiplier: 0.24, increment: 2.5, progressionMode: "reps-first", tags: ["triceps"] },
      { id: "overhead-tricep-extension", name: "Overhead Tricep Extension", starterMultiplier: 0.16, increment: 1, progressionMode: "reps-first", tags: ["triceps"] },
      { id: "close-grip-push-up", name: "Close-Grip Push-Up", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["triceps"], bodyweight: true }
    ],
    lateralDelts: [
      { id: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", starterMultiplier: 0.1, increment: 1, progressionMode: "reps-first", tags: ["shoulders"] },
      { id: "cable-lateral-raise", name: "Cable Lateral Raise", starterMultiplier: 0.12, increment: 1, progressionMode: "reps-first", tags: ["shoulders"] },
      { id: "lean-away-lateral-raise", name: "Lean-Away Lateral Raise", starterMultiplier: 0.08, increment: 1, progressionMode: "reps-first", tags: ["shoulders"] }
    ],
    pullMain: [
      { id: "lat-pulldown", name: "Lat Pulldown", starterMultiplier: 0.66, increment: 2.5, progressionMode: "load-first", tags: ["pull", "back"] },
      { id: "assisted-pull-up", name: "Assisted Pull-Up", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["pull", "back"], bodyweight: true },
      { id: "chest-supported-row", name: "Chest-Supported Row", starterMultiplier: 0.56, increment: 2.5, progressionMode: "load-first", tags: ["pull", "back"] },
      { id: "seated-cable-row", name: "Seated Cable Row", starterMultiplier: 0.62, increment: 2.5, progressionMode: "load-first", tags: ["pull", "back"] }
    ],
    pullAccessory: [
      { id: "single-arm-dumbbell-row", name: "Single-Arm Dumbbell Row", starterMultiplier: 0.42, increment: 2.5, progressionMode: "load-first", tags: ["pull", "back"] },
      { id: "machine-row", name: "Machine Row", starterMultiplier: 0.58, increment: 2.5, progressionMode: "load-first", tags: ["pull", "back"] },
      { id: "cable-row", name: "Cable Row", starterMultiplier: 0.54, increment: 2.5, progressionMode: "reps-first", tags: ["pull", "back"] }
    ],
    rearDelts: [
      { id: "face-pull", name: "Face Pull", starterMultiplier: 0.2, increment: 2.5, progressionMode: "reps-first", tags: ["shoulders", "pull"] },
      { id: "rear-delt-fly", name: "Rear Delt Fly", starterMultiplier: 0.12, increment: 1, progressionMode: "reps-first", tags: ["shoulders", "pull"] },
      { id: "reverse-pec-deck", name: "Reverse Pec Deck", starterMultiplier: 0.22, increment: 2.5, progressionMode: "reps-first", tags: ["shoulders", "pull"] }
    ],
    biceps: [
      { id: "hammer-curl", name: "Hammer Curl", starterMultiplier: 0.16, increment: 1, progressionMode: "reps-first", tags: ["biceps"] },
      { id: "incline-dumbbell-curl", name: "Incline Dumbbell Curl", starterMultiplier: 0.14, increment: 1, progressionMode: "reps-first", tags: ["biceps"] },
      { id: "cable-curl", name: "Cable Curl", starterMultiplier: 0.18, increment: 2.5, progressionMode: "reps-first", tags: ["biceps"] }
    ],
    squatMain: [
      { id: "back-squat", name: "Back Squat", starterMultiplier: 0.85, increment: 5, progressionMode: "load-first", tags: ["lower", "quads"] },
      { id: "leg-press", name: "Leg Press", starterMultiplier: 1.25, increment: 10, progressionMode: "load-first", tags: ["lower", "quads"] },
      { id: "front-squat", name: "Front Squat", starterMultiplier: 0.68, increment: 5, progressionMode: "load-first", tags: ["lower", "quads"] }
    ],
    hingeMain: [
      { id: "romanian-deadlift", name: "Romanian Deadlift", starterMultiplier: 0.78, increment: 5, progressionMode: "load-first", tags: ["lower", "hamstrings"] },
      { id: "trap-bar-deadlift", name: "Trap Bar Deadlift", starterMultiplier: 1, increment: 5, progressionMode: "load-first", tags: ["lower", "posterior"] },
      { id: "barbell-hip-thrust", name: "Barbell Hip Thrust", starterMultiplier: 0.9, increment: 5, progressionMode: "load-first", tags: ["lower", "glutes"] }
    ],
    unilateralLower: [
      { id: "walking-lunge", name: "Walking Lunge", starterMultiplier: 0.34, increment: 2.5, progressionMode: "load-first", tags: ["lower", "unilateral"] },
      { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", starterMultiplier: 0.28, increment: 2.5, progressionMode: "load-first", tags: ["lower", "unilateral"] },
      { id: "step-up", name: "Step-Up", starterMultiplier: 0.3, increment: 2.5, progressionMode: "load-first", tags: ["lower", "unilateral"] }
    ],
    hamstrings: [
      { id: "seated-leg-curl", name: "Seated Leg Curl", starterMultiplier: 0.36, increment: 2.5, progressionMode: "load-first", tags: ["lower", "hamstrings"] },
      { id: "lying-leg-curl", name: "Lying Leg Curl", starterMultiplier: 0.34, increment: 2.5, progressionMode: "load-first", tags: ["lower", "hamstrings"] },
      { id: "glute-ham-raise", name: "Glute Ham Raise", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["lower", "hamstrings"], bodyweight: true }
    ],
    calves: [
      { id: "standing-calf-raise", name: "Standing Calf Raise", starterMultiplier: 0.5, increment: 5, progressionMode: "reps-first", tags: ["lower", "calves"] },
      { id: "seated-calf-raise", name: "Seated Calf Raise", starterMultiplier: 0.36, increment: 2.5, progressionMode: "reps-first", tags: ["lower", "calves"] }
    ],
    core: [
      { id: "plank", name: "Plank", starterMultiplier: null, increment: 0, progressionMode: "time", tags: ["core"], measure: "seconds" },
      { id: "dead-bug", name: "Dead Bug", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["core"], bodyweight: true },
      { id: "hanging-knee-raise", name: "Hanging Knee Raise", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["core"], bodyweight: true },
      { id: "pallof-press", name: "Pallof Press", starterMultiplier: 0.12, increment: 1, progressionMode: "reps-first", tags: ["core"] }
    ],
    conditioningCircuit: [
      { id: "kettlebell-swing", name: "Kettlebell Swing", starterMultiplier: 0.34, increment: 2.5, progressionMode: "reps-first", tags: ["conditioning", "posterior"] },
      { id: "bodyweight-squat", name: "Bodyweight Squat", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["conditioning"], bodyweight: true },
      { id: "push-up", name: "Push-Up", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["conditioning", "push"], bodyweight: true },
      { id: "trx-row", name: "TRX Row", starterMultiplier: null, increment: 0, progressionMode: "reps-first", tags: ["conditioning", "pull"], bodyweight: true },
      { id: "farmer-carry", name: "Farmer Carry", starterMultiplier: 0.4, increment: 2.5, progressionMode: "distance", tags: ["conditioning", "grip"] }
    ]
  };

  const WORKOUT_TEMPLATES = [
    {
      id: "push-shoulders",
      title: "Push + Shoulders",
      subtitle: "Pressing first, delts and triceps after, then an easy cardio finish.",
      focusTags: ["push", "chest", "shoulders", "triceps"],
      slots: [
        { pool: "pushMain", sets: 3, repRange: [6, 8], restSeconds: 90 },
        { pool: "shoulderPress", sets: 3, repRange: [8, 10], restSeconds: 75 },
        { pool: "chestAccessory", sets: 2, repRange: [10, 12], restSeconds: 60 },
        { pool: "lateralDelts", sets: 2, repRange: [12, 15], restSeconds: 45 },
        { pool: "triceps", sets: 2, repRange: [12, 15], restSeconds: 45 }
      ],
      finisher: {
        title: "Steady-state finish",
        note: "Incline walk, bike, or cross trainer. Keep it conversational.",
        modes: ["Incline walk", "Bike", "Cross trainer"],
        minutes: [10, 14]
      }
    },
    {
      id: "pull-biceps",
      title: "Pull + Biceps",
      subtitle: "Back gets first priority, then rear delts and curls, then a moderate cardio finish.",
      focusTags: ["pull", "back", "biceps", "shoulders"],
      slots: [
        { pool: "pullMain", sets: 3, repRange: [6, 8], restSeconds: 90 },
        { pool: "pullMain", sets: 3, repRange: [8, 10], restSeconds: 75, avoidDuplicatePoolPick: true },
        { pool: "pullAccessory", sets: 2, repRange: [10, 12], restSeconds: 60 },
        { pool: "rearDelts", sets: 2, repRange: [12, 15], restSeconds: 45 },
        { pool: "biceps", sets: 2, repRange: [10, 12], restSeconds: 45 }
      ],
      finisher: {
        title: "Steady-state finish",
        note: "Cross trainer, incline walk, or bike.",
        modes: ["Cross trainer", "Incline walk", "Bike"],
        minutes: [12, 15]
      }
    },
    {
      id: "lower-posterior",
      title: "Lower + Posterior Chain",
      subtitle: "Big lower-body effort, then unilateral work and a controlled cardio finish.",
      focusTags: ["lower", "quads", "hamstrings", "glutes"],
      slots: [
        { pool: "squatMain", sets: 3, repRange: [6, 8], restSeconds: 90 },
        { pool: "hingeMain", sets: 3, repRange: [8, 10], restSeconds: 90 },
        { pool: "unilateralLower", sets: 2, repRange: [10, 10], restSeconds: 60, note: "Target reps are per leg." },
        { pool: "hamstrings", sets: 2, repRange: [12, 12], restSeconds: 45 },
        { pool: "calves", sets: 2, repRange: [12, 15], restSeconds: 45 }
      ],
      finisher: {
        title: "Leg-friendly cardio",
        note: "Bike or incline walk. Stay below a soul-crushing effort.",
        modes: ["Bike", "Incline walk"],
        minutes: [10, 12]
      }
    },
    {
      id: "shoulders-arms",
      title: "Shoulders + Arms",
      subtitle: "A slightly lighter day that still feels productive and keeps the variety up.",
      focusTags: ["shoulders", "triceps", "biceps", "push"],
      slots: [
        { pool: "shoulderPress", sets: 3, repRange: [8, 10], restSeconds: 75 },
        { pool: "lateralDelts", sets: 3, repRange: [12, 15], restSeconds: 45 },
        { pool: "rearDelts", sets: 2, repRange: [12, 15], restSeconds: 45 },
        { pool: "triceps", sets: 2, repRange: [12, 15], restSeconds: 45 },
        { pool: "biceps", sets: 2, repRange: [12, 15], restSeconds: 45 }
      ],
      finisher: {
        title: "Cardio reset",
        note: "Cross trainer or brisk incline walk.",
        modes: ["Cross trainer", "Incline walk"],
        minutes: [12, 15]
      }
    },
    {
      id: "full-body-flow",
      title: "Full Body Flow",
      subtitle: "A balanced day when you need to touch everything without overcooking one area.",
      focusTags: ["full-body", "push", "pull", "lower", "core"],
      slots: [
        { pool: "hingeMain", sets: 3, repRange: [5, 8], restSeconds: 90 },
        { pool: "pushMain", sets: 3, repRange: [8, 10], restSeconds: 75 },
        { pool: "pullMain", sets: 2, repRange: [8, 10], restSeconds: 75 },
        { pool: "unilateralLower", sets: 2, repRange: [10, 10], restSeconds: 60, note: "Target reps are per leg." },
        { pool: "core", sets: 2, repRange: [30, 45], restSeconds: 45 }
      ],
      finisher: {
        title: "Moderate cardio",
        note: "Any steady-state machine you don't mind doing for 10 to 12 minutes.",
        modes: ["Incline walk", "Bike", "Cross trainer", "Rower"],
        minutes: [10, 12]
      }
    },
    {
      id: "conditioning-circuit",
      title: "Conditioning Circuit",
      subtitle: "A lighter strength day with movement, pace, and a slightly longer finish.",
      focusTags: ["conditioning", "core", "full-body"],
      slots: [
        { pool: "conditioningCircuit", sets: 3, repRange: [12, 12], restSeconds: 75 },
        { pool: "conditioningCircuit", sets: 3, repRange: [10, 12], restSeconds: 75, avoidDuplicatePoolPick: true },
        { pool: "conditioningCircuit", sets: 3, repRange: [10, 12], restSeconds: 75, avoidDuplicatePoolPick: true },
        { pool: "conditioningCircuit", sets: 3, repRange: [10, 10], restSeconds: 75, avoidDuplicatePoolPick: true, note: "If this is a lunge or split movement, target reps are per leg." },
        { pool: "core", sets: 3, repRange: [10, 12], restSeconds: 60 }
      ],
      finisher: {
        title: "Longer steady-state block",
        note: "Take the easier option and stay moving.",
        modes: ["Incline walk", "Bike", "Cross trainer"],
        minutes: [15, 18]
      }
    }
  ];

  const dom = {
    bodyWeight: document.getElementById("body-weight"),
    sessionLength: document.getElementById("session-length"),
    weatherPanel: document.getElementById("weather-panel"),
    syncPanel: document.getElementById("sync-panel"),
    importDataFile: document.getElementById("import-data-file"),
    summaryCards: document.getElementById("summary-cards"),
    viewSwitcher: document.getElementById("view-switcher"),
    viewRoot: document.getElementById("view-root"),
    timerDock: document.getElementById("timer-dock")
  };

  let state = createDefaultState();
  let cloudConfig = loadCloudConfig();
  let storageWarning = "";
  let timerIntervalId = null;
  let cloudSyncTimeoutId = null;
  let cloudSyncInFlight = false;
  let supabaseClient = null;
  let authSubscription = null;
  let weatherState = {
    status: "idle",
    summary: "",
    forecast: null,
    error: ""
  };
  let cloudState = createDefaultCloudState();

  init();

  function init() {
    state = loadState();
    hydrateState();
    ensureTodaySession();
    attachEvents();
    initCloud();
    renderApp();
    startTimerTicker();
    registerServiceWorker();
    refreshWeather();
  }

  function attachEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
  }

  async function handleClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const action = target.dataset.action;

    if (action === "switch-view") {
      state.ui.activeView = target.dataset.view || "today";
      if (state.ui.activeView === "checkins") {
        ensureCheckinDraft(state.ui.checkinDraft.date || getTodayISODate());
      }
      persistAndRender(false);
      return;
    }

    if (action === "reset-data") {
      const confirmed = window.confirm(
        "Reset the adaptive tracker? This clears generated sessions, logs, check-ins, and saved photos from this browser."
      );
      if (!confirmed) {
        return;
      }
      state = createDefaultState();
      hydrateState();
      ensureTodaySession();
      persistAndRender(true);
      return;
    }

    if (action === "export-data") {
      exportBackup();
      return;
    }

    if (action === "trigger-import") {
      dom.importDataFile.value = "";
      dom.importDataFile.click();
      return;
    }

    if (action === "regenerate-today") {
      regenerateTodaySession();
      return;
    }

    if (action === "open-today") {
      state.ui.activeView = "today";
      persistAndRender(false);
      return;
    }

    if (action === "enable-weather") {
      requestWeatherLocation();
      return;
    }

    if (action === "refresh-weather") {
      refreshWeather(true);
      return;
    }

    if (action === "go-to-checkin") {
      state.ui.activeView = "checkins";
      ensureCheckinDraft(target.dataset.date || getTodayISODate());
      persistAndRender(false);
      return;
    }

    if (action === "save-checkin") {
      saveCheckinDraft();
      return;
    }

    if (action === "edit-checkin") {
      ensureCheckinDraft(target.dataset.date);
      state.ui.activeView = "checkins";
      persistAndRender(false);
      return;
    }

    if (action === "clear-checkin-photo") {
      state.ui.checkinDraft.photoDataUrl = "";
      state.ui.checkinDraft.photoName = "";
      state.ui.checkinDraft.photoUpdatedAt = "";
      persistAndRender(false);
      return;
    }

    if (action === "swap-outdoor") {
      swapTodayForOutdoor(target.dataset.suggestionId);
      return;
    }

    if (action === "delete-weighin") {
      const date = target.dataset.date;
      state.weighIns = state.weighIns.filter((entry) => entry.date !== date);
      updateProfileWeightFromLatest();
      persistAndRender(true);
      return;
    }

    if (action === "toggle-timer") {
      state.ui.timerCollapsed = !state.ui.timerCollapsed;
      persistAndRender(false);
      return;
    }

    if (action === "cloud-connect") {
      initCloud(true);
      renderApp();
      return;
    }

    if (action === "cloud-send-link") {
      await sendCloudMagicLink();
      return;
    }

    if (action === "cloud-sync-now") {
      await syncStateToCloud(true);
      return;
    }

    if (action === "cloud-pull") {
      await pullStateFromCloud(true);
      return;
    }

    if (action === "cloud-sign-out") {
      await signOutCloud();
      return;
    }

    if (action === "cloud-clear-config") {
      const confirmed = window.confirm("Clear the saved cloud sync settings on this device?");
      if (!confirmed) {
        return;
      }
      await clearCloudConfig();
      return;
    }

    if (action === "timer-control") {
      handleTimerControl(target.dataset.control);
    }
  }

  async function handleChange(event) {
    const target = event.target;

    if (target === dom.bodyWeight) {
      state.profile.bodyWeightKg = target.value;
      persistAndRender(true);
      return;
    }

    if (target === dom.sessionLength) {
      state.profile.sessionLength = clampNumber(asNumber(target.value) || DEFAULT_SESSION_MINUTES, 30, 60);
      persistAndRender(true);
      return;
    }

    if (target.dataset.kind === "cloud-config-field") {
      cloudConfig[target.dataset.field] = target.value.trim();
      saveCloudConfig();
      renderCloudPanel();
      return;
    }

    if (target.dataset.kind === "today-weight") {
      upsertWeighIn(getTodayISODate(), target.value);
      updateProfileWeightFromLatest();
      persistAndRender(true);
      return;
    }

    if (target.dataset.kind === "set-field") {
      const session = getSession(target.dataset.date);
      if (!session || session.planType !== "strength") {
        return;
      }

      const exerciseIndex = Number(target.dataset.exerciseIndex);
      const setIndex = Number(target.dataset.setIndex);
      const field = target.dataset.field;
      const set = session.exercises[exerciseIndex].sets[setIndex];
      const wasCompleted = Boolean(set.completed);
      set[field] = target.type === "checkbox" ? target.checked : target.value;

      if (field === "completed" && target.checked && !wasCompleted) {
        startRestTimer(session.exercises[exerciseIndex].restSeconds, `${session.exercises[exerciseIndex].name} • rest`);
      }

      persistAndRender(true);
      return;
    }

    if (target.dataset.kind === "session-note") {
      const session = getSession(target.dataset.date);
      if (!session) {
        return;
      }
      session.notes = target.value;
      saveState(true);
      return;
    }

    if (target.dataset.kind === "finisher-field") {
      const session = getSession(target.dataset.date);
      if (!session || !session.finisher) {
        return;
      }
      const field = target.dataset.field;
      session.finisher[field] = target.type === "checkbox" ? target.checked : target.value;
      persistAndRender(true);
      return;
    }

    if (target.dataset.kind === "outdoor-field") {
      const session = getSession(target.dataset.date);
      if (!session || session.planType !== "outdoor") {
        return;
      }
      const field = target.dataset.field;
      session.outdoorLog[field] = target.type === "checkbox" ? target.checked : target.value;
      persistAndRender(true);
      return;
    }

    if (target.dataset.kind === "checkin-draft") {
      const field = target.dataset.field;
      state.ui.checkinDraft[field] = target.value;
      saveState(false);
      return;
    }

    if (target.dataset.kind === "checkin-photo-upload") {
      const file = target.files && target.files[0];
      if (!file) {
        return;
      }
      const dataUrl = await compressImage(file);
      state.ui.checkinDraft.photoDataUrl = dataUrl;
      state.ui.checkinDraft.photoName = file.name;
      state.ui.checkinDraft.photoUpdatedAt = new Date().toISOString();
      persistAndRender(false);
      return;
    }

    if (target === dom.importDataFile) {
      const file = target.files && target.files[0];
      if (!file) {
        return;
      }
      await importBackup(file);
    }
  }

  function createDefaultState() {
    return {
      version: APP_VERSION,
      profile: {
        bodyWeightKg: DEFAULT_BODY_WEIGHT,
        sessionLength: DEFAULT_SESSION_MINUTES,
        location: null
      },
      sessionsByDate: {},
      weighIns: [],
      checkins: [],
      timer: null,
      ui: {
        activeView: "today",
        checkinDraft: createEmptyCheckinDraft(getTodayISODate()),
        timerCollapsed: false
      }
    };
  }

  function createEmptyCheckinDraft(date) {
    return {
      date,
      bodyWeightKg: "",
      waistCm: "",
      energy: "",
      reflection: "",
      photoDataUrl: "",
      photoName: "",
      photoUpdatedAt: ""
    };
  }

  function createDefaultCloudState() {
    const configured = isCloudConfigured();
    return {
      status: configured ? "configured" : "local-only",
      message: configured
        ? "Sync is configured on this device. Sign in with your email to start sharing data between devices."
        : "Still local only. Add a Supabase project when you want phone and laptop data to stay in sync.",
      user: null,
      session: null,
      pending: false,
      error: "",
      lastSyncedAt: "",
      remoteAvailable: false,
      libraryReady: Boolean(window.supabase && typeof window.supabase.createClient === "function")
    };
  }

  function hydrateState() {
    state.version = APP_VERSION;
    state.profile = {
      bodyWeightKg: DEFAULT_BODY_WEIGHT,
      sessionLength: DEFAULT_SESSION_MINUTES,
      location: null,
      ...(state.profile || {})
    };
    state.sessionsByDate = normaliseSessions(state.sessionsByDate || {});
    state.weighIns = Array.isArray(state.weighIns) ? dedupeByDate(state.weighIns) : [];
    state.checkins = Array.isArray(state.checkins) ? [...state.checkins].sort((a, b) => a.date.localeCompare(b.date)) : [];
    state.timer = normaliseTimer(state.timer);
    state.ui = {
      activeView: "today",
      checkinDraft: createEmptyCheckinDraft(getTodayISODate()),
      timerCollapsed: false,
      ...(state.ui || {})
    };
    if (!VIEW_OPTIONS.some((view) => view.id === state.ui.activeView)) {
      state.ui.activeView = "today";
    }
    ensureCheckinDraft(state.ui.checkinDraft && state.ui.checkinDraft.date ? state.ui.checkinDraft.date : getTodayISODate());
    updateProfileWeightFromLatest();
    saveState(false);
  }

  function normaliseSessions(sessionsByDate) {
    const normalised = {};
    for (const [date, session] of Object.entries(sessionsByDate)) {
      if (!session || typeof session !== "object") {
        continue;
      }
      normalised[date] = normaliseSession(date, session);
    }
    return normalised;
  }

  function normaliseSession(date, session) {
    const base = {
      date,
      planType: session.planType || "strength",
      templateId: session.templateId || "legacy",
      title: session.title || "Session",
      subtitle: session.subtitle || "",
      focusTags: Array.isArray(session.focusTags) ? session.focusTags : [],
      rationale: Array.isArray(session.rationale) ? session.rationale : [],
      generatedAt: session.generatedAt || new Date().toISOString(),
      notes: session.notes || ""
    };

    if (base.planType === "outdoor") {
      return {
        ...base,
        outdoorLog: {
          title: session.outdoorLog && session.outdoorLog.title ? session.outdoorLog.title : "Outdoor session",
          detail: session.outdoorLog && session.outdoorLog.detail ? session.outdoorLog.detail : "",
          targetMetric: session.outdoorLog && session.outdoorLog.targetMetric ? session.outdoorLog.targetMetric : "",
          actualMetric: session.outdoorLog && session.outdoorLog.actualMetric ? session.outdoorLog.actualMetric : "",
          actualMinutes: session.outdoorLog && session.outdoorLog.actualMinutes ? session.outdoorLog.actualMinutes : "",
          completed: Boolean(session.outdoorLog && session.outdoorLog.completed)
        }
      };
    }

    return {
      ...base,
      exercises: Array.isArray(session.exercises)
        ? session.exercises.map((exercise) => ({
            id: exercise.id || createId("exercise"),
            exerciseId: exercise.exerciseId || exercise.id || createId("exercise"),
            name: exercise.name || "Exercise",
            note: exercise.note || "",
            measure: exercise.measure || "reps",
            restSeconds: exercise.restSeconds || 60,
            focusTags: Array.isArray(exercise.focusTags) ? exercise.focusTags : [],
            sets: Array.isArray(exercise.sets)
              ? exercise.sets.map((set, index) => ({
                  index: index + 1,
                  targetLoad: set.targetLoad ?? "",
                  targetReps: set.targetReps ?? "",
                  actualLoad: set.actualLoad ?? "",
                  actualReps: set.actualReps ?? "",
                  completed: Boolean(set.completed)
                }))
              : []
          }))
        : [],
      finisher: session.finisher
        ? {
            title: session.finisher.title || "Finisher",
            note: session.finisher.note || "",
            modes: Array.isArray(session.finisher.modes) ? session.finisher.modes : [],
            plannedMinutes: session.finisher.plannedMinutes ?? "",
            mode: session.finisher.mode || "",
            actualMinutes: session.finisher.actualMinutes ?? "",
            completed: Boolean(session.finisher.completed)
          }
        : null
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState();
      }
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === APP_VERSION && parsed.sessionsByDate) {
        return parsed;
      }
      if (parsed && (parsed.sets || parsed.weekCheckins || parsed.blockStart)) {
        return migrateLegacyState(parsed);
      }
      return parsed && typeof parsed === "object" ? parsed : createDefaultState();
    } catch (error) {
      return createDefaultState();
    }
  }

  function migrateLegacyState(legacy) {
    const migrated = createDefaultState();
    migrated.profile.bodyWeightKg =
      legacy.profile && legacy.profile.bodyWeightKg ? legacy.profile.bodyWeightKg : DEFAULT_BODY_WEIGHT;
    migrated.profile.sessionLength = DEFAULT_SESSION_MINUTES;
    migrated.ui.activeView = "today";

    if (Array.isArray(legacy.weighIns)) {
      migrated.weighIns = dedupeByDate(
        legacy.weighIns.map((entry) => ({
          id: entry.id || createId("weight"),
          date: entry.date,
          weight: entry.weight
        }))
      );
    }

    const blockStart = legacy.blockStart && isValidISODate(legacy.blockStart) ? legacy.blockStart : null;
    const sessionGroups = {};

    if (legacy.sets && typeof legacy.sets === "object" && blockStart) {
      for (const [key, value] of Object.entries(legacy.sets)) {
        const [weekPart, dayId, exerciseId, setIndexPart] = key.split("::");
        const week = asNumber(weekPart);
        const setIndex = asNumber(setIndexPart);
        if (!week || !LEGACY_DAY_MAP[dayId]) {
          continue;
        }
        const date = toLocalISODate(
          addDays(parseLocalDate(blockStart), (week - 1) * 7 + LEGACY_DAY_MAP[dayId].offset)
        );
        const bucketKey = `${date}::${dayId}`;
        sessionGroups[bucketKey] = sessionGroups[bucketKey] || {
          date,
          dayId,
          exercises: {}
        };
        sessionGroups[bucketKey].exercises[exerciseId] = sessionGroups[bucketKey].exercises[exerciseId] || [];
        sessionGroups[bucketKey].exercises[exerciseId][setIndex] = {
          targetLoad: value.targetLoad ?? "",
          targetReps: value.targetReps ?? "",
          actualLoad: value.actualLoad ?? "",
          actualReps: value.actualReps ?? "",
          completed: Boolean(value.completed)
        };
      }
    }

    if (legacy.cardio && typeof legacy.cardio === "object" && blockStart) {
      for (const [key, value] of Object.entries(legacy.cardio)) {
        const [weekPart, dayId] = key.split("::");
        const week = asNumber(weekPart);
        if (!week || !LEGACY_DAY_MAP[dayId]) {
          continue;
        }
        const date = toLocalISODate(
          addDays(parseLocalDate(blockStart), (week - 1) * 7 + LEGACY_DAY_MAP[dayId].offset)
        );
        const bucketKey = `${date}::${dayId}`;
        sessionGroups[bucketKey] = sessionGroups[bucketKey] || { date, dayId, exercises: {} };
        sessionGroups[bucketKey].cardio = value;
      }
    }

    if (legacy.sessionNotes && typeof legacy.sessionNotes === "object" && blockStart) {
      for (const [key, value] of Object.entries(legacy.sessionNotes)) {
        const [weekPart, dayId] = key.split("::");
        const week = asNumber(weekPart);
        if (!week || !LEGACY_DAY_MAP[dayId]) {
          continue;
        }
        const date = toLocalISODate(
          addDays(parseLocalDate(blockStart), (week - 1) * 7 + LEGACY_DAY_MAP[dayId].offset)
        );
        const bucketKey = `${date}::${dayId}`;
        sessionGroups[bucketKey] = sessionGroups[bucketKey] || { date, dayId, exercises: {} };
        sessionGroups[bucketKey].notes = value;
      }
    }

    for (const entry of Object.values(sessionGroups)) {
      const dayInfo = LEGACY_DAY_MAP[entry.dayId];
      const exercises = Object.entries(entry.exercises).map(([exerciseId, sets]) => ({
        id: exerciseId,
        exerciseId,
        name: humaniseLegacyExerciseId(exerciseId),
        note: "",
        measure: "reps",
        restSeconds: 60,
        focusTags: dayInfo.focusTags,
        sets: sets.map((set, index) => ({
          index: index + 1,
          targetLoad: set.targetLoad ?? "",
          targetReps: set.targetReps ?? "",
          actualLoad: set.actualLoad ?? "",
          actualReps: set.actualReps ?? "",
          completed: Boolean(set.completed)
        }))
      }));

      const session = {
        date: entry.date,
        planType: "strength",
        templateId: `legacy-${entry.dayId}`,
        title: dayInfo.title,
        subtitle: "Imported from your previous fixed-block tracker.",
        focusTags: dayInfo.focusTags,
        rationale: ["Imported from the earlier version so your adaptive generator still remembers what you trained."],
        generatedAt: new Date().toISOString(),
        notes: entry.notes || "",
        exercises,
        finisher: entry.cardio
          ? {
              title: "Steady-state finish",
              note: "",
              modes: entry.cardio.mode ? [entry.cardio.mode] : [],
              plannedMinutes: entry.cardio.actualMinutes || "",
              mode: entry.cardio.mode || "",
              actualMinutes: entry.cardio.actualMinutes || "",
              completed: Boolean(entry.cardio.completed)
            }
          : null
      };

      if (hasMeaningfulSessionActivity(session)) {
        migrated.sessionsByDate[entry.date] = session;
      }
    }

    if (legacy.weekCheckins && blockStart) {
      for (const [weekKey, value] of Object.entries(legacy.weekCheckins)) {
        const week = asNumber(weekKey);
        if (!week || !value) {
          continue;
        }
        const date = toLocalISODate(addDays(parseLocalDate(blockStart), (week - 1) * 7 + 6));
        if (!value.waist && !value.energy && !value.reflection && !value.photoDataUrl) {
          continue;
        }
        migrated.checkins.push({
          id: createId("checkin"),
          date,
          bodyWeightKg: "",
          waistCm: value.waist || "",
          energy: value.energy || "",
          reflection: value.reflection || "",
          photoDataUrl: value.photoDataUrl || "",
          photoName: value.photoName || "",
          photoUpdatedAt: value.photoUpdatedAt || ""
        });
      }
    }

    migrated.checkins.sort((a, b) => a.date.localeCompare(b.date));
    migrated.ui.checkinDraft = createEmptyCheckinDraft(getTodayISODate());
    updateProfileWeightFromLatestState(migrated);
    return migrated;
  }

  function saveState(requestSync) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageWarning = "";
    } catch (error) {
      storageWarning = "Saving is limited in this browser context. The tracker still works, but changes may not persist after refresh.";
    }

    if (requestSync) {
      queueCloudSync();
    }
  }

  function persistAndRender(requestSync) {
    saveState(Boolean(requestSync));
    renderApp();
  }

  function renderApp() {
    renderControls();
    renderWeatherPanel();
    renderCloudPanel();
    renderViewSwitcher();
    renderSummaryCards();
    renderActiveView();
    renderTimer();
  }

  function renderControls() {
    dom.bodyWeight.value = state.profile.bodyWeightKg || "";
    dom.sessionLength.value = String(state.profile.sessionLength || DEFAULT_SESSION_MINUTES);
  }

  function renderWeatherPanel() {
    if (weatherState.status === "ready" && weatherState.forecast) {
      const forecast = weatherState.forecast;
      dom.weatherPanel.innerHTML = `
        <div class="weather-summary">
          <div>
            <span class="tiny-label">Local weather</span>
            <div class="weather-main">${forecast.temperatureLabel}</div>
            <div class="tiny-copy">${escapeHtml(forecast.conditionLabel)} • rain chance ${forecast.precipitationProbability}%</div>
          </div>
          <button class="ghost-button" type="button" data-action="refresh-weather">Refresh</button>
        </div>
      `;
      return;
    }

    if (weatherState.status === "loading") {
      dom.weatherPanel.innerHTML = `
        <div class="weather-summary">
          <div>
            <span class="tiny-label">Local weather</span>
            <div class="weather-main">Checking...</div>
            <div class="tiny-copy">Grabbing the local forecast for outdoor suggestions.</div>
          </div>
        </div>
      `;
      return;
    }

    if (weatherState.status === "error") {
      dom.weatherPanel.innerHTML = `
        <div class="weather-summary">
          <div>
            <span class="tiny-label">Local weather</span>
            <div class="weather-main">Unavailable</div>
            <div class="tiny-copy">${escapeHtml(weatherState.error)}</div>
          </div>
          <button class="ghost-button" type="button" data-action="enable-weather">Enable weather</button>
        </div>
      `;
      return;
    }

    dom.weatherPanel.innerHTML = `
      <div class="weather-summary">
        <div>
          <span class="tiny-label">Local weather</span>
          <div class="weather-main">Optional</div>
          <div class="tiny-copy">Allow location if you want run or outdoor alternatives to reflect the actual forecast.</div>
        </div>
        <button class="ghost-button" type="button" data-action="enable-weather">Enable weather</button>
      </div>
    `;
  }

  function renderCloudPanel() {
    if (!dom.syncPanel) {
      return;
    }

    const configured = isCloudConfigured();
    const signedIn = Boolean(cloudState.user);
    const statusLabel = signedIn ? "Signed in" : configured ? "Configured" : "Local only";
    const syncMessage = cloudState.pending
      ? "Working..."
      : cloudState.lastSyncedAt
        ? `Last sync ${formatRelativeTimestamp(cloudState.lastSyncedAt)}`
        : cloudState.remoteAvailable
          ? "Cloud snapshot found"
          : "No cloud snapshot yet";

    dom.syncPanel.innerHTML = `
      <div class="sync-card">
        <div class="sync-head">
          <div>
            <span class="tiny-label">Cloud sync</span>
            <div class="sync-title">${statusLabel}</div>
            <div class="tiny-copy">${escapeHtml(cloudState.message)}</div>
          </div>
          <div class="sync-pill-row">
            <span class="mini-pill">${escapeHtml(syncMessage)}</span>
          </div>
        </div>

        ${
          signedIn
            ? `
              <div class="sync-user-row">
                <strong>${escapeHtml(cloudState.user.email || cloudConfig.email || "Signed in")}</strong>
                <span class="tiny-copy">Using Supabase-backed sync for this tracker.</span>
              </div>
              <div class="sync-actions">
                <button class="secondary-button" type="button" data-action="cloud-sync-now">Sync now</button>
                <button class="ghost-button" type="button" data-action="cloud-pull">Pull latest</button>
                <button class="ghost-button" type="button" data-action="cloud-sign-out">Sign out</button>
              </div>
            `
            : `
              <div class="sync-grid">
                <label class="field">
                  <span>Supabase URL</span>
                  <input
                    type="url"
                    value="${escapeAttribute(cloudConfig.url || "")}"
                    data-kind="cloud-config-field"
                    data-field="url"
                    placeholder="https://your-project.supabase.co"
                  />
                </label>
                <label class="field">
                  <span>Publishable key</span>
                  <input
                    type="password"
                    value="${escapeAttribute(cloudConfig.anonKey || "")}"
                    data-kind="cloud-config-field"
                    data-field="anonKey"
                    placeholder="sb_publishable_..."
                  />
                </label>
                <label class="field sync-grid-span">
                  <span>Your email</span>
                  <input
                    type="email"
                    value="${escapeAttribute(cloudConfig.email || "")}"
                    data-kind="cloud-config-field"
                    data-field="email"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <div class="sync-actions">
                <button class="secondary-button" type="button" data-action="cloud-connect">Save connection</button>
                <button class="ghost-button" type="button" data-action="cloud-send-link">Email me a sign-in link</button>
                ${configured ? `<button class="ghost-button" type="button" data-action="cloud-clear-config">Clear</button>` : ""}
              </div>
              <div class="tiny-copy">
                Once the project is connected, this stays local-first but can sync workouts, check-ins, and photos between devices.
              </div>
            `
        }
      </div>
    `;
  }

  function renderViewSwitcher() {
    dom.viewSwitcher.innerHTML = VIEW_OPTIONS.map(
      (view) => `
        <button
          type="button"
          data-action="switch-view"
          data-view="${view.id}"
          class="${state.ui.activeView === view.id ? "is-active" : ""}"
        >
          ${view.label}
        </button>
      `
    ).join("");
  }

  function renderSummaryCards() {
    const today = getTodayISODate();
    const todaySession = ensureTodaySession();
    const weeklyMetrics = getWindowMetrics(7);
    const monthlyMetrics = getWindowMetrics(HISTORY_WINDOW_DAYS);
    const latestWeight = getLatestWeighIn();
    const dueCheckin = getCheckinStatus();
    const todayProgress = todaySession.planType === "strength" ? getStrengthSessionStats(todaySession) : getOutdoorSessionStats(todaySession);

    dom.summaryCards.innerHTML = `
      ${storageWarning ? renderStorageWarningCard() : ""}
      <article class="summary-card">
        <div class="summary-label">Today</div>
        <span class="summary-value">${escapeHtml(todaySession.title)}</span>
        <p class="summary-detail">
          ${escapeHtml(todaySession.subtitle)}
          <br />
          ${todayProgress.label}
        </p>
      </article>
      <article class="summary-card">
        <div class="summary-label">Last 7 days</div>
        <span class="summary-value">${weeklyMetrics.completedSessions}</span>
        <p class="summary-detail">
          ${weeklyMetrics.completedSets} sets logged across ${weeklyMetrics.totalCardioMinutes} cardio minutes.
          <br />
          ${weeklyMetrics.focusLead}
        </p>
      </article>
      <article class="summary-card">
        <div class="summary-label">${getWeighInByDate(today) ? "Today’s weight" : latestWeight ? "Latest weight" : "Weight log"}</div>
        <span class="summary-value">${latestWeight ? `${formatDisplayNumber(asNumber((getWeighInByDate(today) || latestWeight).weight))} kg` : "Not logged"}</span>
        <div class="summary-detail">
          ${latestWeight && !getWeighInByDate(today) ? `Last logged ${formatShortDate(parseLocalDate(latestWeight.date))}.<br />` : ""}
          <label class="field compact-field">
            <span>Quick log for ${formatShortDate(parseLocalDate(today))}</span>
            <div class="inline-field">
              <input
                type="number"
                min="40"
                max="200"
                step="0.1"
                value="${escapeAttribute(getWeighInByDate(today)?.weight || "")}"
                data-kind="today-weight"
              />
              ${getWeighInByDate(today) ? `<button class="icon-button" type="button" data-action="delete-weighin" data-date="${today}" aria-label="Delete today's weigh-in">×</button>` : ""}
            </div>
          </label>
        </div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Check-in status</div>
        <span class="summary-value">${dueCheckin.due ? "Due" : "On track"}</span>
        <p class="summary-detail">
          ${escapeHtml(dueCheckin.message)}
          <br />
          ${monthlyMetrics.photoCount} photo check-ins saved in the last ${HISTORY_WINDOW_DAYS} days.
        </p>
      </article>
    `;
  }

  function renderStorageWarningCard() {
    return `
      <article class="summary-card">
        <div class="summary-label">Storage notice</div>
        <span class="summary-value">Heads up</span>
        <p class="summary-detail">${escapeHtml(storageWarning)}</p>
      </article>
    `;
  }

  function renderActiveView() {
    if (state.ui.activeView === "history") {
      dom.viewRoot.innerHTML = renderHistoryView();
      return;
    }
    if (state.ui.activeView === "checkins") {
      dom.viewRoot.innerHTML = renderCheckinsView();
      return;
    }
    if (state.ui.activeView === "insights") {
      dom.viewRoot.innerHTML = renderInsightsView();
      return;
    }
    dom.viewRoot.innerHTML = renderTodayView();
  }

  function renderTodayView() {
    const session = ensureTodaySession();
    const checkinStatus = getCheckinStatus();
    const weatherIdeas = buildOutdoorIdeas();
    const recentSessions = getMeaningfulSessionsBefore(getTodayISODate()).slice(-3).reverse();
    const generatedTodayText = formatLongDate(parseLocalDate(session.date));

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Today’s session</div>
            <h2>${escapeHtml(session.title)}</h2>
            <p class="section-copy">
              Generated for ${generatedTodayText}. This plan is saved for the day, so it stays stable once you start logging it.
            </p>
          </div>
          <div class="action-row">
            <button class="secondary-button" type="button" data-action="regenerate-today">Regenerate</button>
            ${
              checkinStatus.due
                ? `<button class="primary-button" type="button" data-action="go-to-checkin" data-date="${getTodayISODate()}">Do check-in</button>`
                : ""
            }
          </div>
        </div>

        <div class="today-layout">
          <div class="today-main">
            ${renderTodaySession(session)}
          </div>

          <aside class="today-rail">
            <article class="rail-card">
              <div class="section-eyebrow">Why this came up</div>
              <h3>Adaptive logic</h3>
              <div class="reason-list">
                ${session.rationale.map((reason) => `<div class="reason-chip">${escapeHtml(reason)}</div>`).join("")}
              </div>
            </article>

            <article class="rail-card">
              <div class="section-eyebrow">Outdoor detour</div>
              <h3>${weatherIdeas.primary.title}</h3>
              <p class="helper-copy">${escapeHtml(weatherIdeas.primary.copy)}</p>
              <div class="suggestion-stack">
                ${weatherIdeas.suggestions
                  .map(
                    (idea) => `
                      <div class="suggestion-card">
                        <div>
                          <strong>${escapeHtml(idea.title)}</strong>
                          <div class="tiny-copy">${escapeHtml(idea.copy)}</div>
                        </div>
                        <button class="ghost-button" type="button" data-action="swap-outdoor" data-suggestion-id="${idea.id}">
                          Use instead
                        </button>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </article>

            <article class="rail-card">
              <div class="section-eyebrow">Weekly reminder</div>
              <h3>${checkinStatus.due ? "Check-in due" : "Check-in rhythm is good"}</h3>
              <p class="helper-copy">${escapeHtml(checkinStatus.message)}</p>
              <button class="ghost-button" type="button" data-action="go-to-checkin" data-date="${getTodayISODate()}">
                Open check-ins
              </button>
            </article>

            <article class="rail-card">
              <div class="section-eyebrow">Recent training</div>
              <h3>Last few sessions</h3>
              <div class="mini-history">
                ${
                  recentSessions.length
                    ? recentSessions
                        .map(
                          (entry) => `
                            <div class="mini-history-row">
                              <div>
                                <strong>${formatShortDate(parseLocalDate(entry.date))}</strong>
                                <div class="tiny-copy">${escapeHtml(entry.title)}</div>
                              </div>
                              <div class="tiny-copy">${escapeHtml(getSessionFocusLabel(entry))}</div>
                            </div>
                          `
                        )
                        .join("")
                    : `<div class="empty-state">No meaningful training logged yet. The generator will learn as soon as you start using it.</div>`
                }
              </div>
            </article>
          </aside>
        </div>
      </section>
    `;
  }

  function renderTodaySession(session) {
    if (session.planType === "outdoor") {
      return renderOutdoorSessionCard(session, true);
    }
    return renderStrengthSessionCard(session, true);
  }

  function renderStrengthSessionCard(session, todayView) {
    const stats = getStrengthSessionStats(session);

    return `
      <article class="session-card session-card-large">
        <div class="session-header">
          <div class="session-title-wrap">
            <span class="session-day">${formatLongDate(parseLocalDate(session.date))}</span>
            <h3>${escapeHtml(session.title)}</h3>
            <p class="session-meta">${escapeHtml(session.subtitle)}</p>
          </div>
          <div class="session-status">
            <span class="status-chip ${stats.status}">${stats.label}</span>
            <span class="tiny-copy">${stats.completedSets}/${stats.totalSets} sets logged</span>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.round(stats.progress * 100)}%;"></div>
            </div>
          </div>
        </div>

        <div class="focus-strip">
          ${session.focusTags.map((focus) => `<span class="focus-pill">${escapeHtml(humaniseFocus(focus))}</span>`).join("")}
        </div>

        <div class="exercise-stack">
          ${session.exercises.map((exercise, index) => renderExerciseCard(session, exercise, index)).join("")}
        </div>

        ${
          session.finisher
            ? `
              <section class="finisher-card">
                <div>
                  <div class="section-eyebrow">Finish</div>
                  <h4>${escapeHtml(session.finisher.title)}</h4>
                  <p class="small-copy">${escapeHtml(session.finisher.note)}</p>
                </div>
                <div class="finisher-grid">
                  <label class="field">
                    <span>Mode</span>
                    <select data-kind="finisher-field" data-date="${session.date}" data-field="mode">
                      ${session.finisher.modes
                        .map(
                          (mode) => `
                            <option value="${escapeAttribute(mode)}" ${mode === session.finisher.mode ? "selected" : ""}>
                              ${mode}
                            </option>
                          `
                        )
                        .join("")}
                    </select>
                  </label>
                  <label class="field">
                    <span>Target minutes</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value="${escapeAttribute(session.finisher.plannedMinutes)}"
                      data-kind="finisher-field"
                      data-date="${session.date}"
                      data-field="plannedMinutes"
                    />
                  </label>
                  <label class="field">
                    <span>Actual minutes</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value="${escapeAttribute(session.finisher.actualMinutes)}"
                      data-kind="finisher-field"
                      data-date="${session.date}"
                      data-field="actualMinutes"
                    />
                  </label>
                  <label class="field">
                    <span>Done</span>
                    <div class="checkbox-wrap">
                      <input
                        type="checkbox"
                        ${session.finisher.completed ? "checked" : ""}
                        data-kind="finisher-field"
                        data-date="${session.date}"
                        data-field="completed"
                      />
                    </div>
                  </label>
                </div>
              </section>
            `
            : ""
        }

        <label class="field notes-field">
          <span>Session notes</span>
          <textarea data-kind="session-note" data-date="${session.date}" placeholder="Quick note on how this felt, substitutions, or anything to remember next time.">${escapeHtml(session.notes || "")}</textarea>
        </label>
      </article>
    `;
  }

  function renderExerciseCard(session, exercise, exerciseIndex) {
    return `
      <section class="exercise-card">
        <div class="exercise-header">
          <div>
            <h4>${escapeHtml(exercise.name)}</h4>
            <div class="exercise-meta">
              ${exercise.sets.length} sets • ${describeExerciseTargets(exercise)}
            </div>
            ${exercise.note ? `<p class="exercise-note">${escapeHtml(exercise.note)}</p>` : ""}
          </div>
          <span class="rest-chip">${exercise.restSeconds}s rest</span>
        </div>

        <div class="table-wrap">
          <table class="set-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Target kg</th>
                <th>${exercise.measure === "seconds" ? "Target sec" : "Target reps"}</th>
                <th>Actual kg</th>
                <th>${exercise.measure === "seconds" ? "Actual sec" : "Actual reps"}</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              ${exercise.sets
                .map(
                  (set, setIndex) => `
                    <tr>
                      <td><strong>${set.index}</strong></td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value="${escapeAttribute(set.targetLoad)}"
                          data-kind="set-field"
                          data-date="${session.date}"
                          data-exercise-index="${exerciseIndex}"
                          data-set-index="${setIndex}"
                          data-field="targetLoad"
                          placeholder="kg"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value="${escapeAttribute(set.targetReps)}"
                          data-kind="set-field"
                          data-date="${session.date}"
                          data-exercise-index="${exerciseIndex}"
                          data-set-index="${setIndex}"
                          data-field="targetReps"
                          placeholder="${exercise.measure === "seconds" ? "sec" : "reps"}"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value="${escapeAttribute(set.actualLoad)}"
                          data-kind="set-field"
                          data-date="${session.date}"
                          data-exercise-index="${exerciseIndex}"
                          data-set-index="${setIndex}"
                          data-field="actualLoad"
                          placeholder="kg"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value="${escapeAttribute(set.actualReps)}"
                          data-kind="set-field"
                          data-date="${session.date}"
                          data-exercise-index="${exerciseIndex}"
                          data-set-index="${setIndex}"
                          data-field="actualReps"
                          placeholder="${exercise.measure === "seconds" ? "sec" : "reps"}"
                        />
                      </td>
                      <td>
                        <div class="checkbox-wrap">
                          <input
                            type="checkbox"
                            ${set.completed ? "checked" : ""}
                            data-kind="set-field"
                            data-date="${session.date}"
                            data-exercise-index="${exerciseIndex}"
                            data-set-index="${setIndex}"
                            data-field="completed"
                          />
                        </div>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderOutdoorSessionCard(session, todayView) {
    const stats = getOutdoorSessionStats(session);
    return `
      <article class="session-card session-card-large">
        <div class="session-header">
          <div class="session-title-wrap">
            <span class="session-day">${formatLongDate(parseLocalDate(session.date))}</span>
            <h3>${escapeHtml(session.outdoorLog.title)}</h3>
            <p class="session-meta">${escapeHtml(session.outdoorLog.detail)}</p>
          </div>
          <div class="session-status">
            <span class="status-chip ${stats.status}">${stats.label}</span>
          </div>
        </div>

        <div class="focus-strip">
          ${session.focusTags.map((focus) => `<span class="focus-pill">${escapeHtml(humaniseFocus(focus))}</span>`).join("")}
        </div>

        <div class="outdoor-log-grid">
          <div class="metric-card">
            <div class="metric-label">Target</div>
            <span class="metric-value">${escapeHtml(session.outdoorLog.targetMetric || "Move for about 40 minutes")}</span>
            <p class="metric-detail">Take this as the main plan today if you want variety and the conditions work.</p>
          </div>

          <label class="field">
            <span>Actual distance / score</span>
            <input
              type="text"
              value="${escapeAttribute(session.outdoorLog.actualMetric)}"
              data-kind="outdoor-field"
              data-date="${session.date}"
              data-field="actualMetric"
              placeholder="e.g. 2.7 km or one football session"
            />
          </label>

          <label class="field">
            <span>Actual minutes</span>
            <input
              type="number"
              min="0"
              step="1"
              value="${escapeAttribute(session.outdoorLog.actualMinutes)}"
              data-kind="outdoor-field"
              data-date="${session.date}"
              data-field="actualMinutes"
              placeholder="minutes"
            />
          </label>

          <label class="field">
            <span>Done</span>
            <div class="checkbox-wrap">
              <input
                type="checkbox"
                ${session.outdoorLog.completed ? "checked" : ""}
                data-kind="outdoor-field"
                data-date="${session.date}"
                data-field="completed"
              />
            </div>
          </label>
        </div>

        <label class="field notes-field">
          <span>Session notes</span>
          <textarea data-kind="session-note" data-date="${session.date}" placeholder="How was it? Energy, route, people you played with, or anything to remember next time.">${escapeHtml(session.notes || "")}</textarea>
        </label>
      </article>
    `;
  }

  function renderHistoryView() {
    const sessions = getRecentSessions(HISTORY_WINDOW_DAYS).reverse();
    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Recent history</div>
            <h2>The last ${HISTORY_WINDOW_DAYS} days</h2>
            <p class="section-copy">
              This stays here for context, but the app now leads with today’s plan so you don’t have to think in spreadsheets.
            </p>
          </div>
          <div class="pill">${sessions.length} saved sessions</div>
        </div>

        <div class="history-stack">
          ${
            sessions.length
              ? sessions.map((session) => renderHistorySessionCard(session)).join("")
              : `<div class="empty-state">No logged sessions yet. Use today’s workout and your history will start building itself here.</div>`
          }
        </div>
      </section>
    `;
  }

  function renderHistorySessionCard(session) {
    const stats = session.planType === "strength" ? getStrengthSessionStats(session) : getOutdoorSessionStats(session);
    return `
      <article class="history-card">
        <div class="history-header">
          <div>
            <div class="section-eyebrow">${formatLongDate(parseLocalDate(session.date))}</div>
            <h3>${escapeHtml(session.planType === "outdoor" ? session.outdoorLog.title : session.title)}</h3>
            <p class="small-copy">${escapeHtml(session.planType === "outdoor" ? session.outdoorLog.detail : session.subtitle)}</p>
          </div>
          <div class="history-status">
            <span class="status-chip ${stats.status}">${stats.label}</span>
            <span class="tiny-copy">${escapeHtml(getSessionFocusLabel(session))}</span>
          </div>
        </div>
        ${
          session.planType === "strength"
            ? `
              <div class="history-exercise-list">
                ${session.exercises
                  .map(
                    (exercise) => `
                      <div class="history-exercise-row">
                        <strong>${escapeHtml(exercise.name)}</strong>
                        <span class="tiny-copy">${escapeHtml(describeExercisePerformance(exercise))}</span>
                      </div>
                    `
                  )
                  .join("")}
                ${
                  session.finisher
                    ? `<div class="history-exercise-row"><strong>${escapeHtml(session.finisher.title)}</strong><span class="tiny-copy">${session.finisher.actualMinutes ? `${escapeHtml(session.finisher.actualMinutes)} min` : "No cardio logged"}</span></div>`
                    : ""
                }
              </div>
            `
            : `
              <div class="history-exercise-list">
                <div class="history-exercise-row"><strong>Target</strong><span class="tiny-copy">${escapeHtml(session.outdoorLog.targetMetric || "Move for about 40 minutes")}</span></div>
                <div class="history-exercise-row"><strong>Actual</strong><span class="tiny-copy">${escapeHtml(session.outdoorLog.actualMetric || "Not logged yet")}${session.outdoorLog.actualMinutes ? ` • ${escapeHtml(session.outdoorLog.actualMinutes)} min` : ""}</span></div>
              </div>
            `
        }
        ${session.notes ? `<p class="tiny-copy" style="margin-top: 12px;">${escapeHtml(session.notes)}</p>` : ""}
      </article>
    `;
  }

  function renderCheckinsView() {
    const draft = state.ui.checkinDraft;
    const gallery = [...state.checkins].sort((a, b) => b.date.localeCompare(a.date));

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Weekly check-ins</div>
            <h2>Save the stuff future-you will care about</h2>
            <p class="section-copy">
              One good check-in beats dozens of fiddly daily admin tasks. Save the photo, waist, energy, and reflection here.
            </p>
          </div>
          <div class="pill">${gallery.length} saved check-ins</div>
        </div>

        <div class="checkin-layout">
          <article class="checkin-editor">
            <div class="section-eyebrow">Current draft</div>
            <h3>${formatLongDate(parseLocalDate(draft.date))}</h3>

            <div class="checkin-form-grid">
              <label class="field">
                <span>Date</span>
                <input type="date" value="${escapeAttribute(draft.date)}" data-kind="checkin-draft" data-field="date" />
              </label>
              <label class="field">
                <span>Body weight (kg)</span>
                <input type="number" min="40" max="200" step="0.1" value="${escapeAttribute(draft.bodyWeightKg)}" data-kind="checkin-draft" data-field="bodyWeightKg" />
              </label>
              <label class="field">
                <span>Waist (cm)</span>
                <input type="number" min="40" max="200" step="0.1" value="${escapeAttribute(draft.waistCm)}" data-kind="checkin-draft" data-field="waistCm" />
              </label>
              <label class="field">
                <span>Energy</span>
                <select data-kind="checkin-draft" data-field="energy">
                  <option value="" ${draft.energy === "" ? "selected" : ""}>Select</option>
                  <option value="1" ${draft.energy === "1" ? "selected" : ""}>1 - Crushed</option>
                  <option value="2" ${draft.energy === "2" ? "selected" : ""}>2 - Rough</option>
                  <option value="3" ${draft.energy === "3" ? "selected" : ""}>3 - Manageable</option>
                  <option value="4" ${draft.energy === "4" ? "selected" : ""}>4 - Good</option>
                  <option value="5" ${draft.energy === "5" ? "selected" : ""}>5 - Strong</option>
                </select>
              </label>
            </div>

            <label class="field" style="margin-top: 16px;">
              <span>Reflection</span>
              <textarea data-kind="checkin-draft" data-field="reflection" placeholder="How are you looking, how are you feeling, and what do you want the generator to keep in mind next week?">${escapeHtml(draft.reflection)}</textarea>
            </label>

            <div class="photo-upload">
              <div class="photo-head">
                <div>
                  <div class="section-eyebrow">Photo</div>
                  <h3>Gallery-ready check-in</h3>
                </div>
                ${
                  draft.photoDataUrl
                    ? `<button class="ghost-button" type="button" data-action="clear-checkin-photo">Clear photo</button>`
                    : ""
                }
              </div>
              <input type="file" accept="image/*" data-kind="checkin-photo-upload" />
              <div class="photo-preview">
                ${
                  draft.photoDataUrl
                    ? `<img src="${escapeAttribute(draft.photoDataUrl)}" alt="Check-in preview" />`
                    : `<div class="photo-empty">No photo in the draft yet. Add one when you want the body-change gallery to stay useful.</div>`
                }
              </div>
            </div>

            <div class="action-row" style="margin-top: 18px;">
              <button class="primary-button" type="button" data-action="save-checkin">Save check-in</button>
            </div>
          </article>

          <article class="checkin-gallery-card">
            <div class="section-eyebrow">Saved gallery</div>
            <h3>Body-change timeline</h3>
            <div class="gallery-grid">
              ${
                gallery.length
                  ? gallery
                      .map(
                        (checkin) => `
                          <button class="gallery-tile" type="button" data-action="edit-checkin" data-date="${checkin.date}">
                            ${
                              checkin.photoDataUrl
                                ? `<img src="${escapeAttribute(checkin.photoDataUrl)}" alt="Check-in ${escapeAttribute(checkin.date)}" />`
                                : `<div class="gallery-placeholder">No photo</div>`
                            }
                            <div class="gallery-meta">
                              <strong>${formatShortDate(parseLocalDate(checkin.date))}</strong>
                              <span>${checkin.waistCm ? `${escapeHtml(checkin.waistCm)} cm waist` : "Tap to edit"}</span>
                            </div>
                          </button>
                        `
                      )
                      .join("")
                  : `<div class="empty-state">No check-ins saved yet. When you do the first one, the photo gallery will start building here.</div>`
              }
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderInsightsView() {
    const metrics = getWindowMetrics(HISTORY_WINDOW_DAYS);
    const focusRows = Object.entries(metrics.focusCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const photos = getRecentCheckins(HISTORY_WINDOW_DAYS);

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Last ${HISTORY_WINDOW_DAYS} days</div>
            <h2>What the last month actually looked like</h2>
            <p class="section-copy">
              The generator keeps variety high, but the data still needs to tell a coherent story: training consistency, focus spread, body trend, and how often you checked in.
            </p>
          </div>
        </div>

        <div class="stats-grid">
          <article class="metric-card">
            <div class="metric-label">Completed sessions</div>
            <span class="metric-value">${metrics.completedSessions}</span>
            <p class="metric-detail">${metrics.plannedSessions} total sessions were generated in the same period.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Completed sets</div>
            <span class="metric-value">${metrics.completedSets}</span>
            <p class="metric-detail">${metrics.totalCardioMinutes} logged cardio minutes and ${metrics.outdoorSessions} outdoor sessions.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Weight trend</div>
            <span class="metric-value">${metrics.weightDelta != null ? `${metrics.weightDelta > 0 ? "+" : ""}${formatDisplayNumber(metrics.weightDelta)} kg` : "—"}</span>
            <p class="metric-detail">Comparing the earliest and latest weigh-ins in the window.</p>
          </article>
        </div>

        <div class="insights-layout">
          <article class="rail-card">
            <div class="section-eyebrow">Focus distribution</div>
            <h3>What got trained most</h3>
            <div class="bar-stack">
              ${
                focusRows.length
                  ? focusRows
                      .map(([focus, count]) => {
                        const width = Math.max(10, Math.round((count / Math.max(...focusRows.map((row) => row[1]), 1)) * 100));
                        return `
                          <div class="bar-row">
                            <div class="bar-label">${escapeHtml(humaniseFocus(focus))}</div>
                            <div class="bar-track"><span style="width: ${width}%;"></span></div>
                            <div class="bar-value">${count}</div>
                          </div>
                        `;
                      })
                      .join("")
                  : `<div class="empty-state">No focus distribution yet because there are no completed sessions in the current window.</div>`
              }
            </div>
          </article>

          <article class="rail-card">
            <div class="section-eyebrow">Check-in gallery</div>
            <h3>Saved body snapshots</h3>
            <div class="mini-gallery">
              ${
                photos.length
                  ? photos
                      .map(
                        (entry) => `
                          <button class="mini-gallery-tile" type="button" data-action="edit-checkin" data-date="${entry.date}">
                            ${
                              entry.photoDataUrl
                                ? `<img src="${escapeAttribute(entry.photoDataUrl)}" alt="Check-in ${escapeAttribute(entry.date)}" />`
                                : `<div class="gallery-placeholder">No photo</div>`
                            }
                            <span>${formatShortDate(parseLocalDate(entry.date))}</span>
                          </button>
                        `
                      )
                      .join("")
                  : `<div class="empty-state">No saved photo check-ins in the current window yet.</div>`
              }
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function loadCloudConfig() {
    try {
      const raw = window.localStorage.getItem(CLOUD_CONFIG_KEY);
      if (!raw) {
        return {
          url: "",
          anonKey: "",
          email: ""
        };
      }
      const parsed = JSON.parse(raw);
      return {
        url: parsed && parsed.url ? String(parsed.url) : "",
        anonKey: parsed && parsed.anonKey ? String(parsed.anonKey) : "",
        email: parsed && parsed.email ? String(parsed.email) : ""
      };
    } catch (error) {
      return {
        url: "",
        anonKey: "",
        email: ""
      };
    }
  }

  function saveCloudConfig() {
    try {
      window.localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cloudConfig));
    } catch (error) {}
  }

  function isCloudConfigured() {
    return Boolean(cloudConfig.url && cloudConfig.anonKey);
  }

  function initCloud(force) {
    cloudState = createDefaultCloudState();

    if (!isCloudConfigured()) {
      supabaseClient = null;
      renderCloudPanel();
      return false;
    }

    if (!(window.supabase && typeof window.supabase.createClient === "function")) {
      cloudState.status = "error";
      cloudState.message = "Supabase could not load in this browser, so sync is unavailable right now.";
      renderCloudPanel();
      return false;
    }

    if (supabaseClient && !force) {
      return true;
    }

    if (authSubscription && typeof authSubscription.unsubscribe === "function") {
      authSubscription.unsubscribe();
      authSubscription = null;
    }

    supabaseClient = window.supabase.createClient(cloudConfig.url, cloudConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const authListener = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setCloudSession(session);
      renderApp();
      if (session) {
        reconcileCloudStateOnSignIn();
      }
    });

    authSubscription = authListener && authListener.data ? authListener.data.subscription : null;
    bootstrapCloudSession();
    return true;
  }

  async function bootstrapCloudSession() {
    if (!supabaseClient) {
      return;
    }

    try {
      const {
        data: { session }
      } = await supabaseClient.auth.getSession();
      setCloudSession(session);
      renderApp();
      if (session) {
        await reconcileCloudStateOnSignIn();
      }
    } catch (error) {
      cloudState.status = "error";
      cloudState.message = "The saved sync session could not be restored.";
      renderApp();
    }
  }

  function setCloudSession(session) {
    cloudState.pending = false;
    cloudState.session = session || null;
    cloudState.user = session && session.user ? session.user : null;
    cloudState.status = session ? "signed-in" : isCloudConfigured() ? "configured" : "local-only";
    cloudState.message = session
      ? `Signed in as ${session.user && session.user.email ? session.user.email : cloudConfig.email || "your account"}.`
      : isCloudConfigured()
        ? "Sync is configured on this device. Email yourself a sign-in link when you want to connect."
        : "Still local only. Add a Supabase project when you want phone and laptop data to stay in sync.";
  }

  async function sendCloudMagicLink() {
    if (!cloudConfig.email) {
      window.alert("Add your email address first.");
      return;
    }

    if (!initCloud(true) || !supabaseClient) {
      return;
    }

    cloudState.pending = true;
    cloudState.message = "Sending a sign-in link to your inbox...";
    renderCloudPanel();

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: cloudConfig.email,
        options: {
          emailRedirectTo: getAuthRedirectUrl()
        }
      });

      if (error) {
        throw error;
      }

      cloudState.pending = false;
      cloudState.message = "Magic link sent. Open it on the device you want to sync.";
      renderCloudPanel();
    } catch (error) {
      cloudState.pending = false;
      cloudState.status = "error";
      cloudState.message = error && error.message ? error.message : "The sign-in link could not be sent.";
      renderCloudPanel();
    }
  }

  async function syncStateToCloud(interactive) {
    if (!supabaseClient || !cloudState.user) {
      if (interactive) {
        window.alert("Connect cloud sync and sign in first.");
      }
      return false;
    }

    if (cloudSyncInFlight) {
      return false;
    }

    cloudSyncInFlight = true;
    cloudState.pending = true;
    if (interactive) {
      cloudState.message = "Syncing your tracker...";
      renderCloudPanel();
    }

    try {
      const syncedAt = new Date().toISOString();
      const payload = {
        user_id: cloudState.user.id,
        email: cloudState.user.email || cloudConfig.email || "",
        app_state: serialiseStateForCloud(state),
        updated_at: syncedAt
      };

      const { error } = await supabaseClient.from("tracker_snapshots").upsert(payload, { onConflict: "user_id" });
      if (error) {
        throw error;
      }

      cloudState.pending = false;
      cloudState.remoteAvailable = true;
      cloudState.lastSyncedAt = syncedAt;
      cloudState.message = `Cloud sync is up to date as of ${formatShortTimestamp(syncedAt)}.`;
      renderCloudPanel();
      return true;
    } catch (error) {
      cloudState.pending = false;
      cloudState.status = "error";
      cloudState.message = error && error.message ? error.message : "The tracker could not sync to Supabase.";
      renderCloudPanel();
      if (interactive) {
        window.alert(cloudState.message);
      }
      return false;
    } finally {
      cloudSyncInFlight = false;
    }
  }

  async function pullStateFromCloud(interactive) {
    if (!supabaseClient || !cloudState.user) {
      if (interactive) {
        window.alert("Connect cloud sync and sign in first.");
      }
      return false;
    }

    try {
      const snapshot = await fetchCloudSnapshot();
      if (!snapshot || !snapshot.app_state) {
        cloudState.remoteAvailable = false;
        cloudState.message = "No cloud snapshot exists yet for this account.";
        renderCloudPanel();
        if (interactive) {
          window.alert("No cloud snapshot exists yet for this account.");
        }
        return false;
      }

      state = {
        ...createDefaultState(),
        ...(snapshot.app_state || {})
      };
      hydrateState();
      ensureTodaySession();
      saveState(false);
      cloudState.remoteAvailable = true;
      cloudState.lastSyncedAt = snapshot.updated_at || "";
      cloudState.message = `Loaded the cloud snapshot from ${formatShortTimestamp(snapshot.updated_at)}.`;
      renderApp();
      return true;
    } catch (error) {
      cloudState.status = "error";
      cloudState.message = error && error.message ? error.message : "The cloud snapshot could not be loaded.";
      renderCloudPanel();
      if (interactive) {
        window.alert(cloudState.message);
      }
      return false;
    }
  }

  async function reconcileCloudStateOnSignIn() {
    if (!supabaseClient || !cloudState.user) {
      return;
    }

    try {
      const snapshot = await fetchCloudSnapshot();
      if (!snapshot || !snapshot.app_state) {
        cloudState.remoteAvailable = false;
        cloudState.message = "Signed in. No cloud snapshot yet, so this device is still the source of truth.";
        renderCloudPanel();
        if (!isStateEffectivelyEmpty(state)) {
          queueCloudSync(true);
        }
        return;
      }

      cloudState.remoteAvailable = true;
      cloudState.lastSyncedAt = snapshot.updated_at || "";

      if (isStateEffectivelyEmpty(state)) {
        state = {
          ...createDefaultState(),
          ...(snapshot.app_state || {})
        };
        hydrateState();
        ensureTodaySession();
        saveState(false);
        cloudState.message = `Loaded your cloud snapshot from ${formatShortTimestamp(snapshot.updated_at)}.`;
        renderApp();
        return;
      }

      cloudState.message = `Cloud snapshot found from ${formatShortTimestamp(snapshot.updated_at)}. Pull latest on this device if you want that version.`;
      renderCloudPanel();
    } catch (error) {
      cloudState.status = "error";
      cloudState.message = error && error.message ? error.message : "The cloud snapshot could not be checked.";
      renderCloudPanel();
    }
  }

  async function fetchCloudSnapshot() {
    if (!supabaseClient || !cloudState.user) {
      return null;
    }

    const { data, error } = await supabaseClient
      .from("tracker_snapshots")
      .select("app_state, updated_at")
      .eq("user_id", cloudState.user.id)
      .limit(1);

    if (error) {
      throw error;
    }

    return Array.isArray(data) && data.length ? data[0] : null;
  }

  async function signOutCloud() {
    if (!supabaseClient) {
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        throw error;
      }
      setCloudSession(null);
      renderApp();
    } catch (error) {
      cloudState.status = "error";
      cloudState.message = error && error.message ? error.message : "Cloud sign-out failed.";
      renderCloudPanel();
    }
  }

  async function clearCloudConfig() {
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut({ scope: "local" });
      } catch (error) {}
    }

    if (authSubscription && typeof authSubscription.unsubscribe === "function") {
      authSubscription.unsubscribe();
      authSubscription = null;
    }

    supabaseClient = null;
    cloudConfig = {
      url: "",
      anonKey: "",
      email: ""
    };
    saveCloudConfig();
    cloudState = createDefaultCloudState();
    renderApp();
  }

  function queueCloudSync(immediate) {
    if (!supabaseClient || !cloudState.user) {
      return;
    }

    if (cloudSyncTimeoutId != null) {
      window.clearTimeout(cloudSyncTimeoutId);
      cloudSyncTimeoutId = null;
    }

    const delay = immediate ? 100 : CLOUD_SYNC_DEBOUNCE_MS;
    cloudSyncTimeoutId = window.setTimeout(() => {
      cloudSyncTimeoutId = null;
      syncStateToCloud(false);
    }, delay);
  }

  function serialiseStateForCloud(currentState) {
    return JSON.parse(
      JSON.stringify({
        version: currentState.version,
        profile: currentState.profile,
        sessionsByDate: currentState.sessionsByDate,
        weighIns: currentState.weighIns,
        checkins: currentState.checkins
      })
    );
  }

  function isStateEffectivelyEmpty(currentState) {
    const meaningfulSessions = Object.values(currentState.sessionsByDate || {}).filter((session) => hasMeaningfulSessionActivity(session));
    return meaningfulSessions.length === 0 && !(currentState.weighIns || []).length && !(currentState.checkins || []).length;
  }

  function getAuthRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function ensureTodaySession() {
    const today = getTodayISODate();
    if (!state.sessionsByDate[today]) {
      state.sessionsByDate[today] = generateStrengthSession(today, []);
      saveState(false);
    }
    return state.sessionsByDate[today];
  }

  function regenerateTodaySession() {
    const today = getTodayISODate();
    const existing = state.sessionsByDate[today];
    if (existing && hasMeaningfulSessionActivity(existing)) {
      const confirmed = window.confirm(
        "Regenerating today will replace the saved plan for this date. Keep going?"
      );
      if (!confirmed) {
        return;
      }
    }

    const excludedTemplateIds = existing ? [existing.templateId] : [];
    state.sessionsByDate[today] = generateStrengthSession(today, excludedTemplateIds);
    persistAndRender(true);
  }

  function generateStrengthSession(date, excludedTemplateIds) {
    const context = buildGenerationContext(date);
    const template = pickTemplate(context, excludedTemplateIds || []);
    const usedExerciseIds = new Set();

    const exercises = template.slots.map((slot, index) => {
      const exerciseBlueprint = pickExerciseFromPool(slot.pool, context, usedExerciseIds, slot.avoidDuplicatePoolPick);
      usedExerciseIds.add(exerciseBlueprint.id);

      const previous = getLatestExerciseRecord(exerciseBlueprint.id, date);
      const target = getSuggestedTarget(exerciseBlueprint, slot.repRange, previous);
      const measure = exerciseBlueprint.measure || "reps";

      return {
        id: `${exerciseBlueprint.id}-${index}`,
        exerciseId: exerciseBlueprint.id,
        name: exerciseBlueprint.name,
        note: slot.note || "",
        measure,
        restSeconds: slot.restSeconds,
        focusTags: exerciseBlueprint.tags,
        sets: Array.from({ length: slot.sets }, (_, setIndex) => ({
          index: setIndex + 1,
          targetLoad: target.targetLoad,
          targetReps: target.targetReps,
          actualLoad: "",
          actualReps: "",
          completed: false
        }))
      };
    });

    return {
      date,
      planType: "strength",
      templateId: template.id,
      title: template.title,
      subtitle: template.subtitle,
      focusTags: template.focusTags,
      rationale: buildRationale(template, context),
      generatedAt: new Date().toISOString(),
      exercises,
      finisher: {
        title: template.finisher.title,
        note: template.finisher.note,
        modes: template.finisher.modes,
        plannedMinutes: String(pickFinisherMinutes(template.finisher.minutes, state.profile.sessionLength)),
        mode: template.finisher.modes[0],
        actualMinutes: "",
        completed: false
      },
      notes: ""
    };
  }

  function buildGenerationContext(date) {
    const priorSessions = getMeaningfulSessionsBefore(date);
    const lastSession = priorSessions.length ? priorSessions[priorSessions.length - 1] : null;
    const recentFourDays = priorSessions.filter((session) => dayDifference(date, session.date) <= 4);

    return {
      date,
      priorSessions,
      lastSession,
      recentFourDays,
      daysSinceFocus: (focus) => getDaysSinceFocus(focus, date, priorSessions),
      daysSinceTemplate: (templateId) => getDaysSinceTemplate(templateId, date, priorSessions)
    };
  }

  function pickTemplate(context, excludedTemplateIds) {
    const scored = WORKOUT_TEMPLATES.filter((template) => !excludedTemplateIds.includes(template.id)).map((template) => ({
      template,
      score: scoreTemplate(template, context)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].template;
  }

  function scoreTemplate(template, context) {
    let score = 0;
    const overlapWithLast = context.lastSession
      ? template.focusTags.filter((focus) => context.lastSession.focusTags.includes(focus)).length
      : 0;

    score += template.focusTags.reduce((sum, focus) => sum + Math.min(context.daysSinceFocus(focus), 5), 0);
    score -= overlapWithLast * 3.2;
    score -= Math.max(0, 5 - context.daysSinceTemplate(template.id)) * 1.1;

    if (template.id === "conditioning-circuit") {
      score += context.recentFourDays.length >= 3 ? 4 : -1;
    }

    if (template.focusTags.includes("lower")) {
      score += context.daysSinceFocus("lower") >= 3 ? 3 : -2;
    }

    if (template.focusTags.includes("pull")) {
      score += context.daysSinceFocus("pull") >= 2 ? 1.5 : 0;
    }

    if (template.focusTags.includes("push")) {
      score += context.daysSinceFocus("push") >= 2 ? 1.5 : 0;
    }

    if (template.id === "shoulders-arms") {
      score += context.daysSinceFocus("shoulders") >= 3 ? 1.5 : 0;
    }

    return score + Math.random() * 0.75;
  }

  function buildRationale(template, context) {
    const reasons = [];

    if (context.lastSession) {
      const overlap = template.focusTags.filter((focus) => context.lastSession.focusTags.includes(focus));
      if (!overlap.length) {
        reasons.push(`Yesterday leaned ${getSessionFocusLabel(context.lastSession).toLowerCase()}, so today rotates away from that.`);
      } else {
        reasons.push(`This still overlaps a little with ${getSessionFocusLabel(context.lastSession).toLowerCase()}, but uses different exercise shapes.`);
      }
    } else {
      reasons.push("There isn't much recent history yet, so this opens with a balanced first guess.");
    }

    const staleFocuses = template.focusTags
      .map((focus) => ({ focus, days: context.daysSinceFocus(focus) }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 2);

    staleFocuses.forEach((entry) => {
      if (entry.days >= 4) {
        reasons.push(`${humaniseFocus(entry.focus)} has been quiet for about ${entry.days} days.`);
      } else if (entry.days >= 2) {
        reasons.push(`${humaniseFocus(entry.focus)} hasn't had center stage for ${entry.days} days.`);
      }
    });

    if (template.id === "conditioning-circuit") {
      reasons.push("A lighter, faster day helps keep the week fresh when pure lifting starts to feel stale.");
    }

    return reasons.slice(0, 3);
  }

  function pickExerciseFromPool(poolName, context, usedExerciseIds, avoidDuplicatePoolPick) {
    const pool = EXERCISE_POOLS[poolName] || [];
    const ranked = pool
      .filter((exercise) => !usedExerciseIds.has(exercise.id))
      .map((exercise) => ({
        exercise,
        daysSinceUse: getDaysSinceExerciseUse(exercise.id, context.date)
      }))
      .sort((a, b) => b.daysSinceUse - a.daysSinceUse || Math.random() - 0.5);

    if (ranked.length) {
      return ranked[0].exercise;
    }

    return pool[0];
  }

  function getSuggestedTarget(exerciseBlueprint, repRange, previousRecord) {
    const [minReps, maxReps] = repRange;

    if (!previousRecord) {
      return {
        targetLoad: formatStoredNumber(getStarterLoad(exerciseBlueprint)),
        targetReps: String(minReps)
      };
    }

    const previousLoad = firstNumber(previousRecord.actualLoad, previousRecord.targetLoad, getStarterLoad(exerciseBlueprint));
    const previousReps = firstNumber(previousRecord.actualReps, previousRecord.targetReps, minReps);
    const previousCompleted = Boolean(previousRecord.completed);

    if (exerciseBlueprint.measure === "seconds" || exerciseBlueprint.progressionMode === "time") {
      const nextSeconds = previousCompleted ? Math.min(maxReps, previousReps + 5) : previousReps;
      return {
        targetLoad: "",
        targetReps: String(nextSeconds)
      };
    }

    if (exerciseBlueprint.bodyweight) {
      const nextReps = previousCompleted ? Math.min(maxReps, previousReps + 1) : previousReps;
      return {
        targetLoad: "",
        targetReps: String(nextReps)
      };
    }

    let nextLoad = previousLoad;
    let nextReps = previousReps;

    if (previousCompleted) {
      if (exerciseBlueprint.progressionMode === "reps-first" && previousReps < maxReps) {
        nextReps = previousReps + 1;
      } else {
        nextReps = minReps;
        nextLoad = roundToIncrement((previousLoad || 0) + exerciseBlueprint.increment, exerciseBlueprint.increment);
      }
    } else {
      nextReps = clampNumber(previousReps, minReps, maxReps);
    }

    return {
      targetLoad: formatStoredNumber(nextLoad),
      targetReps: String(nextReps)
    };
  }

  function getStarterLoad(exerciseBlueprint) {
    if (exerciseBlueprint.starterMultiplier == null) {
      return null;
    }
    const weight = asNumber(state.profile.bodyWeightKg);
    if (weight == null) {
      return null;
    }
    return roundToIncrement(weight * exerciseBlueprint.starterMultiplier, exerciseBlueprint.increment || 0.5);
  }

  function pickFinisherMinutes(range, targetSessionLength) {
    const [minMinutes, maxMinutes] = range;
    if (targetSessionLength <= 35) {
      return minMinutes;
    }
    if (targetSessionLength >= 45) {
      return maxMinutes;
    }
    return Math.round((minMinutes + maxMinutes) / 2);
  }

  function buildOutdoorIdeas() {
    const goodWeather = weatherState.forecast ? isOutdoorFriendly(weatherState.forecast) : false;
    const weatherLine = weatherState.forecast
      ? `${weatherState.forecast.conditionLabel.toLowerCase()} and about ${weatherState.forecast.temperatureLabel}`
      : "the day looks open enough";

    const suggestions = [
      {
        id: "run",
        title: "Easy run",
        copy: goodWeather
          ? `Weather looks decent today: ${weatherLine}. Try a 2 to 3 km run at an easy pace.`
          : "If you want variety, swap in a 2 to 3 km easy run or 20 minutes of jog-walk intervals."
      },
      {
        id: "walk-sport",
        title: "Social movement",
        copy: goodWeather
          ? "Book football, badminton, or just take a fast 35 to 45 minute walk if you want movement without gym brain."
          : "If the weather turns, book badminton, five-a-side, or any indoor activity that still gets you moving."
      },
      {
        id: "swim",
        title: "Swim or recovery cardio",
        copy: "If swimming is realistic today, use it. If not, swap to an easy bike or cross-trainer session for the same 30 to 40 minute window."
      }
    ];

    return {
      primary: goodWeather
        ? { title: "The forecast gives you options", copy: `It looks ${weatherLine}, so today can flex if you want a less predictable session.` }
        : { title: "No weather lock-in", copy: "Even if the forecast isn't helping, you can still swap to a sport, swim, or easy conditioning block." },
      suggestions
    };
  }

  function swapTodayForOutdoor(suggestionId) {
    const today = getTodayISODate();
    const existing = state.sessionsByDate[today];
    if (existing && hasMeaningfulSessionActivity(existing)) {
      const confirmed = window.confirm(
        "This will replace today's saved lifting plan with an outdoor or activity session. Keep going?"
      );
      if (!confirmed) {
        return;
      }
    }

    const suggestion = buildOutdoorIdeas().suggestions.find((item) => item.id === suggestionId) || buildOutdoorIdeas().suggestions[0];
    state.sessionsByDate[today] = {
      date: today,
      planType: "outdoor",
      templateId: `outdoor-${suggestion.id}`,
      title: suggestion.title,
      subtitle: "A generated outdoor detour for today.",
      focusTags: ["conditioning", "outdoor"],
      rationale: [
        "You asked for variety, so this is the app leaning into that instead of forcing another predictable gym day.",
        suggestion.copy
      ],
      generatedAt: new Date().toISOString(),
      outdoorLog: {
        title: suggestion.title,
        detail: suggestion.copy,
        targetMetric:
          suggestion.id === "run"
            ? "2 to 3 km easy"
            : suggestion.id === "walk-sport"
              ? "35 to 45 minutes or one game/session"
              : "20 to 30 minutes swimming or equivalent cardio",
        actualMetric: "",
        actualMinutes: "",
        completed: false
      },
      notes: ""
    };
    persistAndRender(true);
  }

  function getSession(date) {
    return state.sessionsByDate[date] || null;
  }

  function getRecentSessions(days) {
    const cutoff = toLocalISODate(addDays(parseLocalDate(getTodayISODate()), -(days - 1)));
    return Object.values(state.sessionsByDate)
      .filter((session) => session.date >= cutoff && session.date <= getTodayISODate())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function getMeaningfulSessionsBefore(date) {
    return Object.values(state.sessionsByDate)
      .filter((session) => session.date < date && hasMeaningfulSessionActivity(session))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function hasMeaningfulSessionActivity(session) {
    if (!session) {
      return false;
    }
    if (session.planType === "outdoor") {
      return (
        Boolean(session.outdoorLog && session.outdoorLog.completed) ||
        hasValue(session.outdoorLog && session.outdoorLog.actualMetric) ||
        hasValue(session.outdoorLog && session.outdoorLog.actualMinutes) ||
        hasValue(session.notes)
      );
    }

    const hasExerciseData = session.exercises.some((exercise) =>
      exercise.sets.some(
        (set) =>
          set.completed ||
          hasValue(set.actualLoad) ||
          hasValue(set.actualReps)
      )
    );

    const hasFinisherData = Boolean(
      session.finisher &&
        (session.finisher.completed || hasValue(session.finisher.actualMinutes))
    );

    return hasExerciseData || hasFinisherData || hasValue(session.notes);
  }

  function getStrengthSessionStats(session) {
    const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const completedSets = session.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length,
      0
    );
    const finisherComplete = Boolean(session.finisher && (session.finisher.completed || asNumber(session.finisher.actualMinutes) > 0));
    const completedUnits = completedSets + (finisherComplete ? 1 : 0);
    const totalUnits = totalSets + (session.finisher ? 1 : 0);
    const progress = totalUnits ? completedUnits / totalUnits : 0;
    const status = progress >= 1 ? "complete" : progress > 0 ? "partial" : "pending";
    const label = status === "complete" ? "Complete" : status === "partial" ? "In progress" : "Planned";

    return {
      totalSets,
      completedSets,
      progress,
      status,
      label
    };
  }

  function getOutdoorSessionStats(session) {
    const complete = Boolean(
      session.outdoorLog.completed ||
      hasValue(session.outdoorLog.actualMetric) ||
      asNumber(session.outdoorLog.actualMinutes) > 0
    );
    return {
      status: complete ? "complete" : "pending",
      label: complete ? "Logged" : "Planned"
    };
  }

  function getWindowMetrics(days) {
    const sessions = getRecentSessions(days);
    const meaningful = sessions.filter((session) => hasMeaningfulSessionActivity(session));
    const strengthSessions = meaningful.filter((session) => session.planType === "strength");
    const completedSets = strengthSessions.reduce(
      (sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.filter((set) => set.completed).length, 0),
      0
    );
    const totalCardioMinutes = meaningful.reduce((sum, session) => {
      if (session.planType === "outdoor") {
        return sum + (asNumber(session.outdoorLog.actualMinutes) || 0);
      }
      return sum + (session.finisher ? asNumber(session.finisher.actualMinutes) || 0 : 0);
    }, 0);
    const focusCounts = {};

    meaningful.forEach((session) => {
      session.focusTags.forEach((focus) => {
        focusCounts[focus] = (focusCounts[focus] || 0) + 1;
      });
    });

    const weighIns = state.weighIns.filter((entry) => entry.date >= toLocalISODate(addDays(parseLocalDate(getTodayISODate()), -(days - 1))));
    const sortedWeights = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
    const weightDelta =
      sortedWeights.length >= 2
        ? asNumber(sortedWeights[sortedWeights.length - 1].weight) - asNumber(sortedWeights[0].weight)
        : null;
    const latestFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0];
    const photoCount = getRecentCheckins(days).filter((entry) => entry.photoDataUrl).length;

    return {
      plannedSessions: sessions.length,
      completedSessions: meaningful.length,
      completedSets,
      totalCardioMinutes,
      focusCounts,
      focusLead: latestFocus ? `${humaniseFocus(latestFocus[0])} has shown up most often.` : "No pattern yet.",
      weightDelta,
      photoCount,
      outdoorSessions: meaningful.filter((session) => session.planType === "outdoor").length
    };
  }

  function getSessionFocusLabel(session) {
    const focus = session.focusTags.slice(0, 2).map((entry) => humaniseFocus(entry));
    return focus.join(" + ") || "General";
  }

  function getDaysSinceFocus(focus, date, priorSessions) {
    for (let index = priorSessions.length - 1; index >= 0; index -= 1) {
      if (priorSessions[index].focusTags.includes(focus)) {
        return dayDifference(date, priorSessions[index].date);
      }
    }
    return 99;
  }

  function getDaysSinceTemplate(templateId, date, priorSessions) {
    for (let index = priorSessions.length - 1; index >= 0; index -= 1) {
      if (priorSessions[index].templateId === templateId) {
        return dayDifference(date, priorSessions[index].date);
      }
    }
    return 99;
  }

  function getDaysSinceExerciseUse(exerciseId, date) {
    const sessions = getMeaningfulSessionsBefore(date);
    for (let index = sessions.length - 1; index >= 0; index -= 1) {
      const session = sessions[index];
      if (session.planType !== "strength") {
        continue;
      }
      if (session.exercises.some((exercise) => exercise.exerciseId === exerciseId)) {
        return dayDifference(date, session.date);
      }
    }
    return 99;
  }

  function getLatestExerciseRecord(exerciseId, date) {
    const sessions = getMeaningfulSessionsBefore(date).reverse();
    for (const session of sessions) {
      if (session.planType !== "strength") {
        continue;
      }
      const exercise = session.exercises.find((item) => item.exerciseId === exerciseId);
      if (exercise) {
        return exercise.sets[0];
      }
    }
    return null;
  }

  function upsertWeighIn(date, weight) {
    state.weighIns = state.weighIns.filter((entry) => entry.date !== date);
    if (weight !== "") {
      state.weighIns.push({
        id: createId("weight"),
        date,
        weight
      });
      state.weighIns.sort((a, b) => a.date.localeCompare(b.date));
    }
  }

  function getLatestWeighIn() {
    return [...state.weighIns].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function getWeighInByDate(date) {
    return state.weighIns.find((entry) => entry.date === date) || null;
  }

  function updateProfileWeightFromLatest() {
    updateProfileWeightFromLatestState(state);
  }

  function updateProfileWeightFromLatestState(targetState) {
    const latest = [...targetState.weighIns].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (latest && latest.weight !== "") {
      targetState.profile.bodyWeightKg = latest.weight;
    }
  }

  function ensureCheckinDraft(date) {
    const existing = state.checkins.find((entry) => entry.date === date);
    if (existing) {
      state.ui.checkinDraft = {
        date: existing.date,
        bodyWeightKg: existing.bodyWeightKg || getWeighInByDate(existing.date)?.weight || "",
        waistCm: existing.waistCm || "",
        energy: existing.energy || "",
        reflection: existing.reflection || "",
        photoDataUrl: existing.photoDataUrl || "",
        photoName: existing.photoName || "",
        photoUpdatedAt: existing.photoUpdatedAt || ""
      };
      return;
    }

    state.ui.checkinDraft = {
      ...createEmptyCheckinDraft(date),
      bodyWeightKg: getWeighInByDate(date)?.weight || ""
    };
  }

  function saveCheckinDraft() {
    const draft = { ...state.ui.checkinDraft };
    if (!draft.date || !isValidISODate(draft.date)) {
      window.alert("Pick a valid check-in date first.");
      return;
    }

    const existing = state.checkins.find((entry) => entry.date === draft.date);
    const record = {
      id: existing ? existing.id : createId("checkin"),
      date: draft.date,
      bodyWeightKg: draft.bodyWeightKg || "",
      waistCm: draft.waistCm || "",
      energy: draft.energy || "",
      reflection: draft.reflection || "",
      photoDataUrl: draft.photoDataUrl || "",
      photoName: draft.photoName || "",
      photoUpdatedAt: draft.photoUpdatedAt || ""
    };

    state.checkins = state.checkins.filter((entry) => entry.date !== draft.date);
    state.checkins.push(record);
    state.checkins.sort((a, b) => a.date.localeCompare(b.date));

    if (draft.bodyWeightKg !== "") {
      upsertWeighIn(draft.date, draft.bodyWeightKg);
      updateProfileWeightFromLatest();
    }

    ensureCheckinDraft(draft.date);
    persistAndRender(true);
  }

  function getRecentCheckins(days) {
    const cutoff = toLocalISODate(addDays(parseLocalDate(getTodayISODate()), -(days - 1)));
    return state.checkins.filter((entry) => entry.date >= cutoff).sort((a, b) => b.date.localeCompare(a.date));
  }

  function getCheckinStatus() {
    const today = getTodayISODate();
    const latest = [...state.checkins].sort((a, b) => b.date.localeCompare(a.date))[0];
    const todayDate = parseLocalDate(today);
    const isSunday = todayDate.getDay() === 0;

    if (!latest) {
      return {
        due: true,
        message: "No check-ins saved yet. Give yourself a baseline photo and a quick note."
      };
    }

    const daysSince = dayDifference(today, latest.date);
    if (isSunday && daysSince >= 6) {
      return {
        due: true,
        message: "Today is a good Sunday checkpoint. Save the photo, waist, and a short reflection."
      };
    }
    if (daysSince >= 7) {
      return {
        due: true,
        message: `It has been about ${daysSince} days since the last check-in, so you’re due another one.`
      };
    }
    return {
      due: false,
      message: `Last check-in was ${daysSince === 0 ? "today" : `${daysSince} day${daysSince === 1 ? "" : "s"} ago`}.`
    };
  }

  function exportBackup() {
    const payload = {
      app: "Blockkeeper Daily",
      exportedAt: new Date().toISOString(),
      version: APP_VERSION,
      state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blockkeeper-daily-backup-${getTodayISODate()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = parsed && parsed.state ? parsed.state : parsed;
      if (!imported || typeof imported !== "object") {
        throw new Error("Invalid backup");
      }
      state = {
        ...createDefaultState(),
        ...imported
      };
      hydrateState();
      ensureTodaySession();
      persistAndRender(true);
      window.alert("Backup imported successfully.");
    } catch (error) {
      window.alert("That backup file could not be imported.");
    }
  }

  function requestWeatherLocation() {
    if (!navigator.geolocation) {
      weatherState = {
        status: "error",
        summary: "",
        forecast: null,
        error: "This browser does not expose geolocation."
      };
      renderWeatherPanel();
      return;
    }

    weatherState = {
      status: "loading",
      summary: "",
      forecast: null,
      error: ""
    };
    renderWeatherPanel();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.profile.location = {
          latitude: roundToTwo(position.coords.latitude),
          longitude: roundToTwo(position.coords.longitude)
        };
        saveState();
        refreshWeather(true);
      },
      () => {
        weatherState = {
          status: "error",
          summary: "",
          forecast: null,
          error: "Location permission was declined, so the app will fall back to generic activity suggestions."
        };
        renderWeatherPanel();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000
      }
    );
  }

  async function refreshWeather(force) {
    if (!state.profile.location) {
      return;
    }

    weatherState = {
      status: "loading",
      summary: "",
      forecast: null,
      error: ""
    };
    renderWeatherPanel();

    try {
      const { latitude, longitude } = state.profile.location;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Weather lookup failed.");
      }
      const data = await response.json();
      const currentCode = data.current && typeof data.current.weather_code === "number" ? data.current.weather_code : null;
      const temp = data.current && typeof data.current.temperature_2m === "number" ? data.current.temperature_2m : null;
      const precip = data.daily && Array.isArray(data.daily.precipitation_probability_max) ? data.daily.precipitation_probability_max[0] : null;
      const maxTemp = data.daily && Array.isArray(data.daily.temperature_2m_max) ? data.daily.temperature_2m_max[0] : null;
      const minTemp = data.daily && Array.isArray(data.daily.temperature_2m_min) ? data.daily.temperature_2m_min[0] : null;

      weatherState = {
        status: "ready",
        summary: "",
        error: "",
        forecast: {
          code: currentCode,
          conditionLabel: WEATHER_CODE_LABELS[currentCode] || "Unknown",
          temperature: temp,
          temperatureLabel: temp != null ? `${Math.round(temp)}°C` : "—",
          precipitationProbability: precip != null ? Math.round(precip) : 0,
          maxTemp: maxTemp != null ? Math.round(maxTemp) : null,
          minTemp: minTemp != null ? Math.round(minTemp) : null
        }
      };
      renderApp();
    } catch (error) {
      weatherState = {
        status: "error",
        summary: "",
        forecast: null,
        error: "The forecast could not be loaded right now, so outdoor suggestions will stay generic."
      };
      renderWeatherPanel();
    }
  }

  function isOutdoorFriendly(forecast) {
    const fairCodes = [0, 1, 2, 3];
    return (
      fairCodes.includes(forecast.code) &&
      forecast.precipitationProbability <= 35 &&
      forecast.temperature >= 8 &&
      forecast.temperature <= 24
    );
  }

  function startRestTimer(seconds, label) {
    state.timer = {
      label,
      durationMs: seconds * 1000,
      endAt: Date.now() + seconds * 1000,
      pausedRemainingMs: null,
      paused: false,
      finished: false
    };
    state.ui.timerCollapsed = shouldCollapseTimerByDefault();
    saveState(false);
    renderTimer();
    startTimerTicker();
  }

  function startTimerTicker() {
    if (timerIntervalId != null) {
      return;
    }
    timerIntervalId = window.setInterval(() => {
      if (!state.timer) {
        window.clearInterval(timerIntervalId);
        timerIntervalId = null;
        renderTimer();
        return;
      }
      if (!state.timer.paused && getTimerRemainingMs() <= 0 && !state.timer.finished) {
        state.timer.finished = true;
        state.timer.paused = true;
        state.timer.pausedRemainingMs = 0;
        saveState(false);
      }
      renderTimer();
    }, 250);
  }

  function handleTimerControl(control) {
    if (!state.timer) {
      return;
    }
    if (control === "pause" && !state.timer.paused) {
      state.timer.pausedRemainingMs = getTimerRemainingMs();
      state.timer.paused = true;
      saveState(false);
      renderTimer();
      return;
    }
    if (control === "resume" && state.timer.paused) {
      const remaining = state.timer.pausedRemainingMs ?? state.timer.durationMs;
      state.timer.endAt = Date.now() + remaining;
      state.timer.pausedRemainingMs = null;
      state.timer.paused = false;
      state.timer.finished = false;
      saveState(false);
      renderTimer();
      return;
    }
    if (control === "add15") {
      if (state.timer.paused) {
        state.timer.pausedRemainingMs = (state.timer.pausedRemainingMs ?? 0) + 15000;
      } else {
        state.timer.endAt += 15000;
      }
      state.timer.finished = false;
      saveState(false);
      renderTimer();
      return;
    }
    if (control === "stop") {
      state.timer = null;
      saveState(false);
      renderTimer();
    }
  }

  function renderTimer() {
    if (!state.timer) {
      dom.timerDock.className = "timer-dock is-hidden";
      dom.timerDock.innerHTML = "";
      return;
    }

    const remainingMs = getTimerRemainingMs();
    const remainingPct = state.timer.durationMs ? Math.max(0, Math.min(1, remainingMs / state.timer.durationMs)) : 0;
    const paused = state.timer.paused;
    const finished = state.timer.finished || remainingMs <= 0;
    const collapsed = Boolean(state.ui.timerCollapsed);
    const pauseLabel = paused ? "Resume" : "Pause";

    dom.timerDock.className = `timer-dock${collapsed ? " is-collapsed" : ""}`;

    if (collapsed) {
      dom.timerDock.innerHTML = `
        <div class="timer-compact">
          <button class="timer-pill" type="button" data-action="toggle-timer">
            <span class="timer-pill-label">${escapeHtml(getTimerShortLabel(state.timer.label))}</span>
            <strong>${finished ? "Done" : formatDuration(remainingMs)}</strong>
          </button>
          <div class="timer-mini-controls">
            <button type="button" data-action="timer-control" data-control="${paused ? "resume" : "pause"}">${pauseLabel}</button>
            <button type="button" data-action="timer-control" data-control="stop">Stop</button>
          </div>
        </div>
      `;
      return;
    }

    dom.timerDock.innerHTML = `
      <div class="timer-top">
        <div>
          <p class="timer-label">${escapeHtml(state.timer.label)}</p>
          <div class="timer-value">${finished ? "Done" : formatDuration(remainingMs)}</div>
          <p class="timer-subtext">${finished ? "Rest is up." : paused ? "Timer paused." : "Rest is running."}</p>
        </div>
        <button class="ghost-button timer-minimise" type="button" data-action="toggle-timer">Minimise</button>
      </div>
      <div class="timer-track"><span style="width: ${Math.round(remainingPct * 100)}%;"></span></div>
      <div class="timer-actions">
        <button type="button" data-action="timer-control" data-control="${paused ? "resume" : "pause"}">${pauseLabel}</button>
        <button type="button" data-action="timer-control" data-control="add15">+15s</button>
        <button type="button" data-action="timer-control" data-control="stop">Stop</button>
      </div>
    `;
  }

  function getTimerRemainingMs() {
    if (!state.timer) {
      return 0;
    }
    if (state.timer.paused) {
      return Math.max(0, state.timer.pausedRemainingMs ?? 0);
    }
    return Math.max(0, state.timer.endAt - Date.now());
  }

  function normaliseTimer(timer) {
    if (!timer) {
      return null;
    }
    const remaining = timer.paused ? timer.pausedRemainingMs ?? 0 : timer.endAt - Date.now();
    if (remaining <= 0) {
      return null;
    }
    return {
      ...timer,
      finished: false
    };
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const maxSide = 720;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const width = Math.round(image.width * scale);
          const height = Math.round(image.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.fillStyle = "#f5ecdd";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.68));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function registerServiceWorker() {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  function renderCheckinPill(entry) {
    return `${formatShortDate(parseLocalDate(entry.date))} • ${entry.waistCm ? `${entry.waistCm} cm` : "check-in"}`;
  }

  function shouldCollapseTimerByDefault() {
    return Boolean(window.matchMedia && window.matchMedia("(max-width: 860px)").matches);
  }

  function getTimerShortLabel(label) {
    return String(label || "Rest")
      .replace(/\s*•\s*rest/i, "")
      .trim();
  }

  function describeExerciseTargets(exercise) {
    if (!exercise.sets.length) {
      return "Targets pending";
    }
    const sample = exercise.sets[0];
    if (exercise.measure === "seconds") {
      return `${sample.targetReps || "0"} to ${sample.targetReps || "0"} seconds`;
    }
    return `${sample.targetReps || "0"} reps target`;
  }

  function describeExercisePerformance(exercise) {
    const completed = exercise.sets.filter((set) => set.completed).length;
    const firstActual = exercise.sets.find((set) => hasValue(set.actualLoad) || hasValue(set.actualReps));
    if (firstActual) {
      const load = hasValue(firstActual.actualLoad) ? `${escapeHtml(formatDisplayNumber(asNumber(firstActual.actualLoad)))} kg` : "";
      const reps = hasValue(firstActual.actualReps) ? `${escapeHtml(formatDisplayNumber(asNumber(firstActual.actualReps)))} ${exercise.measure === "seconds" ? "sec" : "reps"}` : "";
      return [load, reps].filter(Boolean).join(" • ");
    }
    return `${completed}/${exercise.sets.length} sets completed`;
  }

  function humaniseFocus(focus) {
    return String(focus || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function humaniseLegacyExerciseId(id) {
    return humaniseFocus(id);
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function formatShortDate(date) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function formatLongDate(date) {
    return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }

  function formatShortTimestamp(isoTimestamp) {
    if (!isoTimestamp) {
      return "just now";
    }
    return new Date(isoTimestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatRelativeTimestamp(isoTimestamp) {
    if (!isoTimestamp) {
      return "not yet";
    }

    const diffMs = Date.now() - new Date(isoTimestamp).getTime();
    const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

    if (diffMinutes < 1) {
      return "just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  function formatStoredNumber(value) {
    if (value == null || value === "") {
      return "";
    }
    return String(roundToTwo(Number(value)));
  }

  function formatDisplayNumber(value) {
    if (value == null || value === "") {
      return "";
    }
    const rounded = roundToTwo(Number(value));
    return String(rounded).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function asNumber(value) {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function firstNumber() {
    for (const value of arguments) {
      const numeric = asNumber(value);
      if (numeric != null) {
        return numeric;
      }
    }
    return null;
  }

  function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundToIncrement(value, increment) {
    if (!Number.isFinite(value)) {
      return value;
    }
    if (!increment) {
      return roundToTwo(value);
    }
    return roundToTwo(Math.round(value / increment) * increment);
  }

  function roundToTwo(value) {
    return Math.round(value * 100) / 100;
  }

  function parseLocalDate(iso) {
    const [year, month, day] = String(iso).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function toLocalISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isValidISODate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) {
      return false;
    }
    return Number.isFinite(parseLocalDate(iso).getTime());
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function getTodayISODate() {
    return toLocalISODate(new Date());
  }

  function dayDifference(laterDateIso, earlierDateIso) {
    const later = parseLocalDate(laterDateIso);
    const earlier = parseLocalDate(earlierDateIso);
    return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 86400000));
  }

  function dedupeByDate(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      if (entry && entry.date) {
        map.set(entry.date, entry);
      }
    });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
})();
