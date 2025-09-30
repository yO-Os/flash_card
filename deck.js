let AddCardBtn=window.document.getElementById("AddCard");
let submitDeckButton=window.document.getElementById("submitDeck");
let cancelDeckButton=window.document.getElementById("cancelDeck");
let submitEditButton=window.document.getElementById("EditsubmitDeck");
let cancelEditButton=window.document.getElementById("EditcancelDeck");

submitDeckButton.addEventListener("click",AddCard);
cancelDeckButton.addEventListener("click",UnToggleMenu);
AddCardBtn.addEventListener("click",ToggleMenu);
submitEditButton.addEventListener("click",AddCard);
cancelEditButton.addEventListener("click",UnToggleEditMenu);

function UnToggleMenu(){
    window.document.getElementById("CardForm").style.display="none";
}


function ToggleMenu() {
    let CardForm=window.document.getElementById("CardForm");
    if(CardForm.style.display==="none") {
        CardForm.style.display="flex";
    
        CardForm.style.flexDirection="column";
    } else {
        CardForm.style.display="none";
    }
}
function ToggleEditMenu() {
    let CardForm=window.document.getElementById("EditCardForm");
    if(CardForm.style.display==="none") {
        CardForm.style.display="flex";
        CardForm.style.flexDirection="column";
    } else {
        CardForm.style.display="none";
    }
}

function UnToggleEditMenu(){

    window.document.getElementById("EditCardForm").style.display="none";
}
function AddCard() {
    const section=window.document.querySelector("main section");
    const Question=window.document.getElementById("Question").value;
    const Answer=window.document.getElementById("Answer").value;
    const AnswerError = document.getElementById("AnswerError");
    const urlParams = new URLSearchParams(window.location.search);
    const deckId = urlParams.get("id");


    if (!Question) {
        QuestionError.textContent = "Please enter a question";
        QuestionError.style.display = "block";
        return;
    }else {

    
        QuestionError.style.display = "none";
    }
    if (!Answer) {

        AnswerError.textContent = "Please enter an answer";
        AnswerError.style.display = "block";
        return;
    } else {
    
        AnswerError.style.display = "none";
    }

    
    fetch("/public/assets/php/card.php", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded" },
        body: `deckId=${encodeURIComponent(deckId)}&question=${encodeURIComponent(Question)}&answer=${encodeURIComponent(Answer)}`
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.success){
             let new_=createDiv(data.CardId, Question, Answer);
            section.appendChild(new_);
            window.document.getElementById("CardForm").style.display="none";
        }else {
            AnswerError.textContent = "Error adding deck";
            AnswerError.style.display = "block";
        }
    })
}


function createDiv(cardId, question, answer) {
    let div=window.document.createElement("div");
            div.classList.add("card");
            div.innerHTML=`
                    <h2 class="CardId" style="display:none;">${cardId}</h2>
                    <h2 name="name" style="font-size: 1.2rem;margin-bottom: 0.5rem;color: #00ffff;">${question}</h2>
                    <p>${answer}</p>
                    <div style="display:flex;">
                        <button class="Edit-Card"   style="text-decoration: none; color:#1e1e1e;  border-radius: 10px; border:1px solid cyan;  background-color:       cyan; width:100px;   height: 50px; text-align: center;     padding-top: 15px;
                        cursor:pointer;">Edit Card</button>
                        <button class="Delete-Card"         style="text-decoration: none;   color:#1e1e1e;    border-radius: 10px;    border:1px solid cyan;     background-color:       cyan;    width:100px;     height: 50px; text-align:     center;  padding-top:     15px;
                        cursor:pointer;">Delete Card</button>
                    </div>
            `;
            div.style.display="flex";
            div.style.flexDirection="column";
            div.style.justifyContent="space-between";
            div.style.border="1px solid #00ffff";
            div.style.padding="10px";
            div.style.margin="10px";
            div.style.borderRadius="20px";
            div.style.width="20VW";
            div.style.minHeight="35VH";
            div.style.backgroundColor="rgba(129, 169, 201, 0.2)";
            div.style.alignItems="center";
            attachDeleteFunction(div);
            return div;
}

 function updateDiv(cardId, question, answer) {
    const div = document.querySelector(`.card .CardId:contains(${cardId})`).parentElement;
    div.querySelector('h3').innerText
    div.querySelector('p').innerText = answer;
 }
    
function attachEditFunction(div,Question,Answer) {
    const editButton = div.querySelector('#EditsubmitDeck');
    editButton.addEventListener('click', () => {
        const cardId = div.querySelector('.CardId').innerText;
        fetch('/public/assets/php/card.php', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cardId, question: Question, answer: Answer })

        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                div.querySelector('h3').innerText = Question;
            div.querySelector('p').innerText = Answer;
            }
            else alert('Error Editing card');
        });
    });
}

function attachDeleteFunction(div) {
    const deleteButton = div.querySelector('.Delete-Card');
    deleteButton.addEventListener('click', () => {
        const cardId = div.querySelector('.CardId').innerText;
        fetch('/public/assets/php/card.php', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cardId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) div.remove();
            else alert('Error deleting card ,'+data.error);
        });
    });
}

// Attach delete function to all existing cards on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card').forEach(div => {
        attachDeleteFunction(div);
    });
});

