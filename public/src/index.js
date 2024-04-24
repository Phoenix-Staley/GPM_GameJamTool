// const bcrypt = require('bcrypt'); // don't worry about it for now

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  createJamTest();
  set_all_game_jams();
});

// initializations
let all_game_jams = [];

// creates a jam for testing purposes
async function createJamTest(){
  const response = await fetch(
    'http://localhost:3000/postJam?' + new URLSearchParams({
      titel: 'Test Jam',
      date: 'April 23',
      description: 'test description'
    }), 
    {method: 'POST'}
    );

    let status = response.status;
    console.log('inside test' + status);
}

// sets the array of gamejams
async function set_all_game_jams(){

  const response = await fetch(
  'http://localhost:3000/getJams?', 
  {method: 'POST'}
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