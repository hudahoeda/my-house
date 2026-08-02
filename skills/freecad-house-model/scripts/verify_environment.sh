#!/usr/bin/env sh
set -eu

SKILL_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SKILL_DIR/../../.." && pwd)

if [ -x "$REPO_ROOT/housectl" ]; then
    echo "housectl: available"
else
    echo "housectl: missing or not executable" >&2
    exit 1
fi

if command -v FreeCADCmd >/dev/null 2>&1; then
    echo "FreeCADCmd: $(command -v FreeCADCmd)"
elif command -v freecadcmd >/dev/null 2>&1; then
    echo "freecadcmd: $(command -v freecadcmd)"
else
    echo "FreeCADCmd: unavailable (checks can use --no-freecad)"
fi

echo "repository: $REPO_ROOT"
