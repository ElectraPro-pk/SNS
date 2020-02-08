const fileClient = SolidFileClient;
/*var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
};*/
paths = JSON.parse(localStorage.getItem('paths'));

async function addFriend(){
    friend_Id = $('#username').text();
    myProfileFile = getUsername($('#webd').text()) + paths['profile'];
    
    var doc = solid.data[myProfileFile];
    var refer = 'http://schema.org/friend';
    console.log(`FRIEND URL : ${friend_Id}`)
    await doc[refer].add(friend_Id).then(res=>{
       window.location.reload();
    },err =>console.log(err));

}

function loadProfile() {

    var url_string =  window.location.href;
    var url = new URL(url_string);
    var webId = url.searchParams.get("id");
    var username;
    fileClient.fetchAndParse(webId).then(async function(){
        pro =  getUsername(webId)+paths['profile'];
        console.log(pro);
        const file = solid.data[pro];
        header = 'http://schema.org/';
        currentPrivacy = await file[header + 'privacy'];
        if(currentPrivacy == "public")
        {
             console.log(webId+" FOUND");
            loadPro(webId);
        }
        if(currentPrivacy == "private")
        {
           document.getElementById('pf').innerHTML = `<br><br><br><br><h1 id="error"> ${webId}<br> SNS PROFILE NOT FOUND</h1>`;
        }
        }).catch(err => document.getElementById('pf').innerHTML = `<br><br><br><br><h1 id="error"> ${webId}<br> SNS PROFILE NOT FOUND</h1>`);
    
}
function search_if_Exists(id, obj){
   check = false;
   for(i=0;i<obj.length;i++){
    if(obj[i]['predicate'].value == 'http://schema.org/friend')
    if(obj[i]['object'].value == id){
        check = true;
    }
   }
   return check;   
}
async function remFriend(){
    friend_Id = $('#username').text();
    myProfileFile = getUsername($('#webd').text()) + paths['profile'];    
    var doc = solid.data[myProfileFile];
    var refer = 'http://schema.org/friend';
    var cat = 'http://schema.org/';
    
    await doc[cat + 'Family'].delete(friend_Id);
    await doc[cat + 'Restricted'].delete(friend_Id);
    await doc[cat + 'Close'].delete(friend_Id);
    await doc[cat + 'Work'].delete(friend_Id);
    
    await doc[refer].delete(friend_Id).then(res=>{
        
      
        window.location.reload();
    },err =>console.log(err));

}
function loadPro(webId) {
    $('#alF').hide();
    $('#add').hide();
   
    myProfile = getUsername($('#webd').text()) + paths['profile'];
    fileClient.fetchAndParse(myProfile, 'text/turtle').then(graph => {
        var parsed = JSON.stringify(graph);
        var parsed1 = JSON.parse(parsed);
        var m = parsed1['statements'];             
        if(search_if_Exists(webId,m)){
            $('#alF').show();
        }
        else{
            $('#add').show();
        }

    },err =>console.log(err));
           

            username = getUsername(webId);
            $('#username').text(webId);
            fileClient.fetchAndParse(username + paths['profile'], 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
                var m = parsed1['statements'];
                $(document).ready(function () {
                    var predicates = {
                        'dp':'http://schema.org/dp',
                        'username':'http://schema.org/name',
                        'address':'http://schema.org/address',
                        'region':'http://schema.org/region',
                        'country':'http://schema.org/country',
                    };
                    var dp= '';
                    var username = '';
                    var address = '';
                    var region = '';
                    var country = '';
                    //k = Object.keys(predicates);
                    for (key in predicates){
                        for(var i=0;i<m.length;i++){
                            if(m[i]['predicate'].value == predicates[key]){
                                switch(key){
                                    case 'dp':$('#dp').attr('src',m[i]['object'].value);$('#home').attr('src',m[i]['object'].value);break;
                                    case 'username':$('#usernameI').val(m[i]['object'].value);break;
                                    case 'address':$('#address').val(address = m[i]['object'].value);break;
                                    case 'region':$('#region').val(m[i]['object'].value);break;
                                    case 'country':$('#country').val(m[i]['object'].value);break;
                                }
                            }
                        }
                    }
                    /*$('#dp').attr('src', m['http://schema.org/dp']['object'].value);
                    $('#usernameI').val(m['http://schema.org/name']['object'].value);
                    $('#address').val(m[1]['http://schema.org/address'].value);
                    $('#region').val(m[7]['http://schema.org/region'].value);
                    $('#country').val(m[2]['http://schema.org/country'].value);
*/
                    
                    
                      for(var i=0;i<m.length;i++){
                        if(m[i]['predicate'].value == 'http://schema.org/friend'){
                              
                            $('#friendlist').append(`<li><a  href="searched.html?id=${encodeURIComponent(m[i]['object'].value)}">${m[i]['object'].value}</a></li>`);
                          }
                      }
                    

                },err =>{
                    document.getElementById('pf').innerHTML = `<br><br><br><br><h1 id="error">${webId}<br>SNS PROFILE NOT FOUND</h1>`;
                });

            },err => {
                document.getElementById('pf').innerHTML = `<br><br><br><br><h1 id="error"> ${webId}<br>SNS PROFILE NOT FOUND</h1>`;
            });
        
}
function getUsername(profileURL) {
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
}