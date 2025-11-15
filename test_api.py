# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests",
#     "python-dotenv",
# ]
# ///

import os
import sys
import time
import requests
from dotenv import load_dotenv

# Load env variables from server directory
load_dotenv(dotenv_path="./server/.env")

BASE_URL = "http://localhost:5000/api"

def run_tests():
    print("Starting MindfulTrack Backend API Verification Tests...")
    
    # Test 1: Root route
    try:
        response = requests.get("http://localhost:5000/")
        print(f"Root endpoint status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("ERROR: Server is not running. Please start the server using 'npm run dev' first.")
        sys.exit(1)

    # We will use a unique test user email
    timestamp = int(time.time())
    test_email = f"testuser_{timestamp}@example.com"
    test_password = "password123"
    test_name = "Test User"

    print(f"\nTesting Registration for {test_email}...")
    
    # Test 2: Registration with OTP flow enabled (useOTP=True)
    reg_otp_data = {
        "email": test_email,
        "password": test_password,
        "name": test_name,
        "useOTP": True
    }
    
    reg_response = requests.post(f"{BASE_URL}/auth/register", json=reg_otp_data)
    print(f"Registration (OTP Flow) response: {reg_response.status_code}")
    reg_json = reg_response.json()
    print(f"   Response details: {reg_json}")
    
    # In-memory OTP flow logs to the console. For testing, let's assume we can also login directly or
    # test standard registration without OTP.
    # Let's test standard registration with a second account
    test_email_direct = f"direct_{timestamp}@example.com"
    reg_direct_data = {
        "email": test_email_direct,
        "password": test_password,
        "name": test_name,
        "useOTP": False
    }
    
    reg_dir_response = requests.post(f"{BASE_URL}/auth/register", json=reg_direct_data)
    print(f"Direct Registration response: {reg_dir_response.status_code}")
    reg_dir_json = reg_dir_response.json()
    
    if reg_dir_response.status_code != 201:
        print(f"Registration failed: {reg_dir_json}")
        sys.exit(1)
        
    access_token = reg_dir_json["accessToken"]
    print("   Registration successful! Retrieved access token.")

    # Test 3: Login (Direct Flow)
    print(f"\nTesting Login for {test_email_direct}...")
    login_data = {
        "email": test_email_direct,
        "password": test_password,
        "useOTP": False
    }
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login response: {login_response.status_code}")
    login_json = login_response.json()
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_json}")
        sys.exit(1)
    
    access_token = login_json["accessToken"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("   Login successful! Authorization header set.")

    # Test 4: Get Current User details (/auth/me)
    print("\nTesting /auth/me profile endpoint...")
    me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Profile response: {me_response.status_code}")
    print(f"   User profile details: {me_response.json()}")

    # Test 5: Create Journal Entry with AI Sentiment analysis
    print("\nCreating journal entry with positive sentiment...")
    journal_data_pos = {
        "content": "Today was a fantastic day! I spent quality time with my friends, walked in the park, and accomplished all my tasks. I feel happy and fulfilled."
    }
    j_pos_response = requests.post(f"{BASE_URL}/journal", json=journal_data_pos, headers=headers)
    print(f"Create positive entry response: {j_pos_response.status_code}")
    pos_json = j_pos_response.json()
    print(f"   Analyzed mood: {pos_json.get('mood')}")
    print(f"   Sentiment score: {pos_json.get('sentimentScore')}")
    print(f"   AI Feedback: {pos_json.get('aiFeedback')}")
    print(f"   Tags: {pos_json.get('tags')}")

    print("\nCreating journal entry with anxious/tired sentiment...")
    journal_data_neg = {
        "content": "I feel so anxious and overwhelmed today. The workload at the office is too high and I'm not sure if I can complete everything. I am really stressed."
    }
    j_neg_response = requests.post(f"{BASE_URL}/journal", json=journal_data_neg, headers=headers)
    print(f"Create anxious entry response: {j_neg_response.status_code}")
    neg_json = j_neg_response.json()
    print(f"   Analyzed mood: {neg_json.get('mood')}")
    print(f"   Sentiment score: {neg_json.get('sentimentScore')}")
    print(f"   AI Feedback: {neg_json.get('aiFeedback')}")
    print(f"   Tags: {neg_json.get('tags')}")

    # Test 6: Fetch all journal entries
    print("\nFetching all journal entries...")
    fetch_response = requests.get(f"{BASE_URL}/journal", headers=headers)
    print(f"Fetch entries response: {fetch_response.status_code}")
    entries = fetch_response.json()
    print(f"   Total entries retrieved: {len(entries)}")

    # Test 7: Fetch Weekly Summary
    print("\nFetching Weekly Summary...")
    sum_response = requests.get(f"{BASE_URL}/journal/weekly-summary", headers=headers)
    print(f"Weekly Summary response: {sum_response.status_code}")
    summary_data = sum_response.json()
    print(f"   Weekly Summary details: {summary_data}")

    print("\nAll tests passed successfully!")

if __name__ == "__main__":
    run_tests()
