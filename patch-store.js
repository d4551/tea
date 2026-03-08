const fs = require('fs');
let code = fs.readFileSync('src/domain/builder/builder-project-state-store.ts', 'utf8');

if (!code.includes('AnimationTimeline,')) {
  code = code.replace(/  AnimationClip,\n/, '  AnimationClip,\n  AnimationKeyframe,\n  AnimationTimeline,\n  AnimationTrack,\n');
}
if (!code.includes('BuilderProjectAnimationTimelineRow,')) {
  code = code.replace(/  type BuilderProjectAnimationClipRow,\n/, '  type BuilderProjectAnimationClipRow,\n  type BuilderProjectAnimationTimelineRow,\n  type BuilderProjectAnimationTrackRow,\n');
}

code = code.replace(
  /  \/\*\* Authored animation clips\. \*\/\n  readonly animationClips: Record<string, AnimationClip>;\n/,
  '  /** Authored animation clips. */\n  readonly animationClips: Record<string, AnimationClip>;\n  /** Authored animation timelines. */\n  readonly animationTimelines: Record<string, AnimationTimeline>;\n'
);

code = code.replace(
  /  \/\*\* Authored animation clips\. \*\/\n  readonly animationClips: Map<string, AnimationClip>;\n/,
  '  /** Authored animation clips. */\n  readonly animationClips: Map<string, AnimationClip>;\n  /** Authored animation timelines. */\n  readonly animationTimelines: Map<string, AnimationTimeline>;\n'
);

code = code.replace(/    animationClips: buildBaselineAnimationClips\(\),\n/g, '    animationClips: buildBaselineAnimationClips(),\n    animationTimelines: {},\n');
code = code.replace(/  animationClips: {},\n/g, '  animationClips: {},\n  animationTimelines: {},\n');

code = code.replace(/  animationClips: Record<string, AnimationClip>,\n/, '  animationClips: Record<string, AnimationClip>,\n  animationTimelines: Record<string, AnimationTimeline>,\n');
code = code.replace(/  animationClips,\n/, '  animationClips,\n  animationTimelines,\n');

code = code.replace(/  const animationClipsRecord = asRecord\(record\.animationClips\);\n/, '  const animationClipsRecord = asRecord(record.animationClips);\n  const animationTimelinesRecord = asRecord(record.animationTimelines);\n');
code = code.replace(/    animationClips: cloneRecord\(animationClipsRecord as Record<string, AnimationClip>\),\n/, '    animationClips: cloneRecord(animationClipsRecord as Record<string, AnimationClip>),\n    animationTimelines: cloneRecord(animationTimelinesRecord as Record<string, AnimationTimeline>),\n');

code = code.replace(/  animationClips: new Map\(\n    Object.entries\(state.animationClips\).map\(\(\[id, clip\]\) => \[id, structuredClone\(clip\)]\),\n  \),\n/, '  animationClips: new Map(\n    Object.entries(state.animationClips).map(([id, clip]) => [id, structuredClone(clip)]),\n  ),\n  animationTimelines: new Map(\n    Object.entries(state.animationTimelines).map(([id, timeline]) => [id, structuredClone(timeline)]),\n  ),\n');

code = code.replace(/        animationClips: Object.values\(baseline.animationClips\),\n/g, '        animationClips: Object.values(baseline.animationClips),\n        animationTimelines: Object.values(baseline.animationTimelines),\n');

code = code.replace(/    readonly animationClips: Record<string, AnimationClip>;\n/, '    readonly animationClips: Record<string, AnimationClip>;\n    readonly animationTimelines: Record<string, AnimationTimeline>;\n');

code = code.replace(/    const \[assetRows, assetTagRows, assetVariantRows, animationClipRows\] = await Promise.all\(\[\n/, '    const [assetRows, assetTagRows, assetVariantRows, animationClipRows, animationTimelineRows, animationTrackRows] = await Promise.all([\n');
code = code.replace(/      prisma.builderProjectAnimationClip.listProjectRows\(projectId\),\n    \]\);\n/, '      prisma.builderProjectAnimationClip.listProjectRows(projectId),\n      prisma.builderProjectAnimationTimeline.listProjectRows(projectId),\n      prisma.builderProjectAnimationTrack.listProjectRows(projectId),\n    ]);\n');
code = code.replace(/      animationClips: toAnimationClipsFromRows\(animationClipRows\),\n/, '      animationClips: toAnimationClipsFromRows(animationClipRows),\n      animationTimelines: toAnimationTimelinesFromRows(animationTimelineRows, animationTrackRows),\n');

code = code.replace(/        animationClips: Object.values\(state.animationClips\),\n/, '        animationClips: Object.values(state.animationClips),\n        animationTimelines: Object.values(state.animationTimelines),\n');

code = code.replace(/            media.animationClips,\n/, '            media.animationClips,\n            media.animationTimelines,\n');
code = code.replace(/                  media.animationClips,\n/, '                  media.animationClips,\n                  media.animationTimelines,\n');



const parserCode = `
const toAnimationTimelinesFromRows = (
  timelineRows: readonly BuilderProjectAnimationTimelineRow[],
  trackRows: readonly BuilderProjectAnimationTrackRow[],
): Record<string, AnimationTimeline> => {
  const tracksByTimeline = new Map<string, AnimationTrack[]>();
  for (const row of trackRows) {
    let tracks = tracksByTimeline.get(row.timelineId);
    if (!tracks) {
      tracks = [];
      tracksByTimeline.set(row.timelineId, tracks);
    }
    const keyframes = safeJsonParse(row.keyframes);
    tracks.push({
      id: row.id,
      property: row.property,
      keyframes: Array.isArray(keyframes) ? keyframes : [],
    });
  }

  const timelines: Record<string, AnimationTimeline> = {};
  for (const row of timelineRows) {
    timelines[row.id] = {
      id: row.id,
      assetId: row.assetId,
      label: row.label,
      stateTag: row.stateTag,
      sceneMode: row.sceneMode as "2d" | "3d",
      durationMs: row.durationMs,
      loop: row.loop,
      tracks: tracksByTimeline.get(row.id) ?? [],
      createdAtMs: row.createdAt.getTime(),
      updatedAtMs: row.updatedAt.getTime(),
    };
  }
  return timelines;
};
`;

if (!code.includes('toAnimationTimelinesFromRows')) {
  code += parserCode;
}

fs.writeFileSync('src/domain/builder/builder-project-state-store.ts', code);
console.log('Done patching store!');
