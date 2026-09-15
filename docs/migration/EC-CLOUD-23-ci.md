# EC-CLOUD-23 — Continuous integration

Every push/PR installs the locked dependency graph, typechecks, executes all Node test suites and builds the Next.js application. Deployment should be blocked when CI is red.
