#!/bin/bash

# Backend Status Check Script for AskMyDoc
# This script helps diagnose issues with the backend service on Render.com

BACKEND_URL="https://askmydoc-backend-lr1q.onrender.com"
ECHO_PREFIX="\033[1;36m[STATUS CHECK]\033[0m"

echo -e "${ECHO_PREFIX} Starting backend status check..."
echo -e "${ECHO_PREFIX} Testing backend service at: ${BACKEND_URL}"
echo ""

# Function to make a curl request and display the result
function make_request() {
  local endpoint=$1
  local description=$2
  
  echo -e "${ECHO_PREFIX} Testing endpoint: ${endpoint} (${description})"
  echo -e "${ECHO_PREFIX} Request: curl -s ${BACKEND_URL}${endpoint}"
  echo ""
  
  # Make the request and capture the response
  response=$(curl -s -w "\n\nStatus Code: %{http_code}" ${BACKEND_URL}${endpoint})
  
  # Extract the status code from the response
  status_code=$(echo "$response" | tail -n 1 | cut -d' ' -f3)
  content=$(echo "$response" | sed '$d')
  
  # Check if the response is HTML (likely an error page)
  if [[ "$content" == *"<!DOCTYPE html>"* ]] || [[ "$content" == *"<html>"* ]]; then
    echo -e "\033[1;31mReceived HTML response (error page) instead of API response\033[0m"
    echo -e "Status Code: ${status_code}"
    echo ""
    echo -e "\033[1;33mThis indicates the backend service might be:\033[0m"
    echo -e "  - Spun down (free tier services spin down after 15 minutes of inactivity)"
    echo -e "  - Not properly started"
    echo -e "  - Encountering errors during startup"
  else
    # Display the response
    echo -e "\033[1;32mResponse:\033[0m"
    echo "$content"
    echo -e "Status Code: ${status_code}"
  fi
  
  echo "\n---------------------------------------------------\n"
}

# Test various endpoints
make_request "/" "Root endpoint"
make_request "/health" "Health check endpoint"
make_request "/api/status" "API status endpoint"

echo -e "${ECHO_PREFIX} Status check complete."
echo -e "${ECHO_PREFIX} If you received HTML responses instead of JSON, please check the BACKEND_DEPLOYMENT_FIX.md file for troubleshooting steps."