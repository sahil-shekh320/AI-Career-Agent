const API = "http://127.0.0.1:8000";

function getProfile() {
    return {
        name: document.getElementById("name").value,
        education: document.getElementById("education").value,
        role: document.getElementById("role").value,
        location: document.getElementById("location").value,
        experience: document.getElementById("experience").value,
        skills: document.getElementById("skills").value
                    .split(",")
                    .map(s => s.trim())
    };
}


async function streamText(endpoint, payload, containerId) {
    const box = document.getElementById(containerId);
    box.innerHTML = "";

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        box.innerHTML = "Error: " + errorText;
        return;
    }

    const data = await response.json();

    // Make sure we extract correct field
    const text = data.resume || data.questions || JSON.stringify(data);

    if (typeof text !== "string") {
        box.innerHTML = JSON.stringify(text, null, 2);
        return;
    }

    let i = 0;
    function type() {
        if (i < text.length) {
            box.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 5);
        }
    }

    type();
}


async function generateResume() {
    await streamText(`${API}/generate-resume`, getProfile(), "resumeBox");
}

async function generateInterview() {
    await streamText(`${API}/generate-interview`, getProfile(), "interviewBox");
}

async function searchJobs() {

    const roleValue = document.getElementById("role").value;
    const locationValue = document.getElementById("location").value;

    const response = await fetch(
        `${API}/search-jobs?role=${encodeURIComponent(roleValue)}&location=${encodeURIComponent(locationValue)}`
    );

    const data = await response.json();

    console.log("Full response:", data);

    const jobsBox = document.getElementById("jobsBox");
    jobsBox.innerHTML = "";

    if (!data.jobs || data.jobs.length === 0) {
        jobsBox.innerHTML = "No jobs found.";
        return;
    }

    data.jobs.forEach(job => {
    jobsBox.innerHTML += `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.company}</div>
                </div>
            </div>

            <div class="job-location">📍 ${job.location}</div>

            ${job.link ? `
                <a href="${job.link}" target="_blank" class="apply-btn">
                    Apply Now →
                </a>
            ` : ""}
        </div>
    `;
});
}