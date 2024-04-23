

const bcrypt = require('bcrypt');

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