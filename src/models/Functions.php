<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once  __DIR__."/../config/db.php";


function addDecks( $deckName, $deckDescription) {
        global $connection;

        $stmt = $connection->prepare("call AddDeck (?, ?, ?, @pResult,@pDeckId)");
        $stmt->bind_param("iss", $_SESSION['id'], $deckName, $deckDescription);
        $stmt->execute();
        $stmt->close();

        $res = $connection->query("SELECT @pResult AS result, @pDeckId AS deckId");
        $row = $res->fetch_assoc();

        return [
            "success" => $row['result'] == 1,
            "id" => (int)$row['deckId']
        ];
    }

function getAllDecks() {
        global $connection;
        $stmt = $connection->prepare("CALL GetDeck(?)");

        $stmt->bind_param("i",$_SESSION['id'] );
        $stmt->execute();
        $result = $stmt->get_result();
        $decks = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        while ($connection->more_results() && $connection->next_result())       {}
        return $decks ?: [];
}

function getDeckById($deckId) {
    global $connection;

    $stmt = $connection->prepare("CALL GetDeckById(?)");
    if (!$stmt) die("Prepare failed: " . $connection->error);

    $stmt->bind_param("i", $deckId);
    $stmt->execute();

    $result = $stmt->get_result();
    $deck = $result ? $result->fetch_assoc() : [];
    if ($result) $result->free();

    $stmt->close();

    while ($connection->more_results() && $connection->next_result()) {}
    return $deck ?: [];
}

