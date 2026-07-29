export function getCreatorId(project) {
  if (!project?.createdBy) return null;
  return typeof project.createdBy === 'object' ? project.createdBy._id : project.createdBy;
}

export function getCreatorName(project) {
  if (!project?.createdBy || typeof project.createdBy !== 'object') return 'Deleted user';
  return project.createdBy.name || 'Deleted user';
}