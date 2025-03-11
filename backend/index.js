import express from "express"
import mysql from "mysql"
import path from "path"
import bodyParser from "body-parser"
import ejs from "ejs"
import session from "express-session";

const __dirname = path.resolve()
const app = express()

// path for images
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, '../CSS')));

app.use(express.static("./node_modules/bootstrap/dist/css"));
// Middleware for parsing forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files like CSS, JS
app.use(express.static('CSS'));
app.engine("html", ejs.renderFile);
app.set("view engine", "html");

// Configure session middleware
app.use(session({
    secret: 'fit2101',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host:
    user:
    password:
    database: 
})

// Function checks to see if user is authenticated and has logged in
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/'); // Redirect to login if not authenticated
}

// Function checks to see if user is authenticated and is an admin 
function isAdmin(req, res, next) {
    if (req.session.isAuthenticated && req.session.isAdmin) {
        return next();
    }
    // returns this message if they are not admin and are trying to access admin only pages
    res.status(403).send("Access denied: Admins only");
}

///// DASHBOARD LOGIN INFORMATION /////
// data for testing:
// email: 'user@example.com',
// password: 'password123',
app.get('/dashboard', isAuthenticated, (req, res) => {
    //sql query to get the number of completed task
    const queryTasks = "SELECT COUNT(*) AS completedTasks FROM TASK WHERE task_status = 'Completed'";
    // Query to get all sprints
    const querySprints = "SELECT * FROM SPRINT";

    db.query(queryTasks, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Error fetching completed tasks count');
        }

        const completedTasksCount = result[0].completedTasks;


        db.query(querySprints, (err, sprints) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Error fetching sprints');
            }

            // Render the dashboard page with sprint data
            res.render("dashboard.html", {
                isAdmin: req.session.isAdmin,
                isTeamMember: req.session.isTeamMember,
                user_name: req.session.user_name,
                completedTasksCount: completedTasksCount,
                sprints: sprints
            });
        });
    });
});

app.post('/dashboard', (req, res) => {
    const { email, password } = req.body;

    const userQuery = "SELECT * FROM USER WHERE user_email = ?";
    db.query(userQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error logging in");
        }

        if (results.length == 0) {
            return res.sendFile(path.join(__dirname, './views/login-error.html'));
        }

        const user = results[0];
        //checks if the user enter password matches the password in the database
        if (user.user_password === password) {
            // Set session variables
            req.session.user_no = user.user_no;
            //if password matches set authenticated to true
            req.session.isAuthenticated = true;
            //sets the session user type based on the information entered
            req.session.isAdmin = user.user_type === 'Admin';
            req.session.isTeamMember = user.user_type === 'Team Member';
            //stores the user's name to be displayed beside the welcome message
            req.session.user_name = user.user_name;
            //brings users to the dashboard
            res.redirect('/dashboard');
        } else {
            // otherwise redirect to a error file
            return res.sendFile(path.join(__dirname, './views/login-error.html'));
        }
    });
});

app.listen(3000, () => {
    console.log("Connected to backend!")
})

//// LOGIN PAGE /////
app.get("/", (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname, "./views/login.html"))
})

app.post('/', (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM USER WHERE email = ?";

    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).send("Error accessing the database.");
        if (results.length === 0) return res.status(401).send("Invalid email or password.");

        const user = results[0];

        res.status(401).send("Invalid email or password.");
    });
});

////LOG OUT /////
//destroys the session after logging out to prevent users from changing the url and reentering the system
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        //clears https cookies 
        res.clearCookie('connect.sid'); 
        //redirects user back to the login screen
        res.redirect('/');
    });
});

///PRODUCT BACKLOG ////
app.get('/product', isAuthenticated, (req, res) => {
    const searchTerm = req.query.search || '';
    const searchQuery = `%${searchTerm}%`;

    // Query for tasks based on the search term
    const taskQuery = "SELECT * FROM TASK WHERE task_name LIKE ? ORDER BY task_priority";
    db.query(taskQuery, [searchQuery], (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send("Error fetching tasks");
        }

        // Query for users
        const userQuery = "SELECT user_name FROM USER";
        db.query(userQuery, (err, users) => {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).send("Error fetching users");
            }

            // Query for sprints
            const sprintQuery = "SELECT sprint_no FROM SPRINT";
            db.query(sprintQuery, (err, sprints) => {
                if (err) {
                    console.error('Error fetching sprints:', err);
                    return res.status(500).send("Error fetching sprints");
                }

                // Render the product page with all the data
                res.render("product.html", { records: tasks, users, sprints });
            });
        });
    });
});

