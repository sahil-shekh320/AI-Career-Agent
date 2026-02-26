from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
from serpapi import GoogleSearch

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class Profile(BaseModel):
    name: str
    education: str
    experience: str
    role: str
    location: str
    skills: list[str]

# -----------------------------
# Resume Endpoint
# -----------------------------
@app.post("/generate-resume")
def generate_resume(profile: Profile):

    prompt = f"""
    Create a professional ATS-friendly resume.

    Name: {profile.name}
    Education: {profile.education}
    Skills: {', '.join(profile.skills)}
    Experience: {profile.experience}
    Target Role: {profile.role}
    """

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"resume": response["message"]["content"]}

# -----------------------------
# Interview Endpoint
# -----------------------------
@app.post("/generate-interview")
def generate_interview(profile: Profile):

    prompt = f"""
    Generate:
    - 5 Technical Questions
    - 5 HR Questions
    - 3 Scenario Questions

    For role: {profile.role}
    Based on skills: {', '.join(profile.skills)}
    """

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"questions": response["message"]["content"]}

# -----------------------------
# Job Search Endpoint
# -----------------------------
@app.get("/search-jobs")
def search_jobs(role: str, location: str):

    params = {
        "engine": "google_jobs",
        "q": role,
        "location": location,
        "hl": "en",
        "api_key": "c7ecfd687990c2b2cdadb9d495ca040b8d739909cdc0b2bff8f2fbf92c5ab858"
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    jobs = []

    for job in results.get("jobs_results", []):
        apply_link = None
        if job.get("apply_options"):
            apply_link = job["apply_options"][0].get("link")

        jobs.append({
            "title": job.get("title"),
            "company": job.get("company_name"),
            "location": job.get("location"),
            "link": apply_link
        })

    return {"jobs": jobs}