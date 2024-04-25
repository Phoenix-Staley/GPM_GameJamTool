// const bcrypt = require('bcrypt'); // don't worry about it for now

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    
});

// Function to display game jam details
function displayGameJamDetails(game_jam) {
  // Display the game jam details on the page
  console.log(game_jam.title);
}

// Listen for a custom event called 'gameJamDetailsUpdated'
document.addEventListener('gameJamDetailsUpdated', function(event) {
  // Retrieve the game jam details from the event
  var game_jam = event.detail;
  // Call a function to display the game jam details
  displayGameJamDetails(game_jam);
  console.log('hello world');
});