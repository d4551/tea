import { runDoctorWorkflow } from "./runtime-bootstrap.ts";

const report = await runDoctorWorkflow();
console.info(JSON.stringify(report, null, 2));
if (!report.ok) {
  process.exitCode = 1;
}
