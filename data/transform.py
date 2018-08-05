import pandas as pd
import json
import numpy as np


data = pd.read_csv("predictions.csv")
predictions = data.melt(id_vars=["Name"])

compounds = list(data["Name"].drop_duplicates())
models = list(predictions["variable"].drop_duplicates())

def getCompoundIndex(row):
    return compounds.index(row)

predictions.loc[:, "compound_i"] = predictions["Name"].apply(getCompoundIndex)

predictions = predictions[(predictions["value"] < 200) & (predictions["value"] > -100)]
predictions = predictions.values.tolist()

ftr_data = pd.read_csv("features.csv").set_index("feature")
models = list(ftr_data.columns)
feature_counts = ftr_data.reset_index().values.tolist()
features = {}
for m in models:
    ftrs = list(ftr_data.loc[ftr_data[m] > 0, m].index.values)
    features[m] = ftrs

with open("predictions.json", 'w') as outfile:
    json.dump({"compounds": compounds,
        "models": models,
        "predictions": predictions,
        "features": features
    }, outfile)
