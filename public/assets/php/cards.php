<?php
// Example deck structure in PHP (adjust to your real data source)
require_once "../../../src/models/Functions.php";
$deckId = $_GET['deckId'] ?? null;
if (!$deckId) {
    echo "<p>Invalid deck ID.</p>";
    exit;
}
else{
    $data=GetAllCardsInDeck($deckId);
$cards= $data['cards'] ?? [];

foreach ($cards as $i => $c) {
    $q = htmlspecialchars($c["Question"], ENT_QUOTES, 'UTF-8');
    $tag = htmlspecialchars($c["Answer"] ?? "", ENT_QUOTES, 'UTF-8');

    echo '<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;">';
    echo '  <div style="flex:1">';
    echo "    <strong>{$q}</strong>";
    echo "    <div class=\"tiny muted\">{$tag}</div>";
    echo '  </div>';
    echo '  <div style="width:120px;text-align:right">';
    echo "    <button data-i=\"{$i}\" class=\"openCard\">open</button> ";
    echo "    <button data-i=\"{$i}\" class=\"delCard\">Delete</button>";
    echo '  </div>';
    echo '</div>';
}
}

?>
