/**
 * Canonical builder defaults.
 * Single source of truth for NPC spawn, animation clip, and related values.
 */

/** Default spawn X (center of 640×360 viewport). Shared by NPC and scene spawn. */
export const DEFAULT_SPAWN_X = 320;

/** Default spawn Y (center of 640×360 viewport). Shared by NPC and scene spawn. */
export const DEFAULT_SPAWN_Y = 180;

/** Default X coordinate for new NPC spawn. */
export const DEFAULT_NPC_SPAWN_X = DEFAULT_SPAWN_X;

/** Default Y coordinate for new NPC spawn. */
export const DEFAULT_NPC_SPAWN_Y = DEFAULT_SPAWN_Y;

/** Default scene spawn X when creating a new scene. */
export const DEFAULT_SCENE_SPAWN_X = DEFAULT_SPAWN_X;

/** Default scene spawn Y when creating a new scene. */
export const DEFAULT_SCENE_SPAWN_Y = DEFAULT_SPAWN_Y;

/** Default scene geometry width in pixels. */
export const DEFAULT_SCENE_GEOMETRY_WIDTH = 640;

/** Default scene geometry height in pixels. */
export const DEFAULT_SCENE_GEOMETRY_HEIGHT = 360;

/** Default NPC interaction radius. */
export const DEFAULT_NPC_INTERACT_RADIUS = 24;

/** Default NPC wander radius. */
export const DEFAULT_NPC_WANDER_RADIUS = 32;

/** Default NPC wander speed. */
export const DEFAULT_NPC_WANDER_SPEED = 1;

/** Default NPC idle pause range [min, max] in milliseconds. */
export const DEFAULT_NPC_IDLE_PAUSE_MS: readonly [number, number] = [500, 1500];

/** Default animation clip frame count. */
export const DEFAULT_ANIMATION_FRAME_COUNT = 4;

/** Default animation clip playback FPS. */
export const DEFAULT_ANIMATION_PLAYBACK_FPS = 8;

/** JSON Pointer path for dialogue test artifact patch (RFC 6901). */
export const BUILDER_ARTIFACT_PATCH_PATH_DIALOGUE_TEST = "/dialogue/test";

/** JSON Pointer path for default dialogue lastLine fallback (RFC 6901). */
export const BUILDER_ARTIFACT_PATCH_PATH_DEFAULT_LAST_LINE = "/dialogues/default/lastLine";

/** Error message thrown when an unsupported automation step kind is encountered. */
export const AUTOMATION_STEP_KIND_UNSUPPORTED_ERROR = "automation-step-kind-unsupported";

/** Default scene node size (width and height) when creating 3D nodes. */
export const DEFAULT_SCENE_NODE_SIZE = 64;

/** Default tilemap layer identifier used by the 2D scene editor. */
export const DEFAULT_TILEMAP_LAYER_ID = "default";

/** Default tilemap layer label stored with 2D scene data. */
export const DEFAULT_TILEMAP_LAYER_NAME = "ground";

/** Empty tile sentinel stored in the tilemap grid. */
export const DEFAULT_TILEMAP_EMPTY_VALUE = -1;

/** Default tile width and height for tilemap sprite sheets. */
export const DEFAULT_TILEMAP_TILE_SIZE_PX = 32;

/** Default palette preview size for tilemap swatches. */
export const DEFAULT_TILEMAP_PALETTE_PREVIEW_SIZE_PX = 28;

/** Default tilemap editor column count. */
export const DEFAULT_TILEMAP_GRID_COLUMNS = 12;

/** Default tilemap editor row count. */
export const DEFAULT_TILEMAP_GRID_ROWS = 8;

/** Debounce window before tilemap edits persist through HTMX. */
export const TILEMAP_PERSIST_DEBOUNCE_MS = 400;

/** Flood-fill operation guard to prevent runaway tile paints. */
export const TILEMAP_FILL_OPERATION_LIMIT = 500;

/** Placeholder SVG width for builder generation previews (16:9). */
export const CREATOR_PLACEHOLDER_SVG_WIDTH = 1024;

/** Placeholder SVG height for builder generation previews (16:9). */
export const CREATOR_PLACEHOLDER_SVG_HEIGHT = 576;

/** Default number of library items shown per builder workspace page. */
export const BUILDER_LIBRARY_PAGE_SIZE = 6;
