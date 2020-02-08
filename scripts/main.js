var fileClient = SolidFileClient;

const popupUri= 'popup.html';
$('#login  button').click(() => solid.auth.popupLogin() );
/*$('#login button').click(() => {
fileClient.popupLogin().then( webId => {
   console.log( `Logged in as ${webId}.`)
}, err => console.log(err) );

});*/
$('#logout button').click(() => solid.auth.logout());
// Update components to match the user's login status
/*var paths = {
  "uploads": "private/ZB/UPLOADS/",
  "posts": "private/ZB/POSTS/",
  "profile": "private/ZB/profile.ttl",
};*/

var xobj = new XMLHttpRequest()
    xobj.open('GET', 'scripts/path.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                localStorage.setItem('paths',xobj.responseText)
          }
    };
    xobj.send(null);  
    var paths = JSON.parse(localStorage.getItem('paths'));
var APP_FOLDER  = "public/SNS/";
var username;
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  if (loggedIn) {
    var UserLink = getUsername(session.webId);
    console.log(session);
    console.log(UserLink);
    
    
    username = UserLink;
    $('#loader').show();
     fileClient.createFolder(UserLink + APP_FOLDER).then(fileCreated => {

    fileClient.createFolder(UserLink + paths['posts']).then(fileCreated => {
    }, err => {console.log(err);solid.auth.logout()});

    fileClient.createFolder(UserLink + paths['uploads']).then(fileCreated => {
      writeProfile(session.webId, UserLink + paths['profile']);
      createACL(paths['profile'],session.webId,true).then(function(){
        setTimeout(function(){window.location.href="newsfeed/index.html"},2500);  
      });
    }, err => {
      console.log(err);
      solid.auth.logout();
          
        }
    );
    }, err => {console.log(err);solid.auth.logout()});


  }

});

async function writeProfile(fro, to) {
  var predicatesToSearch = {
    'friend': 'http://xmlns.com/foaf/0.1/knows',
    'name': 'http://xmlns.com/foaf/0.1/name',
    'country': 'http://www.w3.org/2006/vcard/ns#country-name',
    'region': 'http://www.w3.org/2006/vcard/ns#region',
    'address': 'http://www.w3.org/2006/vcard/ns#street-address'
  };
  fileClient.fetchAndParse(fro, 'text/turtle').then(graph => {
    var parsed = JSON.stringify(graph);
    var parsed1 = JSON.parse(parsed);

    //console.log(parsed1);
    var me = parsed1['statements'];
    
    var k = Object.keys(predicatesToSearch);
    for (k in predicatesToSearch) {
    searchAndWrite(me, predicatesToSearch[k], to, k).then(console.log('INSERTED',k));

    }    
  });
 
  
}
async function searchAndWrite(me, u, url, alias) {
  const doc = solid.data[url];
  const dtype = solid.data['http://schema.org/Document']
  const about = 'http://schema.org/';
  await doc.type.add(dtype);
  for (var i = 0; i < me.length; i++) {
    if (me[i]['predicate'].value == u) {
      console.log(me[i]['object'].value);
      await doc[about + alias].add(me[i]['object'].value);
    }
  }
 

}
function getUsername(profileURL) {
  var index = profileURL.indexOf("profile");
  var substring = profileURL.substr(0, index);
  return substring;
}
