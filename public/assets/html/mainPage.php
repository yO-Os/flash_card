<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>



<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" href="/public/assets/css/main.css">
<title>Flashcards Pro — Study Smarter</title>

</head>
<body>
<header>
  <h1>Flashcards Pro</h1>
  <div class="small muted">Smart study</div>
  <div class="toolbar">
    <button id="newDeckBtn">+ New Deck</button>
    <button id="importBtn">Progress</button>
    <button id="exportBtn">Need Reviewing</button>
    <button id="themeBtn">Toggle Theme</button>
  </div>
</header>

<div class="container">
  <aside class="panel">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div><strong>Decks</strong></div>
    </div>

    <div class="controls">
      <input id="searchDeck" placeholder="Search decks or tags" />
      <select id="sortDecks"><option value="recent">Recent</option><option value="name">Name</option></select>
    </div>

    <div class="deck-list" id="deckList">
        <?php
          require_once "../../../src/models/Functions.php";
          $decks = getAllDecks(); // fetch from DB
        ?>
        <?php if (empty($decks)): ?>
          <p>No decks available.</p>
<?php else: ?>
    <?php foreach ($decks as $deck): ?>
    <div class="deck-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #444;">
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

<?php endif; ?>
    </div>
 <div id="deckForm">
        <h2>Deck Info</h2>
        <input type="text" id="deckName" placeholder="Deck Name">
        <input type="text" id="deckDescription" placeholder="Deck Description">
        <span id="deckNameError" style="color:red; font-size:0.9rem; display:none;"></span>
        <div>
            <button id="submitDeck" name="submitDeck">Submit</button>
            <button id="cancelDeck">Cancel</button>
        </div>
        
    </div>
    <div id="EditCardForm">
        <h2>Card Info</h2>
        <input type="text" id="EditQuestion" placeholder="Question">
        
        <input type="text" id="EditAnswer" placeholder="Answer">
        <span id="EditCardError" style="color:red; font-size:0.9rem; display:none;"></span>
        <div>
            <button id="submitCard" name="submitCard">Submit</button>
            <button id="cancelCard">Cancel</button>
        </div>
      </div>
    <hr />
    <div>
      <strong>Edit Deck</strong>
      <div class="form-row" style="margin-top:8px">
        <input id="deckTitle" placeholder="Deck title" />
        <span id="deckNameError" style="display:none;"></span>
        <button id="saveDeck">Save</button>
      </div>
      <label  class="tiny muted">Description</label>
      <input id="deckTags" placeholder="Deck Description" />
      
  </aside>

  <main class="main">
    <div class="panel card-view">
      <div style="display:flex;gap:12px;align-items:center;width:100%;justify-content:space-between">
        <div>
          <div id="currentDeckName" class="big">(No deck selected)</div>
          <div class="muted small" id="deckMeta"></div>
        </div>
        <div class="actions">
          <button id="studyBtn">Study</button>
          <button id="quizBtn">Quiz</button>
          <button id="editModeBtn">Edit</button>
        </div>
      </div>

      <div id="cardArea" style="width:100%;display:flex;justify-content:center;align-items:center;margin-top:12px">
        <div id="flashcard" class="flashcard" role="button" tabindex="0" aria-pressed="false">
          <div class="front">
            <div class="meta-row"><div class="chip" id="tagChip">—</div><div class="muted tiny" id="nextDue">next: —</div></div>
            <div id="frontText" class="big" style="margin-top:10px">Select a deck to begin</div>
            <div class="muted tiny" style="margin-top:8px">Press Space or Enter to flip. ← → to navigate.</div>
          </div>
          <div class="back" style="display:none">
            <div id="backText" class="answer">—</div>
            <div style="margin-top:12px" class="actions"><button id="knownBtn">I knew it</button><button id="easyBtn">Easy</button><button id="hardBtn">Hard</button></div>
          </div>
        </div>
      </div>

      <div class="statbar">
        <div class="progressbar" title="progress"><i id="progressFill"></i></div>
        <div id="statText" class="muted tiny">0 reviewed • 0 due</div>
        <div style="margin-left:auto" class="chips"><div class="chip" id="streak">Streak: 0</div><div class="chip" id="accuracy">Acc: 0%</div></div>
      </div>

    </div>

    <div class="panel" id="sidePanel" style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><strong>Add Cards</strong></div>
      <div style="display:grid;grid-template-columns:1fr 120px;gap:8px;margin-bottom:8px">
        <input id="newQ" placeholder="Question" />
      </div>
      <textarea id="newA" placeholder="Answer" rows="3"></textarea>
      <span id="AddCardError" style="display:none; color:red;"></span>
      <div style="margin-top:8px">
  <div style="display:flex;gap:8px;margin-bottom:8px">
    <button id="addCardBtn">Add Card</button>
    <button id="clearCards">Cancel</button>
  </div>

  <hr />

  <div id="cardsList" style="max-height:160px;overflow:auto"></div>
</div>

      
  </main>
</div>

<footer class="muted tiny"></footer>
</body>
</html>
<script src="/public/assets/js/main.js"></script>
<script src="/public/assets/js/deck.js"></script>
