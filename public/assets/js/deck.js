let EditCardBtn=window.document.getElementById("editModeBtn");
let submitCardButton=window.document.getElementById("addCardBtn");
let cancelCardButton=window.document.getElementById("clearCards");
let submitEditButton=window.document.getElementById("submitCard");
let cancelEditButton=window.document.getElementById("cancelCard");

submitCardButton.addEventListener("click",AddCard);
cancelCardButton.addEventListener("click",clearCards);
EditCardBtn.addEventListener("click",ToggleEditMenu);
submitEditButton.addEventListener("click",EditCard);
 cancelEditButton.addEventListener("click",UnToggleEditMenu);

function ToggleEditMenu() {
    if(currentId==0){
        alert("No cards to edit in this deck or you haven't selected a deck");
        return;
    }
    else{
        let CardForm=window.document.getElementById ("EditCardForm");
        const NQuestion=window.document.getElementById  ("EditQuestion");
        const NAnswer=window.document.getElementById    ("EditAnswer");
        if(CardForm.style.display==="none") {
            CardForm.style.display="flex";
            CardForm.style.flexDirection="column";
            NQuestion.value=cards[index].Question;
            NAnswer.value=cards[index].Answer;
        } else {
            CardForm.style.display="none";
        }
}
}

function UnToggleEditMenu(){
    window.document.getElementById("EditCardForm").style.display="none";
}

function AddCard() {
    const Question=window.document.getElementById("newQ").value;
    const Answer=window.document.getElementById("newA").value;
    const Error = document.getElementById("AddCardError");
    
    if (!Question) {
        Error.textContent = "Please enter a question";
        Error.style.display = "block";
        return;
    }else if (!Answer) {
        Error.textContent = "Please enter an answer";
        Error.style.display = "block";
        return;
    } else if (currentId==0) {
        Error.textContent = "Please select a deck to add cards";
        Error.style.display = "block";
        return;
    }else {
        Error.style.display = "none";
    }
    
    fetch("/public/assets/php/card.php", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded" },
        body: `deckId=${encodeURIComponent(currentId)}&question=${encodeURIComponent(Question)}&answer=${encodeURIComponent(Answer)}`
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.success){
            fetchCard();
            alert("Card added successfully");
            clearCards();
        }else {
            Error.textContent = "Error adding deck";
            Error.style.display = "block";
        }
    })
}

function clearCards() {
    const Question = document.getElementById("newQ");
    const Answer = document.getElementById("newA");
    Question.value = "";
    Answer.value = "";
    document.getElementById("AddCardError").style.display = "none";
}

function clearEditCards() {
    const Question = document.getElementById("EditQuestion");
    const Answer = document.getElementById("EditAnswer");
    Question.value = "";
    Answer.value = "";
    document.getElementById("EditCardError").style.display = "none";
}

function EditCard() {
    const NQuestion=window.document.getElementById("EditQuestion");
    const NAnswer=window.document.getElementById("EditAnswer");
    const Error = document.getElementById("EditCardError");
    const cardId=cards[index].id

    if (!NQuestion.value) {
        Error.textContent = "Please enter a question";
        Error.style.display = "block";
        return;
    }else if (!NAnswer.value) {
        Error.textContent = "Please enter an answer";
        Error.style.display = "block";
        return;
    } else {
        Error.style.display = "none";
    }
    fetch('/public/assets/php/card.php', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cardId, question: NQuestion.value, answer: NAnswer.value })

        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchCard();
                alert("Card edited successfully");
                clearEditCards();
                UnToggleEditMenu();
            }
            else alert('Error Editing card');
        });
 }
    