//add task to the product backlog
app.get('/tasks/add_task', (req, res) => {
    const userQuery = "SELECT user_name FROM USER";
    const sprintQuery = "SELECT sprint_no FROM SPRINT"
    db.query(userQuery, (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching users");
        }
        db.query(sprintQuery, (err, sprints) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching sprints");
            }
            res.render("add_task_view.html", { users, sprints });
        });
    });
});

app.get('/sprints/add_sprint', (req, res) => {
    const userQuery = "SELECT user_name FROM USER";
    const sprintQuery = "SELECT sprint_no FROM SPRINT"
    db.query(userQuery, (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching users");
        }
        db.query(sprintQuery, (err, sprints) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching sprints");
            }
            res.render("add_sprint_view.html", { users, sprints });
        });
    });
});


app.get('/tasks/details', (req, res) => {
    const userQuery = "SELECT * FROM TASK WHERE task_no = ?"
    const taskId = req.query.id;
    db.query(userQuery, [taskId], (err, tasks) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error collecting task");
        }
        if (tasks.length> 0) {
            res.json(tasks[0]);
        } else {
            res.status(404).json({error: "Task not found"});
        }
    });
})

//insert tasks into the database
app.post('/submit_task', (req, res) => {
    //creating task objects
    const newTask = {
        task_name: req.body.task_name,
        task_type: req.body.task_type,
        task_assignee: req.body.task_assignee,
        task_desc: req.body.task_desc,
        task_date: req.body.task_date,
        task_status: req.body.task_status,
        task_priority: req.body.task_priority,
        task_storypoint: req.body.task_storypoint,
        sprint_no: req.body.sprint_no,
        log_hours: req.body.log_hours
    };

    const query = "INSERT INTO TASK (task_name, task_type, task_assignee, task_desc, task_date, task_status, task_priority, task_storypoint, sprint_no, log_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

    db.query(query, [newTask.task_name,
    newTask.task_type,
    newTask.task_assignee,
    newTask.task_desc,
    newTask.task_date,
    newTask.task_status,
    newTask.task_priority,
    newTask.task_storypoint,
    newTask.sprint_no,
    newTask.log_hours], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error inserting task");
        }
        //after tasks are successfully added redirects users to the product table
        res.redirect('/product');
    });
});

app.post("/submit_sprint", (req, res) => {
    const newSprint = {
        sprint_no: req.body.sprint_no,
        sprint_name: req.body.sprint_name,
        sprint_goal: req.body.sprint_goal,
        sprint_start: req.body.sprint_start,
        sprint_end: req.body.sprint_end,
        sprint_status: req.body.sprint_status,
    };
    const query = "INSERT INTO SPRINT (sprint_no, sprint_name, sprint_goal, sprint_start, sprint_end, sprint_status) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(query, [newSprint.sprint_no, newSprint.sprint_name, newSprint.sprint_goal, newSprint.sprint_start, newSprint.sprint_end, newSprint.sprint_status], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error inserting sprint");
        }
        res.redirect('/sprint_board');
    }
    );
});

app.post("/delete_task", (req, res) => {
    //delete task based on the task number 
    const task_no = req.body.task_no;
    //sql query to delete task from the task table
    const query = "DELETE FROM TASK WHERE task_no = ?";
    //execute delete query
    db.query(query, [task_no], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting task");
        }
        //after tasks are successfully deleted redirects users to the product table
        res.redirect("/product");
    });
});

//get task to update in the product backlog
app.get('/tasks/update_task', (req, res) => {
    //get the task number 
    const task_no = req.query.id;
    //sql to get task based on task_no
    const taskQuery = "SELECT * FROM TASK WHERE task_no = ?";
    //sql query to get user from user table
    const userQuery = "SELECT * FROM USER";

    // Execute the task query to fetch the specific task details.
    db.query(taskQuery, [task_no], (err, taskResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching task");
        }
        // Check if the task was found based on the task number.
        if (taskResult.length === 0) {
            return res.status(404).send("Task not found");
        }

        db.query(userQuery, (err, userResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching users");
            }

            console.log('Task Result:', taskResult[0]);
            console.log('User Results:', userResults);
            // The task details will populate the task update form
            res.render("update_task_view.html", { task: taskResult[0], users: userResults });
        });
    });
});

