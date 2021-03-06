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

// account deleetion setup
if (document.getElementById('deleteForm') != null) {
    document.getElementById('deleteForm').onsubmit = function() {
        const data = {
            type: 'delete',
            username: sessionStorage.username,
            password: document.getElementById('password').value
        }
        const param = {
            headers:{
                "content-type":"application/json"
            },
            body: JSON.stringify(data),
            method: "POST"
        }
        deleteAccount(param);
        return false;
    };
}

if (document.getElementById('notiForm') != null) {
    getNotiSettings();
    document.getElementById('notiForm').onsubmit = function() {
        const data = {
            type: 'notiUpdate',
            username: sessionStorage.username,
            token: sessionStorage.token,
            value: document.getElementById(notiCheck).checked
        }
        const param = {
            headers:{
                "content-type":"application/json"
            },
            body: JSON.stringify(data),
            method: "POST"
        }
        updateNotiSettings(param);
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

async function deleteAccount(param) {
    await fetch(reqUrl, param);
    sessionStorage.username = "";
    logout();
}

async function getNotiSettings() {
    const data = {
        type: 'notiGet',
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
    await fetch(reqUrl, param).then(res => res.text()).then(data => {
        if (data == "true") {
            document.getElementById("notiCheck").checked = true;
        } else {
            document.getElementById("notiCheck").checked = false;
        }
    });
}

async function updateNotiSettings(param) {
    if (document.getElementById("notiCheck").checked == true) {
        if (!('serviceWorker' in navigator)) {
            // Service Worker isn't supported on this browser, disable or hide UI.
            return;
        }
        if (!('PushManager' in window)) {
            // Push isn't supported on this browser, disable or hide UI.
            return;
        }
        registerServiceWorker();
        askPermission();
    }
    await fetch(reqUrl, param);
}

function registerServiceWorker() {
    return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      console.log('Service worker successfully registered.');
      return registration;
    })
    .catch(function(err) {
      console.error('Unable to register service worker.', err);
    });
  }

function askPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        resolve(result);
      });
  
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
    });
  }