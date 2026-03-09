import { Prisma } from "@prisma/client";
import { type ExternalFailure, toExternalFailure } from "../contracts/external-boundary.ts";

/**
 * Maps Prisma/client errors into the shared external-boundary failure contract.
 *
 * @param error Unknown database error.
 * @param operation Human-readable operation label.
 * @returns Normalized database failure.
 */
export const toPrismaExternalFailure = (error: unknown, operation: string): ExternalFailure => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          source: "database",
          code: "conflict",
          message: `${operation} failed because the record already exists.`,
          retryable: false,
          operation,
        };
      case "P2025":
        return {
          source: "database",
          code: "not-found",
          message: `${operation} failed because the target record no longer exists.`,
          retryable: false,
          operation,
        };
      case "P2003":
        return {
          source: "database",
          code: "validation",
          message: `${operation} failed because a related record is missing.`,
          retryable: false,
          operation,
        };
      case "P2034":
        return {
          source: "database",
          code: "conflict",
          message: `${operation} conflicted with another transaction.`,
          retryable: true,
          operation,
        };
      default:
        return {
          source: "database",
          code: "unexpected",
          message: `${operation} failed with Prisma error ${error.code}.`,
          retryable: false,
          operation,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      source: "database",
      code: "validation",
      message: `${operation} failed because the database query was invalid.`,
      retryable: false,
      operation,
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      source: "database",
      code: "unavailable",
      message: `${operation} failed because the database connection is unavailable.`,
      retryable: true,
      operation,
    };
  }

  return toExternalFailure({
    source: "database",
    error,
    message: `${operation} failed unexpectedly.`,
    operation,
    fallbackCode: "unexpected",
    retryable: false,
  });
};
