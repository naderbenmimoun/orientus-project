"""
Orientus ML — Génération du dataset d'entraînement synthétique
Génère des paires (profil étudiant, programme) avec un score de compatibilité
basé sur des règles métier réalistes.

Auteur : naderbenmimoun
"""

import pandas as pd
import numpy as np
import json
import os

# ══════════════════════════════════════════
# Configuration
# ══════════════════════════════════════════

SEED = 42
np.random.seed(SEED)

NUM_SAMPLES = 2000  # Nombre de paires à générer

OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "training_data.csv")

# ══════════════════════════════════════════
# Domaines et relations entre eux
# ══════════════════════════════════════════

CATEGORIES = [
    "BUSINESS", "ENGINEERING", "COMPUTER_SCIENCE", "ARTIFICIAL_INTELLIGENCE",
    "DATA_SCIENCE", "MEDICINE", "LAW", "ARTS", "DESIGN", "ARCHITECTURE",
    "EDUCATION", "PSYCHOLOGY", "COMMUNICATION", "MARKETING", "FINANCE",
    "HOSPITALITY", "OTHER"
]

# Matrice de proximité entre domaines (1.0 = identique, 0.5 = proche, 0.0 = pas lié)
FIELD_PROXIMITY = {
    "COMPUTER_SCIENCE": {"DATA_SCIENCE": 0.7, "ARTIFICIAL_INTELLIGENCE": 0.8, "ENGINEERING": 0.5},
    "DATA_SCIENCE": {"COMPUTER_SCIENCE": 0.7, "ARTIFICIAL_INTELLIGENCE": 0.7, "FINANCE": 0.4, "ENGINEERING": 0.4},
    "ARTIFICIAL_INTELLIGENCE": {"COMPUTER_SCIENCE": 0.8, "DATA_SCIENCE": 0.7, "ENGINEERING": 0.5},
    "ENGINEERING": {"COMPUTER_SCIENCE": 0.5, "ARCHITECTURE": 0.4, "DATA_SCIENCE": 0.4},
    "BUSINESS": {"FINANCE": 0.7, "MARKETING": 0.6, "HOSPITALITY": 0.4, "COMMUNICATION": 0.3},
    "FINANCE": {"BUSINESS": 0.7, "DATA_SCIENCE": 0.4, "MARKETING": 0.3},
    "MARKETING": {"BUSINESS": 0.6, "COMMUNICATION": 0.7, "DESIGN": 0.3},
    "COMMUNICATION": {"MARKETING": 0.7, "ARTS": 0.4, "PSYCHOLOGY": 0.3},
    "ARTS": {"DESIGN": 0.6, "COMMUNICATION": 0.4, "ARCHITECTURE": 0.3},
    "DESIGN": {"ARTS": 0.6, "ARCHITECTURE": 0.5, "COMMUNICATION": 0.3},
    "ARCHITECTURE": {"DESIGN": 0.5, "ENGINEERING": 0.4, "ARTS": 0.3},
    "MEDICINE": {"PSYCHOLOGY": 0.4},
    "PSYCHOLOGY": {"MEDICINE": 0.4, "EDUCATION": 0.5, "COMMUNICATION": 0.3},
    "EDUCATION": {"PSYCHOLOGY": 0.5},
    "LAW": {"BUSINESS": 0.2},
    "HOSPITALITY": {"BUSINESS": 0.4, "MARKETING": 0.3},
    "OTHER": {}
}

DEGREES = ["BACHELOR", "MASTER", "MASTER_OF_ARTS", "MASTER_OF_SCIENCE", "MBA", "PHD", "DIPLOMA", "CERTIFICATE"]
CURRENT_DEGREES = ["HIGH_SCHOOL", "BACHELOR", "MASTER", "PHD"]
LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
LANGUAGE_LEVEL_MAP = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
STUDY_MODES = ["ON_CAMPUS", "BLENDED", "DISTANCE"]
COUNTRIES = ["Latvia", "France", "Germany", "Spain", "Turkey", "Italy", "Netherlands", "Poland"]

