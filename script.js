/**
 * Student Enrollment Management System
 * JavaScript Logic with JsonPowerDB Integration
 * Developer: Anash Khan (anashkhan.dev@gmail.com)
 */

// --- JPDB Configurations ---
// Load configurations from localStorage or use defaults
let jpdbBaseURL = localStorage.getItem('jpdbBaseURL') || "http://api.login2explore.com:5577";
let connToken = localStorage.getItem('connToken') || "90935134|-31949240985177192|90903756";
let dbName = localStorage.getItem('dbName') || "SCHOOL-DB";
let relName = localStorage.getItem('relName') || "STUDENT-TABLE";

const jpdbIML = "/api/iml";
const jpdbIRL = "/api/irl";

// State variables
let saveRecNo = null; // Stores record number of retrieved student
let isExistingRecord = false;

// Set global base URL for jpdb-commons.js
if (typeof setBaseUrl === 'function') {
    setBaseUrl(jpdbBaseURL);
} else {
    baseUrl = jpdbBaseURL;
}

$(document).ready(function () {
    // Set initial configuration field values in settings modal
    $('#configToken').val(connToken);
    $('#configDbName').val(dbName);
    $('#configRelName').val(relName);
    $('#configBaseUrl').val(jpdbBaseURL);

    // Initialize application state
    resetForm();

    // --- Configuration Settings Handlers ---
    $('#btnSaveSettings').click(function () {
        const token = $('#configToken').val().trim();
        const db = $('#configDbName').val().trim();
        const rel = $('#configRelName').val().trim();
        const url = $('#configBaseUrl').val().trim();

        if (!token || !db || !rel || !url) {
            showToast("Please fill all configuration settings fields.", "error");
            return;
        }

        // Update global configurations
        connToken = token;
        dbName = db;
        relName = rel;
        jpdbBaseURL = url;

        // Save to localStorage
        localStorage.setItem('connToken', connToken);
        localStorage.setItem('dbName', dbName);
        localStorage.setItem('relName', relName);
        localStorage.setItem('jpdbBaseURL', jpdbBaseURL);

        // Update jpdb-commons.js base URL
        if (typeof setBaseUrl === 'function') {
            setBaseUrl(jpdbBaseURL);
        } else {
            baseUrl = jpdbBaseURL;
        }

        // Close the modal
        const modalElement = document.getElementById('settingsModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        showToast("Configuration saved and updated successfully!", "success");
        resetForm(); // Reset form to apply changes
    });

    // --- Dynamic Profile Card Syncing & Character Counter ---
    $('#rollNo').on('input', function () {
        const val = $(this).val();
        $('#previewRoll').text(val ? val : "-");
        validateField(this, validateRollNo);
    });

    $('#fullName').on('input', function () {
        const val = $(this).val();
        $('#previewName').text(val ? val : "- - - - -");
        validateField(this, validateFullName);
    });

    $('#studentClass').on('input', function () {
        const val = $(this).val();
        $('#previewClassBadge').text(val ? val : "Class Code");
        validateField(this, validateClass);
    });

    $('#email').on('input', function () {
        const val = $(this).val();
        $('#previewEmail').text(val ? val : "-");
        $('#previewEmail').attr('title', val);
        validateField(this, validateEmail);
    });

    $('#phone').on('input', function () {
        const val = $(this).val();
        $('#previewPhone').text(val ? val : "-");
        validateField(this, validatePhone);
    });

    $('#birthDate').on('input', function () {
        const val = $(this).val();
        $('#previewDob').text(val ? formatDate(val) : "-");
        validateField(this, validateBirthDate);
    });

    $('#enrollmentDate').on('input', function () {
        const val = $(this).val();
        $('#previewEnrollDate').text(val ? formatDate(val) : "-");
        validateField(this, validateEnrollmentDate);
    });

    $('#address').on('input', function () {
        const val = $(this).val();
        const len = val.length;
        $('#charCount').text(`${len} / 200 characters`);
        
        if (len >= 180) {
            $('#charCount').removeClass('text-muted').addClass('text-danger fw-semibold');
        } else {
            $('#charCount').removeClass('text-danger fw-semibold').addClass('text-muted');
        }
        
        $('#previewAddress').text(val ? val : "-");
        validateField(this, validateAddress);
    });

    // --- Search Event Trigger on Roll No ---
    // Trigger check on blur
    $('#rollNo').blur(function () {
        checkRollNoExistence();
    });

    // Trigger check on Enter keypress
    $('#rollNo').keypress(function (e) {
        if (e.which === 13) {
            e.preventDefault();
            checkRollNoExistence();
        }
    });

    // --- Button Event Listeners ---
    $('#btnSave').click(function () {
        saveStudent();
    });

    $('#btnUpdate').click(function () {
        updateStudent();
    });

    $('#btnReset').click(function () {
        resetForm();
    });
});

// --- Database Logic ---

/**
 * Checks if the entered Roll Number already exists in JsonPowerDB.
 */
function checkRollNoExistence() {
    const rollNoField = document.getElementById('rollNo');
    const rollNo = $('#rollNo').val().trim();

    if (!rollNo) {
        return; // Do nothing for empty inputs
    }

    if (!validateRollNo(rollNo)) {
        $(rollNoField).addClass('is-invalid').removeClass('is-valid');
        showToast("Roll number must be a positive integer.", "error");
        return;
    }

    $(rollNoField).addClass('is-valid').removeClass('is-invalid');

    // Show loading overlay
    showLoader(true);

    try {
        // Construct GET_BY_KEY request using primary key
        const keyJson = {
            rollNo: rollNo
        };
        const getRequest = createGET_BY_KEYRequest(connToken, dbName, relName, JSON.stringify(keyJson));
        
        // Execute request synchronously via JPDB commons library
        $.ajaxSetup({ async: false });
        const resJsonObj = executeCommand(getRequest, jpdbIRL);
        $.ajaxSetup({ async: true });

        showLoader(false);

        // Process response status
        if (resJsonObj.status === 200) {
            // Record exists: Extract and fill data
            isExistingRecord = true;
            
            const dataObj = JSON.parse(resJsonObj.data);
            saveRecNo = dataObj.rec_no;
            const studentRecord = dataObj.record;

            // Fill form fields
            $('#fullName').val(studentRecord.fullName);
            $('#studentClass').val(studentRecord.studentClass);
            $('#email').val(studentRecord.email);
            $('#phone').val(studentRecord.phone);
            $('#birthDate').val(studentRecord.birthDate);
            $('#enrollmentDate').val(studentRecord.enrollmentDate);
            $('#address').val(studentRecord.address);

            // Trigger preview synchronization
            syncProfilePreview(studentRecord);
            
            // Adjust form validation indicators
            $('#studentForm input, #studentForm textarea').removeClass('is-invalid').addClass('is-valid');

            // Disable Roll Number & Enable all other fields
            toggleFormFields(true);
            
            // Adjust buttons
            $('#btnSave').prop('disabled', true);
            $('#btnUpdate').prop('disabled', false);
            $('#btnReset').prop('disabled', false);
            
            // Set badges
            $('#formStatusBadge').text("Existing Record").removeClass('bg-secondary-glass').addClass('bg-primary-glass text-primary');

            showToast("Student record retrieved successfully!", "info");
            
            // Focus on Full Name
            $('#fullName').focus();

        } else if (resJsonObj.status === 400) {
            // Record does not exist: Prepare for new entry
            isExistingRecord = false;
            saveRecNo = null;

            // Enable form fields
            toggleFormFields(false);

            // Set default Enrollment Date to today
            const todayStr = new Date().toISOString().split('T')[0];
            $('#enrollmentDate').val(todayStr);
            $('#previewEnrollDate').text(formatDate(todayStr));

            // Adjust buttons
            $('#btnSave').prop('disabled', false);
            $('#btnUpdate').prop('disabled', true);
            $('#btnReset').prop('disabled', false);

            // Set badge
            $('#formStatusBadge').text("New Record").removeClass('bg-secondary-glass').addClass('bg-primary-glass text-primary');

            showToast("Roll number not found. You can enter new details.", "info");

            // Focus on Full Name
            $('#fullName').focus();
        } else {
            // Unexpected API error (e.g. invalid token, connection problem)
            showToast(`Database Error: ${resJsonObj.message}`, "error");
            resetForm();
        }

    } catch (error) {
        showLoader(false);
        showToast("Error connecting to JsonPowerDB server. Check settings.", "error");
        console.error("JPDB Connection Error:", error);
    }
}

/**
 * Saves a new student record to JsonPowerDB.
 */
function saveStudent() {
    if (!validateAllFormFields()) {
        showToast("Please fix the validation errors before saving.", "error");
        return;
    }

    const studentData = getFormData();
    
    showLoader(true);

    try {
        // Create PUT request
        const putRequest = createPUTRequest(connToken, JSON.stringify(studentData), dbName, relName);

        $.ajaxSetup({ async: false });
        const resJsonObj = executeCommand(putRequest, jpdbIML);
        $.ajaxSetup({ async: true });

        showLoader(false);

        if (resJsonObj.status === 200) {
            showToast("Student enrolled successfully!", "success");
            resetForm();
        } else {
            showToast(`Failed to save record: ${resJsonObj.message}`, "error");
        }
    } catch (error) {
        showLoader(false);
        showToast("Error executing database operation.", "error");
        console.error(error);
    }
}

/**
 * Updates an existing student record in JsonPowerDB.
 */
function updateStudent() {
    if (!saveRecNo) {
        showToast("No active record loaded to update.", "error");
        return;
    }

    if (!validateAllFormFields()) {
        showToast("Please fix the validation errors before updating.", "error");
        return;
    }

    const studentData = getFormData();

    showLoader(true);

    try {
        // Create UPDATE record request
        const updateRequest = createUPDATERecordRequest(connToken, JSON.stringify(studentData), dbName, relName, saveRecNo);

        $.ajaxSetup({ async: false });
        const resJsonObj = executeCommand(updateRequest, jpdbIML);
        $.ajaxSetup({ async: true });

        showLoader(false);

        if (resJsonObj.status === 200) {
            showToast("Student details updated successfully!", "success");
            resetForm();
        } else {
            showToast(`Failed to update details: ${resJsonObj.message}`, "error");
        }
    } catch (error) {
        showLoader(false);
        showToast("Error executing database update operation.", "error");
        console.error(error);
    }
}

/**
 * Resets the student enrollment form to its initial page load state.
 */
function resetForm() {
    // Clear the form fields
    $('#studentForm')[0].reset();
    
    // Clear validation styling classes
    $('#studentForm input, #studentForm textarea').removeClass('is-invalid is-valid');

    // Reset state variables
    saveRecNo = null;
    isExistingRecord = false;

    // Reset Address character counter
    $('#charCount').text("0 / 200 characters").removeClass('text-danger fw-semibold').addClass('text-muted');

    // Reset UI Element states (Enable only Roll Number)
    $('#rollNo').prop('disabled', false);
    $('#fullName, #studentClass, #email, #phone, #birthDate, #address, #enrollmentDate').prop('disabled', true);

    // Disable Save and Update buttons
    $('#btnSave').prop('disabled', true);
    $('#btnUpdate').prop('disabled', true);

    // Reset Badge status
    $('#formStatusBadge').text("Initial State").removeClass('bg-primary-glass text-primary').addClass('bg-secondary-glass text-secondary');

    // Reset Profile Preview Card details
    $('#previewName').text("- - - - -");
    $('#previewClassBadge').text("Class Code");
    $('#previewRoll').text("-");
    $('#previewEmail').text("-").removeAttr('title');
    $('#previewPhone').text("-");
    $('#previewDob').text("-");
    $('#previewEnrollDate').text("-");
    $('#previewAddress').text("-");

    // Focus on Roll No
    $('#rollNo').focus();
}

// --- Dynamic Form Validations ---

/**
 * Validates a single input field on real-time input events.
 */
function validateField(element, validationFn) {
    const val = $(element).val().trim();
    if (validationFn(val)) {
        $(element).addClass('is-valid').removeClass('is-invalid');
        return true;
    } else {
        $(element).addClass('is-invalid').removeClass('is-valid');
        return false;
    }
}

// Validation rules
function validateRollNo(val) {
    const num = Number(val);
    return val !== "" && Number.isInteger(num) && num > 0;
}

function validateFullName(val) {
    const nameRegex = /^[A-Za-z\s]{3,50}$/;
    return val !== "" && nameRegex.test(val);
}

function validateClass(val) {
    return val !== "" && val.length >= 2;
}

function validateEmail(val) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return val !== "" && emailRegex.test(val);
}

