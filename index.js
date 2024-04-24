const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static("public"));

// Array to store user data
let users = [];

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/home", async (req, res) => {
    let { username, password } = req.body;

    // Find user by username
    const user = users.find(u => u.name === username);

    try {
        // Validate the password using bcrypt
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send("User not signed in. Sign in to get started.");
        }
        
        // Check user role and render appropriate dashboard
        if (user.name === "kamlesh" && password === "202200836") {
            return res.render("admin-dashboard", { users });
        } else if (user.name === "manish" && password === "4518") {
            return res.render("manager-dashboard", { users });
        } else if (user.role === "admin") {
            return res.render("admin-dashboard", { users });
        } else if (user.role === "manager") {
            return res.render("manager-dashboard", { users });
        } else {
            return res.render("home");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the username already exists
        const existingUser = users.find(u => u.name === username);
        if (existingUser) {
            return res.status(400).send("Username already exists.");
        }
        
        // Validate password length
        if (password.length > 20) {
            return res.status(400).send("Password must not exceed 20 characters.");
        }

        // Check if username and password are the same
        if (username === password) {
            return res.status(400).send("Username and password cannot be the same.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        let role = "user"; // Default role is "user"
        // Set role as "admin" for specific username and password
        if (username === "kamlesh" && password === "202200836") {
            role = "admin";
        }
        // Set role as "manager" for specific username and password
        if (username === "manish" && password === "4518") {
            role = "manager";
        }

        // Add new user to the array
        users.push({ name: username, password: hashedPassword, role });

        res.status(201).send("User signed up successfully. Please log in.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Update existing route for updating user roles
app.post("/updateRole/:userId", async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
        const user = users.find(u => u.name === userId); // Find user by name
        if (!user) {
            return res.status(404).send("User not found.");
        }
        // Update user role
        user.role = role;
        
        // Redirect the user to the appropriate dashboard based on the updated role
        if (role === "admin") {
            res.redirect("/admin-dashboard");
        } else if (role === "manager") {
            res.redirect("/manager-dashboard");
        } else {
            res.redirect("/home");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
