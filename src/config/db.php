<?php
// Database configuration
$connection =  new mysqli("localhost", "root", "@Mary1621", "FLASHCARD");
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}   
?>