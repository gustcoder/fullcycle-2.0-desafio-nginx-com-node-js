const express = require('express')
const app = express()
const port = 3000

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
const rndInt = randomIntFromInterval(1, 100)

function queryNames(query) {
    const [names] = connection.query(query);
    
    return names;    
}

const mysql = require('mysql')

const connection = mysql.createConnection(config)

connection.query('USE information_schema')

function checkIfTablePeopleExists(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, function (err, results, fields) {
            if(err) reject(err);
            
            resolve(results);
        });        
    });
}

function createTablePeople(sql) {
    return new Promise((resolve, reject) => {
        connection.query('USE nodedb')
        connection.query(sql, function (err, results, fields) {
            if(err) reject(err);
            
            resolve(results);
        });
    });    
}
        
let names = []

async function checkAndCreateTablePeopleIfNeeded() {
    try {
        sql = "SELECT table_name FROM tables WHERE table_name = 'people';"
        const result = await checkIfTablePeopleExists(sql);
        if (result.length == 0) { 
            const sqlCreateTablePeople = 'CREATE TABLE people (id int not null auto_increment, name varchar(255), primary key(id));'
            await createTablePeople(sqlCreateTablePeople)
            console.log(':: Table people created ::')
        }

        connection.query('USE nodedb')
        const sqlInsertName = `INSERT INTO people (name) VALUES ('Aluno ${rndInt}');`
        connection.query(sqlInsertName)
        console.log(':: User registered successfully ::')
        
        connection.query('SELECT name FROM people ORDER BY name;', function (err, result, fields) {
            if (err) throw err;
            
            names = result
        });

        connection.end()
    } catch (err) {
        console.error('Error', err);
    }    
}

checkAndCreateTablePeopleIfNeeded()

app.get('/', (req, res) => {
    let tableLines = ''
    for (i=0; i < names.length;i++) {
        tableLines += `<tr><td>${names[i].name}</td></tr>`
    }

    const style = `
        table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }
        
        td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
        
        tr:nth-child(even) {
            background-color: #dddddd;
        }    
    `

    const html = `
        <!DOCTYPE html>
        <html>
            <head>
            <style>
                ${style}
            </style>
            </head>
            <body>
                <h1>Full Cycle Rocks!</h1>
                <table>
                    <tr>
                        <th>Name</th>
                    </tr>
                    ${tableLines}
                </table>
            </body>
        </html>
    `
    res.send(html)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
})

