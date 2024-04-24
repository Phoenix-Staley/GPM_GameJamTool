// const bcrypt = require('bcrypt'); // don't worry about it for now

// ** initializiations

// login button functionality
let create_account_button = document.getElementById('submit_account_creation');
create_account_button.addEventListener('click', create_account);

// input functionalities
let username_input = document.getElementById('username_input');
username_input.addEventListener('input', validate_input_fields);

let password_input = document.getElementById('password_input');
password_input.addEventListener('input', validate_input_fields);

let password_confirmation_input = document.getElementById('password_confirm_input');
password_confirmation_input.addEventListener('input', validate_input_fields);

// output message box
let output_div = document.getElementById('output_div');

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  validate_input_fields();
});

// ensures that the input fields are not empty and do not contain spaces
function validate_input_fields(){
  if (username_input.value.includes(' ') || password_input.value.includes(' ')
      || username_input.value === '' || password_input.value === ''){
    create_account_button.disabled = true;
  }
  else if (password_confirmation_input.value !== password_input.value) {
    create_account_button.disabled = true;
  }
  else{
    create_account_button.disabled = false;
  }
}

// called by 'create account' button
// sends an account creation req to the server
async function create_account(){

  clear_output_div();

  const response = await fetch('http://localhost:3000/signUp?' + 
    new URLSearchParams({username: username_input.value, name: 'John Doe', password_encoded: password_input.value}), {method: 'POST'});
  
  let status = response.status; // 201 if successfull, 400 if user already found

  if (status === 201){ // successful
    const message = document.createTextNode('user created successfully');
    output_div.appendChild(message);
    console.log(await response.json()); // gets the user info
    // TODO: login user
    // TODO: send user to self profile page
  }
  else if (status === 400){ // username taken
    const message = document.createTextNode('username taken');
    output_div.appendChild(message);

    // TODO: login user
    // TODO: send user to main page
  }
  
  //const response_text = await response.json();
  //console.log(response_text);
  console.log(response.status);
}

// clears the output div by finding and removing all text nodes
function clear_output_div(){
  
  output_div.childNodes.forEach(node => {
    // Check if the node is a text node
    if (node.nodeType === Node.TEXT_NODE) {
        // Remove the text node
        node.parentNode.removeChild(node);
    }
  });
}