# Compatibilité diplôme actuel → diplôme visé
DEGREE_COMPATIBILITY = {
    "HIGH_SCHOOL": ["BACHELOR", "DIPLOMA", "CERTIFICATE"],
    "BACHELOR": ["MASTER", "MASTER_OF_ARTS", "MASTER_OF_SCIENCE", "MBA", "DIPLOMA", "CERTIFICATE"],
    "MASTER": ["PHD", "MBA", "DIPLOMA", "CERTIFICATE"],
    "PHD": ["DIPLOMA", "CERTIFICATE"]
}


def get_field_proximity(field1: str, field2: str) -> float:
    """Retourne la proximité entre deux domaines (0.0 → 1.0)"""
    if field1 == field2:
        return 1.0
    return FIELD_PROXIMITY.get(field1, {}).get(field2, 0.0)


def is_degree_compatible(current_degree: str, target_degree: str) -> bool:
    """Vérifie si le diplôme actuel permet de postuler au diplôme cible"""
    return target_degree in DEGREE_COMPATIBILITY.get(current_degree, [])


def compute_match_score(student: dict, program: dict) -> float:
    """
    Calcule le score de compatibilité (0.0 → 1.0) entre un profil étudiant et un programme.
    C'est la VÉRITÉ TERRAIN (ground truth) que le modèle ML doit apprendre à prédire.
    """
    score = 0.0
    max_score = 0.0

    # 1. Compatibilité diplôme (25 pts) — ÉLIMINATOIRE
    max_score += 25
    if is_degree_compatible(student["current_degree"], program["degree"]):
        score += 25
    else:
        # Si le diplôme n'est pas compatible, le score global est très bas
        return np.clip(np.random.normal(0.05, 0.03), 0.0, 0.15)

    # 2. Pays (20 pts)
    max_score += 20
    if student["preferred_country"] == "ANY":
        score += 10  # Pas de préférence = neutre
    elif student["preferred_country"] == program["country"]:
        score += 20
    else:
        score += 0

    # 3. Domaine d'intérêt (20 pts)
    max_score += 20
    proximity = get_field_proximity(student["interest_field"], program["category"])
    score += proximity * 20

    # 4. Langue (10 pts)
    max_score += 10
    if student["preferred_language"] == "ANY":
        score += 5
    elif student["preferred_language"] == program["language"]:
        score += 10
    else:
        score += 0

    # 5. Budget (10 pts)
    max_score += 10
    if program["tuition"] is None or program["tuition"] == 0:
        score += 5
    elif student["max_budget"] >= program["tuition"] * 1.2:
        score += 10  # Très confortable
    elif student["max_budget"] >= program["tuition"]:
        score += 7   # Dans le budget
    elif student["max_budget"] >= program["tuition"] * 0.8:
        score += 3   # Un peu serré
    else:
        score += 0   # Trop cher

    # 6. Mode d'études (5 pts)
    max_score += 5
    if student["study_mode"] == program["study_mode"]:
        score += 5
    elif program["study_mode"] == "BLENDED":
        score += 3
    else:
        score += 0

    # 7. GPA (5 pts) — seulement pour Master/PhD
    max_score += 5
    if program["min_gpa"] is None or program["min_gpa"] == 0:
        score += 3
    elif student["gpa"] is not None and student["gpa"] >= program["min_gpa"] + 2:
        score += 5
    elif student["gpa"] is not None and student["gpa"] >= program["min_gpa"]:
        score += 3
    elif student["gpa"] is not None and student["gpa"] >= program["min_gpa"] - 1:
        score += 1
    else:
        score += 0

    # 8. Niveau de langue (5 pts)
    max_score += 5
    student_level = LANGUAGE_LEVEL_MAP.get(student["language_level"], 0)
    program_level = LANGUAGE_LEVEL_MAP.get(program["min_language_level"], 0)
    if program_level == 0:
        score += 3
    elif student_level >= program_level + 1:
        score += 5
    elif student_level >= program_level:
        score += 3
    elif student_level == program_level - 1:
        score += 1
    else:
        score += 0

    # Normaliser et ajouter du bruit réaliste
    raw_score = score / max_score
    noise = np.random.normal(0, 0.05)
    final_score = np.clip(raw_score + noise, 0.0, 1.0)

    return round(final_score, 4)


