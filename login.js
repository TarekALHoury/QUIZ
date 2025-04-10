document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    // Redirect users if they are not authenticated
    if (!sessionStorage.getItem("loggedIn")) {
        console.log("User is not logged in, redirecting to login page");
        window.location.href = "index.html";
    } else {
        console.log("User is logged in");
    }
});

// Login functionality
function handleLogin(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    const userCode = document.getElementById("loginCode").value;
    const messageElement = document.getElementById("loginMessage");

    const ACCESS_CODES = ["MT369", "Dcs58h", "dAU4yC"]; // Example access codes

    if (ACCESS_CODES.includes(userCode)) {
        console.log("Access code is correct, logging in");

        // Use sessionStorage instead of localStorage for security
        sessionStorage.setItem("loggedIn", "true");

        // Redirect to the quiz page (quiztab.html)
        window.location.href = "quiztab.html"; 
    } else {
        console.log("Invalid access code");
        messageElement.textContent = "Invalid code. Please try again.";
        messageElement.style.color = "red"; // Error message in red
    }
}

// Add event listener for form submission
document.getElementById("loginForm").addEventListener("submit", handleLogin);
