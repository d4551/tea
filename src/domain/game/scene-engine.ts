import type {
  CollisionMask,
  Direction,
  MovementVector,
  NpcState,
} from "../../shared/contracts/game.ts";

export class SceneEngine {
  /**
   * Checks if a bounding box collides with any scene collision mask.
   */
  public checkStaticCollision(
    x: number,
    y: number,
    w: number,
    h: number,
    collisions: readonly CollisionMask[],
  ): boolean {
    for (const r of collisions) {
      if (x < r.x + r.width && x + w > r.x && y < r.y + r.height && y + h > r.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a bounding box collides with any NPC.
   */
  public checkNpcCollision(
    x: number,
    y: number,
    w: number,
    h: number,
    npcs: readonly NpcState[],
    excludeNpcId?: string,
  ): boolean {
    for (const npc of npcs) {
      if (excludeNpcId && npc.id === excludeNpcId) continue;

      const r = npc.bounds;
      const nx = npc.position.x + r.x;
      const ny = npc.position.y + r.y;

      if (x < nx + r.width && x + w > nx && y < ny + r.height && y + h > ny) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolves the next position given a movement vector and collisions.
   * Returns the updated position and facing direction.
   */
  public moveEntity(
    currentPos: { x: number; y: number },
    currentFacing: Direction,
    bounds: CollisionMask,
    vector: MovementVector,
    speed: number,
    collisions: readonly CollisionMask[],
    npcs: readonly NpcState[],
    excludeNpcId?: string,
  ): { position: { x: number; y: number }; facing: Direction; moved: boolean } {
    const dx = vector.x * speed;
    const dy = vector.y * speed;

    let facing = currentFacing;
    if (Math.abs(dx) > Math.abs(dy)) {
      facing = dx > 0 ? "right" : "left";
    } else if (Math.abs(dy) > 0) {
      facing = dy > 0 ? "down" : "up";
    }

    if (dx === 0 && dy === 0) {
      return { position: currentPos, facing, moved: false };
    }

    const nextX = currentPos.x + dx;
    const nextY = currentPos.y + dy;

    const footX = nextX + bounds.x;
    const footY = nextY + bounds.y;

    const collidesStatic = this.checkStaticCollision(
      footX,
      footY,
      bounds.width,
      bounds.height,
      collisions,
    );
    const collidesNpc = this.checkNpcCollision(
      footX,
      footY,
      bounds.width,
      bounds.height,
      npcs,
      excludeNpcId,
    );

    if (collidesStatic || collidesNpc) {
      // Simple slide implementation: try moving along individual axes
      const canMoveX =
        !this.checkStaticCollision(
          footX,
          currentPos.y + bounds.y,
          bounds.width,
          bounds.height,
          collisions,
        ) &&
        !this.checkNpcCollision(
          footX,
          currentPos.y + bounds.y,
          bounds.width,
          bounds.height,
          npcs,
          excludeNpcId,
        );

      const canMoveY =
        !this.checkStaticCollision(
          currentPos.x + bounds.x,
          footY,
          bounds.width,
          bounds.height,
          collisions,
        ) &&
        !this.checkNpcCollision(
          currentPos.x + bounds.x,
          footY,
          bounds.width,
          bounds.height,
          npcs,
          excludeNpcId,
        );

      if (canMoveX && Math.abs(dx) > 0) {
        return { position: { x: nextX, y: currentPos.y }, facing, moved: true };
      } else if (canMoveY && Math.abs(dy) > 0) {
        return { position: { x: currentPos.x, y: nextY }, facing, moved: true };
      }

      return { position: currentPos, facing, moved: false };
    }

    return { position: { x: nextX, y: nextY }, facing, moved: true };
  }

  /**
   * Finds the closest NPC within an interaction radius.
   */
  public findInteractableNpc(
    playerPos: { x: number; y: number },
    playerBounds: CollisionMask,
    npcs: readonly NpcState[],
    radius?: number,
  ): NpcState | null {
    const px = playerPos.x + playerBounds.x + playerBounds.width / 2;
    const py = playerPos.y + playerBounds.y + playerBounds.height / 2;

    let closest: NpcState | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const npc of npcs) {
      const nx = npc.position.x + npc.bounds.x + npc.bounds.width / 2;
      const ny = npc.position.y + npc.bounds.y + npc.bounds.height / 2;

      const distSq = (px - nx) * (px - nx) + (py - ny) * (py - ny);
      const effectiveRadius = typeof radius === "number" ? radius : npc.interactRadius;

      if (distSq <= effectiveRadius * effectiveRadius && distSq < minDistance) {
        minDistance = distSq;
        closest = npc;
      }
    }

    return closest;
  }
}

export const sceneEngine = new SceneEngine();
