"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useRef,
  useCallback,
} from "react";
import { createPayoutGenerator } from "@/lib/payout.js";
import { defaultMixtureConfig } from "@/lib/payout-default.js";
import { quest_totals } from "@/app/data/projects.js";

const STORAGE_KEY = "moneyState_v1";
const THEME_STORAGE_KEY = "themeSelection_v1";
const STARFLARE_STORAGE_KEY = "localStarflareClickCount_v1";
const MoneyContext = createContext(null);
const MAX_BAL = 9999.99;
const INIT_BAL = 100.0;

const RAW_THEME_OPTIONS = [
  {
    id: "coral",
    label: "Coral",
    color: "#ff7d7d",
    lightColor: "#ffaeae",
    price: "0",
  },
  {
    id: "green",
    label: "Green",
    color: "#26e055",
    lightColor: "#83e69b",
    price: "200",
  },
  {
    id: "orange",
    label: "Orange",
    color: "#ff863b",
    lightColor: "#ffb385",
    price: "200",
  },
  {
    id: "blue",
    label: "Blue",
    color: "#33a9de",
    lightColor: "#6eb9db",
    price: "500",
  },
  {
    id: "purple",
    label: "Purple",
    color: "#c084fc",
    lightColor: "#d4affa",
    price: "750",
  },
  {
    id: "crimson",
    label: "Crimson",
    color: "#d1243b",
    lightColor: "#e33446",
    price: "2000",
  },
];

export const THEME_OPTIONS = RAW_THEME_OPTIONS;

const DEFAULT_THEME_ID = "coral";
const THEME_BY_ID = THEME_OPTIONS.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

const ensureOwnedList = (list) =>
  Array.from(new Set([DEFAULT_THEME_ID, ...(list || [])].filter(Boolean)));

const getThemeHex = (id) =>
  THEME_BY_ID[id]?.color || THEME_BY_ID[DEFAULT_THEME_ID].color;
const getThemeLightHex = (id) => {
  const theme = THEME_BY_ID[id];
  if (theme?.lightColor) return theme.lightColor;
  return THEME_BY_ID[DEFAULT_THEME_ID].lightColor;
};

// total values for the different quests...
const QUEST_TOTALS = quest_totals;

let __payoutGen = null;

function getPayoutGen() {
  if (!__payoutGen) {
    __payoutGen = createPayoutGenerator(defaultMixtureConfig);
  }
  return __payoutGen;
}

function addWithCap(balance, amount) {
  const b = normalize2(balance);
  const a = normalize2(amount);
  if (!Number.isFinite(a) || a <= 0) return b;

  const sum = b + a;
  return sum > MAX_BAL ? MAX_BAL : normalize2(sum);
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT": {
      // generate once on first run
      const init = INIT_BAL;
      return {
        balance: init,
        awarded: {}, // maps id -> kind. Therefore if the key ID exists, then it has be awarded before
        initBalance: init,
      };
    }
    case "LOAD": {
      const s = action.payload || {};

      // initBalance: use stored if valid, otherwise generate once
      const storedInit = normalize2(toAmount(s.initBalance));
      const init =
        Number.isFinite(storedInit) && storedInit > 0 ? storedInit : INIT_BAL;

      // balance: if storage has a value (including 0), use it; else use init
      const hasStoredBalance = typeof s.balance !== "undefined";
      const baseBalance = hasStoredBalance ? s.balance : init;

      return {
        balance: Math.min(MAX_BAL, normalize2(toAmount(baseBalance))),
        awarded: s.awarded || {},
        initBalance: init,
      };
    }
    case "AWARD": {
      const { id, amount, kind } = action;
      if (state.awarded[id] != null) return state; //return when the key/value pair exists
      const amt = normalize2(toAmount(amount));
      if (!Number.isFinite(amt) || amt <= 0) return state;

      return {
        ...state,
        balance: addWithCap(state.balance, amt), // <-- clamp here
        awarded: { ...state.awarded, [id]: kind },
      };
    }
    case "MARK_AWARDED": {
      const { id, kind } = action;
      if (state.awarded[id] != null) return state;
      return { ...state, awarded: { ...state.awarded, [id]: kind } };
    }
    case "AWARDINF": {
      const amt = normalize2(toAmount(action.amount));
      if (!Number.isFinite(amt) || amt <= 0) return state;
      return { ...state, balance: addWithCap(state.balance, amt) }; // <-- clamp here
    }
    case "SPEND": {
      const spendAmt = normalize2(toAmount(action.amount));
      if (!Number.isFinite(spendAmt) || spendAmt <= 0) return state;
      return normalize2(state.balance) < spendAmt
        ? state
        : { ...state, balance: normalize2(state.balance - spendAmt) };
    }
    case "RESET": {
      // Do NOT generate a new initial value here — we reuse the one we already have.
      return { balance: INIT_BAL, awarded: {}, initBalance: INIT_BAL };
    }
    case "OVERFLOW":
      return state;
    case "UNDERFLOW":
      return state;
    case "INPUT": {
      const amt = normalize2(toAmount(action.amount));
      if (!Number.isFinite(amt) || amt <= 0) return state;
      return { ...state, balance: amt };
    }
    default:
      return state;
  }
}

