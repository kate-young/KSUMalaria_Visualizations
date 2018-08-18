import pandas as pd
import json
import numpy as np
import re

p1 = pd.read_csv("predictions.csv").set_index("Name")
p2 = pd.read_csv("predictions2.csv").set_index("Name")

data = pd.concat([p1, p2], axis=1).reset_index()
predictions = data.reset_index().melt(id_vars=["Name"])
predictions = predictions[predictions["variable"] != "index"]

compounds = list(data["Name"].drop_duplicates())
models = list(predictions["variable"].drop_duplicates())

def getCompoundIndex(row):
    return compounds.index(row)

predictions.loc[:, "compound_i"] = predictions["Name"].apply(getCompoundIndex)

predictions = predictions[(predictions["value"] < 200) & (predictions["value"] > -100)]
predictions = predictions.values.tolist()

f1 = pd.read_csv("features.csv").set_index("feature")
f2 = pd.read_csv("features2.csv").set_index("feature")

ftr_data = pd.concat([f1, f2], axis=1, sort=False).fillna(0)
models = list(ftr_data.columns)
feature_counts = ftr_data.reset_index().values.tolist()
features = {}
for m in models:
    ftrs = list(ftr_data.loc[ftr_data[m] > 0, m].index.values)
    features[m] = ftrs

ci = pd.read_csv("ci_99.csv")
ci.loc[:, "min"] = [float(re.search(r"\((-?\d+.\d+)", x).group(1)) for x in ci["CI Interval"]]
ci.loc[:, "max"] = [float(re.search(r",\s(-?\d+.\d+)\)", x).group(1)) for x in ci["CI Interval"]]

with open("predictions.json", 'w') as outfile:
    json.dump({"compounds": compounds,
        "models": models,
        "predictions": predictions,
        "features": features,
        "ci": ci[["Compound", "min", "max"]].to_dict("records")
    }, outfile)

tsne = pd.read_csv("tsne.csv")
with open("tsne.json", "w") as outfile:
    json.dump(tsne.to_dict("records"), outfile)
