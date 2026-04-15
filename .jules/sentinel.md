## 2024-04-15 - Insecure File System Access in Server Actions
**Vulnerability:** Debug logging logic was using `fs.appendFileSync` to write raw error objects directly to the local filesystem (`update_log.txt`) within Server Actions.
**Learning:** This exposes sensitive database configurations, queries, and internal application states if the log file is accessible. It's also an anti-pattern in serverless deployments which could cause application crashes.
**Prevention:** Avoid any local file system operations (`fs`) for logging or storing data in Server Actions. Use structured, secure logging services designed for serverless environments.
