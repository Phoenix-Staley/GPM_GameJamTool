

//const bcrypt = require('bcrypt'); // don't worry about for now
/*
async function foo(){

    const response = await fetch('http://localhost:3000/signUp?' + 
    new URLSearchParams({username: 'johndoe123', name: 'John Doe', password_encoded: 'hello'}), {method: 'POST'});
    const response_text = await response.json();
    console.log(response_text);
    return;
}

foo();*/

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  validate_input_fields();
});

// login button functionality
let create_account_button = document.getElementById('submit_account_creation');
create_account_button.addEventListener('click', testClick);

let email_input = document.getElementById('email_input');
email_input.addEventListener('input', validate_input_fields);

let password_input = document.getElementById('password_input');
password_input.addEventListener('input', validate_input_fields);

let password_confirmation_input = document.getElementById('password_confirm_input');
password_confirmation_input.addEventListener('input', validate_input_fields);

// ensures that the input fields are not empty and do not contain spaces
function validate_input_fields(){
  console.log(password_input.value );
  console.log(password_input.value.includes(' '));
  console.log(password_input.value.includes(' '));
  if (email_input.value.includes(' ') || password_input.value.includes(' ')
      || email_input.value === '' || password_input.value === ''){
    create_account_button.disabled = true;
  }
  else if (password_confirmation_input.value !== password_input.value) {
    create_account_button.disabled = true;
  }
  else{
    create_account_button.disabled = false;
  }
}



async function testClick(){
  const response = await fetch('http://localhost:3000/signUp?' + 
    new URLSearchParams({username: email_input.value, name: 'John Doe', password_encoded: password_input.value}), {method: 'POST'});
  const response_text = await response.json();
  //console.log(response_text);
  console.log(response.status);
}

// if (response.ok) { // if HTTP-status is 200-299

/*
//http://localhost:3000/[dir]
fetch(new Request(  {
    url: 'http://example.com/getUser?' + new URLSearchParams( { username: 'johndoe123'}),
    method: 'GET'
    }
));

// goes in method param
// GET, getter
// POST, add new to database
// PUT, update existing item
// DELETE, removes item

// fetch returns response obj, contains status property (ie 404: page not found)(mostly 2XX)
// 2XX == success
// others == bad
// if 5XX call phoenix
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

async function fetchMovies() {
    const response = await fetch('/movies');
    // waits until the request completes...
    console.log(response);
  }

  fetch(new Request({
    url: 'http://localhost:3000/signUp?' + new URLSearchParams({
    username: 'johndoe123',
    name: 'John Doe',
    password_encoded: 'hello'
    }),
    method: 'POST'
    }));
    
  */