//update the task in the product backlog 
app.post('/tasks/update_task', (req, res) => {
    const task_no = req.body.task_no;
    const updatedTask = {
        task_name: req.body.task_name,
        task_type: req.body.task_type,
        task_assignee: req.body.task_assignee,
        task_desc: req.body.task_desc,
        task_date: req.body.task_date,
        task_status: req.body.task_status,
        task_priority: req.body.task_priority,
        task_storypoint: req.body.task_storypoint,
        sprint_no: req.body.sprint_no,
        log_hours: req.body.log_hours

    };

    const query = "UPDATE TASK SET task_name = ?, task_type = ?, task_assignee = ?, task_desc = ?, task_date = ?, task_status = ?, task_priority = ?, task_storypoint = ?, sprint_no = ?,log_hours = ? WHERE task_no = ?";

    db.query(query, [updatedTask.task_name,
    updatedTask.task_type,
    updatedTask.task_assignee,
    updatedTask.task_desc,
    updatedTask.task_date,
    updatedTask.task_status,
    updatedTask.task_priority,
    updatedTask.task_storypoint,
    updatedTask.sprint_no,
    updatedTask.log_hours,
        task_no], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating task");
            }
            // if update is successful it will redirect user back to the product backlog page
            res.redirect('/product');
        });
});

//Completed task counter
app.get('/completed_tasks', (req, res) => {
    //sql query to count the number of tasks with a completed status
    const query = "SELECT COUNT(*) AS completedTasks FROM TASK WHERE task_status = 'Completed'";

    db.query(query, (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Error fetching completed tasks count');
        }

        const completedTasksCount = result[0].completedTasks;
        res.json({ completedTasksCount });
    });
});


/// SPRINT BOARD ///
// Sprint board page
app.get("/sprint_board", isAuthenticated, (req, res) => {
    //sql query to select all tasks with the status "To Do"
    const todoQuery = "SELECT * FROM TASK WHERE task_status = 'To Do'";
    //sql query to select all tasks with the status "In Progress"
    const inProgressQuery = "SELECT * FROM TASK WHERE task_status = 'In Progress'";
    //sql query to select all tasks with the status "Completed"
    const completedQuery = "SELECT * FROM TASK WHERE task_status = 'Completed'";
    //sql query to select all sprint numbers in the sprint table
    const sprintQuery = "SELECT sprint_no FROM SPRINT";

    let todoTasks = [];
    let inProgressTasks = [];
    let completedTasks = [];
    let sprint = [];

    db.query(todoQuery, (err, todoResults) => {
        if (err) throw err;
        todoTasks = todoResults;


        db.query(inProgressQuery, (err, inProgressResults) => {
            if (err) throw err;
            inProgressTasks = inProgressResults;


            db.query(completedQuery, (err, completedResults) => {
                if (err) throw err;
                completedTasks = completedResults;


                db.query(sprintQuery, (err, sprints) => {
                    if (err) throw err;
                    sprint = sprints;

                    //render the sprintboard with the data from arrays
                    res.render('sprint_board', {
                        todoTasks,
                        inProgressTasks,
                        completedTasks,
                        sprints
                    });
                });
            });
        });
    });
});

app.post('/update_task_status', (req, res) => {
    const updatedTasks = req.body;
    console.log("Task received for update:", updatedTasks);

    if (Array.isArray(updatedTasks) && updatedTasks.length > 0) {
        let updatePromises = updatedTasks.map(task => {
            return new Promise((resolve, reject) => {
                let query, values;
                if (task.task_status === 'Completed' && task.task_date) {
                    query = "UPDATE TASK SET task_status = ?, task_date = ? WHERE task_no = ?";
                    values = [task.task_status, task.task_date, task.task_no];
                } else {
                    query = "UPDATE TASK SET task_status = ? WHERE task_no = ?";
                    values = [task.task_status, task.task_no];
                }

                // Execute the query
                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error("Error updating task:", err);
                        return reject(err);
                    }
                    console.log("Updated task:", task);
                    resolve(result);
                });
            });
        });

        Promise.all(updatePromises)
            .then(() => {
                res.sendStatus(200);
            })
            .catch((err) => {
                res.status(500).send("Error updating the task");
            });
    } else {
        console.error("Error");
        res.status(400).send("Error");
    }
});

// SPRINT VIEW
app.post('/update_sprint', (req, res) => {
    const { sprint_no, sprint_name, start_date, end_date, sprint_goal } = req.body;
    let sprint = sprints.find(s => s.sprint_no === sprint_no);
    if (sprint) {
        sprint.sprint_name = sprint_name;
        sprint.start_date = start_date;
        sprint.end_date = end_date;
        sprint.sprint_goal = sprint_goal;

        res.status(200).json({ message: 'Sprint updated successfully' });
    } else {
        res.status(404).json({ message: 'Sprint not found' });
    }
});


