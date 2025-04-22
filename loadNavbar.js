// this navbar takes effect on the menu page after customer login !
import { auth } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function loadNavbar() {
    try {
        const response = await fetch("navbar.html");
        const navbarHtml = await response.text();
        
        // Ensure the navbar is loaded into an existing element
        const navbarContainer = document.getElementById("navbar");
        if (!navbarContainer) {
            console.error("Navbar container not found! Make sure your HTML has an element with id='navbar'.");
            return;
        }

        navbarContainer.innerHTML = navbarHtml;

        setupAuthListeners();
    } catch (error) {
        console.error("Error loading navbar:", error);
    }
}

function setupAuthListeners() {
    const authButton = document.getElementById("toggle-login"); // Ensure correct ID usage
    const authRequiredLinks = document.querySelectorAll(".auth-required");

    if (!authButton) {
        console.error("Auth button not found in navbar!");
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authButton.textContent = "Logout";
            authButton.onclick = () => {
                signOut(auth)
                    .then(() => {
                        alert("Logged Out Successfully");
                        window.location.href = "index.html";
                    })
                    .catch((error) => {
                        alert("Error logging out: " + error.message);
                    });
            };

            // Allow access to protected pages
            authRequiredLinks.forEach((link) => {
                link.addEventListener("click", (e) => e.stopPropagation());
            });
        } else {
            authButton.textContent = "Login";
            authButton.onclick = () => {
                window.location.href = "login.html";
            };

            // Prevent access to Cart & Order pages
            authRequiredLinks.forEach((link) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    alert("Please log in to access this page.");
                    window.location.href = "login.html";
                });
            });
        }
    });
}

// Load navbar once DOM is ready
document.addEventListener("DOMContentLoaded", loadNavbar);
