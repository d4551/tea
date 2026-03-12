import { describe, expect, test } from "bun:test";
import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { runDoctorWorkflow, runSetupWorkflow } from "../scripts/runtime-bootstrap.ts";
import { collectRuntimeReadinessReport } from "../src/bootstrap/runtime-readiness.ts";

describe("runtime bootstrap", () => {
  test("doctor workflow returns a deterministic readiness envelope", async () => {
    const report = await runDoctorWorkflow();

    expect(typeof report.ok).toBe("boolean");
    expect(Array.isArray(report.checks)).toBe(true);
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.checks.some((check) => check.key === "database:reachable")).toBe(true);
    expect(report.checks.some((check) => check.key === "database:schema")).toBe(true);
    expect(report.checks.some((check) => check.key === "ai:routing")).toBe(true);
  });

  test("runtime readiness report includes writable directories and built assets", async () => {
    const report = await collectRuntimeReadinessReport();

    expect(report.checks.some((check) => check.key.startsWith("directory:"))).toBe(true);
    expect(report.checks.some((check) => check.key.startsWith("asset:"))).toBe(true);
    expect(
      report.checks.filter((check) => check.key === "directory:./.cache/hf-models").length,
    ).toBe(1);
  });

  test("cross-platform installer entrypoints exist", async () => {
    expect(await Bun.file("scripts/install-macos.sh").exists()).toBe(true);
    expect(await Bun.file("scripts/install-linux.sh").exists()).toBe(true);
    expect(await Bun.file("scripts/install-windows.ps1").exists()).toBe(true);
  });

  test("installer entrypoints use official Bun install flows", async () => {
    const macosScript = await Bun.file("scripts/install-macos.sh").text();
    const linuxScript = await Bun.file("scripts/install-linux.sh").text();
    const windowsScript = await Bun.file("scripts/install-windows.ps1").text();

    expect(macosScript.includes("https://bun.com/install")).toBe(true);
    expect(linuxScript.includes("https://bun.com/install")).toBe(true);
    expect(windowsScript.includes("https://bun.com/install.ps1")).toBe(true);
    expect(macosScript.includes("bun run setup")).toBe(true);
    expect(linuxScript.includes("bun run setup")).toBe(true);
    expect(windowsScript.includes("bun run setup")).toBe(true);
  });

  test("setup workflow creates .env when missing and runs canonical Bun steps", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "bun-test-"));
    await Bun.write(`${cwd}/.env.example`, "TEST_VALUE=from-example\n");

    const commands: string[] = [];
    const result = await runSetupWorkflow({
      cwd,
      readCurrentBunVersion: () => "1.3.10",
      runCommand: async (step) => {
        commands.push(step.description);
      },
      ensureEnvFile: async () => {
        await Bun.write(`${cwd}/.env`, await Bun.file(`${cwd}/.env.example`).text());
        return "created";
      },
      collectReadinessReport: async () => ({ ok: true, checks: [] }),
    });

    expect(result.ok).toBe(true);
    expect(result.steps).toEqual([
      "bun install",
      "created .env from .env.example",
      "bun run prisma:generate",
      "bun run prisma:migrate",
      "bun run build:assets",
    ]);
    expect(commands).toEqual([
      "bun install",
      "bun run prisma:generate",
      "bun run prisma:migrate",
      "bun run build:assets",
    ]);
    expect(await Bun.file(`${cwd}/.env`).text()).toBe("TEST_VALUE=from-example\n");
  });

  test("setup workflow preserves existing .env files", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "bun-test-"));
    await Bun.write(`${cwd}/.env.example`, "TEST_VALUE=from-example\n");
    await Bun.write(`${cwd}/.env`, "TEST_VALUE=preserved\n");

    const result = await runSetupWorkflow({
      cwd,
      readCurrentBunVersion: () => "1.3.10",
      runCommand: async () => undefined,
      ensureEnvFile: async () => "preserved",
      collectReadinessReport: async () => ({ ok: true, checks: [] }),
    });

    expect(result.ok).toBe(true);
    expect(result.steps).toContain("preserved existing .env");
    expect(await Bun.file(`${cwd}/.env`).text()).toBe("TEST_VALUE=preserved\n");
  });
});
