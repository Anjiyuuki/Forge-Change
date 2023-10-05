<?php
// Database connection details
$host = 'your_database_host';
$user = 'your_database_username';
$pass = 'your_database_password';
$db   = 'your_database_name';

// Create a database connection
$mysqli = new mysqli($host, $user, $pass, $db);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve username and password from the form
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Perform a SQL query to check if the credentials are valid
    $query = "SELECT * FROM users WHERE username = ? AND password = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    // If a matching record is found, the login is successful
    if ($result->num_rows == 1) {
        session_start();
        $_SESSION['username'] = $username;
        // Redirect to a secure page or display a welcome message
        header('Location: welcome.php');
        exit();
    } else {
        // Display an error message for invalid credentials
        $error_message = "Invalid username or password";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login Page</title>
</head>
<body>
    <h2>Login</h2>
    <?php if (isset($error_message)) echo "<p>$error_message</p>"; ?>
    <form method="POST" action="">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br><br>
        <input type="submit" value="Login">
    </form>
</body>
</html>
