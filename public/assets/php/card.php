<?php
    require_once  __DIR__."/../../../src/models/Functions.php";
    use OpenAI\Client;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
header('Content-Type: application/json');
require __DIR__ . '/../../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->load();

// Get your API key securely
$OPENAI_API_KEY = $_ENV['OPENAI_API_KEY'];

$MAX_TEXT_LENGTH = 20000; // Limit to avoid sending huge files
// ---------------------

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'File upload failed']);
    exit;
}

$deckId = $_POST['deck_id'] ?? null;
if (!$deckId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing deck_id']);
    exit;
}

$fileTmp = $_FILES['file']['tmp_name'];
$fileType = mime_content_type($fileTmp);
$text = '';

// Allowed formats
$allowed = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

if (!in_array($fileType, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Only .txt, .pdf, and .docx files are allowed']);
    exit;
}

// --- Extract text ---
try {
    if ($fileType === 'text/plain') {
        $text = file_get_contents($fileTmp);

    } elseif ($fileType === 'application/pdf') {
        $parser = new \Smalot\PdfParser\Parser();
        $pdf = $parser->parseFile($fileTmp);
        $text = $pdf->getText();

    } elseif ($fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($fileTmp);
        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                }
            }
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error reading file: ' . $e->getMessage()]);
    exit;
}

$text = trim($text);
if (strlen($text) > $MAX_TEXT_LENGTH) {
    $text = substr($text, 0, $MAX_TEXT_LENGTH);
}

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['error' => 'No readable text found']);
    exit;
}

// --- Call OpenAI to generate flashcards ---
$client = OpenAI::client($OPENAI_API_KEY);

$prompt = "
You are an AI that creates flashcards for studying.
From the content below, generate concise, factual flashcards in JSON format:
[
  {\"question\": \"...\", \"answer\": \"...\"},
  {\"question\": \"...\", \"answer\": \"...\"}
]
Avoid markdown, explanations, or extra text.

CONTENT:
$text
";

try {
    $response = $client->chat()->create([
        'model' => 'gpt-4o-mini',
        'messages' => [
            ['role' => 'system', 'content' => 'You are a flashcard generator. Output clean JSON only.'],
            ['role' => 'user', 'content' => $prompt],
        ],
        'temperature' => 0.4,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'AI request failed: ' . $e->getMessage()]);
    exit;
}

$raw = $response['choices'][0]['message']['content'] ?? '';
$cards = json_decode($raw, true);

if (!$cards || !is_array($cards)) {
    echo json_encode([
        'error' => 'AI output was not valid JSON',
        'raw_output' => $raw
    ]);
    exit;
}

// --- Insert into database ---
$inserted = 0;

foreach ($cards as $card) {
    if (!isset($card['question']) || !isset($card['answer'])) continue;
    $q = trim($card['question']);
    $a = trim($card['answer']);
    if ($q === '' || $a === '') continue;
    addCardToDeck($deckId, $q, $a);
}

echo json_encode([
    'success' => true,
    'deck_id' => $deckId,
    'total' => count($cards)
]);
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