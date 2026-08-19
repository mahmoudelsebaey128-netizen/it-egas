// دالة تسجيل الخروج المباشرة (تعمل فور الضغط)
function handleLogout() {
    // 1. مسح جميع بيانات الجلسة والمستخدم
    localStorage.clear();
    sessionStorage.clear();

    // 2. تنبيه وتسجيل الخروج
    alert("تم تسجيل الخروج بنجاح");

    // 3. التوجيه لصفحة اللوجن أو عمل Reload
    window.location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
    // التأكد من حالة تسجيل الدخول
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = localStorage.getItem("currentUser");

    if (isLoggedIn === "true" && currentUser) {
        const userGreeting = document.getElementById("userGreeting");
        if (userGreeting) {
            userGreeting.textContent = "Welcome, " + currentUser;
        }
    }

    // التنقل بين التابات (Tab Navigation)
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("pageTitle");

    navItems.forEach((item) => {
        item.addEventListener("click", function () {
            const targetTab = this.getAttribute("data-tab");

            // إزالة التفعيل من التابات القديمة
            navItems.forEach((nav) => nav.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));

            // تفعيل التاب الجديدة
            this.classList.add("active");
            const activeContent = document.getElementById(targetTab);
            if (activeContent) {
                activeContent.classList.add("active");
            }

            // تحديث العنوان
            if (pageTitle) {
                pageTitle.textContent = this.textContent.trim();
            }
        });
    });

    // زرار تبديل الوضع الداكن (Dark Mode)
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
        });
    }
});
