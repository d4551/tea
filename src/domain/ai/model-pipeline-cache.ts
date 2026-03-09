import type { AnyPipeline } from "./model-pipeline-loader.ts";
import type { ModelKey } from "./model-registry.ts";

/**
 * Owns the in-memory singleton pipeline cache for the local-model runtime.
 */
export class LocalModelPipelineCache {
  private readonly pipelines = new Map<ModelKey, AnyPipeline>();

  /**
   * Returns a cached pipeline when present.
   *
   * @param key Registry key.
   * @returns Cached pipeline or undefined.
   */
  public get(key: ModelKey): AnyPipeline | undefined {
    return this.pipelines.get(key);
  }

  /**
   * Stores a loaded pipeline under its registry key.
   *
   * @param key Registry key.
   * @param pipeline Loaded pipeline instance.
   */
  public set(key: ModelKey, pipeline: AnyPipeline): void {
    this.pipelines.set(key, pipeline);
  }

  /**
   * Clears all cached pipeline references.
   */
  public clear(): void {
    this.pipelines.clear();
  }
}
