import urllib.request
import urllib.error
import json
import subprocess

def test_vertex_connection():
    project_id = "project-51cbdab8-586c-4f77-94c"
    
    # LIVE REGION SYNC: Based on your active console state, we're trying us-east4 and us-central1
    regions = ["asia-southeast1", "us-east4", "us-central1", "europe-west4"]
    
    model_ids = [
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash",
        "gemini-1.5-pro-002",
        "gemini-1.5-pro",
        "gemini-3-flash-preview",
        "gemini-3.1-flash-lite-preview",
        "veo-3.1-generate-001"
    ]
    
    print(f"--- A-CAM Master Protocol Sync for project: {project_id}...")
    
    try:
        print("--- Fetching ADC token...")
        token = subprocess.check_output(['gcloud', 'auth', 'application-default', 'print-access-token'], shell=True).decode('utf-8').strip()
        
        for r in regions:
            for model_id in model_ids:
                print(f"--- Probing {model_id} in {r}...")
                endpoint = f"https://{r}-aiplatform.googleapis.com/v1beta1/projects/{project_id}/locations/{r}/publishers/google/models/{model_id}:generateContent"
                
                # Special handling for Veo (uses predictLongRunning)
                if "veo" in model_id:
                    endpoint = f"https://{r}-aiplatform.googleapis.com/v1beta1/projects/{project_id}/locations/{r}/publishers/google/models/{model_id}:predictLongRunning"
            
                req = urllib.request.Request(endpoint, method='POST')
                req.add_header('Authorization', f'Bearer {token}')
                req.add_header('x-goog-user-project', project_id)
                req.add_header('Content-Type', 'application/json')
                
                payload = {"contents": [{"parts": [{"text": "hi"}]}]}
                if "veo" in model_id:
                    payload = {"instances": [{"prompt": "test"}], "parameters": {"sampleCount": 1}}
                
                try:
                    with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as response:
                        print(f"--- SUCCESS! Found the Gold ID: {model_id} in {r}")
                        print(f"--- LOCK IN: Update your config to use {model_id}")
                        return
                except urllib.error.HTTPError as e:
                    body = e.read().decode('utf-8', 'ignore')
                    if e.code == 404:
                        # print(f"    - 404: Not found in this region.")
                        continue
                    elif e.code == 403:
                        print(f"!!! {model_id} in {r} Rejected (403: Forbidden/Billing/API Disabled)")
                        print(f"    Body: {body}")
                    else:
                        print(f"!!! {model_id} in {r} Error {e.code}: {body}")
        
        print("\n!!! FAILED: None of the standard Gemini IDs are responding for this project/region.")
        print("--- Recommendation: Check the Vertex AI Console for the exact model name.")
            
    except Exception as e:
        print(f"\n!!! Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_vertex_connection()
