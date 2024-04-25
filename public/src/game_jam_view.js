// const bcrypt = require('bcrypt'); // don't worry about it for now

//const e = require("express");

// called when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  update_page(test_jam);
});

// initializations


/* post object
{
 title: "someString",
 content: "someString",
 jam_title: "someString",
 comments: [{
             poster: "someUsername" ,
             content: "someString"
            }]
}
*/

/* example removed from html page

 <div class="container" id="post_container"> <!-- contains each post -->
                    <div class="post"> <!-- post_div -->
                        <h2>This is a post</h2> <!-- post_title -->
                        <a href=""></a><h4>posted by User1</h4></a> <!-- ignored -->

                        <div class="container"> <!-- contains each comment -->
                            <div class="comment">
                                <p>this is a comment</p>
                                <a href=""><h4> - User2</h4></a>
                                <button class="reply_button">Reply</button>

                                <!-- replies are structured by placing a comment container inside of another comment container-->
                                <div class="container">
                                    <div class="comment">
                                        <p>this is a reply to that comment</p>
                                        <a href=""><h4> - User3</h4></a>
                                        <button class="reply_button">Reply</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="container">
                            <div class="comment">
                                <p>this is also a comment</p>
                                <a href=""><h4> - User4</h4></a>
                                <button class="reply_button">Reply</button>
                            </div>
                        </div>

                        
                    <!-- reply to post-->
                    <div class="item_details">
                        <form>
                            <input type="text"><br>
                            <button>Reply</button>
                        </form>
                    </div>
                    </div>
                </div>
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
  title: 'future jam test 2',
  date: 'May 5, 2024 23:00',
  description: 'future jam test 2 desc',
  participants: ['test user1', 'test user 2', 'test user 3'],
  post: [post_1, post_2]
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
// div to place posts under
const info_subeading = document.getElementById('info_subheading');

// updates the page with the relavent details
function update_page(game_jam) {

  title_elem.textContent = game_jam.title;
  start_date_elem.textContent = 'Starts: ' + game_jam.date;
  description_elem.textContent = 'Description: ' + game_jam.description;

  fill_users(game_jam);
  fill_posts(game_jam);
}

// fills the user div with all participants
function fill_users(game_jam){
  game_jam.participants.forEach(function(user){
    let username = document.createElement('h3');
    username.textContent = user;
    insertAfter(participants_div, username);
  });
}

// fills the post div with all posts
function fill_posts(game_jam){
  game_jam.post.forEach(function(post){

    // parent div of each post
    let post_container = document.createElement('div');
    post_container.classList.add('container');
    post_container.id = 'post_container';

    // post div
    let post_div = document.createElement('div');
    post_div.classList.add('post');

    // title of post
    let post_title = document.createElement('h2');
    post_title.textContent = post.title;

    // construction
    post_div.appendChild(post_title);

    // get all comments
    let comments_list = create_comment_elems(post.comments);
    comments_list.forEach(function(comment_div){
      insertAfter(post_title, comment_div);
    });
    post_container.appendChild(post_div);
    insertAfter(info_subeading, post_container);

    // create reply bar
    let reply_div = document.createElement('div');
    reply_div.classList.add('item_details');
    let form = document.createElement('form');
    let input = document.createElement('input');
    input.type = 'text';
    let button = document.createElement('button');
    button.textContent = 'Reply';
    // construction
    reply_div.appendChild(form);
    form.appendChild(input);
    insertAfter(input, button);
    post_div.appendChild(reply_div);
  });
}

function create_comment_elems(comments){
  let comment_divs = [];
  comments.forEach(function(comment) {

    // comment container div
    let comment_container = document.createElement('div');
    comment_container.classList.add('container');

    // comment div
    let comment_div = document.createElement('div');
    comment_div.classList.add('comment');

    // comment contents
    let comment_p = document.createElement('p');
    comment_p.textContent = comment.content;

    // user that commented
    let user = document.createElement('h4');
    user.textContent = '- ' + comment.poster;

    // reply button
    let reply_button = document.createElement('button');
    reply_button.classList.add('reply_button');
    reply_button.textContent = 'Reply';

    // construction
    comment_div.appendChild(comment_p);
    insertAfter(comment_p, user);
    insertAfter(user, reply_button);
    comment_container.appendChild(comment_div);

    comment_divs.push(comment_container);
  });

  return comment_divs;
}

function insertAfter(ref, _new) {
  ref.parentNode.insertBefore(_new, ref.nextSibling);
}
