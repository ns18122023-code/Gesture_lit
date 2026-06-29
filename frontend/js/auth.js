const API_URL = "http://localhost:5000";
function validEmail(email){

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);
}

function showMessage(message){
    let msgBox = document.getElementById("messageBox");

    if(!msgBox){
        msgBox = document.createElement("p");
        msgBox.id = "messageBox";
        document.querySelector(".auth-box").appendChild(msgBox);
    }

    msgBox.innerText = message;
    msgBox.style.color = "#38bdf8";
}

/* REGISTER */
function registerUser(){
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!validEmail(email)){
    showMessage("Enter valid email address");
    return;
}

    if(name === "" || email === "" || password === ""){
        showMessage("Please fill all fields");
        return;
    }

    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message || data.error);

        if(data.message){
            let allUsers = JSON.parse(localStorage.getItem("allUsers")) || [];

            const alreadyExists = allUsers.some(user => user.email === email);

            if(!alreadyExists){
                allUsers.push({
                    name: name,
                    email: email,
                    joined: new Date().toLocaleString()
                });

                localStorage.setItem("allUsers", JSON.stringify(allUsers));
            }

            setTimeout(() => {
                window.location.href = "login.html";
            }, 800);
        }
    })
    .catch(error => {
        console.log(error);
        showMessage("Backend not running or connection error");
    });
}

/* USER LOGIN */
function loginUser(){
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!validEmail(email)){
    showMessage("Enter valid email address");
    return;
}
    if(email === "" || password === ""){
        showMessage("Please enter email and password");
        return;
    }

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message || data.error);

        if(data.user){
            localStorage.setItem("user", JSON.stringify(data.user));

            setTimeout(() => {
                window.location.href = "home.html";
            }, 800);
        }
    })
    .catch(error => {
        console.log(error);
        showMessage("Backend not running or connection error");
    });
}

/* ADMIN LOGIN */
function adminLogin(){
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!validEmail(email)){
    showMessage("Enter valid admin email");
    return;
}

    if(email === "" || password === ""){
        showMessage("Please enter admin email and password");
        return;
    }

    fetch(`${API_URL}/admin-login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message || data.error);

        if(data.admin){
            localStorage.setItem("user", JSON.stringify(data.admin));

            setTimeout(() => {
                window.location.href = "admin.html";
            }, 800);
        }
    })
    .catch(error => {
        console.log(error);
        showMessage("Backend not running or connection error");
    });
}

/* ENTER KEY SUPPORT */
document.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        if(window.location.pathname.includes("login.html")){
            loginUser();
        }

        if(window.location.pathname.includes("register.html")){
            registerUser();
        }
    }
});