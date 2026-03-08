import argparse
import json
from pathlib import Path

import joblib
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--camp_id", required=True)
    parser.add_argument("--pads_last_4_weeks", required=True, type=float)
    parser.add_argument("--flagged_cases_last_4_weeks", required=True, type=float)
    parser.add_argument("--high_urgency_last_4_weeks", required=True, type=float)
    parser.add_argument("--hygiene_score", required=True, type=float)
    parser.add_argument("--survey_pad_usage_rate", required=True, type=float)
    return parser.parse_args()


def main():
    args = parse_args()

    base_dir = Path(__file__).resolve().parent
    model_path = base_dir / "data" / "pad_model.joblib"

    model = joblib.load(model_path)

    row = pd.DataFrame(
        [
            {
                "pads_last_4_weeks": args.pads_last_4_weeks,
                "flagged_cases_last_4_weeks": args.flagged_cases_last_4_weeks,
                "high_urgency_last_4_weeks": args.high_urgency_last_4_weeks,
                "hygiene_score": args.hygiene_score,
                "survey_pad_usage_rate": args.survey_pad_usage_rate,
            }
        ]
    )

    raw_prediction = model.predict(row)[0]
    predicted_pads = max(0, int(round(raw_prediction)))

    result = {
        "campId": args.camp_id,
        "predictedNextMonthPads": predicted_pads,
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
