"""
Orientus ML — API FastAPI pour servir les prédictions
Endpoint POST /predict : reçoit un profil + liste de programmes → retourne les scores

Auteur : naderbenmimoun
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="Orientus ML Recommendation API", version="1.0.0")

# Charger le modèle et les encodeurs
MODEL_PATH = "models/orientus_recommender_v1.pkl"
ENCODERS_PATH = "models/label_encoders.pkl"

model = None
encoders = None

LANGUAGE_LEVEL_MAP = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6, "NONE": 0}

FIELD_PROXIMITY = {
    "COMPUTER_SCIENCE": {"DATA_SCIENCE": 0.7, "ARTIFICIAL_INTELLIGENCE": 0.8, "ENGINEERING": 0.5},
    "DATA_SCIENCE": {"COMPUTER_SCIENCE": 0.7, "ARTIFICIAL_INTELLIGENCE": 0.7, "FINANCE": 0.4},
    "ARTIFICIAL_INTELLIGENCE": {"COMPUTER_SCIENCE": 0.8, "DATA_SCIENCE": 0.7, "ENGINEERING": 0.5},
    "BUSINESS": {"FINANCE": 0.7, "MARKETING": 0.6, "HOSPITALITY": 0.4},
    "FINANCE": {"BUSINESS": 0.7, "DATA_SCIENCE": 0.4},
    "MARKETING": {"BUSINESS": 0.6, "COMMUNICATION": 0.7},
    "ENGINEERING": {"COMPUTER_SCIENCE": 0.5, "ARCHITECTURE": 0.4},
    "ARTS": {"DESIGN": 0.6, "COMMUNICATION": 0.4},
    "DESIGN": {"ARTS": 0.6, "ARCHITECTURE": 0.5},
    "ARCHITECTURE": {"DESIGN": 0.5, "ENGINEERING": 0.4},
    "MEDICINE": {"PSYCHOLOGY": 0.4},
    "PSYCHOLOGY": {"MEDICINE": 0.4, "EDUCATION": 0.5},
    "EDUCATION": {"PSYCHOLOGY": 0.5},
    "COMMUNICATION": {"MARKETING": 0.7, "ARTS": 0.4},
}

DEGREE_COMPATIBILITY = {
    "HIGH_SCHOOL": ["BACHELOR", "DIPLOMA", "CERTIFICATE"],
    "BACHELOR": ["MASTER", "MASTER_OF_ARTS", "MASTER_OF_SCIENCE", "MBA", "DIPLOMA", "CERTIFICATE"],
    "MASTER": ["PHD", "MBA", "DIPLOMA", "CERTIFICATE"],
    "PHD": ["DIPLOMA", "CERTIFICATE"]
}


class StudentProfile(BaseModel):
    interest_field: str
    preferred_country: str = "ANY"
    preferred_language: str = "ANY"
    target_degree: str
    current_degree: str
    gpa: Optional[float] = None
    language_level: str = "B2"
    ielts_score: Optional[float] = None
    max_budget: float = 10000
    study_mode: str = "ON_CAMPUS"
    needs_scholarship: bool = False


class ProgramInfo(BaseModel):
    id: int
    title: str
    category: str
    country: str
    degree: str
    tuition: Optional[float] = 0
    language: str = "English"
    study_mode: str = "ON_CAMPUS"
    min_gpa: Optional[float] = None
    min_language_level: str = "B2"
    min_ielts: Optional[float] = None
    scholarship_available: bool = False


class RecommendationRequest(BaseModel):
    student: StudentProfile
    programs: List[ProgramInfo]


class ProgramScore(BaseModel):
    program_id: int
    title: str
    match_score: float
    match_percentage: int


class RecommendationResponse(BaseModel):
    recommendations: List[ProgramScore]
    total_analyzed: int
    model_version: str = "v1.0"


def get_field_proximity(f1: str, f2: str) -> float:
    if f1 == f2:
        return 1.0
    return FIELD_PROXIMITY.get(f1, {}).get(f2, 0.0)


def is_degree_compatible(current: str, target: str) -> bool:
    return target in DEGREE_COMPATIBILITY.get(current, [])


@app.on_event("startup")
def load_model():
    global model, encoders
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODERS_PATH):
        model = joblib.load(MODEL_PATH)
        encoders = joblib.load(ENCODERS_PATH)
        print(f"✅ Modèle chargé : {MODEL_PATH}")
    else:
        print(f"⚠️ Modèle non trouvé : {MODEL_PATH}")


@app.get("/health")
def health():
    return {"status": "UP", "model_loaded": model is not None}


@app.post("/predict", response_model=RecommendationResponse)
def predict(request: RecommendationRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    student = request.student
    results = []

    for prog in request.programs:
        student_lang_num = LANGUAGE_LEVEL_MAP.get(student.language_level, 0)
        program_lang_num = LANGUAGE_LEVEL_MAP.get(prog.min_language_level, 0)

        features = {
            "student_interest": student.interest_field,
            "student_country": student.preferred_country,
            "student_language": student.preferred_language,
            "student_target_degree": student.target_degree,
            "student_current_degree": student.current_degree,
            "student_gpa": student.gpa or 0.0,
            "student_lang_level": student_lang_num,
            "student_ielts": student.ielts_score or 0.0,
            "student_budget": student.max_budget,
            "student_study_mode": student.study_mode,
            "student_needs_scholarship": int(student.needs_scholarship),
            "program_category": prog.category,
            "program_country": prog.country,
            "program_degree": prog.degree,
            "program_tuition": prog.tuition or 0,
            "program_language": prog.language,
            "program_study_mode": prog.study_mode,
            "program_min_gpa": prog.min_gpa or 0.0,
            "program_min_lang": program_lang_num,
            "program_min_ielts": prog.min_ielts or 0.0,
            "program_scholarship": int(prog.scholarship_available),
            "gpa_diff": round((student.gpa or 0) - (prog.min_gpa or 0), 2),
            "budget_diff": student.max_budget - (prog.tuition or 0),
            "lang_diff": student_lang_num - program_lang_num,
            "ielts_diff": round((student.ielts_score or 0) - (prog.min_ielts or 0), 1),
            "country_match": int(student.preferred_country == prog.country
                                 or student.preferred_country == "ANY"),
            "field_match": int(student.interest_field == prog.category),
            "field_proximity": get_field_proximity(student.interest_field, prog.category),
            "degree_compatible": int(is_degree_compatible(student.current_degree, prog.degree)),
            "study_mode_match": int(student.study_mode == prog.study_mode),
            "scholarship_match": int(student.needs_scholarship and prog.scholarship_available),
        }

        df = pd.DataFrame([features])

        # Encoder les colonnes catégorielles
        for col, le in encoders.items():
            if col in df.columns:
                val = df[col].iloc[0]
                if val in le.classes_:
                    df[col] = le.transform(df[col].astype(str))
                else:
                    df[col] = 0  # Valeur inconnue

        score = float(model.predict(df)[0])
        score = np.clip(score, 0.0, 1.0)

        results.append(ProgramScore(
            program_id=prog.id,
            title=prog.title,
            match_score=round(score, 4),
            match_percentage=int(round(score * 100))
        ))

    # Trier par score décroissant
    results.sort(key=lambda x: x.match_score, reverse=True)

    return RecommendationResponse(
        recommendations=results[:10],
        total_analyzed=len(request.programs)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)