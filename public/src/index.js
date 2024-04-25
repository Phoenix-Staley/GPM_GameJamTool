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
  //set_all_game_jams_test();
  set_all_game_jams();
  set_all_users();
  //draw_all_game_jams();
});

// initializations
let all_game_jams = [];
let all_users = [];
const future_div = document.getElementById('future');
const ongoing_div = document.getElementById('ongoing');
const past_div = document.getElementById('past');
const username_input = document.getElementById('search_name');
username_input.addEventListener('input', display_searched_users);

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

/* 
post object
{
 title: { S: "someString" },
 content: { S: "someString },
 jam_title: { S: "someString" },
 comments: [{
             poster: { S: "someUsername" },
             content: { S: "someString" }
       }]
}

jam object
jam = {
        title: "title",
        date: "May 48th, 2098",
        description: "someString",
        participants: ["username1", "username2"],
        posts: [postObject1, postObject2]
}

date/time format
const v = new Date('July 20, 2069 at 20:17');
console.log(v.getTime());

converts from ms to string
console.log(date.toLocaleDateString('en-US', date_options));

profile object
{
    username: "string",
    name: "string",
    isAdmin: false,
    bio: "string"
}
*/


// for testing
const post_1 = {
  title: 'test post 1',
  content: 'content of post',
  jam_title: "NA",
  comments: [{poster: 'user 1', content: 'user 1\'s comment'}]
}
const post_2 = {
  title: 'test post 2',
  content: 'content of post',
  jam_title: "NA",
  comments: [
    {poster: 'user 2', content: 'user 2\'s comment'},
    {poster: 'user 3', content: 'user 3\'s comment'}
  ]
}
const test_jam = {
  title: 'game jam with posts',
  date: 'May 5, 2024 23:00',
  description: 'future jam test 2 desc',
  participants: ['test user1', 'test user 2', 'test user 3'],
  post: [post_1, post_2]
}

// creates a couple hardcoded jams for testing
function set_all_game_jams_test(){
  
  all_game_jams.push(test_jam);
  for (let i = 1; i <= 5; i++){
    all_game_jams.push({
      title: 'jam ' + i,
      date: 'May ' + i + ', 2024 ' + i + ':00',
      description: 'jam ' + i + ' description',
      participants: ['user 1', 'user 2'],
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
  console.log(status);
  if (status === 404){ // no jams found
  }
  else if (status === 200){ // success
    all_game_jams = await response.json(); // not sure if correct format
  }
  else{ // idk something got fucked up

  }

  all_game_jams.push(test_jam);

  // has to go after the await response
  draw_all_game_jams();
}

async function set_all_users(){
  const response = await fetch(
    'https://gamejammanager-gpmj-0bab434416a3.herokuapp.com/getUsers?', 
    {method: 'GET'}
    );

  let status = response.status;
  
  if (status === 200){
    all_users = await response.json();
  }
}

function draw_all_game_jams(){

  // creates a game jam div for each jam
  all_game_jams.forEach(function(jam){

    console.log(jam);

    let jam_div = document.createElement('div');
    jam_div.classList.add('jam');

    let a_tag = document.createElement('a');
    //a_tag.setAttribute('href', 'game_jam_view.html');
    a_tag.addEventListener('click', function() {
      game_jam_clicked(jam)});

    let title = document.createElement('h2');
    title.classList.add('jam_name');
    title.textContent = jam.title;

    let begin_time = document.createElement('p');
    begin_time.textContent = jam.date;

    let p_count = document.createElement('p');
    p_count.textContent = jam.participants.length + ' participants';
  
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

function game_jam_clicked(game_jam){
  
  // store the game jam clicked as a cookie
  document.cookie = 'game_jam=' + JSON.stringify(game_jam) + '; ';
  window.location.href = 'game_jam_view.html';
}

// called when a searched user was clicked
// opens the profile view
function user_clicked(user){
  document.cookie = 'view_profile=' + JSON.stringify(user) + '; ';
  window.location.href = 'profile.html';
}

// fills the user div with all participants
function display_searched_users(){
  document.querySelectorAll('.user').forEach(e => e.remove());
  // remove all displayed searched users on empty query
  if (username_input.value === ''){ 
    document.querySelectorAll('.user').forEach(e => e.remove());
  }
  else{ // valid search param
    all_users.forEach(function(user){
      if (user.username.includes(username_input.value)){
        let username = document.createElement('h3');
        username.textContent = user.username;

        let a_tag = document.createElement('a');
        //a_tag.setAttribute('href', 'profile.html');
        a_tag.addEventListener('click', function(){
          user_clicked(user);
        });

        let user_div = document.createElement('div');
        user_div.classList.add('user');

        a_tag.appendChild(username);
        user_div.appendChild(a_tag);
        insertAfter(username_input, user_div);
        }
    });
  }
}