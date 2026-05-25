import { ApiError } from "@formstack/shared";
import { and, eq } from "drizzle-orm";

import { db, workspaceMembers, workspaces } from "../db";

export abstract class BaseController {
  protected normalizeError(err: unknown, fallback = "Internal server error"): never {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) throw ApiError.internal(err.message, err);
    throw ApiError.internal(fallback, err);
  }

  protected assertFound<T>(value: T | null | undefined, name = "Resource"): asserts value is T {
    if (value === null || value === undefined) throw ApiError.notFound(`${name} not found`);
  }

  protected async assertWorkspaceMembership(
    userId: string,
    workspaceId: string,
    minRole: "viewer" | "editor" | "admin" | "owner" = "editor",
  ): Promise<void> {
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)),
      )
      .limit(1);

    if (!membership) throw ApiError.forbidden("You are not a member of this workspace");

    const rank = { viewer: 0, editor: 1, admin: 2, owner: 3 } as const;
    if (rank[membership.role as keyof typeof rank] < rank[minRole]) {
      throw ApiError.forbidden(`Requires ${minRole} role or higher`);
    }
  }

  protected async loadWorkspace(workspaceId: string) {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    this.assertFound(ws, "Workspace");
    return ws;
  }
}
