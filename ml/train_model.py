"""
Orientus ML — Entraînement du modèle XGBoost
Prédit le score de compatibilité (0→1) entre un profil étudiant et un programme.

Auteur : naderbenmimoun
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import json
import os
import time

# ══════════════════════════════════════════
# Configuration
# ══════════════════════════════════════════

SEED = 42
np.random.seed(SEED)

DATA_PATH = "data/training_data.csv"
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "orientus_recommender_v1.pkl")
ENCODERS_PATH = os.path.join(MODEL_DIR, "label_encoders.pkl")
LOG_DIR = "logs"
LOG_PATH = os.path.join(LOG_DIR, "training_log.txt")

# Colonnes catégorielles à encoder
CATEGORICAL_COLS = [
    "student_interest", "student_country", "student_language",
    "student_target_degree", "student_current_degree", "student_study_mode",
    "program_category", "program_country", "program_degree",
    "program_language", "program_study_mode"
]

# Colonne cible
TARGET = "match_score"

# Hyperparamètres XGBoost (optimisés manuellement)
XGBOOST_PARAMS = {
    "n_estimators": 300,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,       # L1 regularization
    "reg_lambda": 1.0,      # L2 regularization
    "min_child_weight": 3,
    "random_state": SEED,
    "n_jobs": -1,
    "eval_metric": "rmse"
}


def load_and_preprocess(path: str):
    """Charge le dataset et encode les variables catégorielles"""
    print(f"📂 Chargement du dataset : {path}")
    df = pd.read_csv(path)
    print(f"   Taille : {df.shape[0]} échantillons, {df.shape[1]} colonnes")

    # Encoder les colonnes catégorielles
    encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        print(f"   Encodé '{col}' : {len(le.classes_)} classes")

    # Séparer features et cible
    X = df.drop(columns=[TARGET])
    y = df[TARGET]

    return X, y, encoders


def train_model(X_train, y_train, X_val, y_val):
    """Entraîne le modèle XGBoost avec early stopping"""
    print("\n🚀 Entraînement XGBoost...")
    print(f"   Params : {json.dumps(XGBOOST_PARAMS, indent=2)}")

    model = xgb.XGBRegressor(**XGBOOST_PARAMS, early_stopping_rounds=20)

    start_time = time.time()

    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_val, y_val)],
        verbose=50
    )

    train_time = time.time() - start_time
    print(f"\n⏱️  Temps d'entraînement : {train_time:.2f} secondes")
    print(f"   Meilleure itération : {model.best_iteration}")

    return model, train_time


def evaluate_model(model, X_val, y_val, X_train, y_train):
    """Évalue le modèle et retourne les métriques"""
    print("\n📊 Évaluation du modèle :")

    # Prédictions
    y_pred_val = model.predict(X_val)
    y_pred_train = model.predict(X_train)

    # Métriques validation
    rmse_val = np.sqrt(mean_squared_error(y_val, y_pred_val))
    mae_val = mean_absolute_error(y_val, y_pred_val)
    r2_val = r2_score(y_val, y_pred_val)

    # Métriques train (pour détecter overfitting)
    rmse_train = np.sqrt(mean_squared_error(y_train, y_pred_train))
    mae_train = mean_absolute_error(y_train, y_pred_train)
    r2_train = r2_score(y_train, y_pred_train)

    print(f"\n   {'Métrique':<20} {'Train':>10} {'Validation':>12}")
    print(f"   {'─' * 44}")
    print(f"   {'RMSE':<20} {rmse_train:>10.4f} {rmse_val:>12.4f}")
    print(f"   {'MAE':<20} {mae_train:>10.4f} {mae_val:>12.4f}")
    print(f"   {'R²':<20} {r2_train:>10.4f} {r2_val:>12.4f}")

    # Overfitting check
    overfit_gap = r2_train - r2_val
    print(f"\n   Overfitting gap (R² train - val) : {overfit_gap:.4f}")
    if overfit_gap > 0.05:
        print("   ⚠️  Possible overfitting détecté")
    else:
        print("   ✅ Pas d'overfitting significatif")

    metrics = {
        "rmse_val": rmse_val, "mae_val": mae_val, "r2_val": r2_val,
        "rmse_train": rmse_train, "mae_train": mae_train, "r2_train": r2_train,
        "overfit_gap": overfit_gap
    }

    return metrics, y_pred_val


def get_feature_importance(model, feature_names):
    """Affiche les features les plus importantes"""
    importance = model.feature_importances_
    feat_imp = sorted(zip(feature_names, importance), key=lambda x: x[1], reverse=True)

    print("\n🏆 Top 15 features les plus importantes :")
    for i, (feat, imp) in enumerate(feat_imp[:15], 1):
        bar = "█" * int(imp * 100)
        print(f"   {i:2d}. {feat:<30} {imp:.4f} {bar}")

    return feat_imp


def error_analysis(y_val, y_pred, X_val):
    """Analyse des erreurs du modèle"""
    print("\n🔍 Analyse des erreurs :")

    errors = np.abs(y_val.values - y_pred)
    df_errors = X_val.copy()
    df_errors["actual"] = y_val.values
    df_errors["predicted"] = y_pred
    df_errors["error"] = errors

    # Pires prédictions
    worst = df_errors.nlargest(5, "error")
    print(f"\n   Top 5 pires prédictions :")
    print(f"   {'Actual':>8} {'Predicted':>10} {'Error':>8} {'degree_ok':>10} {'field_match':>12}")
    for _, row in worst.iterrows():
        print(f"   {row['actual']:>8.3f} {row['predicted']:>10.3f} {row['error']:>8.3f} "
              f"{int(row['degree_compatible']):>10} {int(row['field_match']):>12}")

    # Distribution des erreurs
    print(f"\n   Distribution des erreurs absolues :")
    print(f"   < 0.05 : {(errors < 0.05).mean() * 100:.1f}%")
    print(f"   < 0.10 : {(errors < 0.10).mean() * 100:.1f}%")
    print(f"   < 0.15 : {(errors < 0.15).mean() * 100:.1f}%")
    print(f"   > 0.20 : {(errors > 0.20).mean() * 100:.1f}%")


def main():
    print("=" * 60)
    print("ORIENTUS ML — Entraînement du modèle de recommandation")
    print("=" * 60)

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

    # 1. Charger et préprocesser
    X, y, encoders = load_and_preprocess(DATA_PATH)

    # 2. Split train/val (80/20)
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=SEED
    )
    print(f"\n📊 Split : {len(X_train)} train / {len(X_val)} validation")

    # 3. Cross-validation (5 folds)
    print("\n🔄 Cross-validation 5-fold...")
    cv_model = xgb.XGBRegressor(**{k: v for k, v in XGBOOST_PARAMS.items()
                                    if k != "eval_metric"})
    cv_scores = cross_val_score(cv_model, X, y, cv=5, scoring="r2")
    print(f"   R² scores : {cv_scores}")
    print(f"   R² moyen : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # 4. Entraîner
    model, train_time = train_model(X_train, y_train, X_val, y_val)

    # 5. Évaluer
    metrics, y_pred = evaluate_model(model, X_val, y_val, X_train, y_train)

    # 6. Feature importance
    feat_imp = get_feature_importance(model, X.columns.tolist())

    # 7. Error analysis
    error_analysis(y_val, y_pred, X_val)

    # 8. Sauvegarder
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"\n💾 Modèle sauvegardé → {MODEL_PATH}")
    print(f"💾 Encodeurs sauvegardés → {ENCODERS_PATH}")

    # 9. Log
    log_content = (
        f"Training completed at {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Dataset: {DATA_PATH} ({len(X)} samples)\n"
        f"Split: {len(X_train)} train / {len(X_val)} val\n"
        f"Model: XGBoost Regressor\n"
        f"Params: {json.dumps(XGBOOST_PARAMS)}\n"
        f"Best iteration: {model.best_iteration}\n"
        f"Train time: {train_time:.2f}s\n"
        f"CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}\n"
        f"Val RMSE: {metrics['rmse_val']:.4f}\n"
        f"Val MAE: {metrics['mae_val']:.4f}\n"
        f"Val R²: {metrics['r2_val']:.4f}\n"
        f"Train R²: {metrics['r2_train']:.4f}\n"
        f"Overfit gap: {metrics['overfit_gap']:.4f}\n"
        f"Model file: {MODEL_PATH}\n"
        f"Top feature: {feat_imp[0][0]} ({feat_imp[0][1]:.4f})\n"
    )
    with open(LOG_PATH, "w") as f:
        f.write(log_content)
    print(f"📝 Log sauvegardé → {LOG_PATH}")

    print("\n" + "=" * 60)
    print("✅ ENTRAÎNEMENT TERMINÉ")
    print("=" * 60)


if __name__ == "__main__":
    main()