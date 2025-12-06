# Prompt templates for IA Service

def get_graded_prompt(course_summary):
    return f"""
Tu es un assistant pédagogique expert. Analyse ce cours et retourne EXACTEMENT ce JSON (sans markdown):

{{
  "risk": "élevé" | "moyen" | "faible",
  "shortSummary": "1 phrase résumant la performance (max 15 mots)",
  "advice": "conseil actionnable pour améliorer les notes",
  "focusPoints": ["point1", "point2", "point3"],
  "quiz": [
    {{
      "question": "Question sur le contenu du cours",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Explication courte"
    }}
  ]
}}

Données du cours: {course_summary}

Règles: Moyenne < 60% → "élevé", 60-75% → "moyen", > 75% → "faible". Génère 3 questions de quiz pertinentes.
"""

def get_reports_prompt(course_summary, reports_text):
    return f"""
Tu es un assistant pédagogique expert. Analyse ce cours en utilisant les rapports du professeur.

Retourne EXACTEMENT ce JSON (sans markdown):

{{
  "risk": null,
  "shortSummary": "1 phrase sur les attentes du prof (max 15 mots)",
  "advice": "conseil basé sur les attentes du professeur",
  "focusPoints": ["point1 du prof", "point2 du prof", "point3 du prof"],
  "quiz": [
    {{
      "question": "Question générale sur le sujet du cours",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Explication"
    }}
  ]
}}

Cours: {course_summary}

Rapports du professeur: {reports_text}

Règles: 
1. Ignore le fait qu'il y ait des notes ou non pour les conseils.
2. Base tes conseils UNIQUEMENT sur les rapports.
3. Génère un quiz de 5 questions sur le sujet général du cours.
"""

def get_documents_prompt(course_summary, doc_names, doc_content):
    return f"""
Tu es un assistant pédagogique expert. Analyse ce cours en utilisant les documents disponibles.

Retourne EXACTEMENT ce JSON (sans markdown):

{{
  "risk": null,
  "shortSummary": "Résumé basé sur le contenu des documents (max 15 mots)",
  "advice": "Génère 3 conseils PRÉCIS basés sur le contenu réel des documents",
  "focusPoints": ["Concept clé extrait du doc", "Thème important du doc", "Point crucial du doc"],
  "quiz": [
    {{
      "question": "Question basée sur le contenu des documents",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Explication"
    }}
  ]
}}

Cours: {course_summary}

Documents disponibles: {", ".join(doc_names)}

Contenu extrait des documents: {doc_content[:3000]}

Règles IMPORTANTES:
1. Ignore le fait qu'il y ait des notes ou non pour les conseils.
2. Base tes conseils UNIQUEMENT sur le contenu des documents.
3. Génère 5 questions précises basées sur le contenu extrait.
4. SOIS SPÉCIFIQUE au contenu, évite les conseils génériques.
"""

def get_both_prompt(course_summary, reports_text, doc_names, doc_content):
    return f"""
Tu es un assistant pédagogique expert. Analyse ce cours en utilisant les rapports ET les documents.

Retourne EXACTEMENT ce JSON (sans markdown):

{{
  "risk": null,
  "shortSummary": "Résumé combinant documents et retours prof (max 15 mots)",
  "advice": "Génère 3 conseils ULTRA-PRÉCIS combinant le contenu des documents ET les attentes du professeur",
  "focusPoints": ["Concept du doc + attente prof", "Thème doc aligné avec prof", "Point crucial mentionné"],
  "quiz": [
    {{
      "question": "Question basée sur le contenu réel des documents/rapports",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Explication"
    }}
  ]
}}

Cours: {course_summary}

Rapports du professeur: {reports_text}

Documents: {", ".join(doc_names)}

Contenu extrait des documents: {doc_content[:3000]}

Règles IMPORTANTES:
1. Ignore le fait qu'il y ait des notes ou non pour les conseils.
2. Analyse le contenu des documents ET les commentaires du prof.
3. Génère des conseils qui COMBINENT les deux sources.
4. Génère 5 questions basées sur le contenu RÉEL.
5. Sois ULTRA-SPÉCIFIQUE, pas générique.
"""

def get_none_prompt(course_summary):
    return f"""
Tu es un assistant pédagogique expert. Analyse ce cours.

Retourne EXACTEMENT ce JSON (sans markdown):

{{
  "risk": null,
  "shortSummary": "Résumé du sujet probable du cours",
  "advice": "Conseil spécifique au SUJET du cours (ex: Math -> faire des exos, Prog -> coder)",
  "focusPoints": ["Concept clé du sujet", "Compétence du sujet", "Point important du sujet"],
  "quiz": [
    {{
      "question": "Question de culture générale sur le SUJET du cours",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Explication"
    }}
  ]
}}

Cours: {course_summary}

Règles:
1. Même sans documents, NE SOIS PAS GÉNÉRIQUE ("soyez assidu").
2. Déduis le sujet du cours d'après son TITRE et CODE.
3. Donne des conseils adaptés à ce SUJET spécifique.
4. Génère 5 questions de culture générale sur ce SUJET.
"""
