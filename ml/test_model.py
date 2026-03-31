"""
Orientus ML — Tests unitaires
Auteur : naderbenmimoun
"""

import unittest
import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate_dataset import (
    get_field_proximity, is_degree_compatible,
    compute_match_score, build_features, generate_random_student
)


class TestFieldProximity(unittest.TestCase):
    """Tests pour la matrice de proximité des domaines"""

    def test_same_field_returns_one(self):
        self.assertEqual(get_field_proximity("BUSINESS", "BUSINESS"), 1.0)
        self.assertEqual(get_field_proximity("COMPUTER_SCIENCE", "COMPUTER_SCIENCE"), 1.0)

    def test_related_fields_return_positive(self):
        self.assertGreater(get_field_proximity("COMPUTER_SCIENCE", "DATA_SCIENCE"), 0.0)
        self.assertGreater(get_field_proximity("BUSINESS", "FINANCE"), 0.0)

    def test_unrelated_fields_return_zero(self):
        self.assertEqual(get_field_proximity("MEDICINE", "ARCHITECTURE"), 0.0)
        self.assertEqual(get_field_proximity("LAW", "ENGINEERING"), 0.0)


class TestDegreeCompatibility(unittest.TestCase):
    """Tests pour la compatibilité des diplômes"""

    def test_highschool_can_apply_bachelor(self):
        self.assertTrue(is_degree_compatible("HIGH_SCHOOL", "BACHELOR"))

    def test_highschool_cannot_apply_master(self):
        self.assertFalse(is_degree_compatible("HIGH_SCHOOL", "MASTER"))

    def test_bachelor_can_apply_master(self):
        self.assertTrue(is_degree_compatible("BACHELOR", "MASTER"))

    def test_master_can_apply_phd(self):
        self.assertTrue(is_degree_compatible("MASTER", "PHD"))

    def test_bachelor_cannot_apply_phd(self):
        self.assertFalse(is_degree_compatible("BACHELOR", "PHD"))


class TestMatchScore(unittest.TestCase):
    """Tests pour le calcul du score de compatibilité"""

    def test_perfect_match_high_score(self):
        student = {
            "interest_field": "BUSINESS", "preferred_country": "Latvia",
            "preferred_language": "English", "target_degree": "MASTER",
            "current_degree": "BACHELOR", "gpa": 15.0,
            "language_level": "C1", "ielts_score": 7.0,
            "max_budget": 10000, "study_mode": "ON_CAMPUS",
            "needs_scholarship": False
        }
        program = {
            "category": "BUSINESS", "country": "Latvia", "degree": "MASTER",
            "tuition": 5000, "language": "English", "study_mode": "ON_CAMPUS",
            "min_gpa": 12.0, "min_language_level": "B2",
            "min_ielts": 6.0, "scholarship_available": False
        }
        score = compute_match_score(student, program)
        self.assertGreater(score, 0.7)

    def test_incompatible_degree_low_score(self):
        student = {
            "interest_field": "BUSINESS", "preferred_country": "Latvia",
            "preferred_language": "English", "target_degree": "MASTER",
            "current_degree": "HIGH_SCHOOL", "gpa": None,
            "language_level": "B2", "ielts_score": 6.0,
            "max_budget": 10000, "study_mode": "ON_CAMPUS",
            "needs_scholarship": False
        }
        program = {
            "category": "BUSINESS", "country": "Latvia", "degree": "MASTER",
            "tuition": 5000, "language": "English", "study_mode": "ON_CAMPUS",
            "min_gpa": 12.0, "min_language_level": "B2",
            "min_ielts": 6.0, "scholarship_available": False
        }
        score = compute_match_score(student, program)
        self.assertLess(score, 0.2)


class TestBuildFeatures(unittest.TestCase):
    """Tests pour la construction des features"""

    def test_features_count(self):
        student = generate_random_student()
        program = {
            "category": "BUSINESS", "country": "Latvia", "degree": "MASTER",
            "tuition": 5000, "language": "English", "study_mode": "ON_CAMPUS",
            "min_gpa": 12.0, "min_language_level": "B2",
            "min_ielts": 6.0, "scholarship_available": False
        }
        features = build_features(student, program)
        self.assertEqual(len(features), 31)

    def test_country_match_feature(self):
        student = generate_random_student()
        student["preferred_country"] = "Latvia"
        program = {
            "category": "BUSINESS", "country": "Latvia", "degree": "MASTER",
            "tuition": 5000, "language": "English", "study_mode": "ON_CAMPUS",
            "min_gpa": 12.0, "min_language_level": "B2",
            "min_ielts": 6.0, "scholarship_available": False
        }
        features = build_features(student, program)
        self.assertEqual(features["country_match"], 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)