/** ---------- helpers ---------- **/
const roundTo = (n, decimals = 2) => {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
  // return Math.round(n); // whole-number rounding (commented out)
};

// hard cap at 2 decimals; also coerces strings
const normalize2 = (v) => {
  const n = typeof v === "number" ? v : Number.parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
  // return Math.round(n); // whole-number rounding
};

const randInRange = (min, max, decimals = 2) =>
  roundTo(Math.random() * (max - min) + min, decimals);

// Accepts numbers or strings like "15,340.00", "$15,340.00"
const toAmount = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[,$\s]/g, "");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

// For 'project', an optional projValue can be provided.
function amountFor(kind, { projValue } = {}) {
  switch (kind) {
    case "link":
      return 150;

    case "project":
      return 400;

    case "redtext":
      return 25;

    case "egg":
      return randInRange(1, 5);

    default:
      return 0;
  }
}

function leverPayout() {
  const gen = getPayoutGen();
  return normalize2(gen.next()); // bounded, cents-rounded payout
}

export function MoneyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    balance: 0,
    awarded: {},
    initBalance: 100,
  });
  const [ready, setReady] = useState(false);
  const [overflowTick, setOverflowTick] = useState(0);
  const [underflowTick, setUnderflowTick] = useState(0);
  const [leverPullTick, setLeverPullTick] = useState(0);
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
  const [highlightHex, setHighlightHex] = useState(
    getThemeHex(DEFAULT_THEME_ID),
  );
  const [highlightLightHex, setHighlightLightHex] = useState(
    getThemeLightHex(DEFAULT_THEME_ID),
  );
  const [ownedThemes, setOwnedThemes] = useState([DEFAULT_THEME_ID]);
  const [starflareClickCount, setStarflareClickCount] = useState(0);
  const pendingAwardsRef = useRef(new Set());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const storedId = parsed?.themeId;
        const storedOwned = Array.isArray(parsed?.ownedThemes)
          ? parsed.ownedThemes
          : [];
        if (storedOwned.length) {
          setOwnedThemes(ensureOwnedList(storedOwned));
        }
        if (storedId && THEME_BY_ID[storedId]) {
          setThemeId(storedId);
          setHighlightHex(getThemeHex(storedId));
          setHighlightLightHex(getThemeLightHex(storedId));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // relax the guard: load even if some fields are missing
        dispatch({ type: "LOAD", payload: parsed || {} });
      } else {
        // first-ever run: create initBalance and set balance to it
        dispatch({ type: "INIT" });
      }
    } catch {
      // if parsing fails, also initialize
      dispatch({ type: "INIT" });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  useEffect(() => {
    const hex = getThemeHex(themeId);
    const lightHex = getThemeLightHex(themeId);
    setHighlightHex(hex);
    setHighlightLightHex(lightHex);
    try {
      document.documentElement.style.setProperty("--highlight-color", hex);
      document.documentElement.style.setProperty(
        "--highlight-light-color",
        lightHex,
      );
    } catch {}
  }, [themeId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ themeId, ownedThemes }),
      );
    } catch {}
  }, [themeId, ownedThemes]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STARFLARE_STORAGE_KEY);
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        setStarflareClickCount(parsed);
      } else {
        setStarflareClickCount(0);
      }
    } catch {
      setStarflareClickCount(0);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STARFLARE_STORAGE_KEY, String(starflareClickCount));
    } catch {}
  }, [starflareClickCount]);

  // ---- derived quest stats (outside api useMemo) ----
  const questCounts = useMemo(() => {
    const counts = { redtext: 0, project: 0, link: 0 };
    for (const kind of Object.values(state.awarded || {})) {
      if (counts[kind] != null) counts[kind]++;
    }
    return counts;
  }, [state.awarded]);

  const questStats = useMemo(
    () => ({
      redtext: { total: QUEST_TOTALS.redtext, done: questCounts.redtext },
      project: { total: QUEST_TOTALS.project, done: questCounts.project },
      link: { total: QUEST_TOTALS.link, done: questCounts.link },
    }),
    [questCounts],
  );

  // keep the same API: function that returns the memoized object
  const getQuestStats = useCallback(() => questStats, [questStats]);

  const allQuestsComplete = useMemo(
    () =>
      questStats.redtext.done >= questStats.redtext.total &&
      questStats.project.done >= questStats.project.total &&
      questStats.link.done >= questStats.link.total,
    [questStats],
  );

  const getAllQuestsComplete = useCallback(
    () => allQuestsComplete,
    [allQuestsComplete],
  );

  const completedQuests = useMemo(
    () => ({
      redtext: questStats.redtext.done >= questStats.redtext.total,
      project: questStats.project.done >= questStats.project.total,
      link: questStats.link.done >= questStats.link.total,
    }),
    [questStats],
  );

  const getCompletedQuests = useCallback(
    () => completedQuests,
    [completedQuests],
  );

  const purchaseTheme = useCallback(
    (id) => {
      const theme = THEME_BY_ID[id];
      if (!theme) return { success: false, reason: "not-found" };

      // already owned: just select
      if (ownedThemes.includes(id)) {
        setThemeId(id);
        return { success: true, alreadyOwned: true };
      }

      const price = normalize2(toAmount(theme.price));
      const currentBalance = normalize2(stateRef.current.balance);
      if (!Number.isFinite(price) || price <= 0) {
        setOwnedThemes((prev) => ensureOwnedList([...prev, id]));
        setThemeId(id);
        return { success: true, free: true };
      }

      if (currentBalance < price) {
        setUnderflowTick((t) => t + 1);
        return { success: false, reason: "insufficient" };
      }

      dispatch({ type: "SPEND", amount: price });
      setOwnedThemes((prev) => ensureOwnedList([...prev, id]));
      setThemeId(id);
      return { success: true, purchased: true };
    },
    [ownedThemes],
  );

  const setThemeById = useCallback((id) => {
    const nextId = THEME_BY_ID[id] ? id : DEFAULT_THEME_ID;
    setThemeId(nextId);
  }, []);

  const api = useMemo(
    () => ({
      ...state,
      themeId,
      highlightHex,
      highlightLightHex,
      ownedThemes,

      /**
       * Award once per `rewardId`, computing the amount from a category string.
       * @param {string} id
       * @param {'redtext'|'project'|'link'|'egg'|'lever'} kind
       * @param {number|string} [projValue] Optional amount when kind === 'project'
       * @returns {boolean} true if paid (first time), false otherwise
       */
      awardOnce: (id, kind, projValue) => {
        if (state.awarded[id] != null || pendingAwardsRef.current.has(id))
          return false;

        const allowed = new Set(["redtext", "project", "link"]);
        if (!allowed.has(kind)) {
          return false;
        }

        // Compute amount and normalize to 2 decimals to avoid FP drift
        const rawAmount = amountFor(kind, { projValue });
        const amount = normalize2(rawAmount);
        if (!(Number.isFinite(amount) && amount > 0)) return false;

        if (normalize2(state.balance) === MAX_BAL) {
          setOverflowTick((t) => t + 1);
        }

        pendingAwardsRef.current.add(id);
        // if a red word, add to balance and update awarded map immediately.
        // If a link (redirects to another page, wait 200ms before updating the awarded tab)
        if (kind === "redtext") {
          dispatch({ type: "AWARD", id, amount, kind });
        } else {
          // Add balance immediately
          window.setTimeout(() => {
            dispatch({ type: "AWARDINF", amount });
          }, 300);

          // Mark awarded after a small delay to avoid pre-navigation UI shifts
          window.setTimeout(() => {
            pendingAwardsRef.current.delete(id);
            dispatch({ type: "MARK_AWARDED", id, kind });
          }, 800);
        }

        return true;
      },

      spend: (amount) => {
        const amt = normalize2(toAmount(amount));
        if (!Number.isFinite(amt) || amt <= 0) return false;
        if (normalize2(state.balance) < amt) {
          setUnderflowTick((t) => t + 1);
          return false;
        }

        dispatch({ type: "SPEND", amount: amt });
        return true;
      },

      hasAward: (id) => !!state.awarded[id],

      reset: () => dispatch({ type: "RESET" }),
      localClickCount: () => starflareClickCount,
      incLocalClickCount: () =>
        setStarflareClickCount((prev) => {
          const safePrev = Number.isFinite(prev) && prev >= 0 ? prev : 0;
          return safePrev + 1;
        }),

      awardLever: (spendAmt) => {
        const gen = getPayoutGen();

        // Use provided spendAmt if valid; otherwise fall back to generator’s configured cost
        let cost = normalize2(toAmount(spendAmt));
        if (!Number.isFinite(cost) || cost <= 0) {
          cost = normalize2(gen.info().config.cost); // e.g., 5 from your default config
        }

        //if the spend will make it underflow increment underflow and return false;
        if (normalize2(state.balance) < cost) {
          dispatch({ type: "UNDERFLOW" });
          setUnderflowTick((t) => t + 1);
          return false;
        }
        setLeverPullTick((t) => t + 1);
        dispatch({ type: "SPEND", amount: cost });
        const payoutAmount = normalize2(leverPayout()); // compute this outside
        window.setTimeout(() => {
          if (Number.isFinite(payoutAmount) && payoutAmount > 0) {
            setLeverPullTick((t) => t + 1);
            dispatch({ type: "AWARDINF", amount: payoutAmount });
          }
        }, 400);

        return true;
      },

      // on an overflow, it sets the balanceFx to 'overflow', which is listened for in AnimatedBalance, and plays the custom trio
      // then on the next frame, it sets the balance Fx back to null to be potentially called again
      triggerOverflowFx: () => {
        dispatch({ type: "OVERFLOW" });
        setOverflowTick((t) => t + 1);
      },

      triggerUnderFlowFx: () => {
        dispatch({ type: "UNDERFLOW" });
        setUnderflowTick((t) => t + 1);
      },

      inputBalance: (amt) => {
        dispatch({ type: "INPUT", amount: amt });
      },
      getQuestStats,

      getAllQuestsComplete,
      getCompletedQuests,
      underflowTick,
      overflowTick,
      leverPullTick,
      ready,
      setThemeById,
      purchaseTheme,

      // Spend balance specifically for a starflare purchase
      buyStarflare: (amount) => {
        const amt = normalize2(toAmount(amount));
        if (!Number.isFinite(amt) || amt <= 0) return false;
        if (normalize2(state.balance) < amt) {
          setUnderflowTick((t) => t + 1);
          return false;
        }
        dispatch({ type: "SPEND", amount: amt });
        return true;
      },
    }),
    [
      state,
      themeId,
      highlightHex,
      highlightLightHex,
      ownedThemes,
      starflareClickCount,
      ready,
      overflowTick,
      underflowTick,
      leverPullTick,
      getCompletedQuests,
      getAllQuestsComplete,
      getQuestStats,
      setThemeById,
      purchaseTheme,
    ],
  );

  return <MoneyContext.Provider value={api}>{children}</MoneyContext.Provider>;
}

export function useMoney() {
  const ctx = useContext(MoneyContext);
  if (!ctx) throw new Error("useMoney must be used inside MoneyProvider");
  return ctx;
}
