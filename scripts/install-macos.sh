#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${ROOT_DIR}/.env.example"
SUPPORTED_RANGE="$(grep '^BUN_SUPPORTED_RANGE=' "${CONFIG_FILE}" | cut -d= -f2)"
EXPECTED_PREFIX="${SUPPORTED_RANGE%.x}"
INSTALL_VERSION="bun-v$(grep '^BUN_INSTALL_VERSION=' "${CONFIG_FILE}" | cut -d= -f2)"

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    local current_version
    current_version="$(bun --version)"
    if [[ "${current_version}" == ${EXPECTED_PREFIX}* ]]; then
      return
    fi
  fi

  curl -fsSL https://bun.com/install | bash -s "${INSTALL_VERSION}"
  export BUN_INSTALL="${HOME}/.bun"
  export PATH="${BUN_INSTALL}/bin:${PATH}"
}

ensure_bun
cd "${ROOT_DIR}"
bun run setup
