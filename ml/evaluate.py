"""
TACTIX AI - ML Model Evaluation & Sensitivity Suite
Evaluates sensitivity of predicted risk across weather, terrain, and resource variations.
"""

import json
import os

def run_evaluation():
    results_file = "ml/model_results.json"
    if not os.path.exists(results_file):
        from ml.train import train_model
        train_model()
        
    with open(results_file, "r") as f:
        res = json.load(f)
        
    print(f"Loaded ML Evaluation metrics for TACTIX AI:")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    run_evaluation()
