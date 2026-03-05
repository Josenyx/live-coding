const API = "http://localhost:3000";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

if (registerForm) {

registerForm.addEventListener("submit", async (e) => {

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API + "/auth/register", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
email,
password
})

});

const data = await res.json();

alert(data.message);

});

}

if (loginForm) {

loginForm.addEventListener("submit", async (e) => {

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API + "/auth/login", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
email,
password
})

});

const data = await res.json();

localStorage.setItem("token", data.token);

alert("Login correcto");

});

}