///// USER VIEW /////
app.get("/users", isAuthenticated, isAdmin, (req, res) => {
    const searchTerm = req.query.search || '';
    const searchQuery = `%${searchTerm}%`;

    const action = req.query.action;

    if (action === 'add') {
        res.sendFile(path.join(__dirname, './views/add_user_view.html'));
    } else {
        // SQL query to filter users based on the search term
        const q = "SELECT * FROM USER WHERE user_name LIKE ?";
        db.query(q, [searchQuery], (err, users) => {
            if (err) {
                return res.json(err);
            } else {
                res.render("user_view.html", { records: users });
            }
        });
    }
});

app.get('/users/details', (req, res) => {
    const userQuery = "SELECT * FROM USER WHERE user_no = ?"
    const userId = req.query.id;
    db.query(userQuery, [userId], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error collecting user");
        }
        if (users.length > 0) {
            res.json(users[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

//Adds new users to the database
app.post("/add_user", (req, res) => {
    const newUser = {
        user_name: req.body.user_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        user_type: req.body.user_type,
    };

    //sql query insert user data into user table
    const query = "INSERT INTO USER (user_name, user_email, user_password, user_type) VALUES (?, ?, ?, ?)";
    //execute the query
    db.query(query, [newUser.user_name, newUser.user_email, newUser.user_password, newUser.user_type], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error adding user");
        }
        //redirect user to the user page if inserting into database was successful
        res.redirect("/users");
    });
});

app.post("/add_sprint", (req, res) => {
    const newSprint = {
        sprint_no: req.body.sprint_no,
        sprint_name: req.body.sprint_name,
        sprint_goal: req.body.sprint_goal,
        sprint_start: req.body.sprint_start,
        sprint_end: req.body.sprint_end,
        sprint_status: req.body.sprint_status,
    };

    const query = "INSERT INTO SPRINT (sprint_no, sprint_name, sprint_goal, sprint_start, sprint_end, sprint_status) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(query, [newSprint.sprint_no, newSprint.sprint_name, newSprint.sprint_goal, newSprint.sprint_start, newSprint.sprint_end, newSprint.sprint_status], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error adding sprint");
        }
        res.redirect("/sprint_board");
    });
});

//Delete users from the database
app.post("/delete_user", (req, res) => {
    const user_no = req.body.user_no;
    //sql query deleted user from the user table
    const query = "DELETE FROM USER WHERE user_no = ?";
    //execute the query
    db.query(query, [user_no], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error deleting user");
        }
        //redirect user to the user page if deleting user from database was successful
        res.redirect("/users");
    });
});

//Define route to get request to update user table
app.get('/user/update_user', (req, res) => {
    //get the user_no
    const user_no = req.query.id;
    // SQL query to select a user based on their nser_no
    const userQuery = "SELECT * FROM USER WHERE user_no = ?";
    //execute the query
    db.query(userQuery, [user_no], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching user");
        }

        // If no user is found with the given user_no return an error message "user not found"
        if (userResults.length === 0) {
            return res.status(404).send("User not found");
        }
        //If the user is found, render the "update_user_view" form with the user's details
        res.render("update_user_view", { user: userResults[0] });
    });
});

//Updates user details 
app.post('/user/update_user', (req, res) => {
    const user_no = req.body.user_no;
    const updatedUser = {
        user_name: req.body.user_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
        user_type: req.body.user_type,
    };

    //sql query sets the new values for user table where the user_no matches the given user_no
    const query = "UPDATE USER SET user_name = ?, user_email = ?, user_password = ?, user_type = ? WHERE user_no = ?";
    //execute the query
    db.query(query, [
        updatedUser.user_name,
        updatedUser.user_email,
        updatedUser.user_password,
        updatedUser.user_type,
        user_no], (err, result) => {
            if (err) {
                console.error(err);
                //returns this error message if the user_no does not match and is unable to update the user table
                return res.status(500).send("Error updating user");
            }
            //if the update is sucessful redirect user to the user table view
            res.redirect("/users");
        });
});

