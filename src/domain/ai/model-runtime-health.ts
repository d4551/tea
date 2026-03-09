import type { LocalModelFailure } from "./local-model-contract.ts";

/**
 * Configuration for local-model runtime health tracking.
 */
export interface LocalModelRuntimeHealthConfig {
  /** Number of consecutive failures required before opening the circuit. */
  readonly circuitBreakerThreshold: number;
  /** Time in milliseconds to keep the circuit open after tripping. */
  readonly cooldownMs: number;
}

/**
 * Snapshot of the current local-model runtime health state.
 */
export interface LocalModelRuntimeHealthSnapshot {
  /** Count of consecutive failures observed since the last success. */
  readonly consecutiveFailures: number;
  /** Timestamp in milliseconds until which the circuit remains open. */
  readonly circuitOpenUntilMs: number;
}

/**
 * Tracks repeated local-model failures and opens a cooldown window when needed.
 */
export class LocalModelRuntimeHealth {
  private _consecutiveFailures = 0;
  private _circuitOpenUntilMs = 0;

  /**
   * Creates a runtime health tracker.
   *
   * @param config Runtime health policy.
   */
  constructor(private readonly config: LocalModelRuntimeHealthConfig) {}

  /**
   * Returns the current health snapshot.
   *
   * @returns Current health state.
   */
  public snapshot(): LocalModelRuntimeHealthSnapshot {
    return {
      consecutiveFailures: this._consecutiveFailures,
      circuitOpenUntilMs: this._circuitOpenUntilMs,
    };
  }

  /**
   * Returns true when the circuit is currently open.
   *
   * @param nowMs Optional timestamp override for tests.
   * @returns True when requests should short-circuit.
   */
  public isCircuitOpen(nowMs: number = Date.now()): boolean {
    return nowMs < this._circuitOpenUntilMs;
  }

  /**
   * Marks the runtime healthy after a successful load or inference.
   */
  public markSuccess(): void {
    this._consecutiveFailures = 0;
    this._circuitOpenUntilMs = 0;
  }

  /**
   * Records a structured local-model failure and updates circuit state.
   *
   * @param failure Structured failure payload.
   * @param nowMs Optional timestamp override for tests.
   * @returns Updated health snapshot.
   */
  public recordFailure(
    failure: LocalModelFailure,
    nowMs: number = Date.now(),
  ): LocalModelRuntimeHealthSnapshot {
    if (failure.code === "circuit-open") {
      return this.snapshot();
    }

    this._consecutiveFailures += 1;
    if (this._consecutiveFailures >= this.config.circuitBreakerThreshold) {
      this._circuitOpenUntilMs = nowMs + this.config.cooldownMs;
    }

    return this.snapshot();
  }

  /**
   * Resets all tracked health state.
   */
  public reset(): void {
    this._consecutiveFailures = 0;
    this._circuitOpenUntilMs = 0;
  }
}
