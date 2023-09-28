const express = require("express");
const mysql = require("mysql");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "/public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "studentdb",
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

const serve = (file) => {
    return path.join(__dirname, "public", file);
};

app.get("/", (req, res) => {
    res.sendFile(serve("index.html"));
});
app.get("/create", (req, res) => {
    res.sendFile(serve("create-demo.html"));
});
app.get("/read", (req, res) => {
    res.sendFile(serve("read-demo.html"));
});
app.get("/update", (req, res) => {
    res.sendFile(serve("update-demo.html"));
});
app.get("/delete", (req, res) => {
    res.sendFile(serve("delete-demo.html"));
});

app.post("/api/submit", (req, res) => {
    const { firstName, lastName, rollNo, department, division, email } =
        req.body;
    console.log(req.body);
    const insertQuery =
        "INSERT INTO students (firstName, lastName, rollNo, department, division, email) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
        insertQuery,
        [firstName, lastName, rollNo, department, division, email],
        (err, result) => {
            if (err) {
                res.send({
                    msg: "Roll no. already exists",
                });
                return;
            }
            console.log("Record inserted into MySQL database");
            res.header({ "Content-Type": "application/json" }).send({
                msg: "Submitted successfully",
            });
        }
    );
});
app.get("/api/getDetails", (req, res) => {
    const rollNo = req.query.rollNo;
    const selectQuery = "SELECT * FROM students WHERE rollNo = ?";
    db.query(selectQuery, [rollNo], (err, result) => {
        if (result.length == 0) {
            res.send({
                status: "failed",
                error: "Roll no. does not exist.",
            });
        } else {
            res.send({
                status: "success",
                details: result[0],
            });
        }
    });
    console.log(rollNo);
});
app.post("/api/updateDetails", (req, res) => {
    const { firstName, lastName, rollNo, department, division, email } =
        req.body;
    const updateQuery =
        "UPDATE students SET firstName = ?, lastName = ?, department = ?, division = ?, email = ? WHERE rollNo = ?";
    db.query(
        updateQuery,
        [firstName, lastName, department, division, email, rollNo],
        (err, result) => {
            if (err)
                res.send({
                    status: "failed",
                    error: err,
                });
            else
                res.send({
                    status: "success",
                });
        }
    );
});
app.post("/api/deleteRecord", (req, res) => {
    const { rollNumber: rollNo } = req.body;
    console.log(req.body);
    const deleteQuery = "DELETE FROM students WHERE rollNo = ?";
    db.query(deleteQuery, [rollNo], (err, result) => {
        if (err)
            res.send({
                status: "failed",
                error: err,
            });
        else {
            res.send({
                status: "success",
                deletedRollNo: rollNo,
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
