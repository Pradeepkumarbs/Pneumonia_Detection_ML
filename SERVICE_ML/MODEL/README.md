# model/

Place your trained model file here:

    ml-service/model/pneumonia.pkl

## Required bundle format

```python
import joblib

bundle = {
    'clf':        trained_random_forest_classifier,
    'scaler':     fitted_standard_scaler,
    'threshold':  0.78,
    'classes':    ['NORMAL', 'PNEUMONIA'],
    'hog_params': {
        'image_size':      (128, 128),
        'orientations':    9,
        'pixels_per_cell': (8, 8),
        'cells_per_block': (2, 2),
    }
}

joblib.dump(bundle, 'pneumonia.pkl')
```

This file is excluded from git via .gitignore.