function validatePhone(val) {
    const phoneRegex = /^[6-9]\d{9}$/; // Validates Indian mobiles starting with 6-9, total 10 digits
    return val !== "" && phoneRegex.test(val);
}

function validateBirthDate(val) {
    if (val === "") return false;
    const dob = new Date(val);
    const today = new Date();
    // Student must be at least 3 years old and born in the past
    return dob < today && (today.getFullYear() - dob.getFullYear() >= 3);
}

function validateEnrollmentDate(val) {
    return val !== "";
}

function validateAddress(val) {
    return val !== "" && val.length >= 10 && val.length <= 200;
}

/**
 * Validates all form fields. Used before Save and Update calls.
 */
function validateAllFormFields() {
    let isValid = true;

    isValid = validateField('#rollNo', validateRollNo) && isValid;
    isValid = validateField('#fullName', validateFullName) && isValid;
    isValid = validateField('#studentClass', validateClass) && isValid;
    isValid = validateField('#email', validateEmail) && isValid;
    isValid = validateField('#phone', validatePhone) && isValid;
    isValid = validateField('#birthDate', validateBirthDate) && isValid;
    isValid = validateField('#enrollmentDate', validateEnrollmentDate) && isValid;
    isValid = validateField('#address', validateAddress) && isValid;

    return isValid;
}

