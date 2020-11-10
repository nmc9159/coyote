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
    await fetch('http://localhost:8080',param).then(res => res.text()).then(data => {
        console.log(data);
        logged = data;
    });
    statusText = document.getElementById("statusText");
    if (statusText) {
        statusText.innerHTML = logged;
    }
}

async function signUp(param) {
    await fetch('http://localhost:8080',param).then(res => res.text()).then(data => {
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
    await fetch('http://localhost:8080',param).then(res => res.text()).then(data => {
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
