<?php
ini_set('display_errors', 0);
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json; charset=utf-8');
    require_once  __DIR__."/../../../src/models/Functions.php";


        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $UserId = $_POST['UserId'] ?? 1;
        $deckName = $_POST['deckName'] ?? '';
        $deckDescription = $_POST['deckDescription'] ?? '';

        $status = addDecks($UserId, $deckName, $deckDescription);

        header('Content-Type: application/json');
        echo json_encode($status);
        exit;


        }

        if($_SERVER['REQUEST_METHOD'] === 'PUT'){
            $putVars = json_decode(file_get_contents("php://input"), true);
            $deckId = $putVars['DeckId'] ?? 0;
            $title = $putVars['title'] ?? '';
            $description = $putVars['description'] ?? '';
            
            $status = editDeck($deckId, $title, $description);

            header('Content-Type: application/json');
            echo json_encode($status);
            exit;
        }
        if($_SERVER['REQUEST_METHOD'] === 'DELETE'){
            $json = file_get_contents("php://input");
            $data = json_decode($json, true);
            $deckId = $data['deckId'] ?? 0;

            $status = deleteDeck($deckId);

            header('Content-Type: application/json');
            echo json_encode($status);
            exit;
        }

?>