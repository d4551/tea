import { createLogger } from "../src/lib/logger.ts";
import { runDoctorWorkflow } from "./runtime-bootstrap.ts";

const logger = createLogger("script.doctor");
const report = await runDoctorWorkflow();
logger.info("script.doctor.report", {
  ok: report.ok,
  checkCount: report.checks.length,
});
for (const check of report.checks) {
  logger.info("script.doctor.check", { key: check.key, ok: check.ok, detail: check.detail });
}
if (!report.ok) {
  logger.error("script.doctor.failed");
  process.exitCode = 1;
}
