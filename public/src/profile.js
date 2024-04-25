// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    update_page(test_user);
});

/*
profile object
{
    username: "string",
    name: "string",
    isAdmin: false,
    bio: "string"
}
*/

// inits
const profile_title = document.getElementById('profile_title');
const bio = document.getElementById('bio');


// testing
const test_user = {
  username: 'test user',
  name: 'first last',
  isAdmin: false,
  bio: 'test user bio here'
}

function update_page(user){
  profile_title.textContent = user.username;
  bio.textContent = user.bio;
}