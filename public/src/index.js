//const fetch = require('cross-fetch');
//import fetch from '../node_modules/cross-fetch/';
//import fetch from 'cross-fetch';

// date/time format
const date_options = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: 'numeric', 
  minute: 'numeric',
  hour12: false // use military time
};

// const bcrypt = require('bcrypt'); // don't worry about it for now

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  //createJamTest();
  //set_all_game_jams();
  set_all_game_jams_test();
  draw_all_game_jams();
});

// initializations
let all_game_jams = [];
const future_div = document.getElementById('future');
const ongoing_div = document.getElementById('ongoing');
const past_div = document.getElementById('past');



// creates a jam for testing purposes
async function createJamTest(){ // user must be logged in to make req

  const response = await fetch(
    'https://gamejammanager-gpmj-0bab434416a3.herokuapp.com/postJam?' + new URLSearchParams({
      title: 'Test Jam',
      date: 'April 23',
      description: 'test description'
    }), 
    {method: 'POST'}
    );

    let status = response.status;
    console.log('inside test ' + status);
}

/* post object
{
 title: { S: "someString" },
 content: { S: "someString },
 jam_title: { S: "someString" },
 comments: [{
             poster: { S: "someUsername" },
             content: { S: "someString" }
       }]
}

*/


/* jam object
jam = {
        title: "title",
        date: "May 48th, 2098",
        description: "someString",
        participants: ["username1", "username2"],
        posts: [postObject1, postObject2]
    }
*/

/* date/time format
const v = new Date('July 20, 2069 at 20:17');
console.log(v.getTime());

converts from ms to string
console.log(date.toLocaleDateString('en-US', date_options));
*/

// creates a couple hardcoded jams for testing
function set_all_game_jams_test(){
  for (let i = 1; i <= 5; i++){
    all_game_jams.push({
      title: 'jam ' + i,
      date: 'May ' + i + ', 2024 ' + i + ':00',
      description: 'jam ' + i + ' description',
      particpants: ['user 1', 'user 2'],
      post: []
    })
  }
}

// sets the array of gamejams
async function set_all_game_jams(){

  const response = await fetch(
  'https://gamejammanager-gpmj-0bab434416a3.herokuapp.com/getJams?', 
  {method: 'GET'}
  );
  
  let status = response.status; // 201 if successfull, 404 if no jams

  if (status === 404){ // no jams found
  }
  else if (status === 201){ // success
    all_game_jams = response.json(); // not sure if correct format
  }
  else{ // idk something got fucked up

  }
}

function draw_all_game_jams(){

  // creates a game jam div for each jam
  all_game_jams.forEach(function(jam){

    let jam_div = document.createElement('div');
    jam_div.classList.add('jam');
    let a_tag = document.createElement('a');
    //a_tag.setAttribute('href', 'game_jam_view.html');
    a_tag.addEventListener('click', function() {
      test_jam_click(jam)});
    let title = document.createElement('h2');
    title.classList.add('jam_name');
    title.textContent = jam.title;
    let begin_time = document.createElement('p');
    begin_time.textContent = jam.date;
    let p_count = document.createElement('p');
    p_count.textContent = jam.particpants.length + ' participants';
  
    jam_div.appendChild(a_tag);
    a_tag.appendChild(title);
    insertAfter(title, begin_time);
    insertAfter(begin_time, p_count);

    // check date of jam to determine category
    const current_date = new Date();
    const jam_date = new Date(jam.date);
    if (jam_date < current_date){ // past jam
      insertAfter(past_div, jam_div);
    }
    else if (jam_date > current_date){
      insertAfter(future_div, jam_div);
    }
  })
}

function insertAfter(ref, _new) {
  ref.parentNode.insertBefore(_new, ref.nextSibling);
}

function test_jam_click(game_jam){
  // Dispatch a custom event called 'gameJamDetailsUpdated' with the updated details
  var event = new CustomEvent('gameJamDetailsUpdated', { detail: game_jam});
  document.dispatchEvent(event);

  window.location.href = 'game_jam_view.html';
}