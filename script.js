/* n8n WEBHOOK URL */
const MAKE_WEBHOOK_URL = 'https://meenado89.app.n8n.cloud/webhook/resume-upload';

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== DRAG AND DROP RESUME UPLOAD ===== */
const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
        setFile(file);
    } else {
        showError('Only PDF or Word files are allowed.');
    }
});

/* ===== FILE SELECT INPUT ===== */
function handleFileSelect(input) {
    const file = input.files[0];
    if (file) setFile(file);
}

let selectedFile = null;
function setFile(file) {
    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSelected').classList.add('show');
    dropzone.style.display = 'none';
}

function removeFile() {
    selectedFile = null;
    document.getElementById('resumeFile').value = '';
    document.getElementById('fileSelected').classList.remove('show');
    dropzone.style.display = 'block';
}

/* ===== FORM SUBMIT ===== */
/* ===== FORM SUBMIT ===== */
document.getElementById('rozgarForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) return showError('Please upload your resume before submitting.');

    const jobDescription = document.getElementById('jobDescription').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();

    if (!jobDescription || !userEmail) return showError('Please fill in all fields.');

    const btn = document.getElementById('submitBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    hideError();
    btn.querySelector('.btn-text').textContent = 'Analyzing...';

    try {
        /* ===== CREATE FORM DATA TO SEND TO N8N ===== */
        const formData = new FormData();
        formData.append('email', userEmail);
        formData.append('job_description', jobDescription);
        formData.append('data', selectedFile);  // ← CHANGED: 'resume' to 'data'
        formData.append('filename', selectedFile.name);  // ← CHANGED: for reference

        /* ===== SEND TO N8N WEBHOOK ===== */
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('rozgarForm').style.display = 'none';
            document.getElementById('successMsg').classList.add('show');
            btn.querySelector('.btn-text').textContent = 'Submit';
        } else {
            throw new Error('Server error');
        }

    } catch (err) {
        showError('Something went wrong. Please try again in a moment.');
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Submit';
    }
});

/* ===== ERROR / SUCCESS HANDLERS ===== */
function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.classList.add('show');
}

function hideError() {
    document.getElementById('errorMsg').classList.remove('show');
}

/* ===== RESET FORM ===== */
function resetForm() {
    document.getElementById('rozgarForm').reset();
    document.getElementById('rozgarForm').style.display = 'block';
    document.getElementById('successMsg').classList.remove('show');
    removeFile();
    const btn = document.getElementById('submitBtn');
    btn.classList.remove('loading');
    btn.disabled = false;
}