def generate_random_student() -> dict:
    """Génère un profil étudiant aléatoire mais réaliste"""
    current_degree = np.random.choice(CURRENT_DEGREES, p=[0.35, 0.40, 0.20, 0.05])

    # GPA dépend du diplôme actuel
    if current_degree == "HIGH_SCHOOL":
        gpa = None  # Pas de GPA pour le BAC
    else:
        gpa = round(np.random.normal(13.0, 2.5), 1)
        gpa = np.clip(gpa, 8.0, 19.0)

    # Niveau de langue
    lang_probs = {
        "HIGH_SCHOOL": [0.05, 0.15, 0.40, 0.30, 0.08, 0.02],
        "BACHELOR": [0.02, 0.08, 0.25, 0.40, 0.20, 0.05],
        "MASTER": [0.01, 0.04, 0.15, 0.35, 0.35, 0.10],
        "PHD": [0.00, 0.02, 0.08, 0.25, 0.45, 0.20],
    }
    language_level = np.random.choice(LANGUAGE_LEVELS, p=lang_probs[current_degree])

    # IELTS corrélé au niveau de langue
    ielts_map = {"A1": 3.0, "A2": 4.0, "B1": 5.0, "B2": 6.0, "C1": 7.0, "C2": 8.0}
    ielts = round(ielts_map[language_level] + np.random.normal(0, 0.3), 1)
    ielts = np.clip(ielts, 3.0, 9.0)

    # Budget
    budget = int(np.random.choice([3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000],
                                   p=[0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05, 0.03, 0.02]))

    # Pays préféré (30% pas de préférence)
    preferred_country = np.random.choice(
        COUNTRIES + ["ANY"],
        p=[0.12, 0.10, 0.10, 0.08, 0.08, 0.08, 0.07, 0.07, 0.30]
    )

    return {
        "interest_field": np.random.choice(CATEGORIES),
        "preferred_country": preferred_country,
        "preferred_language": np.random.choice(["English", "French", "German", "ANY"],
                                                p=[0.50, 0.20, 0.10, 0.20]),
        "target_degree": np.random.choice(DEGREES, p=[0.25, 0.30, 0.05, 0.05, 0.05, 0.10, 0.10, 0.10]),
        "current_degree": current_degree,
        "gpa": gpa,
        "language_level": language_level,
        "ielts_score": ielts,
        "max_budget": budget,
        "study_mode": np.random.choice(STUDY_MODES, p=[0.60, 0.25, 0.15]),
        "needs_scholarship": np.random.choice([True, False], p=[0.40, 0.60]),
    }


def generate_random_program() -> dict:
    """Génère un programme universitaire aléatoire mais réaliste"""
    degree = np.random.choice(DEGREES, p=[0.25, 0.30, 0.05, 0.05, 0.05, 0.10, 0.10, 0.10])

    # Min GPA dépend du niveau
    if degree in ["BACHELOR", "DIPLOMA", "CERTIFICATE"]:
        min_gpa = None
    elif degree == "PHD":
        min_gpa = round(np.random.choice([13.0, 14.0, 15.0], p=[0.3, 0.5, 0.2]), 1)
    else:
        min_gpa = round(np.random.choice([10.0, 11.0, 12.0, 13.0], p=[0.3, 0.3, 0.3, 0.1]), 1)

    # Min language level
    if degree == "PHD":
        min_lang = np.random.choice(["B2", "C1", "C2"], p=[0.3, 0.5, 0.2])
    elif degree in ["BACHELOR", "DIPLOMA", "CERTIFICATE"]:
        min_lang = np.random.choice(["B1", "B2"], p=[0.4, 0.6])
    else:
        min_lang = np.random.choice(["B1", "B2", "C1"], p=[0.2, 0.6, 0.2])

    # Tuition
    tuition_ranges = {
        "BACHELOR": (2500, 8000), "MASTER": (2500, 10000), "PHD": (3000, 9000),
        "DIPLOMA": (5000, 18000), "MBA": (5000, 15000), "CERTIFICATE": (1000, 5000),
        "MASTER_OF_ARTS": (2500, 8000), "MASTER_OF_SCIENCE": (3000, 10000)
    }
    t_min, t_max = tuition_ranges.get(degree, (2500, 8000))
    tuition = int(np.random.uniform(t_min, t_max) / 100) * 100

    return {
        "category": np.random.choice(CATEGORIES),
        "country": np.random.choice(COUNTRIES),
        "degree": degree,
        "tuition": tuition,
        "language": np.random.choice(["English", "French", "German"], p=[0.65, 0.25, 0.10]),
        "study_mode": np.random.choice(STUDY_MODES, p=[0.65, 0.20, 0.15]),
        "min_gpa": min_gpa,
        "min_language_level": min_lang,
        "min_ielts": round(np.random.choice([5.0, 5.5, 6.0, 6.5, 7.0],
                                             p=[0.15, 0.25, 0.30, 0.20, 0.10]), 1),
        "scholarship_available": np.random.choice([True, False], p=[0.25, 0.75]),
    }


