<?php


    require_once  __DIR__."/../../../src/models/Functions.php";


        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            // echo "Session user ID: " . $_SESSION['id'];
            // exit;
            $deckName = $_POST['deckName'] ?? '';
            $deckDescription = $_POST['deckDescription'] ??     '';
            
            $status = addDecks( $deckName, $deckDescription);
            
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