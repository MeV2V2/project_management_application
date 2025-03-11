const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

let tasks = [];
// Middleware for parsing forms
app.use(bodyParser.urlencoded({ extended: true }));

// path for images
app.use('/images', express.static(path.join(__dirname, 'images')));


// Serve static files like CSS, JS
app.use(express.static('CSS'));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
// Routes
app.get('/', (req, res) => {
    res.render('view_task_view', { records: tasks });
});

app.get('/add_task_view', (req, res) => {
    res.render('add_task_view');
});

// Route to handle form submission and add a new task
app.post('/submit', (req, res) => {
    const newTask = req.body;
    tasks.push(newTask);  // Store the task in the mock database
    res.redirect('/view_task_view');  // Redirect to view_task page after adding
});

// Route to view tasks
app.get('/view_task_view', (req, res) => {
    res.render('view_task_view', { records: tasks });
});

app.post("/delete_all_post", (req, res) => {
    const taskName = req.body.task_name;
    const taskIndex = tasks.findIndex(task => task.taskName === taskName);
    tasks.splice(taskIndex, 1);
    res.redirect("/view_task_view");
});

///// LOGIN /////
// data for testing
const user = {
    email: 'user@example.com',
    password: 'password123',
};
// it has to be the main route / 
app.get('/login', (req, res) => {
    res.render('login', { loggedIn: false, email: '' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === user.email && password === user.password) {
        res.render('dashboard', { loggedIn: true, email });
    } else {
        res.render('login', { loggedIn: false, email: '', error: 'Invalid credentials. Please try again.' });
    }
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { loggedIn: true, email: user.email });
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

