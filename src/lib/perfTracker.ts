/**
 * Performance Monitoring — Track API latency, DB queries, and Core Web Vitals
 */

type PerfEntry = {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
};

class PerformanceTracker {
  private static entries: PerfEntry[] = [];
  private static readonly MAX_ENTRIES = 200;

  /** Start a timer and return stop function */
  static startTimer(name: string, metadata?: Record<string, any>): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.record(name, duration, metadata);
      return duration;
    };
  }

  /** Record a performance entry */
  static record(name: string, duration: number, metadata?: Record<string, any>) {
    this.entries.push({ name, duration, timestamp: Date.now(), metadata });
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }

    // Warn on slow operations
    if (duration > 5000) {
      console.warn(`[PERF] Slow operation: ${name} took ${duration}ms`, metadata);
    }
  }

  /** Measure an async function */
  static async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const stop = this.startTimer(name, metadata);
    try {
      const result = await fn();
      stop();
      return result;
    } catch (err) {
      stop();
      throw err;
    }
  }

  /** Get average duration for a named operation */
  static getAverage(name: string, windowMs = 3600000): number {
    const cutoff = Date.now() - windowMs;
    const relevant = this.entries.filter(e => e.name === name && e.timestamp > cutoff);
    if (relevant.length === 0) return 0;
    return Math.round(relevant.reduce((s, e) => s + e.duration, 0) / relevant.length);
  }

  /** Get P95 duration for a named operation */
  static getP95(name: string, windowMs = 3600000): number {
    const cutoff = Date.now() - windowMs;
    const durations = this.entries
      .filter(e => e.name === name && e.timestamp > cutoff)
      .map(e => e.duration)
      .sort((a, b) => a - b);
    if (durations.length === 0) return 0;
    const idx = Math.floor(durations.length * 0.95);
    return durations[idx] || durations[durations.length - 1];
  }

  /** Get performance summary */
  static getSummary() {
    const names = [...new Set(this.entries.map(e => e.name))];
    return names.map(name => ({
      name,
      count: this.entries.filter(e => e.name === name).length,
      avg: this.getAverage(name),
      p95: this.getP95(name),
      max: Math.max(...this.entries.filter(e => e.name === name).map(e => e.duration)),
    }));
  }

  /** Clear entries */
  static clear() {
    this.entries = [];
  }
}

export { PerformanceTracker };
