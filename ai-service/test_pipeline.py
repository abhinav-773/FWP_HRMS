import requests
import os
import json
import time

API_URL = "http://localhost:8000/api/v1/interview"
INTERVIEW_ID = "test_end_to_end_123"

def main():
    print("1. Checking API Health...")
    try:
        health = requests.get("http://localhost:8000/api/health", timeout=5)
        print("Health Check:", health.json())
    except Exception as e:
        print("Failed to reach API:", e)
        return

    print("\n2. Getting questions...")
    q_res = requests.get(f"{API_URL}/{INTERVIEW_ID}/questions")
    questions = q_res.json().get("questions", [])
    print(f"Got {len(questions)} questions. First question: {questions[0]['text']}")
    
    print("\n3. Testing Audio Processing (Upload dummy audio)...")
    # create a dummy audio file (just some random bytes that might fail whisper, or an empty wav header)
    import wave, struct
    with wave.open("test.wav", "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(44100)
        # write 1 second of silence
        for _ in range(44100):
            w.writeframesraw(struct.pack('<h', 0))
    
    with open("test.wav", "rb") as f:
        files = {"audio": ("test.wav", f, "audio/wav")}
        data = {
            "question_id": questions[0]["id"],
            "question_text": questions[0]["text"],
            "job_title": "Software Engineer"
        }
        print("Uploading audio to process_audio endpoint...")
        start = time.time()
        audio_res = requests.post(f"{API_URL}/{INTERVIEW_ID}/audio", data=data, files=files)
        print(f"Processed in {time.time() - start:.2f}s")
        print("Response:", json.dumps(audio_res.json(), indent=2))
        
    print("\n4. Marking Interview as Complete...")
    comp_res = requests.post(f"{API_URL}/{INTERVIEW_ID}/complete")
    print("Complete Response:", json.dumps(comp_res.json(), indent=2))
    
    print("\nEnd-to-End Validation complete!")

if __name__ == "__main__":
    main()
