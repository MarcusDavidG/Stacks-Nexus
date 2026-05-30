#!/bin/bash
# Auto-restarts the transaction loop if it exits for any reason.
# Progress is saved to .loop-progress.json so it always resumes from last cycle.

echo "🔁 Auto-restart wrapper started"

while true; do
  npm run loop:checkin
  EXIT=$?

  if [ $EXIT -eq 0 ]; then
    echo "✅ Loop completed successfully."
    break
  fi

  echo "⚠️  Loop exited with code $EXIT — restarting in 10 seconds..."
  sleep 10
done
