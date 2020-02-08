
const fileClient   = SolidFileClient

function chat(t){
    friend_id = t.className;
   friend_name = friendsData[friend_id].name;
$('#friendUN').text(friend_name);
friend = getname(friend_id);

}
/*
var paths = {
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
allFriends = [];
friendsData = {};
async function setName(){
    for(i=0;i<allFriends.length;i++){
        var doc = solid.data[allFriends[i]];
        var refer = "http://xmlns.com/foaf/0.1/name";   
        a = await doc[refer];
        n =  await a.toString();
        $('#'+getname(allFriends[i])).text(n);  
        friendsData[allFriends[i]] = {
            "name":n,
            "webId":allFriends[i]
            } ;
        
    }
}
function getname(str){
    wordToFind =".solid.community/profile/card#me"
    z = str.substr("https://".length);
    a = z.indexOf(wordToFind);
    name = z.substr(0,a);
    return name;
}

async function loadAll(){
    FileURL = getUsername($('#webd').text()) + paths['profile'];
    fileClient.fetchAndParse(FileURL, 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
                var m = parsed1['statements'];
                     for(var i=0;i<m.length;i++){
                 if(m[i]['predicate'].value == 'http://schema.org/friend'){
                      allFriends.push(m[i]['object'].value);
                            $('#friends').append(`<a href="#" onclick="chat(this)" class="${m[i]['object'].value}"><span id="${getname(m[i]['object'].value)}"></span><br><span class="small">${m[i]['object'].value}</span></a><hr>`);
                          }
                    }
}).then(function(){
    setName().then(function(){
        $('#spinner').fadeOut(500);
    });
});
console.clear();

}

