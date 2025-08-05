#!/usr/bin/env python3
"""
Test script for the Transparency Microservice
Run this script to test all endpoints and verify functionality
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:5000"
TIMEOUT = 10

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False

def test_generate_questions():
    """Test the generate questions endpoint"""
    print("\n🔍 Testing generate questions endpoint...")
    
    test_data = {
        "category": "Food & Beverages",
        "productName": "Organic Green Tea",
        "ingredients": "Organic green tea leaves (Camellia sinensis)",
        "brand": "Pure Leaf Co."
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate-questions",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "questions" in data:
                print(f"✅ Generate questions passed: {len(data['questions'])} questions generated")
                return True
            else:
                print(f"❌ Generate questions failed: Invalid response format")
                return False
        else:
            print(f"❌ Generate questions failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Generate questions error: {e}")
        return False

def test_transparency_score():
    """Test the transparency score endpoint"""
    print("\n🔍 Testing transparency score endpoint...")
    
    test_data = {
        "productName": "Organic Green Tea",
        "category": "Food & Beverages",
        "brand": "Pure Leaf Co.",
        "description": "Premium organic green tea sourced from sustainable farms",
        "ingredients": "Organic green tea leaves (Camellia sinensis)",
        "sourcing": "Sourced from certified organic farms in Fujian Province, China",
        "manufacturing": "Traditional steaming and drying process in solar-powered facility",
        "certifications": "USDA Organic, Fair Trade Certified, ISO 22000"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/transparency-score",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "result" in data:
                score = data["result"].get("score", 0)
                insights = data["result"].get("insights", [])
                print(f"✅ Transparency score passed: Score {score}/100")
                print(f"   Insights: {len(insights)} insights generated")
                return True
            else:
                print(f"❌ Transparency score failed: Invalid response format")
                return False
        else:
            print(f"❌ Transparency score failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Transparency score error: {e}")
        return False

def test_question_templates():
    """Test the question templates endpoint"""
    print("\n🔍 Testing question templates endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/questions/templates", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "templates" in data:
                categories = data.get("categories", [])
                print(f"✅ Question templates passed: {len(categories)} categories available")
                return True
            else:
                print(f"❌ Question templates failed: Invalid response format")
                return False
        else:
            print(f"❌ Question templates failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Question templates error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid data"""
    print("\n🔍 Testing error handling...")
    
    # Test with invalid JSON
    try:
        response = requests.post(
            f"{BASE_URL}/generate-questions",
            data="invalid json",
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        
        if response.status_code == 400:
            print("✅ Error handling passed: Invalid JSON properly rejected")
            return True
        else:
            print(f"❌ Error handling failed: Expected 400, got {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def test_performance():
    """Test API performance"""
    print("\n🔍 Testing API performance...")
    
    test_data = {
        "category": "Food & Beverages",
        "productName": "Test Product",
        "ingredients": "Test ingredients"
    }
    
    start_time = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}/generate-questions",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        end_time = time.time()
        
        if response.status_code == 200:
            response_time = end_time - start_time
            print(f"✅ Performance test passed: Response time {response_time:.3f}s")
            return True
        else:
            print(f"❌ Performance test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Performance test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Transparency Microservice Tests")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_generate_questions,
        test_transparency_score,
        test_question_templates,
        test_error_handling,
        test_performance
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Microservice is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the microservice.")
        return 1

if __name__ == "__main__":
    # Check if microservice is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Microservice is not running or not responding")
            print("Please start the microservice first:")
            print("cd project/microservice")
            print("python app.py")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to microservice")
        print("Please start the microservice first:")
        print("cd project/microservice")
        print("python app.py")
        sys.exit(1)
    
    sys.exit(main()) 