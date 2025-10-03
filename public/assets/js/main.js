

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
        body: `UserId=${encodeURIComponent(1)}&deckName=${encodeURIComponent(DeckName)}&deckDescription=${encodeURIComponent(DeckDescription)}`
    })
    .then(res=>res.json())

    .then(data=>{
        if(data.success){

            let div=window.document.createElement("div");
            div.classList.add("deck-item");
            div.innerHTML=`
        <div>
            <strong>${DeckName}</strong>
            <div class="small muted" style="font-size: 13px; color: #9fb3c8;">
                ${DeckDescription}
            </div>
        </div>
        <div>
            <button data-id="${data.id}" class="select" style="background: #0b1220;
            border: 1px solid rgba(255, 255, 255, 0.04);
            color: #e6eef8;padding: 8px 10px;border-radius: 10px;cursor: pointer;">Open</button>
            <button data-id="${data.id}" class="delete" style="background: #0b1220;
            border: 1px solid rgba(255, 255, 255, 0.04);
            color: #e6eef8;padding: 8px 10px;border-radius: 10px;cursor: pointer;>Delete</button>
        </div>
            `;
            div.style.display="flex";
            div.style.justifyContent="space-between";
            //div.style.border="1px solid white";
            div.style.padding="10px";
            div.style.marginBottom="8px";
            div.style.borderRadius="8px";
            div.style.alignItems="center";
            div.style.gap="8px";
            // div.style.width="20VW";
            // div.style.minHeight="35VH";
            // div.style.backgroundColor="rgba(129, 169, 201, 0.5)";

            section.appendChild(div);
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
            fetchCard();
            console.log("Open deck", deckId);
            // window.location.href = "deck.php?id=" + deckId;
        }



        if (e.target.classList.contains("delete")) {
            const deckId = e.target.dataset.id;
            DeleteDeck(deckId);
            console.log("Delete deck", deckId);
            // confirm deletion + send fetch request here
        }
    });
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