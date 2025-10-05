

let addDeckButton=window.document.getElementById("newDeckBtn");
let submitDeckButton=window.document.getElementById("submitDeck");
let cancelDeckButton=window.document.getElementById("cancelDeck");
let editButton=window.document.getElementById("saveDeck");
let cards=[];
let index=0;

let currentId=0;

submitDeckButton.addEventListener("click",AddDeck);
cancelDeckButton.addEventListener("click",UnToggleMenu);
addDeckButton.addEventListener("click",ToggleMenu);
editButton.addEventListener("click",EditDeck)
attachDeckEventListeners();
attachCardEventListeners();

function UnToggleMenu(){
    window.document.getElementById("deckForm").style.display="none";
    window.document.getElementById("deckName").value="";
    window.document.getElementById("deckDescription").value="";
    document.getElementById("deckNameError").style.display = "none";
}
function ToggleMenu() {
    if(window.document.getElementById("deckForm").style.display==="none") {
        window.document.getElementById("deckForm").style.display="flex";
        window.document.getElementById("deckForm").style.alignItems="center";
        window.document.getElementById("deckForm").style.flexDirection="column";
    } else {
        window.document.getElementById("deckForm").style.display="none";
        window.document.getElementById("deckName").value="";
        window.document.getElementById("deckDescription").value="";
        document.getElementById("deckNameError").style.display = "none";
    }
}
function AddDeck() {
    const section=window.document.getElementById("deckList");
    const DeckName=window.document.getElementById("deckName").value;
    const DeckDescription=window.document.getElementById("deckDescription").value;
    const nameError = document.getElementById("deckNameError");

    if (!DeckName) {
        nameError.textContent = "Please enter a deck Title";
        nameError.style.display = "block";
        nameError.style.color = "red";
        return;
    } else {
        nameError.style.display = "none";
    }

    fetch("/public/assets/php/main.php", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded" },
        body: `deckName=${encodeURIComponent(DeckName)}&deckDescription=${encodeURIComponent(DeckDescription)}`
    })
    .then(res=>res.json())

    .then(data=>{
        if(data.success){

            reloadDecks();
            window.document.getElementById("deckForm").style.display="none";
        } else {
            nameError.textContent = "Error adding deck";
            nameError.style.display = "block";
        }
    })
    
}
function fetchCard() {
    
    cards=[];
    const deckName=window.document.getElementById("currentDeckName");
    const deckDescription=window.document.getElementById("deckMeta");
    const deckNameEdit=window.document.getElementById("deckTitle");
    const deckDescriptionEdit=window.document.getElementById("deckTags");
    const Question=document.getElementById("frontText");
    const Answer=document.getElementById("backText");
    const nextDue=document.getElementById("nextDue");
    fetch(`/public/assets/php/card.php?deckId=${encodeURIComponent(currentId)}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
})
    .then(res=>res.json())

    .then(data=>{
        deckNameEdit.value=data['Title'] || '';
        deckDescriptionEdit.value=data['Description'] || '';
        deckNameEdit.innerText=data['Title'] || '';
        deckDescriptionEdit.innerText=data['Description'] || '';
        deckName.innerText=data['Title'];
        deckDescription.innerText=data['Description'] || '';
        cards=data['cards'];
        if (cards.length > 0) {
            if (index >= cards.length) index = 0;
            Question.textContent = cards[index]?.Question || 'No cards in this deck';
            Answer.textContent = cards[index]?.Answer || '';
            if (cards.length > index + 1)
            nextDue.innerText = cards[index+1].Question;
            else {
            nextDue.innerText = ' end ';
        }

    }else {
    Question.textContent = 'No cards in this deck';
    Answer.textContent  = '';
    nextDue.innerText =' next ';
    }
    });
}
function reloadDecks() {
  fetch("/public/assets/php/decks.php") 
    .then(res => res.text())
    .then(html => {
      document.getElementById("deckList").innerHTML = html;
    });
}
function reloadCards() {
        
    fetch(`/public/assets/php/cards.php?deckId=${encodeURIComponent(currentId)}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
})
    .then(res => res.text())
    .then(html => {
      document.getElementById("cardsList").innerHTML = html;
    });
 }
function EditDeck(){
    const DeckNameEdit=window.document.getElementById("deckTitle")
    const deckDescriptionEdit=window.document.getElementById("deckTags");
    fetch('/public/assets/php/main.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ DeckId: currentId, title: DeckNameEdit.value, description: deckDescriptionEdit.value })

        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                reloadDecks();
            }
            else alert('Error Editing card: ' + data.error+' '+data.id+''+currentId);
        });
}
function attachDeckEventListeners() {
    const deckList = document.getElementById("deckList");

    deckList.addEventListener("click", (e) => {
        if (e.target.classList.contains("select")) {
            const deckId = e.target.dataset.id;
            currentId=deckId;
            index=0;
            fetchCard();
            reloadCards();
            console.log("Open deck", deckId);
        }



        if (e.target.classList.contains("delete")) {
            const deckId = e.target.dataset.id;
            DeleteDeck(deckId);
            console.log("Delete deck", deckId);
        }
    });
}

function attachCardEventListeners(){
    const cardList = document.getElementById("cardsList");
    cardList.addEventListener("click", (e) => {
        if (e.target.classList.contains("openCard")) {
            index = e.target.dataset.i;
            fetchCard();
            console.log("open card");
        }
        if (e.target.classList.contains("delCard")) {
            index = e.target.dataset.i;
            DeleteCard();
            fetchCard();
            console.log("delete card");
        }
});
}

function DeleteCard(){
    const cardId=cards[index].id
    fetch('/public/assets/php/card.php', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id:cardId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Card deleted successfully");
                fetchCard();
                reloadCards();
            }else alert('Error deleting card ,'+data.error);
        }
    );
    }
function DeleteDeck(DeckId){
    fetch('/public/assets/php/main.php', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ deckId: DeckId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) reloadDecks();
            else alert('Error deleting card ,'+data.error);
        });
    }