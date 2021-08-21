// Constructor function to create user objects
function User(name, username, email, password) {
  this.name = name;
  this.username = username;
  this.email = email;
  this.password = password;
}

// Getting the name of the page
var pageURL = window.location.toString();
var pageName = pageURL.slice(pageURL.lastIndexOf("/"));

// Getting users from the database
let fetchUsers = () => {
  return new Promise((resolve, reject) => {
    firebase.database().ref("users").once("value", (userObjs) => {
      resolve(userObjs.val());
    });
  });
};

// Function to validate input fields
async function validateInput() {
  let loader = document.getElementById("loader");
  loader.style.display = "block";
  let users = await fetchUsers();
  let fields = document.getElementsByTagName("input");
  let validInput = false;
  let regex;
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].id === "name-field") {
      regex = /^(?=.{3,30}$)[a-z]+(?:['_.\s][a-z]+)*$/gim;
      if (!regex.test(fields[i].value)) {
        loader.style.display = "none";
        fields[i].focus();
        fields[i].select();
        fields[i].classList.add("invalid");
        document.querySelector("#name-message").className = "message";
        return false;
      } else {
        fields[i].classList.remove("invalid");
        document.querySelector("#name-message").className = "hidden";
      }
    }
    if (fields[i].id === "username-field") {
      regex = /^(?=.*[a-zA-Z]{1,})(?=.*[\d]{0,})[a-zA-Z0-9]{5,15}$/gim;
      if (!regex.test(fields[i].value)) {
        loader.style.display = "none";
        fields[i].focus();
        fields[i].select();
        fields[i].classList.add("invalid")
        document.querySelector("#username-message").className = "message";
        return false;
      } else {
        fields[i].classList.remove("invalid");
        document.querySelector("#username-message").className = "hidden";
        for (let key in users) {
          if (users[key].username ===
            fields[i].value) {
            loader.style.display = "none";
            fields[i].focus();
            fields[i].value = "";
            fields [i].placeholder = "This username is not available!";
            return false;
          }
        }
      }
    }
    if (fields[i].id === "email-field") {
      if (pageName === "/login.html") {
        loader.style.display = "none";
        var emailMessage = document.getElementsByClassName("login-page-message")[0];
        emailMessage.innerText = "Invalid email!";
      }
      regex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
      if (!regex.test(fields[i].value)) {
        loader.style.display = "none";
        fields[i].focus();
        fields[i].select();
        fields[i].classList.add("invalid");
        document.querySelector("#email-message").className = "message";
        return false;
      } else {
        fields[i].classList.remove("invalid");
        document.querySelector("#email-message").className = "hidden";
        if (pageName !== "/login.html") {
          for (let key in users) {
            if (users[key].email ===
              fields[i].value) {
              loader.style.display = "none";
              fields[i].focus();
              fields[i].value = "";
              fields [i].placeholder = "This email is not available!";
              return false;
            }
          }
        }
      }
    }
    if (fields[i].id === "pass-field") {
      if (pageName === "/login.html") {
        loader.style.display = "none";
        var passMessage = document.getElementsByClassName("login-page-message")[1];
        passMessage.innerText = "Invalid password!";
      }
      regex = /^((?=\S*?[a-zA-Z])(?=\S*?[0-9]).{6,})\S$/;
      if (!regex.test(fields[i].value)) {
        loader.style.display = "none";
        fields[i].focus();
        fields[i].select();
        fields[i].classList.add("invalid");
        document.querySelector("#pass-message").className = "message";
        return false;
      } else {
        fields[i].classList.remove("invalid");
        document.querySelector("#pass-message").className = "hidden";
        if (pageName !== "/login.html") {
          for (let key in users) {
            if (users[key].password ===
              fields[i].value) {
              loader.style.display = "none";
              fields[i].focus();
              fields[i].value = "";
              fields [i].placeholder = "This password is not available!";
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}

// Function to store user objects in firebase realtime database
async function storeUser() {
  let isValidInput = await validateInput();
  if (!isValidInput) {
    return;
  } else {
    let loader = document.getElementById("loader");
    let successAlert = document.getElementById("success-alert");
    let name = document.getElementById("name-field").value;
    let username = document.getElementById("username-field").value;
    let email = document.getElementById("email-field").value;
    let password = document.getElementById("pass-field").value;
    let user = new User(name, username, email, password);
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userObj) => {
      loader.style.display = "none";
      successAlert.style.display = "flex";
      firebase.database().ref(`users/${userObj.user.uid}`).set(user);
      setTimeout(() => {
        window.location = "profile.html";
      }, 1500);
    })
    .catch((error) => {
      console.log("error", error.message);
    });
  }
}

// Function to check for user attributes in firebase realtime database
async function checkUser() {
  let isValidInput = await validateInput();
  if (!isValidInput) {
    return;
  } else {
    let loader = document.getElementById("loader");
    let successAlert = document.getElementById("success-alert");
    loader.style.display = "block";
    let emailFound = true;
    let passFound = true;
    let email = document.getElementById("email-field").value;
    let password = document.getElementById("pass-field").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userObj) => {
      successAlert.style.display = "flex";
      loader.style.display = "none";
      firebase.database().ref(`users/${userObj.user.uid}`).once("value", (userObj) => {
        window.location = "profile.html";
      });
    })
    .catch((error) => {
      if (error.message.indexOf("user record") !== -1) {
        emailFound = false;
      } else {
        passFound = false;
      }
      if (!emailFound) {
        loader.style.display = "none";
        let emailField = document.getElementById("email-field");
        emailField.focus();
        emailField.select();
        emailField.classList.add("invalid");
        let emailMessage = document.getElementsByClassName("login-page-message")[0];
        emailMessage.innerText = "Email not found!";
        let messageDiv = document.getElementById("email-message");
        messageDiv.className = "message";
      } else if (!passFound) {
        loader.style.display = "none";
        let passField = document.getElementById("pass-field");
        passField.focus();
        passField.select();
        passField.classList.add("invalid");
        let passMessage = document.getElementsByClassName("login-page-message")[1];
        passMessage.innerText = "Incorrect password!";
        let messageDiv = document.getElementById("pass-message");
        messageDiv.className = "message";
      }
    });
  }
}

// Function to log user out of the page
function logOut() {
  let loader = document.getElementById("loader");
  let logoutAlert = document.getElementById("logout-alert");
  loader.style.display = "block";
  firebase.auth().signOut().then(() => {
    loader.style.display = "none";
    logoutAlert.style.display = "flex";
    setTimeout(() => {
      window.location = "login.html";
    },
      1500);
  })
};

/* Sign Up Page Scripts - Start */
if (pageName === "/" || pageName === "/index.html") {
  let signUpBtn = document.getElementById("sign-up-btn");
  signUpBtn.onclick = storeUser;
}
/* Sign Up Page Scripts - End */

/* Login Page Scripts - Start */
else if (pageName === "/login.html") {
  firebase.auth().onAuthStateChanged(
    (user) => {
      if (user) {
        window.location = "profile.html";
      } else {
        let loginBtn = document.getElementById("login-btn");
        loginBtn.onclick = checkUser;
      }
    });
}
/* Login Page Scripts - End */

/* Profile Page Scripts - Start */
else {
  let modal = document.getElementById('modal');
  modal.classList.add('modal-open');
  modal.classList.remove('modal-close');
  modal.style.display = "block";
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref(`users/${user.uid}`).once("value", (user) => {
        modal.classList.add('modal-close');
        modal.classList.remove('modal-open');
        modal.style.display = "none";
        let userObj = user.val();
        let loader = document.getElementById("loader");
        let logoutBtn = document.getElementById("logout-btn");
        let nameP = document.getElementById("name");
        let uNameP = document.getElementById("username");
        let emailP = document.getElementById("email");
        nameP.innerHTML = userObj.name;
        uNameP.innerHTML = userObj.username;
        emailP.innerHTML = userObj.email;
        logoutBtn.onclick = function() {
          logOut();
        }
      })
    } else {
      window.location = "login.html"
    }
  });
}
/* Profile Page Scripts - End */