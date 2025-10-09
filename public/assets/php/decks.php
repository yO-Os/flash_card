<?php
require_once "../../../src/models/Functions.php";
$action = $_GET['action'] ?? '';

if($_SERVER['REQUEST_METHOD'] !== 'GET'){
    if ($action === 'getDecks') {
    $decks = getAllDecks();
    html_($decks);
} elseif ($action === 'getDecksToBeReviewed') {
    $decks = needingReview();
    html_($decks);
} else {
    echo "<p>Invalid action.</p>";
    exit;
}
}

function html_($decks){
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $decks = getAllDecks();

    header('Content-Type: application/json');
    echo json_encode($decks);
    exit;
if (empty($decks)): ?>
  <p>No decks available.</p>
<?php else: ?>
  <?php foreach ($decks as $deck): ?>
    <div class="deck-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #444;">
      <div>
        <strong><?= htmlspecialchars($deck['Title'] ?: 'Untitled') ?></strong>
        <div class="small muted">
          <?= htmlspecialchars($deck['Description']) ?>
        </div>
      </div>
      <div>
        <button data-id="<?= $deck['id'] ?>" class="select">Open</button>
        <button data-id="<?= $deck['id'] ?>" class="delete">Delete</button>
      </div>
    </div>
  <?php endforeach; ?>
<?php endif;
}
 ?>