// --- Helper Functions ---

/**
 * Enables or disables form fields based on search results.
 * @param {boolean} isExisting True if record exists, False if not.
 */
function toggleFormFields(isExisting) {
    // Roll Number is always disabled once checked to avoid mismatch
    $('#rollNo').prop('disabled', true);
    
    // Enable all other inputs
    $('#fullName, #studentClass, #email, #phone, #birthDate, #address, #enrollmentDate').prop('disabled', false);
}

/**
 * Returns structured JSON object containing values of form inputs.
 */
function getFormData() {
    return {
        rollNo: $('#rollNo').val().trim(),
        fullName: $('#fullName').val().trim(),
        studentClass: $('#studentClass').val().trim(),
        email: $('#email').val().trim(),
        phone: $('#phone').val().trim(),
        birthDate: $('#birthDate').val(),
        enrollmentDate: $('#enrollmentDate').val(),
        address: $('#address').val().trim()
    };
}

/**
 * Maps DB student record object into the profile preview card.
 */
function syncProfilePreview(studentRecord) {
    $('#previewRoll').text(studentRecord.rollNo);
    $('#previewName').text(studentRecord.fullName);
    $('#previewClassBadge').text(studentRecord.studentClass);
    $('#previewEmail').text(studentRecord.email).attr('title', studentRecord.email);
    $('#previewPhone').text(studentRecord.phone);
    $('#previewDob').text(formatDate(studentRecord.birthDate));
    $('#previewEnrollDate').text(formatDate(studentRecord.enrollmentDate));
    $('#previewAddress').text(studentRecord.address);
}