/// BURNDOWN ///
//route to burndown chart
app.post("/burndown", isAuthenticated, (req, res) => {
    let { todoTasks, inProgressTasks, completedTasks, sprints, selectedSprint } = req.body;

    todoTasks = JSON.parse(todoTasks);
    inProgressTasks = JSON.parse(inProgressTasks);
    completedTasks = JSON.parse(completedTasks);

    const allTasks = todoTasks.concat(inProgressTasks, completedTasks);

    // Compute total story points for the sprint
    let totalStoryPoints = 0;
    allTasks.forEach(task => {
        if (task.sprint_no == selectedSprint) {
            totalStoryPoints += task.task_storypoint;
        }
    });

    function getDataPoints(tasks, selectedSprint) {
        // Filter tasks by sprint_no
        let filteredTasks = tasks.filter(task => task.sprint_no == selectedSprint);

        // Group tasks by date and sum their story points
        let tasksByDate = {};
        filteredTasks.forEach(task => {
            let taskDate = new Date(task.task_date).toLocaleDateString('en-AU', {
                timeZone: 'Australia/Sydney',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            if (!tasksByDate[taskDate]) {
                tasksByDate[taskDate] = 0;
            }

            tasksByDate[taskDate] += task.task_storypoint;
        });

        // Convert tasksByDate into a sorted array of { date, storypoint } objects
        let sortedData = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b)).map(date => ({
            date: date,
            storypoint: tasksByDate[date]
        }));

        // Calculate the cumulative story points
        let cumulativeStoryPoints = totalStoryPoints;
        return sortedData.map(entry => {
            cumulativeStoryPoints -= entry.storypoint; // Subtract the sum of story points for that day

            return {
                date: entry.date, // Formatted date
                storypoint: cumulativeStoryPoints // Remaining story points
            };
        });
    }

    const dataPoints = getDataPoints(completedTasks, selectedSprint);

    const sprintsQuery = "SELECT sprint_start, sprint_end FROM SPRINT WHERE sprint_no = ?";

    db.query(sprintsQuery, [selectedSprint], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return;
        }
        let startDate = new Date(results[0].sprint_start);
        let endDate = new Date(results[0].sprint_end);

        const sprintDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // milliseconds to days

        const formattedStartDate = startDate.toLocaleDateString('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const formattedEndDate = endDate.toLocaleDateString('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        console.log(formattedStartDate);
        console.log(sprintDuration);

        // Ideal Burndown Rate (Story points to be burned per day)
        const idealBurndownRate = totalStoryPoints / sprintDuration;

        console.log(idealBurndownRate)

        // Generate ideal burndown data points
        let idealDataPoints = [];
        let currentDate = new Date(startDate);
        let remainingStoryPoints = totalStoryPoints;

        while (currentDate <= endDate) {
            idealDataPoints.push({
                date: currentDate.toLocaleDateString('en-AU', {
                    timeZone: 'Australia/Sydney',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                storypoint: remainingStoryPoints
            });

            remainingStoryPoints -= idealBurndownRate;  // Subtract the ideal rate per day
            currentDate.setDate(currentDate.getDate() + 1);  // Move to the next day
        }

        console.log(idealDataPoints)

        // Render the burndown chart view and pass all necessary data
        res.render("burndown.html", {
            dataPoints: JSON.stringify(dataPoints),  // Actual burndown data
            idealDataPoints: JSON.stringify(idealDataPoints),  // Ideal burndown data
            selectedSprint,
            totalStoryPoints,
            formattedStartDate,
            formattedEndDate
        });
    });
});


//// SETTINGS //// 
//updating the team members email and password after login in to the dashboard
app.get("/settings", isAuthenticated, (req, res) => {
    //stores the user_no in that session
    const user_no = req.session.user_no;
    // SQL query to select a user based on their user_no
    const userQuery = "SELECT * FROM USER WHERE user_no = ?";

    db.query(userQuery, [user_no], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching user");
        }
        // If no user is found with the given user_no return an error message "user not found"
        if (userResults.length === 0) {
            return res.status(404).send("User not found");
        }
        //if user is found render the settings form
        res.render("settings", { user: userResults[0] });
    });
});

//updating the team members email and password after login in to the dashboard
app.post("/settings/update", isAuthenticated, (req, res) => {
    //stores the user_no in that session
    const user_no = req.session.user_no;
    const updatedUser = {
        user_email: req.body.user_email,
        user_password: req.body.user_password,
    };
    //sql query to update the user email and password 
    const updateQuery = "UPDATE USER SET user_email = ?, user_password = ? WHERE user_no = ?";
    //execute the query
    db.query(updateQuery, [
        updatedUser.user_email,
        updatedUser.user_password,
        user_no], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error updating user");
            }
            res.redirect('/dashboard');
        });
});

// SPRINT VIEW
app.post('/update_sprint', (req, res) => {
    const { sprint_no, sprint_name, start_date, end_date, sprint_goal } = req.body;
    let sprint = sprints.find(s => s.sprint_no === sprint_no);
    if (sprint) {
        sprint.sprint_name = sprint_name;
        sprint.start_date = start_date;
        sprint.end_date = end_date;
        sprint.sprint_goal = sprint_goal;

        res.status(200).json({ message: 'Sprint updated successfully' });
    } else {
        res.status(404).json({ message: 'Sprint not found' });
    }
});
