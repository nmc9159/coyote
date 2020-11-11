// Add libs
var mysql = require('mysql');
var https = require('http');
const fs = require('fs');
const crypto = require('crypto');

// MySQL stuff
let authFile = fs.readFileSync('auth.json');
let authData = JSON.parse(authFile);

var con = mysql.createConnection({
    host: "localhost",
    user: authData.user,
    password: authData.password,
    database: "mydb"
});

/*
connect to MySQL db
*/
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

/*
add a new user to the database
*/
function addUser(user, hash, salt, callback) {
    // check if user name exist already
    con.query("SELECT user FROM login", function (err, result, fields) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) {
            if (result[i].user == user) {
                return callback(false);
            }
        }
        let query = "INSERT INTO login (user, hash, salt) VALUES ('" + user + "', '" + hash + "', '" + salt + "')";
        con.query(query, function (err2, result2) {
            if (err2) throw err2;
        });
        return callback(true);
    });
}

/*
Check login credentials and assign token
*/
function loginUser(username, password, callback) {
    let query = "SELECT hash, salt FROM login WHERE user='" + username + "'";
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 1) {
            result = result[0];
            const sha256 = crypto.createHash('sha256');
            sha256.update(password + result.salt);
            hash = sha256.digest("hex");
            success = hash == result.hash;
            if (success) {
                token = crypto.randomBytes(120).toString('hex');
                let tokenQuery =  "UPDATE login SET stayToken='" + token + "' WHERE user='" + username + "'";
                con.query(tokenQuery, function (err, result) {
                    if (err) throw err;
                    
                });
            }
            return callback(success, token);
        } else {
            return callback("invalid username");
        }
    });
}

/* 
verify token
*/
function stayLoggedIn(username, token, callback) {
    let query = "SELECT stayToken FROM login WHERE user='" + username + "'";
    con.query(query, function (err, result) {
        if (err) throw err;
        if (result.length == 1) {
            result = result[0];
            if (result.stayToken == token) {
                return callback(true);
            } else {
                return callback("invalid token");
            }
        } else {
            return callback("invalid username");
        }
    });
}


// HTTP stuff

function getReqBody() {
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    });
    return body;
}

/*
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
*/

https.createServer(function (req, res) {
    if (req.url === '/favicon.ico') {
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': 'null', 'Access-Control-Allow-Headers': 'Content-Type'});
    if (req.headers["content-type"] == "application/json") {
        let body = {};
        req.on('data', (chunk) => {
            body = JSON.parse(chunk);
        }).on('end', async () => {
            if (body.type == "signup") {
                const sha256 = crypto.createHash('sha256');
                salt = crypto.randomBytes(120).toString('hex');
                sha256.update(body.password + salt);
                hash = sha256.digest("hex");
                addUser(body.username, hash, salt, result => {
                    if (result) {
                        res.write("success");
                    } else {
                        res.write("fail");
                    }
                    res.end();
                });
            } else if (body.type == "login") {
                loginUser(body.username, body.password, (result, token) => {
                    if (result == "invalid username") {
                        res.write(result);
                    } else if (result) {
                        res.write(token);
                    } else {
                        res.write("invalid password");
                    }
                    res.end();
                });
            } else if (body.type == "stayLoggedIn") {
                stayLoggedIn(body.username, body.token, result => {
                    if (result == "invalid username") {
                        res.write(result);
                    } else if (result == "invalid token") {
                        res.write(result);
                    } else {
                        res.write("logged in");
                        // eventually do something here to send content back 
                    }
                    res.end();
                });
            } else {
                res.end();
            }
        });
    } else {
        res.end();
    }
}).listen(8080);

// runs on keyboard interupt (closes down everything)
process.on( 'SIGINT', function() {
    console.log("Closing");
    con.end();
    process.exit( );
});