<?php
    require_once  __DIR__."/../../../src/models/Functions.php";

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $deckId = $_POST['deckId'] ?? 0;
        $Question = $_POST['question'] ?? '';
        $Answer = $_POST['answer'] ?? '';

        $status = addCardToDeck($deckId, $Question, $Answer);

        header('Content-Type: application/json');
        echo json_encode($status);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $json = file_get_contents("php://input");
        $data = json_decode($json, true);
        $cardId = $data['id'] ?? 0;

        $status = deleteCard($cardId);

        header('Content-Type: application/json');
        echo json_encode($status);
        exit;
    }

    $action = $_GET['action'] ?? '';
    if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === "answerd") {
        
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $json = file_get_contents("php://input");
        $data = json_decode($json, true) ?? [];
        $action = $data['action'] ?? '';
        $cardId = $data['cardId'] ?? 0;
        $Question = $data['question'] ?? '';
        $Answer = $data['answer'] ?? '';
        if ($action === "answer") {
            $isCorrect = $data['correct'];
            $status = checkAnswer($cardId, $isCorrect);
            header('Content-Type: application/json');
            echo json_encode($status);
            exit;
        }
        else{

            $status = updateCard($cardId, $Question, $Answer);
            header('Content-Type: application/json');
            echo json_encode($status);
            exit;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $deckId = $_GET['deckId'] ?? 0;

        $cards = GetAllCardsInDeck($deckId);

        header('Content-Type: application/json');
        echo json_encode($cards);
        exit;
    }
?>