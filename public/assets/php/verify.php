<?php
require_once '../../../src/models/Functions.php';

if (!isset($_GET['code']) || !isset($_GET['id'])) {
    die("Invalid verification link");
}

$code = $_GET['code'];
$id = (int)$_GET['id'];

$stmt = $connection->prepare("CALL VerifyUser(?, ?, @result)");
$stmt->bind_param("is", $id, $code);
$stmt->execute();
$stmt->close();

$res = $connection->query("SELECT @result AS result");
$row = $res->fetch_assoc();

if ($row['result'] == 1) {
    echo "<h2>Email verified successfully!</h2>";
} else {
    echo "<h2>Invalid or expired verification link.</h2>";
}
?>
