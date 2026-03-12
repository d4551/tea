import { WebGPURenderer } from "three/webgpu";

export const isWebGpuRendererAvailable = typeof WebGPURenderer === "function";
