// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    update_page(get_view_profile());
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

// parses the cookie to get the selected gamejam
function get_view_profile(){

  const cookies = document.cookie.split('; ');
  let profile = null;

  cookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      if (name === 'view_profile') {
          profile = JSON.parse(decodeURIComponent(value));
      }
  });

  return profile;
}

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