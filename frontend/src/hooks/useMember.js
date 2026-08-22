/**
 * Project team — GET/POST/PATCH/DELETE /projects/:id/members.
 *
 * All four endpoints are live. The role gate on the route is coarse (ADMIN,
 * PM); the controller additionally 403s a PM who is not a member of the project
 * itself, so a PM cannot staff someone else's job.
 *
 * The roster is unpaginated — a project team is a handful of people — and comes
 * back as `{ data: [...] }`, each row a project_member with its `user` embedded
 * through the backend's `userSelect` projection.
 */

import {
  addProjectMember,
  editProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "@/api/projects.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The key every mutation below invalidates. */
const membersKey = (projectId) => ["projects", "members", projectId];

export const useProjectMembers = (projectId) => {
  return useQuery({
    queryKey: membersKey(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: Boolean(projectId),
  });
};

/**
 * Adding someone who is already on the team is a 409 from the controller, not a
 * silent no-op — the dialog shows that message rather than swallowing it, which
 * is why errors are not caught in any of the three mutations here.
 *
 * `_count.members` on the project row moves too, so the detail and list queries
 * are invalidated alongside the roster.
 */
export const useAddProjectMember = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => addProjectMember(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["projects", "detail"] });
    },
  });
};

/** Only `roleInProject` is editable — the row is keyed by userId, not by id. */
export const useUpdateProjectMember = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, body }) => editProjectMember(projectId, userId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) }),
  });
};

/**
 * Removing a member deletes the project_member row only. Their tasks stay on
 * the project — `assigned_to_user_id` is onDelete: SetNull against the USER,
 * not against the membership — so this is not a destructive action in the way
 * deleting a project is.
 */
export const useRemoveProjectMember = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["projects", "detail"] });
    },
  });
};
