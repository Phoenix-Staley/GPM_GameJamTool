// const bcrypt = require('bcrypt'); // don't worry about it for now

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    validate_input_fields();
});

// ensures that the input fields are not empty and do not contain spaces
function validate_input_fields(){
  if (username_input.value.includes(' ') || password_input.value.includes(' ')
      || username_input.value === '' || password_input.value === ''){
    login_button.disabled = true;
  }
  else{
    login_button.disabled = false;
  }
}

// login button functionality
let login_button = document.getElementById('login_button');
login_button.addEventListener('click', login);

let username_input = document.getElementById('username_input');
username_input.addEventListener('input', validate_input_fields);

let password_input = document.getElementById('password_input');
password_input.addEventListener('input', validate_input_fields);

// attempts to login a prexisting user
async function login(){
  
}