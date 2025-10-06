
// RNg plumbing
export function makeCryptoRNG() {
  const hasCrypto =
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function";

  if (hasCrypto) {
    return {
      random: () => {
        const buf = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buf);
        return (buf[0] >>> 0) / 2 ** 32; // [0,1)
      },
    };
  }
  return { random: Math.random };
}

export function makeMulberry32(seed) {
  let t = seed >>> 0;
  return {
    random: () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 2 ** 32;
    },
  };
}

// distributions
export function triangularSample(rng, a, m, b) {
  if (!(a <= m && m <= b)) throw new Error("Require a <= m <= b");
  const u = rng.random();
  const Fm = (m - a) / (b - a);
  if (u < Fm) {
    return a + Math.sqrt(u * (b - a) * (m - a));
  } else {
    return b - Math.sqrt((1 - u) * (b - a) * (b - m));
  }
}

export function triangularEV(a, m, b) {
  return (a + m + b) / 3;
}

export function powerTailSample(rng, m, cap, k) {
  if (!(cap > m)) throw new Error("Require cap > m");
  if (!(k > 0)) throw new Error("Require k > 0");
  const u = rng.random();
  return m + (cap - m) * Math.pow(u, k);
}

export function powerTailEV(m, cap, k) {
  return m + (cap - m) / (k + 1);
}

// mix builder
function clamp(x, lo, hi) {
  return Math.min(Math.max(x, lo), hi);
}
function toCents(x) {
  return Math.round(x * 100) / 100;
}

// solve for mixture weight p so: EV = (1-p)*evBase + p*evTail = targetEV
function calibrateP(evTarget, evBase, evTail) {
  const denom = evTail - evBase;
  if (denom <= 0) {
    // Tail not larger than base — default to pure base to keep shape sane.
    return 0;
  }
  return clamp((evTarget - evBase) / denom, 0, 1);
}

// returns { next(), info() }
export function createPayoutGenerator(cfg) {
  const rng = cfg.rng || makeCryptoRNG();

  if (!(cfg.min < cfg.baseMode && cfg.baseMode <= cfg.baseMax && cfg.baseMax <= cfg.cap)) {
    throw new Error("Require min < baseMode <= baseMax <= cap");
  }
  if (!(cfg.tailStart >= cfg.baseMax && cfg.tailStart < cfg.cap)) {
    throw new Error("Require tailStart >= baseMax and tailStart < cap");
  }

  // Component means
  const evBase = triangularEV(cfg.min, cfg.baseMode, cfg.baseMax);
  const evTail = powerTailEV(cfg.tailStart, cfg.cap, cfg.tailK);

  // allow explicit tailWeight; else calibrate to targetEV
  const hasTailWeight =
    typeof cfg.tailWeight === "number" && Number.isFinite(cfg.tailWeight);
  const p = hasTailWeight
    ? clamp(cfg.tailWeight, 0, 1)
    : calibrateP(cfg.targetEV, evBase, evTail);

  const evOverall = (1 - p) * evBase + p * evTail;

  const drawBase = () => {
    const x = triangularSample(rng, cfg.min, cfg.baseMode, cfg.baseMax);
    return cfg.roundToCents ? toCents(x) : x;
  };

  const drawTail = () => {
    const x = powerTailSample(rng, cfg.tailStart, cfg.cap, cfg.tailK);
    return cfg.roundToCents ? toCents(x) : x;
  };

  return {
    next: () => {
      const u = rng.random();
      const raw = u < p ? drawTail() : drawBase();
      return clamp(raw, cfg.min, cfg.cap);
    },

    info: () => ({
      p,                    
      evBase,
      evTail,
      evOverall,
      usedTailWeight: hasTailWeight, 
      targetEV: cfg.targetEV,
      evDriftFromTarget: typeof cfg.targetEV === "number"
        ? evOverall - cfg.targetEV
        : undefined,
      config: cfg,
    }),
  };
}
