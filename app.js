(function () {
  const STORAGE_KEY = "blockkeeper-fitness-tracker-v1";
  const TOTAL_WEEKS = 3;

  const WEEK_GUIDANCE = {
    1: {
      title: "Base Week",
      cue: "Learn the flow, keep 2 to 3 reps in reserve, and use this week to calibrate realistic starter loads."
    },
    2: {
      title: "Build Week",
      cue: "If week 1 felt clean, let the app nudge the next week up with a small load jump or one extra rep."
    },
    3: {
      title: "Push Week",
      cue: "Beat week 2 slightly without changing everything at once. Cleaner reps and better pacing still count."
    }
  };

  const WORKOUT_DAYS = [
    {
      id: "upper-push",
      weekday: "Monday",
      calendarOffset: 0,
      title: "Upper Body Push + Cardio",
      summary: "Press-heavy day. Keep the compounds honest and use short rests on the accessories.",
      strengthMinutes: 25,
      cardio: {
        min: 12,
        max: 15,
        suggested: 14,
        note: "Steady-state incline walk, bike, or cross trainer. You should be able to talk, but not sing.",
        modes: ["Incline walk", "Bike", "Cross trainer"]
      },
      exercises: [
        {
          id: "bench-press",
          name: "Bench Press or Dumbbell Press",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 90,
          increment: 2,
          starterMultiplier: 0.55,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "shoulder-press",
          name: "Shoulder Press",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 75,
          increment: 1,
          starterMultiplier: 0.34,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "incline-dumbbell-press",
          name: "Incline Dumbbell Press",
          sets: 2,
          repRange: [10, 12],
          restSeconds: 60,
          increment: 1,
          starterMultiplier: 0.42,
          progressionMode: "reps-first"
        },
        {
          id: "tricep-pushdowns",
          name: "Tricep Pushdowns",
          sets: 2,
          repRange: [12, 15],
          restSeconds: 45,
          increment: 2.5,
          starterMultiplier: 0.24,
          progressionMode: "reps-first"
        },
        {
          id: "lateral-raises",
          name: "Lateral Raises",
          sets: 2,
          repRange: [12, 15],
          restSeconds: 45,
          increment: 1,
          starterMultiplier: 0.1,
          progressionMode: "reps-first"
        }
      ]
    },
    {
      id: "lower-body",
      weekday: "Tuesday",
      calendarOffset: 1,
      title: "Lower Body + Cardio",
      summary: "Use the bigger rests on the first two lifts, then move quickly through the accessory work.",
      strengthMinutes: 25,
      cardio: {
        min: 12,
        max: 15,
        suggested: 13,
        note: "Steady-state bike or incline walk. Keep it controlled after the leg work.",
        modes: ["Bike", "Incline walk"]
      },
      exercises: [
        {
          id: "squat-or-leg-press",
          name: "Squat or Leg Press",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 90,
          increment: 5,
          starterMultiplier: 0.85,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "romanian-deadlift",
          name: "Romanian Deadlift",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 90,
          increment: 5,
          starterMultiplier: 0.78,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "lunges-or-split-squats",
          name: "Walking Lunges or Split Squats",
          sets: 2,
          repRange: [10, 10],
          restSeconds: 60,
          increment: 2.5,
          starterMultiplier: 0.34,
          progressionMode: "load-first",
          note: "Target reps are per leg."
        },
        {
          id: "leg-curl",
          name: "Leg Curl",
          sets: 2,
          repRange: [12, 12],
          restSeconds: 45,
          increment: 2.5,
          starterMultiplier: 0.36,
          progressionMode: "load-first"
        },
        {
          id: "calf-raises",
          name: "Calf Raises",
          sets: 2,
          repRange: [12, 15],
          restSeconds: 45,
          increment: 5,
          starterMultiplier: 0.5,
          progressionMode: "reps-first"
        }
      ]
    },
    {
      id: "pull-day",
      weekday: "Thursday",
      calendarOffset: 3,
      title: "Pull Day + Cardio",
      summary: "Back volume first, then tidy up shoulders and biceps before the steady-state finish.",
      strengthMinutes: 25,
      cardio: {
        min: 12,
        max: 15,
        suggested: 14,
        note: "Steady-state cross trainer, incline walk, or bike.",
        modes: ["Cross trainer", "Incline walk", "Bike"]
      },
      exercises: [
        {
          id: "lat-pulldown",
          name: "Lat Pulldown or Assisted Pull-Ups",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: 0.66,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "seated-cable-row",
          name: "Seated Cable Row",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: 0.62,
          progressionMode: "load-first"
        },
        {
          id: "dumbbell-row",
          name: "Dumbbell Row",
          sets: 2,
          repRange: [10, 10],
          restSeconds: 60,
          increment: 2.5,
          starterMultiplier: 0.42,
          progressionMode: "load-first",
          note: "Target reps are per side."
        },
        {
          id: "face-pulls",
          name: "Face Pulls",
          sets: 2,
          repRange: [12, 15],
          restSeconds: 45,
          increment: 2.5,
          starterMultiplier: 0.2,
          progressionMode: "reps-first"
        },
        {
          id: "bicep-curls",
          name: "Bicep Curls",
          sets: 2,
          repRange: [10, 12],
          restSeconds: 45,
          increment: 1,
          starterMultiplier: 0.14,
          progressionMode: "reps-first"
        }
      ]
    },
    {
      id: "full-body",
      weekday: "Friday",
      calendarOffset: 4,
      title: "Full Body Strength + Cardio",
      summary: "The heaviest hinge of the week. Keep the bench and row sharp, then finish with moderate cardio.",
      strengthMinutes: 25,
      cardio: {
        min: 12,
        max: 15,
        suggested: 14,
        note: "Steady-state cardio at a moderate effort.",
        modes: ["Incline walk", "Cross trainer", "Bike"]
      },
      exercises: [
        {
          id: "deadlift",
          name: "Deadlift or Trap Bar Deadlift",
          sets: 3,
          repRange: [5, 8],
          restSeconds: 90,
          increment: 5,
          starterMultiplier: 1.0,
          progressionMode: "load-first",
          review: true
        },
        {
          id: "dumbbell-bench-press",
          name: "Dumbbell Bench Press",
          sets: 3,
          repRange: [8, 10],
          restSeconds: 75,
          increment: 2,
          starterMultiplier: 0.5,
          progressionMode: "load-first"
        },
        {
          id: "goblet-squat",
          name: "Goblet Squat or Leg Press",
          sets: 2,
          repRange: [10, 12],
          restSeconds: 60,
          increment: 2.5,
          starterMultiplier: 0.42,
          progressionMode: "reps-first"
        },
        {
          id: "cable-row",
          name: "Cable Row",
          sets: 2,
          repRange: [10, 12],
          restSeconds: 60,
          increment: 2.5,
          starterMultiplier: 0.56,
          progressionMode: "reps-first"
        },
        {
          id: "plank",
          name: "Plank",
          sets: 2,
          repRange: [30, 60],
          restSeconds: 45,
          increment: 0,
          starterMultiplier: null,
          progressionMode: "time",
          measure: "seconds"
        }
      ]
    },
    {
      id: "conditioning",
      weekday: "Saturday",
      calendarOffset: 5,
      title: "Conditioning Strength + Longer Cardio",
      summary: "Three controlled rounds. Keep moving, but do not let the circuit turn into a frantic mess.",
      strengthMinutes: 20,
      cardio: {
        min: 18,
        max: 20,
        suggested: 19,
        note: "Steady-state incline walk, bike, or cross trainer.",
        modes: ["Incline walk", "Bike", "Cross trainer"]
      },
      exercises: [
        {
          id: "kettlebell-swings",
          name: "Kettlebell Swings or Dumbbell Romanian Deadlift",
          sets: 3,
          repRange: [12, 12],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: 0.36,
          progressionMode: "load-first"
        },
        {
          id: "push-ups-or-machine-press",
          name: "Push-Ups or Machine Chest Press",
          sets: 3,
          repRange: [10, 12],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: null,
          progressionMode: "reps-first"
        },
        {
          id: "cable-or-trx-rows",
          name: "Cable Rows or TRX Rows",
          sets: 3,
          repRange: [10, 12],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: 0.5,
          progressionMode: "reps-first"
        },
        {
          id: "step-ups-or-lunges",
          name: "Step-Ups or Bodyweight Lunges",
          sets: 3,
          repRange: [10, 10],
          restSeconds: 75,
          increment: 2.5,
          starterMultiplier: null,
          progressionMode: "load-first",
          note: "Target reps are per leg."
        },
        {
          id: "dead-bug-or-knee-raise",
          name: "Dead Bug or Hanging Knee Raise",
          sets: 3,
          repRange: [10, 12],
          restSeconds: 75,
          increment: 0,
          starterMultiplier: null,
          progressionMode: "reps-first"
        }
      ]
    }
  ];

  const RECOVERY_DAYS = [
    {
      id: "wednesday",
      weekday: "Wednesday",
      calendarOffset: 2,
      title: "Rest or Light Walk",
      summary: "Keep recovery active without sneaking in a hidden sixth training day.",
      pills: ["20 to 40 minute walk", "Mobility", "Hydrate", "Early night"]
    },
    {
      id: "sunday",
      weekday: "Sunday",
      calendarOffset: 6,
      title: "Sunday Check-In",
      summary: "Upload a photo, measure waist, look at the trend lines, and reset the next week calmly.",
      pills: ["Photo", "Waist", "Reflection", "Week review"]
    }
  ];

  const REVIEW_LIFTS = [
    { dayId: "upper-push", exerciseId: "bench-press", label: "Bench / DB Press" },
    { dayId: "lower-body", exerciseId: "squat-or-leg-press", label: "Squat / Leg Press" },
    { dayId: "lower-body", exerciseId: "romanian-deadlift", label: "Romanian Deadlift" },
    { dayId: "pull-day", exerciseId: "lat-pulldown", label: "Lat Pulldown / Pull-Up" },
    { dayId: "full-body", exerciseId: "deadlift", label: "Deadlift / Trap Bar" }
  ];

  const dom = {
    blockStart: document.getElementById("block-start"),
    bodyWeight: document.getElementById("body-weight"),
    resetData: document.getElementById("reset-data"),
    importDataFile: document.getElementById("import-data-file"),
    weekSwitcher: document.getElementById("week-switcher"),
    summaryCards: document.getElementById("summary-cards"),
    viewSwitcher: document.getElementById("view-switcher"),
    viewRoot: document.getElementById("view-root"),
    timerDock: document.getElementById("timer-dock")
  };

  let state = loadState();
  let computedPlan = {};
  let timerIntervalId = null;
  let storageWarning = "";

  hydrateState();
  attachEvents();
  recomputeAndRender();
  startTimerTicker();
  registerServiceWorker();

  function attachEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("submit", handleSubmit);
  }

  function handleClick(event) {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.action;

    if (action === "switch-week") {
      state.activeWeek = clampNumber(asNumber(actionTarget.dataset.week) || 1, 1, TOTAL_WEEKS);
      saveState();
      recomputeAndRender();
      return;
    }

    if (action === "switch-view") {
      state.activeView = actionTarget.dataset.view || "program";
      saveState();
      renderChrome();
      renderActiveView();
      return;
    }

    if (action === "reset-data") {
      const confirmed = window.confirm(
        "Reset the entire local 3-week block? This clears saved sets, cardio, steps, weigh-ins, and photos from this browser."
      );
      if (!confirmed) {
        return;
      }
      state = createDefaultState();
      saveState();
      recomputeAndRender();
      return;
    }

    if (action === "export-data") {
      exportBackup();
      return;
    }

    if (action === "trigger-import") {
      if (dom.importDataFile) {
        dom.importDataFile.value = "";
        dom.importDataFile.click();
      }
      return;
    }

    if (action === "delete-weighin") {
      const entryId = actionTarget.dataset.entryId;
      state.weighIns = state.weighIns.filter((entry) => entry.id !== entryId);
      saveState();
      recomputeAndRender();
      return;
    }

    if (action === "clear-photo") {
      const week = clampNumber(asNumber(actionTarget.dataset.week) || state.activeWeek, 1, TOTAL_WEEKS);
      state.weekCheckins[week].photoDataUrl = "";
      state.weekCheckins[week].photoName = "";
      state.weekCheckins[week].photoUpdatedAt = "";
      saveState();
      recomputeAndRender();
      return;
    }

    if (action === "timer-control") {
      const control = actionTarget.dataset.control;
      handleTimerControl(control);
      return;
    }
  }

  async function handleChange(event) {
    const target = event.target;

    if (target === dom.blockStart) {
      if (target.value) {
        state.blockStart = target.value;
        saveState();
        recomputeAndRender();
      }
      return;
    }

    if (target === dom.bodyWeight) {
      state.profile.bodyWeightKg = target.value;
      saveState();
      recomputeAndRender();
      return;
    }

    if (target.dataset.kind === "set-field") {
      const week = clampNumber(asNumber(target.dataset.week) || 1, 1, TOTAL_WEEKS);
      const key = makeSetKey(week, target.dataset.day, target.dataset.exercise, target.dataset.set);
      const record = state.sets[key] || {};
      const field = target.dataset.field;
      const previousCompleted = Boolean(record.completed);
      record[field] = target.type === "checkbox" ? target.checked : target.value;
      state.sets[key] = record;

      if (field === "completed" && target.checked && !previousCompleted) {
        const exercise = findExercise(target.dataset.day, target.dataset.exercise);
        const label = exercise ? `${exercise.name} • rest` : "Rest timer";
        const restSeconds = exercise ? exercise.restSeconds : 60;
        startRestTimer(restSeconds, label);
      }

      saveState();
      recomputeAndRender();
      return;
    }

    if (target.dataset.kind === "cardio-field") {
      const week = clampNumber(asNumber(target.dataset.week) || 1, 1, TOTAL_WEEKS);
      const key = makeSessionKey(week, target.dataset.day);
      const record = state.cardio[key] || {};
      const field = target.dataset.field;
      record[field] = target.type === "checkbox" ? target.checked : target.value;
      state.cardio[key] = record;
      saveState();
      recomputeAndRender();
      return;
    }

    if (target.dataset.kind === "session-note") {
      const week = clampNumber(asNumber(target.dataset.week) || 1, 1, TOTAL_WEEKS);
      const key = makeSessionKey(week, target.dataset.day);
      state.sessionNotes[key] = target.value;
      saveState();
      return;
    }

    if (target.dataset.kind === "checkin-field") {
      const week = clampNumber(asNumber(target.dataset.week) || state.activeWeek, 1, TOTAL_WEEKS);
      const field = target.dataset.field;
      state.weekCheckins[week][field] = target.value;
      saveState();
      recomputeAndRender();
      return;
    }

    if (target.dataset.kind === "steps-field") {
      const date = target.dataset.date;
      state.steps[date] = target.value;
      saveState();
      recomputeAndRender();
      return;
    }

    if (target.dataset.kind === "photo-upload") {
      const week = clampNumber(asNumber(target.dataset.week) || state.activeWeek, 1, TOTAL_WEEKS);
      const file = target.files && target.files[0];
      if (!file) {
        return;
      }
      const dataUrl = await compressImage(file);
      state.weekCheckins[week].photoDataUrl = dataUrl;
      state.weekCheckins[week].photoName = file.name;
      state.weekCheckins[week].photoUpdatedAt = new Date().toISOString();
      saveState();
      recomputeAndRender();
      return;
    }

    if (target === dom.importDataFile) {
      const file = target.files && target.files[0];
      if (!file) {
        return;
      }
      await importBackupFile(file);
    }
  }

  function handleSubmit(event) {
    const form = event.target;

    if (form.dataset.kind !== "weighin-form") {
      return;
    }

    event.preventDefault();

    const dateInput = form.querySelector('input[name="weighin-date"]');
    const weightInput = form.querySelector('input[name="weighin-value"]');
    const date = dateInput.value;
    const weight = weightInput.value;

    if (!date || weight === "") {
      return;
    }

    state.weighIns = state.weighIns.filter((entry) => !(entry.date === date && entry.weight === weight));
    state.weighIns.push({
      id: createId("weighin"),
      date,
      weight
    });
    state.weighIns.sort((a, b) => a.date.localeCompare(b.date));
    saveState();
    recomputeAndRender();
  }

  function hydrateState() {
    state.version = 1;
    state.blockStart = isValidISODate(state.blockStart) ? state.blockStart : toLocalISODate(getUpcomingMonday(new Date()));
    state.activeView = ["program", "checkin", "review"].includes(state.activeView) ? state.activeView : "program";
    state.activeWeek = clampNumber(asNumber(state.activeWeek) || inferActiveWeek(state.blockStart), 1, TOTAL_WEEKS);
    state.profile = state.profile || {};
    state.profile.bodyWeightKg = state.profile.bodyWeightKg === "" ? "" : state.profile.bodyWeightKg || "82.5";
    state.sets = state.sets || {};
    state.cardio = state.cardio || {};
    state.sessionNotes = state.sessionNotes || {};
    state.weighIns = Array.isArray(state.weighIns) ? state.weighIns : [];
    state.steps = state.steps || {};
    state.timer = normaliseTimer(state.timer);
    state.weekCheckins = state.weekCheckins || {};

    for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
      state.weekCheckins[week] = {
        waist: "",
        photoDataUrl: "",
        photoName: "",
        photoUpdatedAt: "",
        photoNotes: "",
        reflection: "",
        energy: "",
        ...state.weekCheckins[week]
      };
    }

    saveState();
  }

  function createDefaultState() {
    return {
      version: 1,
      blockStart: toLocalISODate(getUpcomingMonday(new Date())),
      activeWeek: 1,
      activeView: "program",
      profile: {
        bodyWeightKg: "82.5"
      },
      sets: {},
      cardio: {},
      sessionNotes: {},
      weighIns: [],
      steps: {},
      weekCheckins: {
        1: createWeekCheckin(),
        2: createWeekCheckin(),
        3: createWeekCheckin()
      },
      timer: null
    };
  }

  function createWeekCheckin() {
    return {
      waist: "",
      photoDataUrl: "",
      photoName: "",
      photoUpdatedAt: "",
      photoNotes: "",
      reflection: "",
      energy: ""
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState();
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : createDefaultState();
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageWarning = "";
    } catch (error) {
      storageWarning = "Saving is limited in this browser context. The tracker still works, but changes may not persist after refresh.";
    }
  }

  function exportBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "Blockkeeper",
      version: state.version || 1,
      state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blockkeeper-backup-${toLocalISODate(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importBackupFile(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const candidate = parsed && typeof parsed === "object" && parsed.state ? parsed.state : parsed;
      if (!candidate || typeof candidate !== "object") {
        throw new Error("Invalid backup file");
      }

      state = mergeImportedState(candidate);
      hydrateState();
      saveState();
      recomputeAndRender();
      window.alert("Backup imported. Your tracker has been updated on this device.");
    } catch (error) {
      window.alert("That backup file could not be imported.");
    }
  }

  function mergeImportedState(candidate) {
    return {
      ...createDefaultState(),
      ...candidate,
      profile: {
        ...createDefaultState().profile,
        ...(candidate.profile || {})
      },
      weekCheckins: {
        1: { ...createWeekCheckin(), ...(candidate.weekCheckins && candidate.weekCheckins[1] ? candidate.weekCheckins[1] : {}) },
        2: { ...createWeekCheckin(), ...(candidate.weekCheckins && candidate.weekCheckins[2] ? candidate.weekCheckins[2] : {}) },
        3: { ...createWeekCheckin(), ...(candidate.weekCheckins && candidate.weekCheckins[3] ? candidate.weekCheckins[3] : {}) }
      },
      sets: candidate.sets || {},
      cardio: candidate.cardio || {},
      sessionNotes: candidate.sessionNotes || {},
      weighIns: Array.isArray(candidate.weighIns) ? candidate.weighIns : [],
      steps: candidate.steps || {},
      timer: null
    };
  }

  function recomputeAndRender() {
    computedPlan = buildComputedPlan();
    renderChrome();
    renderActiveView();
    renderTimer();
  }

  function renderChrome() {
    dom.blockStart.value = state.blockStart;
    dom.bodyWeight.value = state.profile.bodyWeightKg;

    dom.weekSwitcher.innerHTML = Array.from({ length: TOTAL_WEEKS }, (_, index) => {
      const week = index + 1;
      const info = WEEK_GUIDANCE[week];
      return `
        <button
          type="button"
          data-action="switch-week"
          data-week="${week}"
          class="${week === state.activeWeek ? "is-active" : ""}"
        >
          Week ${week}
        </button>
      `;
    }).join("");

    dom.viewSwitcher.innerHTML = [
      { id: "program", label: "Program" },
      { id: "checkin", label: "Weekly Check-In" },
      { id: "review", label: "Review" }
    ]
      .map(
        (view) => `
          <button
            type="button"
            data-action="switch-view"
            data-view="${view.id}"
            class="${view.id === state.activeView ? "is-active" : ""}"
          >
            ${view.label}
          </button>
        `
      )
      .join("");

    dom.summaryCards.innerHTML = renderSummaryCards();
  }

  function renderSummaryCards() {
    const weekMetrics = getWeekMetrics(state.activeWeek);
    const blockMetrics = getBlockMetrics();
    const guide = WEEK_GUIDANCE[state.activeWeek];
    const weekDates = getWeekDates(state.activeWeek);
    const checkin = state.weekCheckins[state.activeWeek];

    return `
      ${
        storageWarning
          ? `
            <article class="summary-card">
              <div class="summary-label">Storage notice</div>
              <span class="summary-value">Heads up</span>
              <p class="summary-detail">${escapeHtml(storageWarning)}</p>
            </article>
          `
          : ""
      }
      <article class="summary-card">
        <div class="summary-label">Week ${state.activeWeek} focus</div>
        <span class="summary-value">${guide.title}</span>
        <p class="summary-detail">
          ${guide.cue}
          <br />
          ${formatShortDate(weekDates[0])} to ${formatShortDate(weekDates[6])}
        </p>
      </article>
      <article class="summary-card">
        <div class="summary-label">Training score</div>
        <span class="summary-value">${weekMetrics.completedWorkouts}/5</span>
        <p class="summary-detail">
          ${weekMetrics.completedSets}/${weekMetrics.totalSets} sets checked off this week.
          <br />
          ${blockMetrics.completedWorkouts}/15 workouts complete across the block.
        </p>
      </article>
      <article class="summary-card">
        <div class="summary-label">Body trend</div>
        <span class="summary-value">${weekMetrics.avgWeight != null ? `${formatDisplayNumber(weekMetrics.avgWeight)} kg` : "No avg yet"}</span>
        <p class="summary-detail">
          Waist: ${checkin.waist ? `${escapeHtml(checkin.waist)} cm` : "not logged yet"}.
          <br />
          Energy: ${checkin.energy ? `${escapeHtml(checkin.energy)}/5` : "not logged yet"}.
        </p>
      </article>
      <article class="summary-card">
        <div class="summary-label">Cardio and habits</div>
        <span class="summary-value">${weekMetrics.cardioMinutes} min</span>
        <p class="summary-detail">
          Steps average: ${weekMetrics.avgSteps != null ? `${Math.round(weekMetrics.avgSteps).toLocaleString()}` : "not enough data"}.
          <br />
          Sunday photo: ${checkin.photoDataUrl ? "uploaded" : "waiting"}.
        </p>
      </article>
    `;
  }

  function renderActiveView() {
    if (state.activeView === "checkin") {
      dom.viewRoot.innerHTML = renderCheckinView();
      return;
    }

    if (state.activeView === "review") {
      dom.viewRoot.innerHTML = renderReviewView();
      return;
    }

    dom.viewRoot.innerHTML = renderProgramView();
  }

  function renderProgramView() {
    const sessions = WORKOUT_DAYS.map((day) => computedPlan[state.activeWeek][day.id]);
    const recoveryCards = RECOVERY_DAYS.map((day) => renderRecoveryCard(day)).join("");
    const weekDates = getWeekDates(state.activeWeek);

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Program overview</div>
            <h2>Week ${state.activeWeek}: ${WEEK_GUIDANCE[state.activeWeek].title}</h2>
            <p class="section-copy">
              ${WEEK_GUIDANCE[state.activeWeek].cue}
              Your week runs from ${formatLongDate(weekDates[0])} to ${formatLongDate(weekDates[6])}.
            </p>
          </div>
          <div class="pill">Lift first, steady-state after</div>
        </div>

        <div class="program-grid">
          ${sessions.map((session) => renderSessionCard(session)).join("")}
        </div>

        <div class="section-head" style="margin-top: 24px;">
          <div>
            <div class="section-eyebrow">Recovery lane</div>
            <h2>Keep the off-days useful</h2>
            <p class="section-copy">
              These are the days that keep the 5 training sessions sustainable instead of turning the week into a grind.
            </p>
          </div>
          <div class="mini-pill">7 to 10k daily steps</div>
        </div>

        <div class="recovery-grid">
          ${recoveryCards}
        </div>

        <div class="floating-note" style="margin-top: 18px; padding: 18px;">
          <div class="section-eyebrow">Block anchors</div>
          <p class="small-copy">
            Protein target: 130 to 160 g per day. Sleep target: about 7 hours where possible.
            The starter loads are only a first pass based on your body weight and exercise type, so if a target feels off,
            change it once and the later weeks will react to that change.
          </p>
        </div>
      </section>
    `;
  }

  function renderSessionCard(session) {
    const stats = getSessionStats(session);
    const statusText = stats.status === "complete" ? "Complete" : stats.status === "partial" ? "In progress" : "Planned";

    return `
      <article class="session-card">
        <div class="session-header">
          <div class="session-title-wrap">
            <span class="session-day">${session.weekday} • ${formatShortDate(session.date)}</span>
            <h3>${session.title}</h3>
            <p class="session-meta">
              ${session.strengthMinutes} min lifting • ${session.cardio.min} to ${session.cardio.max} min cardio
            </p>
            <p class="small-copy">${session.summary}</p>
          </div>
          <div class="session-status">
            <span class="status-chip ${stats.status}">${statusText}</span>
            <span class="tiny-copy">${stats.completedSets}/${stats.totalSets} sets logged</span>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.round(stats.progress * 100)}%;"></div>
            </div>
          </div>
        </div>

        <div class="exercise-stack">
          ${session.exercises.map((exercise) => renderExerciseCard(session, exercise)).join("")}
        </div>

        <div class="cardio-panel">
          <div style="flex: 1;">
            <h4 style="margin: 0;">Cardio finish</h4>
            <p class="small-copy">${session.cardio.note}</p>
          </div>
          <label class="field">
            <span>Mode</span>
            <select data-kind="cardio-field" data-week="${session.week}" data-day="${session.id}" data-field="mode">
              ${session.cardio.modes
                .map(
                  (mode) => `
                    <option value="${escapeAttribute(mode)}" ${mode === session.cardio.mode ? "selected" : ""}>
                      ${mode}
                    </option>
                  `
                )
                .join("")}
            </select>
          </label>
          <label class="field">
            <span>Actual min</span>
            <input
              type="number"
              min="0"
              step="1"
              value="${escapeAttribute(session.cardio.actualMinutes)}"
              data-kind="cardio-field"
              data-week="${session.week}"
              data-day="${session.id}"
              data-field="actualMinutes"
            />
          </label>
          <label class="field">
            <span>Done</span>
            <div class="checkbox-wrap">
              <input
                type="checkbox"
                ${session.cardio.completed ? "checked" : ""}
                data-kind="cardio-field"
                data-week="${session.week}"
                data-day="${session.id}"
                data-field="completed"
              />
            </div>
          </label>
        </div>

        <div class="notes-field">
          <label class="field">
            <span>Session notes</span>
            <textarea
              data-kind="session-note"
              data-week="${session.week}"
              data-day="${session.id}"
              placeholder="Quick note on effort, substitutions, or anything you want future-you to remember."
            >${escapeHtml(session.notes || "")}</textarea>
          </label>
        </div>
      </article>
    `;
  }

  function renderExerciseCard(session, exercise) {
    const repLabel = exercise.measure === "seconds" ? "Target sec" : "Target reps";
    const actualRepLabel = exercise.measure === "seconds" ? "Actual sec" : "Actual reps";

    return `
      <section class="exercise-card">
        <div class="exercise-header">
          <div>
            <h4>${exercise.name}</h4>
            <div class="exercise-meta">
              ${exercise.sets.length} sets • ${exercise.repRange[0]}${exercise.repRange[0] !== exercise.repRange[1] ? ` to ${exercise.repRange[1]}` : ""} ${exercise.measure === "seconds" ? "seconds" : "reps"}
            </div>
            ${exercise.note ? `<p class="exercise-note">${exercise.note}</p>` : ""}
          </div>
          <span class="rest-chip">${exercise.restSeconds}s rest</span>
        </div>

        <div class="table-wrap">
          <table class="set-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Target kg</th>
                <th>${repLabel}</th>
                <th>Actual kg</th>
                <th>${actualRepLabel}</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              ${exercise.sets
                .map((set, setIndex) => renderSetRow(session, exercise, set, setIndex))
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSetRow(session, exercise, set, setIndex) {
    return `
      <tr>
        <td>
          <strong>${set.index}</strong>
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="0.5"
            value="${escapeAttribute(set.targetLoad)}"
            placeholder="kg"
            data-kind="set-field"
            data-week="${session.week}"
            data-day="${session.id}"
            data-exercise="${exercise.id}"
            data-set="${setIndex}"
            data-field="targetLoad"
          />
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="1"
            value="${escapeAttribute(set.targetReps)}"
            placeholder="${exercise.measure === "seconds" ? "sec" : "reps"}"
            data-kind="set-field"
            data-week="${session.week}"
            data-day="${session.id}"
            data-exercise="${exercise.id}"
            data-set="${setIndex}"
            data-field="targetReps"
          />
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="0.5"
            value="${escapeAttribute(set.actualLoad)}"
            placeholder="kg"
            data-kind="set-field"
            data-week="${session.week}"
            data-day="${session.id}"
            data-exercise="${exercise.id}"
            data-set="${setIndex}"
            data-field="actualLoad"
          />
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="1"
            value="${escapeAttribute(set.actualReps)}"
            placeholder="${exercise.measure === "seconds" ? "sec" : "reps"}"
            data-kind="set-field"
            data-week="${session.week}"
            data-day="${session.id}"
            data-exercise="${exercise.id}"
            data-set="${setIndex}"
            data-field="actualReps"
          />
        </td>
        <td>
          <div class="checkbox-wrap">
            <input
              type="checkbox"
              ${set.completed ? "checked" : ""}
              data-kind="set-field"
              data-week="${session.week}"
              data-day="${session.id}"
              data-exercise="${exercise.id}"
              data-set="${setIndex}"
              data-field="completed"
            />
          </div>
        </td>
      </tr>
    `;
  }

  function renderRecoveryCard(day) {
    const date = addDays(parseLocalDate(state.blockStart), (state.activeWeek - 1) * 7 + day.calendarOffset);

    return `
      <article class="recovery-card">
        <div class="session-day">${day.weekday} • ${formatShortDate(date)}</div>
        <h3>${day.title}</h3>
        <p class="small-copy">${day.summary}</p>
        <div class="hero-badges" style="margin-top: 14px;">
          ${day.pills.map((pill) => `<span>${pill}</span>`).join("")}
        </div>
        ${
          day.id === "sunday"
            ? `
              <div style="margin-top: 16px;">
                <button type="button" class="secondary-button" data-action="switch-view" data-view="checkin">
                  Open Sunday check-in
                </button>
              </div>
            `
            : ""
        }
      </article>
    `;
  }

  function renderCheckinView() {
    const week = state.activeWeek;
    const weekDates = getWeekDates(week);
    const metrics = getWeekMetrics(week);
    const checkin = state.weekCheckins[week];
    const weighIns = getWeighInsForWeek(week);
    const sunday = weekDates[6];

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">Weekly check-in</div>
            <h2>Week ${week} Sunday review</h2>
            <p class="section-copy">
              Use this screen for the Sunday reset: add your photo, log waist, look at the weigh-in average,
              and leave a short reflection before the next week starts.
            </p>
          </div>
          <div class="pill">Sunday date: ${formatLongDate(sunday)}</div>
        </div>

        <div class="checkin-grid">
          <div class="checkin-card">
            <div class="section-eyebrow">Scale trend</div>
            <h3>Weigh-ins and weekly average</h3>
            <p class="helper-copy">
              Aim for 3 to 4 weigh-ins each week, then use the average instead of reacting to one random day.
            </p>

            <form class="log-form" data-kind="weighin-form">
              <label class="field">
                <span>Date</span>
                <input name="weighin-date" type="date" value="${getDefaultWeighInDate(week)}" />
              </label>
              <label class="field">
                <span>Body weight (kg)</span>
                <input name="weighin-value" type="number" min="40" max="200" step="0.1" />
              </label>
              <button class="primary-button" type="submit">Add weigh-in</button>
            </form>

            <div class="weighin-row">
              <span class="summary-label">Weekly average</span>
              <strong>${metrics.avgWeight != null ? `${formatDisplayNumber(metrics.avgWeight)} kg` : "No average yet"}</strong>
            </div>

            <div class="weighin-list" style="margin-top: 14px;">
              ${
                weighIns.length
                  ? weighIns
                      .map(
                        (entry) => `
                          <div class="weighin-row">
                            <div>
                              <strong>${formatLongDate(parseLocalDate(entry.date))}</strong>
                              <div class="tiny-copy">${formatDisplayNumber(asNumber(entry.weight))} kg</div>
                            </div>
                            <button class="icon-button" type="button" data-action="delete-weighin" data-entry-id="${entry.id}" aria-label="Delete weigh-in">
                              ×
                            </button>
                          </div>
                        `
                      )
                      .join("")
                  : `<div class="empty-state">No weigh-ins logged for this week yet.</div>`
              }
            </div>

            <div style="margin-top: 20px;" class="steps-grid">
              <div class="metric-card">
                <div class="metric-label">Waist at navel</div>
                <span class="metric-value">${checkin.waist ? `${escapeHtml(checkin.waist)} cm` : "—"}</span>
                <label class="field" style="margin-top: 12px;">
                  <span>Waist measurement (cm)</span>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    step="0.1"
                    value="${escapeAttribute(checkin.waist)}"
                    data-kind="checkin-field"
                    data-week="${week}"
                    data-field="waist"
                  />
                </label>
              </div>

              <div class="metric-card">
                <div class="metric-label">Energy</div>
                <span class="metric-value">${checkin.energy ? `${escapeHtml(checkin.energy)}/5` : "—"}</span>
                <label class="field" style="margin-top: 12px;">
                  <span>How manageable did the week feel?</span>
                  <select data-kind="checkin-field" data-week="${week}" data-field="energy">
                    <option value="" ${checkin.energy === "" ? "selected" : ""}>Select a score</option>
                    <option value="1" ${checkin.energy === "1" ? "selected" : ""}>1 - Crushed</option>
                    <option value="2" ${checkin.energy === "2" ? "selected" : ""}>2 - Rough</option>
                    <option value="3" ${checkin.energy === "3" ? "selected" : ""}>3 - Manageable</option>
                    <option value="4" ${checkin.energy === "4" ? "selected" : ""}>4 - Good</option>
                    <option value="5" ${checkin.energy === "5" ? "selected" : ""}>5 - Strong</option>
                  </select>
                </label>
              </div>
            </div>

            <label class="field" style="margin-top: 18px;">
              <span>Reflection</span>
              <textarea
                data-kind="checkin-field"
                data-week="${week}"
                data-field="reflection"
                placeholder="How did the block feel? Any lifts to swap, any cardio that felt easier, anything to tighten up next week?"
              >${escapeHtml(checkin.reflection)}</textarea>
            </label>
          </div>

          <div class="photo-card">
            <div class="photo-head">
              <div>
                <div class="section-eyebrow">Sunday photo</div>
                <h3>Progress photo check-in</h3>
              </div>
              ${checkin.photoDataUrl ? `<div class="goal-chip">Saved locally</div>` : ""}
            </div>
            <p class="photo-caption">
              Same lighting, same distance, same time of day if you can. This makes the comparison actually useful.
            </p>

            <div class="photo-upload">
              <input
                type="file"
                accept="image/*"
                data-kind="photo-upload"
                data-week="${week}"
              />
              <div class="photo-preview">
                ${
                  checkin.photoDataUrl
                    ? `<img src="${escapeAttribute(checkin.photoDataUrl)}" alt="Week ${week} progress check-in" />`
                    : `<div class="photo-empty">No photo uploaded yet for week ${week}.<br />Add one on Sunday so the 3-week review has something visual to compare.</div>`
                }
              </div>
              ${
                checkin.photoUpdatedAt
                  ? `<div class="tiny-copy">Last updated ${formatDateTime(checkin.photoUpdatedAt)}</div>`
                  : ""
              }
              <label class="field">
                <span>Photo notes</span>
                <textarea
                  data-kind="checkin-field"
                  data-week="${week}"
                  data-field="photoNotes"
                  placeholder="Anything you notice visually this week."
                >${escapeHtml(checkin.photoNotes)}</textarea>
              </label>
              ${
                checkin.photoDataUrl
                  ? `<button class="ghost-button" type="button" data-action="clear-photo" data-week="${week}">Clear photo</button>`
                  : ""
              }
            </div>
          </div>
        </div>

        <div class="steps-grid" style="margin-top: 18px;">
          <article class="steps-card">
            <div class="section-eyebrow">Daily movement</div>
            <h3>Step log</h3>
            <p class="helper-copy">
              Aim for 7,000 to 10,000 per day. You do not need perfect numbers, just a useful trend line.
            </p>
            <div style="margin-top: 14px;">
              ${weekDates.map((date) => renderStepRow(date)).join("")}
            </div>
          </article>

          <article class="steps-card">
            <div class="section-eyebrow">Weekly snapshot</div>
            <h3>Week ${week} pulse</h3>
            <div class="review-list" style="margin-top: 16px;">
              <div class="review-item">
                <span>Workouts complete</span>
                <strong>${metrics.completedWorkouts}/5</strong>
              </div>
              <div class="review-item">
                <span>Cardio minutes</span>
                <strong>${metrics.cardioMinutes}</strong>
              </div>
              <div class="review-item">
                <span>Average steps</span>
                <strong>${metrics.avgSteps != null ? Math.round(metrics.avgSteps).toLocaleString() : "—"}</strong>
              </div>
              <div class="review-item">
                <span>Photo logged</span>
                <strong>${checkin.photoDataUrl ? "Yes" : "No"}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderStepRow(date) {
    const iso = toLocalISODate(date);
    const value = state.steps[iso] || "";
    const parsed = asNumber(value);
    const status =
      parsed == null ? "" : parsed >= 7000 && parsed <= 10000 ? `<span class="goal-hit">in target</span>` : parsed > 10000 ? `<span class="goal-hit">above target</span>` : `<span class="goal-miss">below target</span>`;

    return `
      <div class="steps-row">
        <div>
          <strong>${date.toLocaleDateString(undefined, { weekday: "long" })}</strong>
          <div class="tiny-copy">${formatShortDate(date)}</div>
        </div>
        <label>
          <span class="sr-only">Steps for ${iso}</span>
          <input
            type="number"
            min="0"
            step="100"
            value="${escapeAttribute(value)}"
            data-kind="steps-field"
            data-date="${iso}"
            placeholder="steps"
          />
        </label>
        <div>${status}</div>
      </div>
    `;
  }

  function renderReviewView() {
    const blockMetrics = getBlockMetrics();
    const weightDelta = blockMetrics.weightDelta;
    const waistDelta = blockMetrics.waistDelta;

    return `
      <section class="view-card">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">3-week review</div>
            <h2>Score the block, then adjust</h2>
            <p class="section-copy">
              The goal is not dramatic scale movement. A good block is slight fat loss or a leaner look, stable or improving strength,
              manageable energy, and cardio that feels easier at the same pace.
            </p>
          </div>
          <div class="pill">${formatLongDate(getWeekDates(1)[0])} to ${formatLongDate(getWeekDates(3)[6])}</div>
        </div>

        <div class="stats-grid">
          <article class="metric-card">
            <div class="metric-label">Workout consistency</div>
            <span class="metric-value">${blockMetrics.completedWorkouts}/15</span>
            <p class="metric-detail">Target range was 12 to 15 completed sessions across the block.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Cardio minutes</div>
            <span class="metric-value">${blockMetrics.cardioMinutes}</span>
            <p class="metric-detail">Minimum planned total for 3 weeks: ${blockMetrics.minimumCardioTarget} minutes.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Weight trend</div>
            <span class="metric-value">${weightDelta != null ? `${weightDelta > 0 ? "+" : ""}${formatDisplayNumber(weightDelta)} kg` : "—"}</span>
            <p class="metric-detail">Comparing week 1 average to the latest weekly average with data.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Waist trend</div>
            <span class="metric-value">${waistDelta != null ? `${waistDelta > 0 ? "+" : ""}${formatDisplayNumber(waistDelta)} cm` : "—"}</span>
            <p class="metric-detail">Comparing the first logged waist value to the latest logged waist value.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Photo check-ins</div>
            <span class="metric-value">${blockMetrics.photosLogged}/3</span>
            <p class="metric-detail">Sunday photos make the visual trend easier to trust.</p>
          </article>
          <article class="metric-card">
            <div class="metric-label">Average steps</div>
            <span class="metric-value">${blockMetrics.avgSteps != null ? Math.round(blockMetrics.avgSteps).toLocaleString() : "—"}</span>
            <p class="metric-detail">Across all logged days in the 3-week block.</p>
          </article>
        </div>

        <div class="review-grid">
          <article class="review-card">
            <div class="section-eyebrow">Week-by-week</div>
            <h3>Scoreboard</h3>
            <div class="review-list" style="margin-top: 16px;">
              ${[1, 2, 3].map((week) => renderWeekReviewRow(week)).join("")}
            </div>
          </article>

          <article class="review-card">
            <div class="section-eyebrow">Main lifts</div>
            <h3>Strength trend</h3>
            <table class="review-table">
              <thead>
                <tr>
                  <th>Lift</th>
                  <th>Week 1 anchor</th>
                  <th>Latest logged / plan</th>
                </tr>
              </thead>
              <tbody>
                ${REVIEW_LIFTS.map((lift) => renderLiftReviewRow(lift)).join("")}
              </tbody>
            </table>
          </article>
        </div>

        <div class="review-grid">
          <article class="review-card">
            <div class="section-eyebrow">Success check</div>
            <h3>What the block says</h3>
            <div class="review-list" style="margin-top: 16px;">
              ${renderReviewPrompt("Weight", describeWeightTrend(weightDelta))}
              ${renderReviewPrompt("Waist", describeWaistTrend(waistDelta))}
              ${renderReviewPrompt("Strength", describeStrengthTrend())}
              ${renderReviewPrompt("Energy", describeEnergyTrend())}
              ${renderReviewPrompt("Cardio", describeCardioTrend(blockMetrics))}
            </div>
          </article>

          <article class="review-card">
            <div class="section-eyebrow">Next move</div>
            <h3>Adjustment reminders</h3>
            <div class="review-list" style="margin-top: 16px;">
              ${renderReviewPrompt("Calories", "If weight and waist both held steady and you still want faster fat loss, nudge calories down slightly instead of slashing them.")}
              ${renderReviewPrompt("Training", "If strength dipped hard and energy cratered, keep the split but soften the deficit or trim a little cardio.")}
              ${renderReviewPrompt("Consistency", "If the problem was missed sessions rather than hard sessions, protect schedule and session length before changing the program itself.")}
              ${renderReviewPrompt("Photos", "Use the Sunday photos with the waist trend, not instead of it. They usually make more sense together.")}
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderWeekReviewRow(week) {
    const metrics = getWeekMetrics(week);
    const checkin = state.weekCheckins[week];

    return `
      <div class="review-item">
        <div>
          <strong>Week ${week}</strong>
          <div class="tiny-copy">
            ${metrics.completedWorkouts}/5 workouts • ${metrics.cardioMinutes} cardio min •
            ${metrics.avgWeight != null ? `${formatDisplayNumber(metrics.avgWeight)} kg avg` : "no avg weight"}
          </div>
        </div>
        <div class="tiny-copy" style="text-align: right;">
          Waist: ${checkin.waist ? `${escapeHtml(checkin.waist)} cm` : "—"}<br />
          Photo: ${checkin.photoDataUrl ? "Yes" : "No"}
        </div>
      </div>
    `;
  }

  function renderLiftReviewRow(lift) {
    const history = [];

    for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
      const session = computedPlan[week][lift.dayId];
      const exercise = session && session.exerciseMap ? session.exerciseMap[lift.exerciseId] : null;
      if (exercise) {
        history.push({ week, exercise });
      }
    }

    if (!history.length) {
      return `<tr><td>${lift.label}</td><td>—</td><td>—</td></tr>`;
    }

    const first = history[0].exercise.sets[0];
    const latest = getLatestUsefulSet(history);

    return `
      <tr>
        <td>${lift.label}</td>
        <td>${describeSet(first, history[0].exercise)}</td>
        <td>${latest ? describeSet(latest.set, latest.exercise) : "—"}</td>
      </tr>
    `;
  }

  function renderReviewPrompt(label, copy) {
    return `
      <div class="review-item">
        <div>
          <strong>${label}</strong>
          <div class="tiny-copy">${copy}</div>
        </div>
      </div>
    `;
  }

  function buildComputedPlan() {
    const plan = {};

    for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
      plan[week] = {};

      for (const day of WORKOUT_DAYS) {
        const sessionDate = addDays(parseLocalDate(state.blockStart), (week - 1) * 7 + day.calendarOffset);
        const exercises = day.exercises.map((exercise) => {
          const sets = Array.from({ length: exercise.sets }, (_, setIndex) => {
            const record = state.sets[makeSetKey(week, day.id, exercise.id, setIndex)] || {};
            const previousSet =
              week > 1 ? plan[week - 1][day.id].exerciseMap[exercise.id].sets[setIndex] : null;
            const suggestion = getSuggestedSet(exercise, week, previousSet);

            return {
              index: setIndex + 1,
              targetLoad: hasValue(record.targetLoad) ? record.targetLoad : suggestion.targetLoad,
              targetReps: hasValue(record.targetReps) ? record.targetReps : suggestion.targetReps,
              actualLoad: record.actualLoad ?? "",
              actualReps: record.actualReps ?? "",
              completed: Boolean(record.completed)
            };
          });

          return {
            ...exercise,
            measure: exercise.measure || "reps",
            sets
          };
        });

        const exerciseMap = Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise]));
        const sessionKey = makeSessionKey(week, day.id);
        const cardioRecord = state.cardio[sessionKey] || {};

        plan[week][day.id] = {
          ...day,
          week,
          date: sessionDate,
          exercises,
          exerciseMap,
          cardio: {
            ...day.cardio,
            actualMinutes: cardioRecord.actualMinutes ?? "",
            mode: cardioRecord.mode || day.cardio.modes[0],
            completed: Boolean(cardioRecord.completed)
          },
          notes: state.sessionNotes[sessionKey] || ""
        };
      }
    }

    return plan;
  }

  function getSuggestedSet(exercise, week, previousSet) {
    if (week === 1 || !previousSet) {
      return {
        targetLoad: formatStoredNumber(getStarterLoad(exercise)),
        targetReps: String(exercise.repRange[0])
      };
    }

    const [minReps, maxReps] = exercise.repRange;
    const previousTargetLoad = firstNumber(previousSet.targetLoad, getStarterLoad(exercise));
    const previousEffectiveLoad = firstNumber(previousSet.actualLoad, previousSet.targetLoad, getStarterLoad(exercise));
    const previousTargetReps = firstNumber(previousSet.targetReps, minReps);
    const previousEffectiveReps = firstNumber(previousSet.actualReps, previousSet.targetReps, minReps);
    const completed = Boolean(previousSet.completed);

    let nextLoad = previousTargetLoad;
    let nextReps = previousTargetReps;

    if (!completed) {
      nextLoad = previousTargetLoad;
      nextReps = previousTargetReps;
    } else if (exercise.measure === "seconds" || exercise.progressionMode === "time") {
      nextLoad = null;
      nextReps = Math.min(maxReps, previousEffectiveReps + 10);
    } else if (exercise.progressionMode === "reps-first" || previousEffectiveLoad == null) {
      nextLoad = previousEffectiveLoad;
      if (previousEffectiveReps < maxReps) {
        nextReps = previousEffectiveReps + 1;
      } else {
        nextReps = minReps;
        nextLoad = previousEffectiveLoad == null ? null : roundToIncrement(previousEffectiveLoad + exercise.increment, exercise.increment);
      }
    } else {
      const actualReps = asNumber(previousSet.actualReps);
      const hitTarget = actualReps == null ? true : actualReps >= previousTargetReps;
      nextReps = minReps;
      nextLoad = hitTarget
        ? roundToIncrement((previousEffectiveLoad ?? previousTargetLoad ?? getStarterLoad(exercise) ?? 0) + exercise.increment, exercise.increment)
        : previousEffectiveLoad;
    }

    return {
      targetLoad: formatStoredNumber(nextLoad),
      targetReps: formatStoredNumber(nextReps)
    };
  }

  function getStarterLoad(exercise) {
    if (exercise.starterMultiplier == null) {
      return null;
    }
    const bodyWeight = asNumber(state.profile.bodyWeightKg);
    if (bodyWeight == null) {
      return null;
    }
    return roundToIncrement(bodyWeight * exercise.starterMultiplier, exercise.increment || 0.5);
  }

  function getSessionStats(session) {
    const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const completedSets = session.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length,
      0
    );
    const cardioDone =
      session.cardio.completed || (asNumber(session.cardio.actualMinutes) != null && asNumber(session.cardio.actualMinutes) >= session.cardio.min);
    const totalUnits = totalSets + 1;
    const completedUnits = completedSets + (cardioDone ? 1 : 0);
    const progress = totalUnits ? completedUnits / totalUnits : 0;
    const status = progress >= 1 ? "complete" : progress > 0 ? "partial" : "pending";

    return {
      totalSets,
      completedSets,
      cardioDone,
      progress,
      status
    };
  }

  function getWeekMetrics(week) {
    const sessions = WORKOUT_DAYS.map((day) => computedPlan[week][day.id]);
    const stats = sessions.map((session) => getSessionStats(session));
    const completedWorkouts = stats.filter((item) => item.status === "complete").length;
    const completedSets = stats.reduce((sum, item) => sum + item.completedSets, 0);
    const totalSets = stats.reduce((sum, item) => sum + item.totalSets, 0);
    const cardioMinutes = sessions.reduce((sum, session) => sum + (asNumber(session.cardio.actualMinutes) || 0), 0);
    const weighIns = getWeighInsForWeek(week);
    const avgWeight = average(weighIns.map((entry) => asNumber(entry.weight)).filter((value) => value != null));
    const weekDates = getWeekDates(week).map((date) => toLocalISODate(date));
    const stepValues = weekDates.map((iso) => asNumber(state.steps[iso])).filter((value) => value != null);
    const avgSteps = average(stepValues);

    return {
      completedWorkouts,
      completedSets,
      totalSets,
      cardioMinutes,
      avgWeight,
      avgSteps
    };
  }

  function getBlockMetrics() {
    const metrics = [1, 2, 3].map((week) => getWeekMetrics(week));
    const completedWorkouts = metrics.reduce((sum, item) => sum + item.completedWorkouts, 0);
    const cardioMinutes = metrics.reduce((sum, item) => sum + item.cardioMinutes, 0);
    const minimumCardioTarget = WORKOUT_DAYS.reduce((sum, day) => sum + day.cardio.min, 0) * TOTAL_WEEKS;
    const avgSteps = average(
      Object.values(state.steps)
        .map((value) => asNumber(value))
        .filter((value) => value != null)
    );
    const photosLogged = [1, 2, 3].filter((week) => state.weekCheckins[week].photoDataUrl).length;

    const firstWeight = metrics[0].avgWeight;
    const latestWeight = [...metrics].reverse().find((item) => item.avgWeight != null)?.avgWeight ?? null;
    const firstWaist = firstValue([1, 2, 3].map((week) => asNumber(state.weekCheckins[week].waist)));
    const latestWaist = firstValue(
      [3, 2, 1].map((week) => asNumber(state.weekCheckins[week].waist))
    );

    return {
      completedWorkouts,
      cardioMinutes,
      minimumCardioTarget,
      avgSteps,
      photosLogged,
      weightDelta: firstWeight != null && latestWeight != null ? latestWeight - firstWeight : null,
      waistDelta: firstWaist != null && latestWaist != null ? latestWaist - firstWaist : null
    };
  }

  function getWeighInsForWeek(week) {
    const [weekStart, weekEnd] = getWeekBoundary(week);
    return [...state.weighIns]
      .filter((entry) => entry.date >= weekStart && entry.date <= weekEnd)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function getWeekDates(week) {
    const start = addDays(parseLocalDate(state.blockStart), (week - 1) * 7);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  function getWeekBoundary(week) {
    const dates = getWeekDates(week).map((date) => toLocalISODate(date));
    return [dates[0], dates[6]];
  }

  function getDefaultWeighInDate(week) {
    const today = toLocalISODate(new Date());
    const [start, end] = getWeekBoundary(week);
    if (today >= start && today <= end) {
      return today;
    }
    return start;
  }

  function inferActiveWeek(blockStart) {
    const start = parseLocalDate(blockStart);
    if (!Number.isFinite(start.getTime())) {
      return 1;
    }
    const today = new Date();
    const diffDays = Math.floor((stripTime(today).getTime() - stripTime(start).getTime()) / 86400000);
    if (diffDays <= 0) {
      return 1;
    }
    return clampNumber(Math.floor(diffDays / 7) + 1, 1, TOTAL_WEEKS);
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
    saveState();
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
        saveState();
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
      saveState();
      renderTimer();
      return;
    }

    if (control === "resume" && state.timer.paused) {
      const remaining = state.timer.pausedRemainingMs ?? state.timer.durationMs;
      state.timer.endAt = Date.now() + remaining;
      state.timer.pausedRemainingMs = null;
      state.timer.paused = false;
      state.timer.finished = false;
      saveState();
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
      saveState();
      renderTimer();
      return;
    }

    if (control === "stop") {
      state.timer = null;
      saveState();
      renderTimer();
    }
  }

  function renderTimer() {
    if (!state.timer) {
      dom.timerDock.innerHTML = `
        <div class="timer-top">
          <div>
            <p class="timer-label">Rest timer</p>
            <div class="timer-value">Ready</div>
            <p class="timer-subtext">Check off a set to start the timer automatically, Strong-style.</p>
          </div>
        </div>
        <div class="timer-track"><span style="width: 0%;"></span></div>
        <div class="timer-actions">
          <button type="button" data-action="timer-control" data-control="add15">+15s</button>
          <button type="button" data-action="timer-control" data-control="stop">Clear</button>
        </div>
      `;
      return;
    }

    const remainingMs = getTimerRemainingMs();
    const remainingPct = state.timer.durationMs
      ? Math.max(0, Math.min(1, remainingMs / state.timer.durationMs))
      : 0;
    const paused = state.timer.paused;
    const finished = state.timer.finished || remainingMs <= 0;

    dom.timerDock.innerHTML = `
      <div class="timer-top">
        <div>
          <p class="timer-label">${escapeHtml(state.timer.label)}</p>
          <div class="timer-value">${finished ? "Done" : formatDuration(remainingMs)}</div>
          <p class="timer-subtext">${finished ? "Rest is up. Start the next set when you're ready." : paused ? "Timer paused." : "Rest is running."}</p>
        </div>
      </div>
      <div class="timer-track"><span style="width: ${Math.round(remainingPct * 100)}%;"></span></div>
      <div class="timer-actions">
        <button type="button" data-action="timer-control" data-control="${paused ? "resume" : "pause"}">
          ${paused ? "Resume" : "Pause"}
        </button>
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

  function describeSet(set, exercise) {
    const load = firstNumber(set.actualLoad, set.targetLoad);
    const reps = firstNumber(set.actualReps, set.targetReps);

    if (exercise.measure === "seconds") {
      return reps != null ? `${formatDisplayNumber(reps)} sec` : "—";
    }

    if (load != null && reps != null) {
      return `${formatDisplayNumber(load)} kg × ${formatDisplayNumber(reps)}`;
    }

    if (reps != null) {
      return `${formatDisplayNumber(reps)} reps`;
    }

    return "—";
  }

  function getLatestUsefulSet(history) {
    for (let index = history.length - 1; index >= 0; index -= 1) {
      const item = history[index];
      const found = item.exercise.sets.find((set) => hasValue(set.actualLoad) || hasValue(set.actualReps) || hasValue(set.targetLoad) || hasValue(set.targetReps));
      if (found) {
        return { exercise: item.exercise, set: found };
      }
    }
    return null;
  }

  function describeWeightTrend(delta) {
    if (delta == null) {
      return "You need at least two weekly averages before the weight trend means much.";
    }
    if (delta <= -1.5) {
      return "Weight dropped quickly. Great for momentum, but check that strength and energy did not pay too much for it.";
    }
    if (delta < 0) {
      return "Weight is trending down at a sensible pace. That matches the brief well.";
    }
    if (delta <= 0.4) {
      return "Weight is basically stable, which can still be a win if the waist or photos improved.";
    }
    return "Weight trended up. If the waist also rose, tighten calories or weekend drift before changing training.";
  }

  function describeWaistTrend(delta) {
    if (delta == null) {
      return "No clear waist trend yet. One measurement per week is enough if you keep it consistent.";
    }
    if (delta < 0) {
      return "Waist is down. That is exactly what we want to see, even if scale weight is not dramatic.";
    }
    if (delta === 0) {
      return "Waist held steady. Use the photos and weight trend to decide whether that is acceptable.";
    }
    return "Waist is up. That is the main signal to look at calories, consistency, and weekend spillover.";
  }

  function describeStrengthTrend() {
    const improved = REVIEW_LIFTS.filter((lift) => {
      const first = computedPlan[1][lift.dayId].exerciseMap[lift.exerciseId].sets[0];
      const latest = getLatestUsefulSet(
        Array.from({ length: TOTAL_WEEKS }, (_, index) => ({
          week: index + 1,
          exercise: computedPlan[index + 1][lift.dayId].exerciseMap[lift.exerciseId]
        }))
      );

      if (!latest) {
        return false;
      }

      const firstScore = computeSetScore(first);
      const latestScore = computeSetScore(latest.set);
      return latestScore >= firstScore;
    }).length;

    if (improved >= 3) {
      return "Most key lifts are stable or better. That is strong evidence the block is balanced well enough.";
    }
    if (improved >= 1) {
      return "Some lifts moved forward, which is still a good sign during a fat-loss phase.";
    }
    return "Strength is flat or unclear. Check whether the issue is missing logs, harder fatigue, or starter loads that need recalibration.";
  }

  function describeEnergyTrend() {
    const energyValues = [1, 2, 3]
      .map((week) => asNumber(state.weekCheckins[week].energy))
      .filter((value) => value != null);

    if (!energyValues.length) {
      return "Energy has not been scored yet. Add it on Sundays so the review has context.";
    }

    const avg = average(energyValues);
    if (avg >= 4) {
      return "Energy stayed good. You probably have room to keep pushing the same structure.";
    }
    if (avg >= 3) {
      return "Energy looks manageable, which is exactly where this kind of block should live.";
    }
    return "Energy ran low. Recover harder before increasing training stress further.";
  }

  function describeCardioTrend(blockMetrics) {
    if (blockMetrics.cardioMinutes >= blockMetrics.minimumCardioTarget) {
      return "Cardio volume met the plan. If it is also feeling easier, the block is doing its job.";
    }
    if (blockMetrics.cardioMinutes >= blockMetrics.minimumCardioTarget * 0.75) {
      return "Cardio volume is close enough to useful, but consistency is the easiest place to tighten up next.";
    }
    return "Cardio volume fell well short of plan. Bring that back before overhauling the lifting split.";
  }

  function computeSetScore(set) {
    const load = firstNumber(set.actualLoad, set.targetLoad, 0);
    const reps = firstNumber(set.actualReps, set.targetReps, 0);
    return load * Math.max(reps, 1);
  }

  function findExercise(dayId, exerciseId) {
    const day = WORKOUT_DAYS.find((item) => item.id === dayId);
    return day ? day.exercises.find((exercise) => exercise.id === exerciseId) || null : null;
  }

  function makeSetKey(week, dayId, exerciseId, setIndex) {
    return `${week}::${dayId}::${exerciseId}::${setIndex}`;
  }

  function makeSessionKey(week, dayId) {
    return `${week}::${dayId}`;
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const maxSide = 960;
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
          resolve(canvas.toDataURL("image/jpeg", 0.74));
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
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // The app works fine without offline caching, so this can fail quietly.
      });
    });
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

  function formatDateTime(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
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

  function average(values) {
    if (!values.length) {
      return null;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function firstNumber(...values) {
    for (const value of values) {
      const numeric = asNumber(value);
      if (numeric != null) {
        return numeric;
      }
    }
    return null;
  }

  function firstValue(values) {
    for (const value of values) {
      if (value != null) {
        return value;
      }
    }
    return null;
  }

  function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
  }

  function asNumber(value) {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
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

  function isValidISODate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) {
      return false;
    }
    return Number.isFinite(parseLocalDate(iso).getTime());
  }

  function toLocalISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getUpcomingMonday(date) {
    const next = stripTime(date);
    const day = next.getDay();
    const distance = day === 1 ? 0 : day === 0 ? 1 : 8 - day;
    next.setDate(next.getDate() + distance);
    return next;
  }
})();
