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

    // Query to fetch user data by username
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if a user with the given username exists
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $stored_password = $row["password"];

        // Verify the entered password against the stored hash
        if (password_verify($password, $stored_password)) {
            // Login successful! Redirect to the welcome page
            header("Location: welcome.html"); // Replace with the actual welcome HTML page URL
            exit(); // Terminate script execution after the redirection
        } else {
            echo "Login failed. Please check your credentials.";
        }
    } else {
        echo "Login failed. User not found.";
    }

    // Close the database connection
    $stmt->close();
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css"> <!-- Reuse the CSS from your registration page -->
    <title>Login Page</title>
</head>
<body>
    <header>
        <div class="container">
            <img src="images/logo.png" alt="" width="200">
        </div>
    </header>

    <nav>
        <ul>
            <li><a href="explore.html" id="explore">Explore</a></li>
            <li><a href="groups.html" id="groups">Groups</a></li>
            <li><a href="inbox.html" id="inbox">Inbox</a></li>
            <li><a href="info.html" id="info">Info</a></li>
        </ul>
    </nav>

    <main>
        <h2>Login to Your Account</h2>
        <form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <input type="submit" value="Login">
        </form>
        
        <p>Don't have an account? <a href="register.html">Register</a></p>
    </main>

    <script src="script.js"></script>
</body>
</html>
