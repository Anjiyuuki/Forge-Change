<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>User Registration</title>
</head>
<body>
    <h2>Register a New User</h2>
    
    <?php
    // Check if the form is submitted
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Database connection details
        $db_host = "your_db_host";
        $db_username = "your_db_username";
        $db_password = "your_db_password";
        $db_name = "forgechange";

        // Create a database connection
        $conn = new mysqli($db_host, $db_username, $db_password, $db_name);

        // Check for connection errors
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Get user input
        $username = $_POST["username"];
        $password = $_POST["password"];

        // Hash the password (for security)
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert user data into the database
        $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $hashed_password);

        if ($stmt->execute()) {
            echo "Registration successful! <a href='login.php'>Login</a>";
        } else {
            echo "Registration failed. Please try again.";
        }

        // Close the database connection
        $stmt->close();
        $conn->close();
    }
    ?>

    <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
        <label for="username">Username:</label>
        <input type="text" name="username" required><br>
        
        <label for="password">Password:</label>
        <input type="password" name="password" required><br>

        <input type="submit" value="Register">
    </form>
</body>
</html>
