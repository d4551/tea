import { describe, expect, test } from "bun:test";
import { Prisma } from "@prisma/client";
import { toPrismaExternalFailure } from "./prisma-failure.ts";

describe("prisma external failure mapping", () => {
  test("maps known conflict errors to retryable false conflict failures", () => {
    const error = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "7.4.2",
    });

    const failure = toPrismaExternalFailure(error, "create document");

    expect(failure.code).toBe("conflict");
    expect(failure.retryable).toBe(false);
  });

  test("maps transaction conflicts to retryable conflict failures", () => {
    const error = new Prisma.PrismaClientKnownRequestError("tx conflict", {
      code: "P2034",
      clientVersion: "7.4.2",
    });

    const failure = toPrismaExternalFailure(error, "store oracle interaction");

    expect(failure.code).toBe("conflict");
    expect(failure.retryable).toBe(true);
  });
});
