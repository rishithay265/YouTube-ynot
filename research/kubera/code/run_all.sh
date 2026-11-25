#!/usr/bin/env bash
# Re-runs every verification script and records the output in results.txt.
set -euo pipefail
cd "$(dirname "$0")"
{
  echo "Kubera Yantra paper -- verification log"
  echo "python: $(python3 --version 2>&1)"
  for s in magic3.py directions.py magic4.py mantra_syllables.py stego_demo.py figures.py; do
    echo
    echo "################################################################"
    echo "# $s"
    echo "################################################################"
    python3 "$s"
  done
} 2>&1 | tee results.txt
