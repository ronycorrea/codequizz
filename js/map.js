export function phaseState(phase, profile) {
  if (!phase.publicada) return 'future';
  if (profile.phaseProgress[phase.id]?.approved) return 'completed';
  return phase.prerequisitos.every(id => profile.phaseProgress[id]?.approved) ? 'available' : 'locked';
}
export function worldProgress(world, profile) { return world.faseIds.filter(id => profile.phaseProgress[id]?.approved).length; }
