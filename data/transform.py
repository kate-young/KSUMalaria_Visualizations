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

#predictions = predictions[np.abs(predictions["value"]) < 100]
predictions = predictions.values.tolist()

with open("predictions.json", 'w') as outfile:
    json.dump({"compounds": compounds,
        "models": models,
        "predictions": predictions
    }, outfile)
