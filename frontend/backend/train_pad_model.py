import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression


FEATURES = [
    "pads_last_month",
    "pads_2_months_ago",
    "pads_3_months_ago",
    "pads_last_4_weeks",
    "flagged_cases_last_4_weeks",
    "high_urgency_last_4_weeks",
    "hygiene_score",
    "survey_pad_usage_rate",
]
TARGET = "target_next_month_pads"


def main():
    base_dir = Path(__file__).resolve().parent
    data_dir = base_dir / "data"
    csv_path = data_dir / "pad_demand_training.csv"
    model_path = data_dir / "pad_model.joblib"
    meta_path = data_dir / "pad_model_meta.json"

    df = pd.read_csv(csv_path)

    X = df[FEATURES]
    y = df[TARGET]

    model = LinearRegression()
    model.fit(X, y)

    joblib.dump(model, model_path)

    meta = {
        "featureNames": FEATURES,
        "rowsUsed": int(len(df)),
        "modelType": "LinearRegression",
    }

    with meta_path.open("w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"Model trained with {len(df)} rows")
    print(f"Saved model to {model_path}")


if __name__ == "__main__":
    main()
