

let addDeckButton=window.document.getElementById("newDeckBtn");
let submitDeckButton=window.document.getElementById("submitDeck");
let cancelDeckButton=window.document.getElementById("cancelDeck");
let editButton=window.document.getElementById("saveDeck");
let NeedingReviewBtn=window.document.getElementById("NeedingReview");
let studyModeBtn=window.document.getElementById("studyBtn");
let quizModeBtn=window.document.getElementById("quizBtn");
let cards=[];
let index=0;
let isFlipped=false;
let currentId=0;
let acc=0;
let correct=0;
let reviewed=0;
let studymode=true;
const uploadBtn = document.getElementById('uploadBtn');
const loading = document.getElementById('loading');
const message = document.getElementById('message');

document.getElementById('uploadBtn').addEventListener('click', async (e) => {
    e.preventDefault(); 
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert('Choose a file');
 // string like "1"
 console.log("uploading");
  const fd = new FormData();
  fd.append('file', file);
  fd.append('deck_id', currentId); // <-- important

  
  const res = await fetch('../php/card.php', {
    method: 'POST',
    body: fd,
    // DON'T set Content-Type — browser sets multipart boundary automatically
  });
  const data = await res.json();
  console.log(data);
  if (data.success) {
          alert(`Generated ${data.total} flashcards!`);
          fetchCard();
          reloadCards();
        }else {
          alert('Error generating flashcards: ' + data.error);
        }
});
// uploadBtn.addEventListener('click', async () => {
//     const fileInput = document.getElementById('fileInput');

//     if (!fileInput.files[0]) {
//         alert('Please choose a file');
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);  // file
//     formData.append('deck_id', currentId);
//     // Show loading
//     loading.style.display = 'block';
//     message.textContent = '';

//     try {

          
//         const res = await fetch('/public/assets/php/card.php', {    method: 'POST', body: formData });
//         const data = await res.json();
//         if (data.success) {
//           alert(`Generated ${data.total} flashcards!`);
//           fetchCard();
//           reloadCards();
//         }else {
//           alert('Error generating flashcards: ' + data.error);
//         }
//     } catch (err) {
//         message.textContent = '❌ Upload failed: ' + err.message;
//     } finally {
//         // Hide loading after completion
//         loading.style.display = 'none';
//     }
// });

submitDeckButton.addEventListener("click",AddDeck);
cancelDeckButton.addEventListener("click",UnToggleMenu);
addDeckButton.addEventListener("click",ToggleMenu);
editButton.addEventListener("click",EditDeck)
NeedingReviewBtn.addEventListener("click",reloadDecksToBeReviewd);
studyModeBtn.addEventListener("click",studyModeCheck);
quizModeBtn.addEventListener("click",QuizModeCheck);
studyModeCheck();
attachDeckEventListeners();
attachAnswerEventListeners();
reloadDecks();