def build_features(student: dict, program: dict) -> dict:
    """Construit le vecteur de features pour le modèle ML"""
    student_lang_num = LANGUAGE_LEVEL_MAP.get(student["language_level"], 0)
    program_lang_num = LANGUAGE_LEVEL_MAP.get(program["min_language_level"], 0)

    gpa_diff = (student["gpa"] - program["min_gpa"]) if (student["gpa"] and program["min_gpa"]) else 0.0
    budget_diff = student["max_budget"] - (program["tuition"] or 0)
    lang_diff = student_lang_num - program_lang_num
    ielts_diff = student["ielts_score"] - (program["min_ielts"] or 0)

    return {
        # Student features
        "student_interest": student["interest_field"],
        "student_country": student["preferred_country"],
        "student_language": student["preferred_language"],
        "student_target_degree": student["target_degree"],
        "student_current_degree": student["current_degree"],
        "student_gpa": student["gpa"] or 0.0,
        "student_lang_level": student_lang_num,
        "student_ielts": student["ielts_score"],
        "student_budget": student["max_budget"],
        "student_study_mode": student["study_mode"],
        "student_needs_scholarship": int(student["needs_scholarship"]),

        # Program features
        "program_category": program["category"],
        "program_country": program["country"],
        "program_degree": program["degree"],
        "program_tuition": program["tuition"] or 0,
        "program_language": program["language"],
        "program_study_mode": program["study_mode"],
        "program_min_gpa": program["min_gpa"] or 0.0,
        "program_min_lang": program_lang_num,
        "program_min_ielts": program["min_ielts"] or 0.0,
        "program_scholarship": int(program["scholarship_available"]),

        # Computed features (interactions)
        "gpa_diff": round(gpa_diff, 2),
        "budget_diff": budget_diff,
        "lang_diff": lang_diff,
        "ielts_diff": round(ielts_diff, 1),
        "country_match": int(student["preferred_country"] == program["country"]
                             or student["preferred_country"] == "ANY"),
        "field_match": int(student["interest_field"] == program["category"]),
        "field_proximity": get_field_proximity(student["interest_field"], program["category"]),
        "degree_compatible": int(is_degree_compatible(student["current_degree"], program["degree"])),
        "study_mode_match": int(student["study_mode"] == program["study_mode"]),
        "scholarship_match": int(student["needs_scholarship"] and program["scholarship_available"]),
    }


def main():
    """Génère le dataset complet"""
    print("=" * 60)
    print("ORIENTUS ML — Génération du dataset d'entraînement")
    print("=" * 60)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    rows = []
    for i in range(NUM_SAMPLES):
        student = generate_random_student()
        program = generate_random_program()

        features = build_features(student, program)
        score = compute_match_score(student, program)

        features["match_score"] = score
        rows.append(features)

        if (i + 1) % 500 == 0:
            print(f"  Généré {i + 1}/{NUM_SAMPLES} exemples...")

    df = pd.DataFrame(rows)

    # Statistiques
    print(f"\n📊 Dataset généré :")
    print(f"  Taille : {len(df)} échantillons, {len(df.columns)} features")
    print(f"  Score moyen : {df['match_score'].mean():.4f}")
    print(f"  Score médian : {df['match_score'].median():.4f}")
    print(f"  Score min : {df['match_score'].min():.4f}")
    print(f"  Score max : {df['match_score'].max():.4f}")
    print(f"  % bon match (>0.6) : {(df['match_score'] > 0.6).mean() * 100:.1f}%")
    print(f"  % mauvais match (<0.3) : {(df['match_score'] < 0.3).mean() * 100:.1f}%")

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n✅ Sauvegardé → {OUTPUT_FILE}")

    return df


if __name__ == "__main__":
    main()