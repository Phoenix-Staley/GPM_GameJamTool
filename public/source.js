

//const bcrypt = require('bcrypt'); // don't worry about for now

async function foo(){

    const response = await fetch('http://localhost:3000/signUp?' + 
    new URLSearchParams({username: 'johndoe123', name: 'John Doe', password_encoded: 'hello'}), {method: 'POST'});
    const response_text = await response.json();
    console.log(response_text);
    return;
}

foo();

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