window.document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("light");
  if (document.body.classList.contains("light")) {
    document.body.style.background = "linear-gradient(180deg,#f7f9fc,#eef2ff)";
    document.body.style.color = "#0b1220";
  } else {
    document.body.style.background = "linear-gradient(180deg,#071024,#081328)";
    document.body.style.color = "var(--text)";
  }
};


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
    const deckIdDisplay=window.document.getElementById("deckIdDisplay");
    const Question=document.getElementById("frontText");
    const Answer=document.getElementById("backText");
    const nextDue=document.getElementById("nextDue");
    const stat=document.getElementById("statText");
    const accuracy=document.getElementById("accuracy");
    const progressBar=document.getElementById("progressFill");
    deckIdDisplay.value=currentId;
    fetch(`/public/assets/php/card.php?deckId=${encodeURIComponent(currentId)}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
})
    .then(res=>res.json())

    .then(data=>{
        deckNameEdit.value=data['Title'] || '';
        deckDescriptionEdit.value=data['Description'] || '';
        deckName.innerText=data['Title'];
        deckDescription.innerText=data['Description'] || '';
        cards=data['cards'];
        if (cards.length > 0) {
            if (index >= cards.length) {
                index = 0;
            }
                
            Question.textContent = cards[index]?.Question || 'No cards in this deck';
            Answer.textContent = cards[index]?.Answer || '';
            acc=(correct/(cards.length))*100;
            stat.innerText = `${index + 1} of ${cards.length} cards`;
            accuracy.innerText = `Acc: ${acc}%`;
            progressBar.style.width = (((index + 1) / cards.length )* 100) + '%';
            if (cards.length > index + 1){
            nextDue.innerText = cards[index+1].Question;
            }
            else {
            nextDue.innerText = cards[0].Question;
        }

    }else {
    Question.textContent = 'No cards in this deck';
    Answer.textContent  = '';
    nextDue.innerText =' next ';
    }
    });
}
function reloadDecksToBeReviewd() {
    fetch("/public/assets/php/decks.php?action=getDecksToBeReviewed",{
    method: 'GET', headers: { 'Accept': 'application/json' }
  })
    .then(res => res.text())
    .then(html => {
      document.getElementById("deckList").innerHTML = html;
    });
}
function reloadDecks() {
  fetch("/public/assets/php/decks.php?action=getAllDecks",{
    method: 'GET', headers: { 'Accept': 'application/json' }
  }
  )
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
            reviewed=0;
            correct=0;
            acc=0;
            fetchCard();
            reloadCards();
            console.log("Open deck", deckId);
        }



        if (e.target.classList.contains("delete")) {
            const deckId = e.target.dataset.id;
            currentId=deckId;
            index=0;
            reviewed=0;
            correct=0;
            acc=0;
            DeleteDeck(deckId);
            console.log("Delete deck", deckId);
        }
    });
}


function attachAnswerEventListeners(){
    const Answer = document.getElementById("answer");
    Answer.addEventListener("click", (e) => {
        if (e.target.classList.contains("easyBtn")) {
            easyAnswerCheck();
        }
        if (e.target.classList.contains("hardBtn")) {
            hardAnswerCheck();
        }
});
}
function easyAnswerCheck(){
    fetch('/public/assets/php/card.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action:'answer',cardId:cards[index].id, correct:1 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                correct++;
                nextCard();
            }else alert('Error recording answer ,'+data.error);
        }
    );
}
function hardAnswerCheck(){
    fetch('/public/assets/php/card.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action:'answer',cardId:cards[index].id, correct:0 })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                nextCard();

            }else alert('Error recording answer ,'+data.error);
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

function nextCard(){
    if (cards.length === 0) return;
    index++;
    reviewed++;
    if (index >= cards.length){
        index = 0;
        reviewed=0;
        correct=0;
        alert("You've reached the end of the deck, starting over.");
    } 
    const Question=document.getElementById("frontText");
    const Answer=document.getElementById("backText");
    const nextDue=document.getElementById("nextDue");
    const stat=document.getElementById("statText");
    const accuracy=document.getElementById("accuracy");
    const progressBar=document.getElementById("progressFill");
    Question.textContent = cards[index]?.Question || 'No cards in this deck';
    Answer.textContent = cards[index]?.Answer || '';
    progressBar.style.width = (((index + 1) / cards.length )* 100) + '%';
    acc=(correct/(cards.length))*100;
    stat.innerText = `${index + 1} of ${cards.length} cards`;
    accuracy.innerText = `Acc: ${acc}%`;
    if (cards.length > index + 1){
        nextDue.innerText = cards[index+1].Question;
    }
    else {
        nextDue.innerText = cards[0].Question;
    }
    isFlipped=true;
    flipCard();
}
function prevCard(){
    if (cards.length === 0) return;
    index--;
    reviewed--;
    correct--;
    if (index < 0){
        index = 0;
        reviewed=0;
        correct=0;
    } else if (correct < 0) correct=0;
    const Question=document.getElementById("frontText");
    const Answer=document.getElementById("backText");
    const nextDue=document.getElementById("nextDue");
    const progressBar=document.getElementById("progressFill");
    const stat=document.getElementById("statText");
    const accuracy=document.getElementById("accuracy");
    Question.textContent = cards[index]?.Question || 'No cards in this deck';
    Answer.textContent = cards[index]?.Answer || '';
    progressBar.style.width = (((index + 1) / cards.length )* 100) + '%';
    acc=(correct/(cards.length))*100;
    stat.innerText = `${index + 1} of ${cards.length} cards`;
    accuracy.innerText = `Acc: ${acc}%`;
    if (cards.length > index + 1){
        nextDue.innerText = cards[index+1].Question;
    }else {
        nextDue.innerText = cards[0].Question;
    }
    isFlipped=true;
    flipCard();
}
function flipCard() {
    if(isFlipped){
        document.querySelector(".back").style.display = "none";
        document.querySelector(".front").style.display = "flex";
        isFlipped=false;
        return;
    }else {
        document.querySelector(".back").style.display ="flex";
        document.querySelector(".front").style.display ="none";
        isFlipped=true;
        return;
    }
}
function studyModeCheck(){
    studymode=true;
    document.getElementById("cardsList").style.display="block";
    document.getElementById("sidePanel").style.display="block";
    document.getElementById("accuracy").style.display="none";
    document.getElementById("AnswerBtn").style.display="none";
}
function QuizModeCheck(){
    studymode=false;
    document.getElementById("cardsList").style.display="none";
    document.getElementById("sidePanel").style.display="none";
    document.getElementById("accuracy").style.display="block";
    document.getElementById("AnswerBtn").style.display="flex";
}
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "Escape":
        reloadDecks();
        currentId=0;
        index=0;
        fetchCard();
        reloadCards();
      break;
    case "Enter":
      flipCard();
      break;
    case "ArrowLeft":
        if (studymode){
            prevCard();
        }
      break;
    case "ArrowRight":
        if (studymode){
            nextCard();
        }
      
      break;
  }
});
