const reqUrl = "http://localhost:8080";

// signup button setup
if (document.getElementById('signup') != null) {
    document.getElementById('signup').onsubmit = function() {
        if (document.getElementById('password').value ==  document.getElementById('confirmPassword').value) {
            const data = {
                type: 'signup',
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            }
            const param = {
                headers:{
                    "content-type":"application/json"
                },
                body: JSON.stringify(data),
                method: "POST"
            }
            signUp(param);
            return false;
        }
    };
}

// login in button setup
if (document.getElementById('login') != null) {
    document.getElementById('login').onsubmit = function() {
        const data = {
            type: 'login',
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        }
        const param = {
            headers:{
                "content-type":"application/json"
            },
            body: JSON.stringify(data),
            method: "POST"
        }
        login(param);
        return false;
    };
}

window.onload = function() {
    checkLogin();
}

// verify if user is signed in
// eventually update page based on http response
async function checkLogin() {
    const data = {
        type: 'stayLoggedIn',
        username: sessionStorage.username,
        token: sessionStorage.token
    }
    const param = {
        headers:{
            "content-type":"application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    }
    let logged;
    await fetch(reqUrl, param).then(res => res.text()).then(data => {
        logged = data;
    });
    logoutLi = document.getElementById("logoutLi");
    signupLi = document.getElementById("signupLi");
    loginLi = document.getElementById("loginLi");
    accountLi = document.getElementById("accountLi");
    if (logged == "logged in") {
        if (loginLi) {
            loginLi.style.display = "none";
        }
        if (signupLi) {
            signupLi.style.display = "none";
        }
    } else {
        if (logoutLi) {
            logoutLi.style.display = "none";
        }
        if (accountLi) {
            accountLi.style.display = "none";
        }
        if (location.pathname.split('/').pop() == "account.html") {
            window.location.href = "login.html";
        }
    }
}

function logout() {
    sessionStorage.token = "";
    window.location.href = "index.html";
}

async function signUp(param) {
    await fetch(reqUrl, param).then(res => res.text()).then(data => {
        console.log(data);
        if (data == "success") {
            const data = {
                type: 'login',
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            }
            const param = {
                headers:{
                    "content-type":"application/json"
                },
                body: JSON.stringify(data),
                method: "POST"
            }
            login(param);
        }
    });
}

async function login(param) {
    await fetch(reqUrl, param).then(res => res.text()).then(data => {
        console.log(data);
        if (data == "invalid username") {
            // inform user
        } else if (data == "invalid password") {
            // inform user
        } else {
            sessionStorage.username = JSON.parse(param.body).username;
            sessionStorage.token = data;
            // redirect to main page
            window.location.href = "index.html";
        }
    });
}
