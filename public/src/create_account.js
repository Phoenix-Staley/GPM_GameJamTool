// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  validate_input_fields();
});


// login button functionality
let create_account_button = document.getElementById('submit_account_creation');
create_account_button.addEventListener('click', create_account);

let email_input = document.getElementById('email_input');
email_input.addEventListener('input', validate_input_fields);

let password_input = document.getElementById('password_input');
password_input.addEventListener('input', validate_input_fields);

let password_confirmation_input = document.getElementById('password_confirm_input');
password_confirmation_input.addEventListener('input', validate_input_fields);

// ensures that the input fields are not empty and do not contain spaces
function validate_input_fields(){
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

// called by 'create account' button
// sends an account creation req to the server
async function create_account(){

  const response = await fetch('http://localhost:3000/signUp?' + 
    new URLSearchParams({username: email_input.value, name: 'John Doe', password_encoded: password_input.value}), {method: 'POST'});
  const response_text = await response.json();
  //console.log(response_text);
  console.log(response.status);
}
