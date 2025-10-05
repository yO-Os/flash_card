<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once  __DIR__."/../../../src/models/Functions.php";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $isSignup = $data['isSignup'] ?? false;

    if ($isSignup) {
        $status = registerUser($name, $email, $password);
        header('Content-Type: application/json');
        echo json_encode($status);
        exit;
    } else {
        $user = authenticateUser($name, $password);
        $_SESSION['user_name'] = $name;
        header('Content-Type: application/json');
        echo json_encode($user);
        exit;
    }
}
?>