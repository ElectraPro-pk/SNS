var fileClient = SolidFileClient;
/*var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
};*/
paths = JSON.parse(localStorage.getItem('paths'));
function getUsername(profileURL) {
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
}
async function loadAll(){
    FileURL = getUsername($('#webd').text()) + paths['profile'];
    fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
                var m = parsed1['statements'];
                     for(var i=0;i<m.length;i++){
                 if(m[i]['predicate'].value == 'http://schema.org/friend'){
                      console.log(m[i]);
                            $('#friends').append('<tr><td>'+m[i]['object'].value+'</td><td> <button onclick = "removefriend(this)" class="'+m[i]['object'].value+'"> Remove Friend </button> </td><td><button onclick="showmodal(this)" class="'+m[i]['object'].value+'">Category</button></td></tr>');
                          }
                    }
});
}


function showmodal(btn){
    console.log(btn);
    var modal = document.getElementById("myModal");  
    modal.style.display = "block";
    document.getElementById('header').innerHTML=btn.getAttribute('class');
     var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
async function cat(category){
    var friend_id = document.getElementById('header').innerHTML;
    fileURL = getUsername($('#webd').text()) + paths['profile'];
    refer = `http://schema.org/${category}`;
    const doc = await solid.data[fileURL];
    await doc[refer].add(friend_id).then(function(){
          document.getElementById("myModal").style.display = "none";
    });
   
  }
  

  async function remCat(btn){
    var class_names = btn.getAttribute('class');
    var a = class_names.split(" ");

    var fileURL = getUsername($('#webd').text()) + paths['profile'];

    var doc = solid.data[fileURL];
    var refer =    `http://schema.org/${a[0]}`;
    await doc[refer].delete(a[1]).then(function(){
        window.location.reload();
    })
  }
async function removefriend(t){
    var friend_id = t.getAttribute('class');
    fileURL = getUsername($('#webd').text()) + paths['profile'];
    refer = `http://schema.org/friend`;
    const doc = await solid.data[fileURL];
    var cat = 'http://schema.org/';
    
    await doc[cat + 'Family'].delete(friend_id);
    await doc[cat + 'Restricted'].delete(friend_id);
    await doc[cat + 'Close'].delete(friend_id);
    await doc[cat + 'Work'].delete(friend_id);
    await doc[refer].delete(friend_id).then(function(){
        window.location.reload();
    });
}
//<td><button onclick="showmodal(this)" class="'+m[i]['object'].value+'">Category</button></td>
async function loadCategorized(){
    FileURL = getUsername($('#webd').text()) + paths['profile'];
    //close friends//
    fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
                var m = parsed1['statements'];
                     for(var i=0;i<m.length;i++){
                 if(m[i]['predicate'].value == 'http://schema.org/Close'){
                     console.log(m[i]['object'].value);
                    $('#close').append('<tr><td>'+m[i]['object'].value+`</td><td><button onclick="remCat(this)" class="Close ${m[i]['object'].value}">Remove</button> </td></tr>`);
                          }
                    }
});
    //Family Friends//
    fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
        var parsed = JSON.stringify(graph);
        var parsed1 = JSON.parse(parsed);
        var m = parsed1['statements'];
             for(var i=0;i<m.length;i++){
         if(m[i]['predicate'].value == 'http://schema.org/Family'){
             console.log(m[i]['object'].value);
            $('#family').append('<tr><td>'+m[i]['object'].value+`</td><td><button onclick="remCat(this)" class="Family ${m[i]['object'].value}">Remove</button> </td></tr>`);
                  }
            }
});
    //Restricted//
    fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
        var parsed = JSON.stringify(graph);
        var parsed1 = JSON.parse(parsed);
        var m = parsed1['statements'];
             for(var i=0;i<m.length;i++){
         if(m[i]['predicate'].value == 'http://schema.org/Restricted'){
             console.log(m[i]['object'].value);
            $('#restricted').append('<tr><td>'+m[i]['object'].value+`</td><td><button onclick="remCat(this)" class="Restricted ${m[i]['object'].value}">Remove</button> </td></tr>`);
                  }
            }
});   
//work
fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
    var parsed = JSON.stringify(graph);
    var parsed1 = JSON.parse(parsed);
    var m = parsed1['statements'];
         for(var i=0;i<m.length;i++){
     if(m[i]['predicate'].value == 'http://schema.org/Work'){
         console.log(m[i]['object'].value);
        $('#work').append('<tr><td>'+m[i]['object'].value+`</td><td><button onclick="remCat(this)" class="Work ${m[i]['object'].value}">Remove</button> </td></tr>`);
              }
        }
});


}