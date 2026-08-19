/**
 * GasTrack IT EGAS - Core Logic & Session Management
 * Enterprise Jira Task Manager for EGAS IT Department
 */

// Verify User Auth Session
(function checkAuthSession() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn && currentPage !== 'login.html' && currentPage !== '') {
        window.location.href = 'login.html';
    } else if (isLoggedIn && currentPage === 'login.html') {
        window.location.href = 'index.html';
    }
})();

// Helper Utility: Format Dates
function formatDateArabic(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// Global Storage Cleanup Utility
function resetSystemData() {
    if (confirm("هل أنت تأكد من إعادة ضبط كافة بيانات منصة IT EGAS إلى الوضع الافتراضي؟")) {
        localStorage.clear();
        window.location.reload();
    }
}
