import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JobApplyTool from "../job_apply.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <JobApplyTool />
  </StrictMode>
);
