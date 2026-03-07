import { runSetupWorkflow } from "./runtime-bootstrap.ts";

const result = await runSetupWorkflow();
console.info(JSON.stringify(result, null, 2));
if (!result.ok) {
  process.exitCode = 1;
}
