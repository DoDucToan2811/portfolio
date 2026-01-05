console.log("Welcome to my portfolio!");
document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
        duration: 1200, // Animation duration in milliseconds
        once: true, // Animation occurs only once
    });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Function to update button text
function updateToggleText() {
    if (body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    updateToggleText();
});

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }
    updateToggleText();
});