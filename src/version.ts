// src/version.ts
// Single source of truth: read the version from package.json

import packageJson from "../package.json";

export const APP_VERSION = packageJson.version;
