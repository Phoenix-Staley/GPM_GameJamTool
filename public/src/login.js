//const fetch = require('cross-fetch');
//import fetch from '../node_modules/cross-fetch';
//import fetch from 'cross-fetch';


// const bcrypt = require('bcrypt'); // don't worry about it for now

/* admin creds
  username: cesarus123
  password: hello
*/

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

  const response = await fetch(
    'https://gamejammanager-gpmj-0bab434416a3.herokuapp.com/signIn?' + new URLSearchParams({
      username: username_input.value, 
      password_encoded: password_input.value
      }),
      {method: 'POST'});
  
  let status = response.status; // 200 if successful

  console.log(status);
/*
  if (status === 200){
    window.location.assign('index.html');
  }
  */
}