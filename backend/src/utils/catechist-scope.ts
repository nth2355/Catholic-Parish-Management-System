import type { Prisma } from "../generated/prisma/client.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const activeAssignment = {
  status: "ACTIVE" as const,
};

export function classTeachingScope(
  req: AuthRequest,
): Prisma.ClassWhereInput {
  if (req.user?.role !== "CATECHIST") return {};

  return {
    assignments: {
      some: {
        ...activeAssignment,
        catechist: { userAccount: { id: req.user.userId } },
      },
    },
  };
}

export function sessionTeachingScope(
  req: AuthRequest,
): Prisma.SessionWhereInput {
  if (req.user?.role !== "CATECHIST") return {};

  return {
    assignment: {
      is: {
        ...activeAssignment,
        catechist: { userAccount: { id: req.user.userId } },
      },
    },
  };
}

export function assignmentTeachingScope(
  req: AuthRequest,
): Prisma.TeachingAssignmentWhereInput {
  if (req.user?.role !== "CATECHIST") return {};

  return {
    status: "ACTIVE",
    catechist: { userAccount: { id: req.user.userId } },
  };
}