function editDeck($deckId, $title, $description) {
    global $connection;

    $stmt = $connection->prepare("CALL EditDeck(?, ?, ?, @result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("iss", $deckId, $title, $description);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        return ["success" => $row['result'] == 1,"error" => "No deck updated (either not found or no new changes)","id"=>$deckId];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}

function deleteDeck($deckId) {
    global $connection;

    $stmt = $connection->prepare("CALL DeleteDeck(?, @result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("i", $deckId);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        return ["success" => $row['result'] == 1,"error" => "No deck deleted (either not found or already deleted)"];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}

function GetAllCardsInDeck($deckId) {
    global $connection;

    $data=[];
    $stmt = $connection->prepare("CALL GetCards(?)");
    $stmt->bind_param("i", $deckId);
    $stmt->execute();

    $result = $stmt->get_result();
    if (!$result) {
        $stmt->close();
        while ($connection->more_results() && $connection->next_result()) {}
        return [];
    }

    $cards = $result->fetch_all(MYSQLI_ASSOC);
    $result->free();
    $stmt->close();

    $data['Title'] = getDeckById($deckId)['Title'] ?? 'Untitled';
    $data['Description'] = getDeckById($deckId)['Description'] ?? '';
    $data['cards'] = $cards ?: [];

    while ($connection->more_results() && $connection->next_result()) {}
    return $data ?: [];
}

function addCardToDeck($deckId, $front, $back) {
    global $connection;

    $stmt = $connection->prepare("CALL AddCard(?, ?, ?, @result,@CardId)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("iss", $deckId, $front, $back);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        return ["success" => $row['result'] == 1, "CardId" => $row['CardId'] ?? null];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}

function deleteCard($cardId) {
    global $connection;

    $stmt = $connection->prepare("CALL DelteCard(?, @result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("i", $cardId);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        return ["success" => $row['result'] == 1,"error" => "Failed to retrieve result"];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}

function updateCard($cardId, $front, $back) {
    global $connection;

    $stmt = $connection->prepare("CALL EditCard(?, ?, ?, @result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("iss", $cardId, $front, $back);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        return ["success" => $row['result'] == 1,"error" => "No card updated (either not found or no new changes)"];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}
function registerUser($name, $email, $password) {
    global $connection;

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $connection->prepare("CALL AddUser(?, ?, ?,  @userId,@result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("sss", $name, $email, $hashedPassword);

    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => 4, "error" => $stmt->error];
    }
    $stmt->close();

    while ($connection->more_results() && $connection->next_result()) {;}

    $res = $connection->query("SELECT @result AS result, @userId AS userId");

    if ($res) {
        
        $row = $res->fetch_assoc();
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['id'] = (int)$row['userId'];
            $verify=sendVerficationCode((int)$row['userId']);
            if ($verify['success']) {
                $code = $verify['code'];
                $userId = (int)$row['userId'];
                $verifyLink = "http://localhost:8000/public/assets/php/verify.php?code=$code&id=$userId";

                ini_set("SMTP", "localhost");
                ini_set("smtp_port", "1025");
                ini_set("sendmail_from", "no-reply@flashcard.local");

                $subject = "Verify your FlashCard account";
                $message = "
                <h2>Welcome, $name!</h2>
                <p>Click below to verify your email:</p>
                <a href='$verifyLink'>Verify Account</a>
                ";

                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-type:text/html; charset=UTF-8\r\n";
                $headers .= "From: FlashCard <no-reply@flashcard.local>\r\n";


                mail($email, $subject, $message, $headers);
        }
        return [
            "success" => $row['result'],
            "id" => (int)$row['userId'],"code"=>$verify['code']
        ];
    } else {
        return ["success" => 4, "error" => "Failed to retrieve result"];
    }
}

function authenticateUser($user, $password) {
    global $connection;

    $stmt = $connection->prepare("CALL CheckUser(?,@password_hashIn,@userId,@result)");
    if (!$stmt) {
        return null;
    }

    $stmt->bind_param("s", $user);
    if (!$stmt->execute()) {
        $stmt->close();
        return null;
    }

    $res = $connection->query("SELECT @result AS result, @userId AS userId, @password_hashIn AS password_hashIn");
    if ($res) {
        $row = $res->fetch_assoc();
        $password_hashIn = $row['password_hashIn'] ?? '';
        if ($row['result'] != 1 || !password_verify($password, $password_hashIn)) {
            return ["success" => 3, "id" => 0];
        }
        if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['id'] = (int)$row['userId'];
        return ["success" => $row['result'], "id" => (int)$row['userId']];
    } else {
        return ["success" =>3, "error" => "Failed to retrieve result"];
    }
}
function sendVerficationCode($id) {
    global $connection;

    $code = bin2hex(random_bytes(16));
    $stmt = $connection->prepare("CALL AssignToken(?, ?)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("ss", $id, $code);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();
    return ["success" => true, "code" => $code];
}
function needingReview(){
    global $connection;
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $userId = $_SESSION['id'];

    $stmt = $connection->prepare("CALL NeedingReview(?)");
    if (!$stmt) {
        return [];
    }

    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        $stmt->close();
        return [];
    }

    $result = $stmt->get_result();
    if (!$result) {
        $stmt->close();
        return [];
    }

    $data = $result->fetch_all(MYSQLI_ASSOC);
    $result->free();
    $stmt->close();
    while ($connection->more_results() && $connection->next_result()) {}

    $decks = [];
    foreach ($data as $row) {
        $deckId = $row['id'];
        if (!isset($decks[$deckId])) {
            $decks[]=getDeckById($deckId);
        }
    }

    return $decks ?: [];
}
function checkAnswer($cardId, $isCorrect) {
    global $connection;

    $stmt = $connection->prepare("CALL CheckAnswer(?, ?, @result)");
    if (!$stmt) {
        return ["success" => false, "error" => "Prepare failed: " . $connection->error];
    }

    $stmt->bind_param("ii", $cardId, $isCorrect);
    if (!$stmt->execute()) {
        $stmt->close();
        return ["success" => false, "error" => "Execute failed: " . $stmt->error];
    }

    $stmt->close();

    $res = $connection->query("SELECT @result AS result");
    if ($res) {
        $row = $res->fetch_assoc();
        if ($row['result'] == 1) {
            return ["success" => true,"id"=>$cardId,"isCorrect"=>$isCorrect,"error" => "Failed to update review status"];
        }
        return ["success" => false,"id"=>$cardId,"isCorrect"=>$isCorrect,"error" => "Failed to find the progress of the card"];
    } else {
        return ["success" => false, "error" => "Failed to retrieve result"];
    }
}
?>