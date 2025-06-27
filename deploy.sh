#!/bin/bash

NOW=\"`date "+%F %H:%M"`\"

# --- Configuration (Consider using environment variables) ---
OHDEAR_API_KEY="your-oh-dear-api-token-here" #  Use: export OHDEAR_API_KEY="..."
STATUS_PAGE_ID="your-status-page-id-here" #  Use: export STATUS_PAGE_ID="..."
OHDEAR_API_URL="https://ohdear.app/api/status-page-updates"

update_ohdear() {
  local title="$1"
  local text="$2"
  local now="$(date '+%F %H:%M')" # Corrected date command
  local response

  response=$(curl --silent --write-out '%{http_code}' -L \
                  -X POST "$OHDEAR_API_URL" \
                  -H "Content-Type: application/json" \
                  -H "Authorization: Bearer $OHDEAR_API_KEY" \
                  --data-raw "{\"status_page_id\":$STATUS_PAGE_ID, \"title\":\"$title\", \"text\":\"$text\", \"severity\":\"scheduled\", \"time\":\"$now\"}")

  if [ "$response" -eq 201 ]; then # Changed to  -eq
    echo "🚨 Oh Dear Status: Update successful ($response) ✔️"
  else
    echo "🚨 Oh Dear Status: Failed to update ($response) ❌"
    return 1 # Explicitly return non-zero on failure
  fi
  return 0
}

update_ohdear "Maintenance started" "We'll be right back!"

if [ $? -eq 1 ]; then
    echo "Failed to notify Oh Dear about maintenance start. Exiting."
    exit 1
fi

# Start deployment here...
# ...
# ...

update_ohdear "Maintenance finished" "All done"

echo "Deployment complete."
exit 0 # Explicitly exit
