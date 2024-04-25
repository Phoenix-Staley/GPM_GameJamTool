// const bcrypt = require('bcrypt'); // don't worry about it for now

//const e = require("express");

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    update_page(test_jam);
});

// initializations

// for testing
const test_jam = {
  title: 'future jam test 2',
  date: 'May 5, 2024 23:00',
  description: 'future jam test 2 desc',
  participants: ['test user1', 'test user 2'],
  post: []
}

// game jam title elem
const title_elem = document.getElementById('title');
// start date elem
const start_date_elem = document.getElementById('start_date');
// end date elem
const end_date_elem = document.getElementById('end_date');
// description elem
const description_elem = document.getElementById('description');
// div to place participants under
const participants_div = document.getElementById('participants_div');

// updates the page with the relavent details
function update_page(game_jam) {

  title_elem.textContent = game_jam.title;
  start_date_elem.textContent = 'Starts: ' + game_jam.date;
  description_elem.textContent = 'Description: ' + game_jam.description;

  fill_users(game_jam);

}

// fills the user div with all participants
function fill_users(game_jam){
  
  game_jam.participants.forEach(function(user){
    let username = document.createElement('h3');
    username.textContent = user;
    insertAfter(participants_div, username);
  });
}


function insertAfter(ref, _new) {
  ref.parentNode.insertBefore(_new, ref.nextSibling);
}
