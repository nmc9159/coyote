if (sessionStorage.getItem("users") == null) {
    console.log("users");
    sessionStorage.setItem("users", "{}");
}
if (sessionStorage.getItem("noti") == null) {
    console.log("noti");
    sessionStorage.setItem("noti", "{}");
}

// signup button setup
if (document.getElementById('signup') != null) {
    document.getElementById('signup').onsubmit = function() {
        if (document.getElementById('password').value ==  document.getElementById('confirmPassword').value) {
            const data = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            }
            signUp(data);
            return false;
        }
    };
}

// login in button setup
if (document.getElementById('login') != null) {
    document.getElementById('login').onsubmit = function() {
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        }
        login(data);
        return false;
    };
}

// account deleetion setup
if (document.getElementById('deleteForm') != null) {
    document.getElementById('deleteForm').onsubmit = function() {
        const data = {
            username: sessionStorage.getItem(username),
            password: document.getElementById('password').value
        }
        deleteAccount(data);
        return false;
    };
}

if (document.getElementById('notiForm') != null) {
    getNotiSettings();
    document.getElementById('notiForm').onsubmit = function() {
        updateNotiSettings();
        return false;
    };
}

window.onload = function() {
    checkLogin();
}

// verify if user is signed in
// eventually update page based on http response
async function checkLogin() {
    logoutLi = document.getElementById("logoutLi");
    signupLi = document.getElementById("signupLi");
    loginLi = document.getElementById("loginLi");
    accountLi = document.getElementById("accountLi");
    page = location.pathname.split('/').pop()
    if (!(sessionStorage.getItem("loggedin") == null || sessionStorage.getItem("loggedin") == "false")) {
        if (loginLi) {
            loginLi.style.display = "none";
        }
        if (signupLi) {
            signupLi.style.display = "none";
        }
        if (page == "login.html") {
            window.location.href = "index.html";
        }
        if (page == "signup.html") {
            window.location.href = "index.html";
        }
    } else {
        if (logoutLi) {
            logoutLi.style.display = "none";
        }
        if (accountLi) {
            accountLi.style.display = "none";
        }
        if (page == "account.html") {
            window.location.href = "login.html";
        }
    }
}

function logout() {
    sessionStorage.setItem("loggedin", "false");
    window.location.href = "index.html";
}

async function signUp(param) {
    users = JSON.parse(sessionStorage.getItem("users"));
    username = param.username;
    if (!(username in users)) {
        users[username] = param.password;
        sessionStorage.setItem("users", JSON.stringify(users));
        sessionStorage.setItem("loggedin", username);
        window.location.href = "index.html";
    }
}

async function login(param) {
    users = JSON.parse(sessionStorage.getItem("users"));
    username = param.username;
    console.log(users);
    if (username in users && users[username] == param.password) {
        sessionStorage.setItem("loggedin", username);
        window.location.href = "index.html";
    }
}

async function deleteAccount(param) {
    users = JSON.parse(sessionStorage.getItem("users"));
    username = param.username;
    if (param.username in users && users[username] == param.password) {
        delete users[username];
        sessionStorage.setItem("users", JSON.stringify(users));
        sessionStorage.setItem("loggedin", null);
        window.location.href = "index.html";
    }
}

async function getNotiSettings() {
    noti = JSON.parse(sessionStorage.getItem("noti"));
    username = sessionStorage.getItem("loggedin");
    if (username) {
        if (noti.username == "true") {
            document.getElementById("notiCheck").checked = true;
        } else {
            document.getElementById("notiCheck").checked = false;
        }
    }
}

async function updateNotiSettings() {
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
    noti = JSON.parse(sessionStorage.getItem("noti"));
    username = sessionStorage.getItem("loggedin");
    if (username) {
        noti.username = document.getElementById("notiCheck").checked
        sessionStorage.setItem("noti", JSON.stringify(noti));
    }
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