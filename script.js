/* ROZGARAI SCRIPT.JS
   THIS FILE CONTROLS ALL THE INTERACTIVE BEHAVIOUR
   OF THE ROZGARAI FRONTEND PAGE*/

/*  REPLIT BACKEND URL */
const BACKEND_URL = 'http://127.0.0.1:5000/api/analyse';

// SCROLL REVEAL ANIMATIONS USING THE INTERSECTION OBSERVER API
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        /* WHEN AN ELEMENT COMES INTO VIEW ADD THE VISIBLE CLASS */
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

/* TELLING THE OBSERVER TO WATCH ALL ELEMENTS WITH CLASS REVEAL */
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// DRAG AND DROP FILE UPLOAD FUNCTIONALITY
const dropzone = document.getElementById('dropzone');

/* WHEN USER DRAGS A FILE OVER THE BOX HIGHLIGHT IT */
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
});

/* WHEN USER STOPS DRAGGING REMOVE THE HIGHLIGHT */
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
});

/* WHEN USER DROPS A FILE CHECK THE TYPE AND SET IT */
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

// FILE SELECTED THROUGH THE BROWSE BUTTON
function handleFileSelect(input) {
    const file = input.files[0];
    if (file) setFile(file);
}

/* STORING THE SELECTED FILE IN A VARIABLE SO WE CAN SEND IT LATER */
let selectedFile = null;

/* SHOWING THE SELECTED FILE NAME AND HIDING THE DROPZONE */
function setFile(file) {
    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSelected').classList.add('show');
    dropzone.style.display = 'none';
}

/* CLEARING THE SELECTED FILE AND SHOWING THE DROPZONE AGAIN */
function removeFile() {
    selectedFile = null;
    document.getElementById('resumeFile').value = '';
    document.getElementById('fileSelected').classList.remove('show');
    dropzone.style.display = 'block';
}

// ROTATING MESSAGES TO SHOW ON THE BUTTON WHILE THE AI IS WORKING - MAKES IT FEEL MORE ALIVE AND LESS BORING
const loaderMessages = [
    'Reading your resume...',
    'Extracting your skills...',
    'Comparing to job requirements...',
    'Finding skill gaps...',
    'Matching government courses...',
    'Selecting relevant schemes...',
    'Writing your report...',
    'Sending to your email...'
];

/* CYCLING THROUGH MESSAGES EVERY 2.5 SECONDS */
function startLoaderMessages(btn) {
    let i = 0;
    return setInterval(() => {
        i = (i + 1) % loaderMessages.length;
        btn.querySelector('.btn-text').textContent = loaderMessages[i];
    }, 2500);
}

// FROM HERE ON IT'S ALL ABOUT HANDLING THE FORM SUBMISSION AND COMMUNICATING WITH THE BACKEND
document.getElementById('rozgarForm').addEventListener('submit', async (e) => {
    /* STOPPING THE BROWSER FROM DOING ITS DEFAULT FORM SUBMIT */
    e.preventDefault();

    /* CHECKING THE RESUME FILE WAS UPLOADED */
    if (!selectedFile) return showError('Please upload your resume before submitting.');

    /* GETTING VALUES FROM THE FORM FIELDS */
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();

    /* CHECKING ALL FIELDS ARE FILLED IN */
    if (!jobDescription || !userEmail) return showError('Please fill in all fields.');

    /* CHECKING THE FILE IS NOT TOO LARGE */
    if (selectedFile.size > 5 * 1024 * 1024) return showError('Resume file must be under 5MB.');

    /* SHOWING THE LOADING STATE ON THE BUTTON */
    const btn = document.getElementById('submitBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    hideError();

    /* STARTING THE ROTATING STATUS MESSAGES */
    const loaderInterval = startLoaderMessages(btn);

    try {
        /* BUILDING THE FORM DATA PACKAGE TO SEND TO PYTHON */
        const formData = new FormData();
        formData.append('email', userEmail);
        formData.append('job_description', jobDescription);
        formData.append('data', selectedFile);   /* THE RESUME FILE */
        formData.append('filename', selectedFile.name);

        /* SENDING EVERYTHING TO THE PYTHON FLASK BACKEND */
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': '1'
            },
            body: formData
        });

        /* STOPPING THE ROTATING MESSAGES */
        clearInterval(loaderInterval);

        if (response.ok) {
    const data = await response.json();
    document.getElementById('rozgarForm').style.display = 'none';
    document.getElementById('reportSection').innerHTML = `
        <div class="report-card">
            <div class="report-header">
                <h2>Your RozgarAI Career Report</h2>
                <p>Based on your resume and the job you want</p>
            </div>
            <div class="report-body">
                <pre>${data.analysis}</pre>
            </div>
            <button onclick="location.reload()" class="btn-primary" style="margin-top:20px">
                Analyse Another Resume
            </button>
        </div>
    `;
    document.getElementById('reportSection').style.display = 'block';
    document.getElementById('reportSection').scrollIntoView({behavior:'smooth'});
}

    } catch (err) {
        /* IF THE REQUEST ITSELF FAILED SHOW THE ERROR MESSAGE */
        clearInterval(loaderInterval);
        showError('Something went wrong: ' + err.message + '. Please try again.');
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = '✦ Analyse My Resume — It\'s Free';
    }
});

// HELPER FUNCTIONS FOR MANAGING THE FORM STATE AND ERROR MESSAGES

/* SHOWING AN ERROR MESSAGE BELOW THE FORM */
function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.classList.add('show');
}

/* HIDING THE ERROR MESSAGE */
function hideError() {
    document.getElementById('errorMsg').classList.remove('show');
}

/* RESETTING THE WHOLE FORM BACK TO ITS STARTING STATE */
function resetForm() {
    document.getElementById('rozgarForm').reset();
    document.getElementById('rozgarForm').style.display = 'block';
    document.getElementById('successMsg').classList.remove('show');
    removeFile();
    const btn = document.getElementById('submitBtn');
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = '✦ Analyse My Resume — It\'s Free';
}