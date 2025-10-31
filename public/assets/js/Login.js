const authContainer = document.querySelector(".auth-container");
const flashcardApp = document.getElementById("flashcards-app"); // make sure your flashcard app has id="app"
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const switchToSignup = document.getElementById("switch-to-signup");
let isSignup = false;

// Switch between login and signup forms
switchToSignup.addEventListener("click", (e) => {
  e.preventDefault();
  isSignup = !isSignup;

  if (isSignup) {
    authTitle.textContent = "Sign Up";
    authForm.innerHTML = `
      <div class="form-group">
        <input type="text" id="new-username" placeholder="Username" required />
      </div>
      <div class="form-group">
        <input type="email" id="email" placeholder="Email" required />
      </div>
      <div class="form-group">
        <input type="password" id="new-password" placeholder="Password" minlength="6" maxlength="30" required />
      </div>
      <button type="submit" class="auth-btn">Sign Up</button>
    `;
    switchToSignup.textContent = "Already have an account? Login";
  } else {
    authTitle.textContent = "Login";
    authForm.innerHTML = `
      <div class="form-group">
        <input type="text" id="username" placeholder="Username" required />
      </div>
      <div class="form-group">
        <input type="password" id="password" placeholder="Password" required />
      </div>
      <button type="submit" class="auth-btn">Login</button>
    `;
    switchToSignup.textContent = "Sign Up";
  }
});

// Handle login/signup
authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (isSignup) {
    const username = document.getElementById("new-username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("new-password").value.trim();

    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    fetch('/public/assets/php/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name:username, email:email, password:password, isSignup:true })
    })
        .then(res => res.json())
        .then(data => {
          console.log(data);
            if (data.success==0) {
                alert("Username already exists. Please choose another.");
            }else if(data.success==1) {
                alert("Email already registered. Please use another.");
            }
            else if (data.success==2) {
                alert("Account created successfully! You can now login.");
                isSignup = false;
                switchToSignup.click();
            }
            else {
                alert('Error creating account: ' + data.error);
            }
        });
  } else {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch('/public/assets/php/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name:username,password:password })
    })
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        if(data.success==1){
            window.location.replace("mainPage.html");
        }
        else if(data.success==0){
        alert("Invalid username or password.");
    }
    else if(data.success==3){
        alert("Account not verified. Please check your email.");
    }
    else {
        alert('Login failed: ' + data.error);
    }
}
);
}
  
});