/**
 * Formats standard ISO YYYY-MM-DD string into descriptive DD-MMM-YYYY.
 */
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Controls the visibility of the full-screen loading spinner page overlay.
 */
function showLoader(visible) {
    if (visible) {
        $('#loaderOverlay').removeClass('d-none');
    } else {
        $('#loaderOverlay').addClass('d-none');
    }
}

/**
 * Triggers professional Bootstrap floating toast notifications on page.
 */
function showToast(message, type = 'success') {
    const toastId = 'toast_' + Date.now();
    let bgHeaderClass = 'bg-success';
    let iconClass = 'bi-check-circle-fill';
    let headerText = 'Success';

    switch (type) {
        case 'error':
        case 'danger':
            bgHeaderClass = 'bg-danger';
            iconClass = 'bi-exclamation-triangle-fill';
            headerText = 'Error';
            break;
        case 'info':
            bgHeaderClass = 'bg-primary';
            iconClass = 'bi-info-circle-fill';
            headerText = 'Information';
            break;
        case 'warning':
            bgHeaderClass = 'bg-warning text-dark';
            iconClass = 'bi-exclamation-circle-fill';
            headerText = 'Warning';
            break;
    }

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="4000">
            <div class="toast-header ${bgHeaderClass} text-white">
                <i class="bi ${iconClass} me-2"></i>
                <strong class="me-auto">${headerText}</strong>
                <small class="text-white-50">Just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body text-dark fw-medium py-3">
                ${message}
            </div>
        </div>
    `;

    $('#toastContainer').append(toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Clean up DOM after toast fades out
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}
