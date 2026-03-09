import { createLogger } from "../src/lib/logger.ts";
import { runSetupWorkflow } from "./runtime-bootstrap.ts";

const logger = createLogger("script.setup");
const result = await runSetupWorkflow();
logger.info("script.setup.result", {
  ok: result.ok,
  stepCount: result.steps.length,
});
if (!result.ok) {
  logger.error("script.setup.failed", { steps: result.steps });
  process.exitCode = 1;
}
