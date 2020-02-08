var fileClient = SolidFileClient;
/*var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
};*/

paths = JSON.parse(localStorage.getItem('paths'));
async function saveChanges(){
    var username = getUsername($('#username').text());
    var file_URL = username + paths['profile'];
    var doc = solid.data[file_URL];
    console.log(file_URL)
      await doc['http://schema.org/name'].set($('#usernameI').val());
      await doc['http://schema.org/address'].set($('#address').val());
      await doc['http://schema.org/region'].set($('#region').val());
      await doc['http://schema.org/country'].set($('#country').val());


}
function loadProfile() {

    var username;
    solid.auth.trackSession(session => {
        if (session) {
            username = getUsername(session.webId);
            $('#username').text(session.webId);
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
                        'privacy' :'http://schema.org/privacy'
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
                                    case 'privacy':
                                        privacy = m[i]['object'].value;
                                        $('#pp').text('Profile Status : '+privacy.toUpperCase());
                                        if(privacy == "private"){
                                            $("#pp").addClass('w3-red');
                                        }
                                        if(privacy == "public"){
                                            $("#pp").addClass('w3-blue');
                                        }
                                        break;
                                }
                            }
                        }
                    }   
                      for(var i=0;i<m.length;i++){
                        if(m[i]['predicate'].value == 'http://schema.org/friend'){
                              
                            $('#friendlist').append(`<li><a  href="searched.html?id=${encodeURIComponent(m[i]['object'].value)}">${m[i]['object'].value}</a></li>`);
                          }
                      }
                    

                });

            });
        }



    });

}

function getUsername(profileURL) {
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
}

$(document).ready(function () {
    $('#logout').click(() => { solid.auth.logout(); console.log('DONE'); window.location.href = '../index.html' });
    $("#dpSelect").change(function(){
        uploadDP();
    });
    $('#chg').hide(); 
    $('#prog').hide();
    $('#ep').click(function(){
        $(this).hide();
        $('#chg').show();
        $('.field').prop('disabled',false);
    });
    $('#chg').click(function(){
        $(this).hide();
        $('#prog').show();
        $('.field').prop('disabled',true);
        saveChanges().then(function(){
                   window.location.reload();
           });
        }); 
});

async function uploadDP(){
    var webd = getUsername($('#username').text());
        console.log(webd);
        
        
        const folder = webd + paths['uploads'];
        const fileInput = document.getElementById('dpSelect');
        const files = fileInput.files;
        
            for (var i = 0; i < files.length; i++) {
                var URI = folder + files[i].name;
                var content = files[i];
                
                SolidFileClient.updateFile(URI, content).then(res => {
                    console.log(res);
                    mediaLink = URI;
                    console.log("media link : ", mediaLink);
                    writeDP(mediaLink,webd + paths['profile']).then(() => {alert('Dp Uploaded!');setTimeout(function(){window.location.reload()},200)});  
                }, err => { console.log("upload error : " + err) });

            }
           
            
            
            
}
async function changePrivacy(){
    fileToChange = getUsername($('#username').text())+paths['profile'];
    console.log(fileToChange);
    const file = solid.data[fileToChange];
    header = 'http://schema.org/';
    currentPrivacy = await file[header + 'privacy'];//read privacy
    if(currentPrivacy == "public"){
      await file[header + 'privacy'].set("private");//write
    }
    else if(currentPrivacy == "private"){
      await file[header + 'privacy'].set("public");
    }
    else{
        await file[header + 'privacy'].set("public");
    }
    window.location.reload();
  }
  
  
async function writeDP(linkToMedia,url){
    
    const doc = solid.data[url];
    const dtype = solid.data['http://schema.org/Document']
    const about = 'http://schema.org/';
    await doc.type.add(dtype);
    await doc[about + 'dp'].add('');
    await doc[about + 'dp'].set(mediaLink);


    

}