const http = require('http');
const fs = require('fs');
const path = require('path');


const usersFilePath = path.join(__dirname, 'users.json');


const readUsersFile = (callback) => {
    fs.readFile(usersFilePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const users = JSON.parse(data);
            callback(null, users);
        } catch (err) {
            callback(err);
        }
    });
};

const writeUsersFile = (users, callback) => {
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err) return callback(err);
        callback(null);
    });
};


const renderForm = () => `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                width: 300px;
            }
            h1 {
                text-align: center;
                color: #333;
            }
            form {
                display: flex;
                flex-direction: column;
            }
            input[type="text"] {
                padding: 10px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 16px;
            }
            button {
                padding: 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            button:hover {
                background-color: #45a049;
            }
            a {
                display: block;
                text-align: center;
                margin-top: 20px;
                color: #333;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Foydalanuvchi Qo'shish</h1>
            <form action="/users" method="POST">
                <input type="text" name="firstname" placeholder="Ism" required/>
                <input type="text" name="lastname" placeholder="Familiya" required/>
                <button type="submit">Qo'shish</button>
            </form>
        </div>
    </body>
    </html>
`;

const renderUsersTable = (users) => `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                min-height: 100vh;
            }
            table {
                width: 50%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #4CAF50;
                color: white;
            }
            tr:hover {
                background-color: #f5f5f5;
            }
            a {
                color: #333;
                text-decoration: none;
                margin-top: 20px;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <h1>Foydalanuvchilar Ro'yxati</h1>
        <table>
            <tr>
                <th>Ism</th>
                <th>Familiya</th>
            </tr>
            ${users.map(user => `
                <tr>
                    <td>${user.firstname}</td>
                    <td>${user.lastname}</td>
                </tr>
            `).join('')}
        </table>
        <a href="/">Ortga qaytish</a>
    </body>
    </html>
`;


const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderForm());
    } else if (req.method === 'POST' && req.url === '/users') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const params = new URLSearchParams(body);
            const firstname = params.get('firstname');
            const lastname = params.get('lastname');

            if (firstname && lastname) {
                readUsersFile((err, users) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Server xatosi');
                        return;
                    }

                    users.push({ firstname, lastname });

                    writeUsersFile(users, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Server xatosi');
                            return;
                        }

                        res.writeHead(302, { 'Location': '/users' });
                        res.end();
                    });
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Ism va familiya kiritilishi shart');
            }
        });
    } else if (req.method === 'GET' && req.url === '/users') {
        readUsersFile((err, users) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server xatosi');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(renderUsersTable(users));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Sahifa topilmadi');
    }
});


server.listen(3000, () => {
    console.log('Server 3000 portda ishga tushdi');
});
