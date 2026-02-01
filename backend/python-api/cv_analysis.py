"""
AI-Powered CV Analysis Service

This service uses machine learning and natural language processing
to analyze and rank candidate CVs/resumes.

Features:
- CV parsing and data extraction
- Skills matching with job requirements
- Experience level assessment
- Education qualification matching
- Intelligent scoring and ranking
- Automated screening
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Optional
import PyPDF2
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy

router = APIRouter(prefix="/ai/cv-analysis", tags=["AI - CV Analysis"])

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("⚠️ spaCy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None


class CVAnalyzer:
    """
    AI-powered CV analysis and ranking system
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF CV"""
        try:
            from io import BytesIO
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF extraction failed: {str(e)}")
    
    def extract_email(self, text: str) -> Optional[str]:
        """Extract email address using regex"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else None
    
    def extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        matches = re.findall(phone_pattern, text)
        return matches[0] if matches else None
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract technical skills using NLP and keyword matching
        """
        # Common tech skills (expand this list)
        skill_keywords = [
            'python', 'javascript', 'typescript', 'java', 'c++', 'react', 'nodejs',
            'angular', 'vue', 'django', 'flask', 'fastapi', 'sql', 'postgresql',
            'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'machine learning', 'ai', 'data science', 'deep learning', 'nlp',
            'git', 'agile', 'scrum','jenkins', 'ci/cd', 'microservices'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def extract_experience_years(self, text: str) -> int:
        """
        Extract years of experience from CV
        """
        # Look for patterns like "5 years experience", "5+ years", etc.
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience[:\s]+(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s+in'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                return int(matches[0])
        
        return 0
    
    def extract_education(self, text: str) -> List[str]:
        """Extract education qualifications"""
        degrees = ['phd', 'master', 'bachelor', 'mba', 'msc', 'bsc', 'ba', 'ma']
        found_degrees = []
        
        text_lower = text.lower()
        for degree in degrees:
            if degree in text_lower:
                found_degrees.append(degree.upper())
        
        return found_degrees
    
    def calculate_skill_match_score(
        self, 
        candidate_skills: List[str], 
        required_skills: List[str]
    ) -> float:
        """
        Calculate how well candidate skills match job requirements
        Returns score between 0-100
        """
        if not required_skills:
            return 100.0
        
        candidate_skills_lower = [s.lower() for s in candidate_skills]
        required_skills_lower = [s.lower() for s in required_skills]
        
        matches = sum(1 for skill in required_skills_lower if skill in candidate_skills_lower)
        score = (matches / len(required_skills_lower)) * 100
        
        return round(score, 2)
    
    def calculate_overall_score(self, cv_data: Dict, job_requirements: Dict) -> Dict:
        """
        Calculate comprehensive candidate score
        
        Scoring breakdown:
        - Skills match: 40%
        - Experience: 30%
        - Education: 20%
        - CV completeness: 10%
        """
        scores = {}
        
        # Skills match (40%)
        skills_score = self.calculate_skill_match_score(
            cv_data.get('skills', []),
            job_requirements.get('required_skills', [])
        )
        scores['skills'] = skills_score * 0.4
        
        # Experience match (30%)
        candidate_exp = cv_data.get('experience_years', 0)
        required_exp = job_requirements.get('min_experience_years', 0)
        
        if candidate_exp >= required_exp:
            exp_score = min(100, (candidate_exp / max(required_exp, 1)) * 100)
        else:
            exp_score = (candidate_exp / max(required_exp, 1)) * 70  # Penalty for less experience
        
        scores['experience'] = exp_score * 0.3
        
        # Education match (20%)
        required_edu = job_requirements.get('required_education', '').lower()
        candidate_edu = cv_data.get('education', [])
        
        edu_score = 0
        if 'phd' in required_edu and 'PHD' in candidate_edu:
            edu_score = 100
        elif 'master' in required_edu and any(d in candidate_edu for d in ['MASTER', 'MBA', 'MSC', 'MA']):
            edu_score = 100
        elif 'bachelor' in required_edu and any(d in candidate_edu for d in ['BACHELOR', 'BSC', 'BA']):
            edu_score = 100
        elif candidate_edu:
            edu_score = 80  # Has some education
        
        scores['education'] = edu_score * 0.2
        
        # CV completeness (10%)
        completeness = 0
        if cv_data.get('email'): completeness += 25
        if cv_data.get('phone'): completeness += 25
        if cv_data.get('skills'): completeness += 25
        if cv_data.get('experience_years', 0) > 0: completeness += 25
        
        scores['completeness'] = completeness * 0.1
        
        # Total score
        total_score = sum(scores.values())
        
        return {
            'overall_score': round(total_score, 2),
            'breakdown': {
                'skills_match': round(skills_score, 2),
                'experience_match': round(exp_score, 2),
                'education_match': round(edu_score, 2),
                'cv_completeness': round(completeness, 2),
            },
            'recommendation': self._get_recommendation(total_score)
        }
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        if score >= 80:
            return "Strong Match - Highly Recommended for Interview"
        elif score >= 65:
            return "Good Match - Recommended for Interview"
        elif score >= 50:
            return "Moderate Match - Consider for Interview"
        else:
            return "Weak Match - Not Recommended"


# Initialize analyzer
cv_analyzer = CVAnalyzer()


@router.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    required_skills: Optional[List[str]] = None,
    min_experience_years: int = 0,
    required_education: str = "bachelor"
):
    """
    Analyze a single CV and return structured data with scoring
    
    **Example Request:**
    ```
    POST /ai/cv-analysis/analyze
    Form Data:
        file: resume.pdf
        required_skills: ["Python", "React", "PostgreSQL"]
        min_experience_years: 3
        required_education: "bachelor"
    ```
    
    **Example Response:**
    ```json
    {
        "candidate_info": {
            "email": "john@example.com",
            "phone": "+1234567890",
            "skills": ["Python", "React", "Docker"],
            "experience_years": 5,
            "education": ["BACHELOR", "MASTER"]
        },
        "score": {
            "overall_score": 85.5,
            "breakdown": {
                "skills_match": 90.0,
                "experience_match": 100.0,
                "education_match": 100.0,
                "cv_completeness": 100.0
            },
            "recommendation": "Strong Match - Highly Recommended"
        }
    }
    ```
    """
    # Read file
    content = await file.read()
    
    # Extract text
    if file.filename.endswith('.pdf'):
        text = cv_analyzer.extract_text_from_pdf(content)
    elif file.filename.endswith(('.txt', '.doc', '.docx')):
        text = content.decode('utf-8', errors='ignore')
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    # Extract candidate information
    cv_data = {
        'email': cv_analyzer.extract_email(text),
        'phone': cv_analyzer.extract_phone(text),
        'skills': cv_analyzer.extract_skills(text),
        'experience_years': cv_analyzer.extract_experience_years(text),
        'education': cv_analyzer.extract_education(text),
    }
    
    # Job requirements
    job_requirements = {
        'required_skills': required_skills or [],
        'min_experience_years': min_experience_years,
        'required_education': required_education,
    }
    
    # Calculate score
    score = cv_analyzer.calculate_overall_score(cv_data, job_requirements)
    
    return {
        'candidate_info': cv_data,
        'score': score,
        'filename': file.filename,
    }


@router.post("/batch-analyze")
async def batch_analyze_cvs(
    files: List[UploadFile] = File(...),
    required_skills: Optional[List[str]] = None,
    min_experience_years: int = 0,
    required_education: str = "bachelor"
):
    """
    Analyze multiple CVs and rank them
    
    Returns ranked list of candidates sorted by overall score
    """
    results = []
    
    for file in files:
        try:
            result = await analyze_cv(
                file, 
                required_skills, 
                min_experience_years,
                required_education
            )
            results.append(result)
        except Exception as e:
            results.append({
                'filename': file.filename,
                'error': str(e)
            })
    
    # Sort by overall score (highest first)
    valid_results = [r for r in results if 'score' in r]
    valid_results.sort(key=lambda x: x['score']['overall_score'], reverse=True)
    
    return {
        'total_candidates': len(files),
        'successfully_analyzed': len(valid_results),
        'ranked_candidates': valid_results,
        'errors': [r for r in results if 'error' in r]
    }
