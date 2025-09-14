#!/usr/bin/env python3

import requests
import json

def test_tts():
    """Test the TTS endpoint directly"""
    url = "http://localhost:8000/tts"
    
    payload = {
        "text": "Hello, this is a test of the text-to-speech system.",
        "character": "narrator",
        "voice_type": "narrator",
        "rate": 1.0,
        "voice": "narrator"
    }
    
    try:
        print("Testing TTS endpoint...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ TTS Success!")
            print(f"Audio URL: {result.get('audio_url')}")
            print(f"Timings count: {len(result.get('timings', []))}")
            print(f"Character: {result.get('character')}")
        else:
            print(f"❌ TTS Failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ TTS Error: {e}")

def test_auto_reader():
    """Test the auto-reader endpoint"""
    url = "http://localhost:8000/auto-reader/status"
    
    try:
        print("\nTesting Auto-reader status...")
        response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Auto-reader status retrieved!")
            print(f"Status: {result}")
        else:
            print(f"❌ Auto-reader status failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Auto-reader Error: {e}")

def test_image_generation():
    """Test the image generation endpoint"""
    url = "http://localhost:8000/images/generate"
    
    payload = {
        "line_text": "A beautiful sunset over the mountains",
        "line_index": 0,
        "context": "A children's story about nature",
        "style": "cartoon"
    }
    
    try:
        print("\nTesting Image generation...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Image generation Success!")
            print(f"Description: {result.get('image_description', 'N/A')[:100]}...")
            print(f"Style: {result.get('style')}")
        else:
            print(f"❌ Image generation Failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Image generation Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing ADHD Reader Backend Services")
    print("=" * 50)
    
    test_tts()
    test_auto_reader()
    test_image_generation()
    
    print("\n" + "=" * 50)
    print("Test completed!")
