const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const formTitle = document.getElementById("formTitle");

showRegister.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formTitle.innerText = "Register";
});

showLogin.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.innerText = "Login";
});

// Example submit actions
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Logged in successfully!");
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Account created successfully!");
});
