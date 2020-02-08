var fileClient = SolidFileClient;
/*var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
};*/

paths = JSON.parse(localStorage.getItem('paths'));

//predicates used in posts in fetching

postDate   = "http://schema.org/date";
comments   = "http://schema.org/comments";
postLikes  = "http://schema.org/likes";
postText   = "http://schema.org/PostBody";
mediaFile  = "http://schema.org/media";
postOnwer  = "http://schema.org/postFrom";
postshares = "http://schema.org/shares";
postUid    = "http://schema.org/postId";
postTime   = "http://schema.org/time";

var userLink = '';

//AC FILE//

const fc = SolidFileClient;
const { AclParser, AclDoc, AclRule, Permissions, Agents } = SolidAclParser;
const { READ, WRITE, CONTROL } = Permissions;

async function createACL(ACCESSTO,ONWER_WEBID, public_flag = false) {
    aclUrl = ACCESSTO + ".acl";
    console.log(`ONWER  : ${ONWER_WEBID}`);
    console.log(`PUBLIC : ${public_flag}`);
    console.log(`FILE   : ${ACCESSTO}`);
    let content = `
    @prefix  acl:  <http://www.w3.org/ns/auth/acl#>.
    @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    <ControlReadWrite>
        a             acl:Authorization;
        acl:agent     <${ONWER_WEBID}>;
        acl:accessTo  <${ACCESSTO}>;
        acl:mode      acl:Read, acl:Write, acl:Control.`
    
    if(public_flag){
            content += `
            <read>
            a               acl:Authorization;
            acl:accessTo    <${ACCESSTO}>;
            acl:mode       acl:Read;
            acl:agent      foaf:Agent.`
        }
    
    fc.updateFile(aclUrl,content,"text/turtle").then(success => {
        alert(`POSTED`);
        window.location.reload();
    }, err => console.log(err));
}
function controlCheckBox(t,URL, agent_type,perm_type){

        if(t.checked){
          addPermission(URL, agent_type,perm_type);
        }
        else{
            deletePermission(URL, agent_type,perm_type);
        }
}
async function addPermission(FILE_URL, agent_type,perm_type){
    ACL = FILE_URL + ".acl";
    fc.readFile(ACL).then(async function(turtle){
        localStorage.setItem('previousContent',turtle.toString());
    },err => console.log(err));
    turtle = localStorage.getItem('previousContent')
    const parser = new AclParser ({ ACL , FILE_URL});
    parser['accessTo'] = FILE_URL;
    const doc = await  parser.turtleToAclDoc(turtle);
    doc.addRule(perm_type,agent_type);
    const newTurtle = await parser.aclDocToTurtle(doc);
    //console.log(newTurtle);
    fc.updateFile(ACL,newTurtle,"text/turtle").then(success => {
        //console.log(`ADDED PERMISSIONS ${ACL}.`)
    }, err => console.log(err));

}async function deletePermission(FILE_URL, agent_type,perm_type){
    ACL = FILE_URL + ".acl";
    fc.readFile(ACL).then(async function(turtle){
        localStorage.setItem('previousContent',turtle.toString());
    },err => console.log(err));
    turtle = localStorage.getItem('previousContent')
    const parser = new AclParser ({ ACL , FILE_URL});
    parser['accessTo'] = FILE_URL;
    const doc = await  parser.turtleToAclDoc(turtle);
    doc.deleteRule(perm_type,agent_type);
    const newTurtle = await parser.aclDocToTurtle(doc);
    //console.log(newTurtle);
    fc.updateFile(ACL,newTurtle,"text/turtle").then(success => {
        //console.log(`REMOVED PERMISSIONS ${ACL}.`)
    }, err => console.log(err));

}
function openAclDialog(t){
    
    file_url = getUsername($('#webd').text()) + paths['posts'] + t + ".ttl";
  
    getAcl(file_url).then(function(){
        document.getElementById('id01').style.display='block';
    });
    //console.log(file_url)
}

async function getAcl(URL) {
    $('#furl').text(null);
    $('#sh').text(null);
    ACL = URL + ".acl";
    fc.readFile(ACL).then(async function(turtle){
        localStorage.setItem('previousContent',turtle.toString());
    },err => console.log(err));
    turtle = localStorage.getItem('previousContent')
    localStorage.removeItem('previousContent');
    const parser = new AclParser ({ ACL , URL});
    parser['accessTo'] = URL;
    const doc = await  parser.turtleToAclDoc(turtle);
    const public = "http://xmlns.com/foaf/0.1/Agent";
    var ownerPerm = doc.getPermissionsFor($('#webd').text());
    var ONWP  = [...ownerPerm];
    console.log(ONWP);
    var other = doc.getPermissionsFor(public);
    var OP  = [...other];
    $('#O').text($("#webd").text());  
    $('#sh').append(`<p><input class="w3-input" id="cpy" value ="${URL}"><button  class="w3-btn w3-right w3-border w3-green" onclick="copylink()">Copy Link</button></p>`)
    $('#furl').text(`${URL}`)
    //onwer//
    if(ONWP.includes(READ)){
        $('#rd').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${me}','${READ}')"><span class="slider"></span></label>`);
    }
    else{
        $('#rd').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${me}','${READ}')"><span class="slider"></span></label>`);
    }
    if(ONWP.includes(WRITE)){
        $('#wr').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${me}','${WRITE}')"><span class="slider"></span></label>`);
    }
    else{
        $('#wr').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${me}','${WRITE}')"><span class="slider"></span></label>`);
    }
    if(ONWP.includes(CONTROL)){
        $('#cnt').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${me}','${CONTROL}')"><span class="slider"></span></label>`);;
    }
    else{
        $('#cnt').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${me}','${CONTROL}')"><span class="slider"></span></label>`);
    }
    //OTHER PUBLIC//
    if(OP.includes(READ)){
        $('#prd').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${public}','${READ}')"><span class="slider"></span></label>`);
    }
    else{
        $('#prd').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${public}','${READ}')"><span class="slider"></span></label>`);
    }
    if(OP.includes(WRITE)){
        $('#pwr').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${public}','${WRITE}')"><span class="slider"></span></label>`);
    }
    else{
        $('#pwr').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${public}','${WRITE}')"><span class="slider"></span></label>`);
    }
    if(OP.includes(CONTROL)){
        $('#pcnt').html(`<label class="switch"><input  type="checkbox" checked onclick="controlCheckBox(this,'${URL}','${public}','${CONTROL}')"><span class="slider"></span></label>`);
    }
    else{
        $('#pcnt').html(`<label class="switch"><input  type="checkbox"  onclick="controlCheckBox(this,'${URL}','${public}','${CONTROL}')"><span class="slider"></span></label>`);
    }
}

function copylink(){
    var copyText = document.getElementById("cpy");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");

}
//createACL(folder,me,true);
//getAcl(folder);










function loadProfile(){
    fileClient.fetchAndParse(userLink + paths['profile']).then(graph => {
        console.log(graph);
    });
}
function checkType(filename) {
var images = ['png','jpeg','jpg','bmp','tif','gif','svg','tiff'];
var docs = ['doc','docx','pdf','rtf','txt','html','htm'];
var vids = ['3g2','3gp','avi','flv','mp4','mkv','wmv'];
  var fileextension = filename.split('.').pop();
  if(images.includes(fileextension)){
  return 'img';
  }
  if(docs.includes(fileextension)){
  return 'doc';
  }
  if(vids.includes(fileextension)){
  return 'vid';
  }
  return 'uf';
   
}
function calculateDuration(d, t) {
    var today = new Date();
    var tm = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();
    
    if (date == d) {
          //console.log('DATE MATCHED : ',d);
        var dat = parseInt(tm) - parseInt(t);
        //console.log(`${date} - ${d} = ${dat}`);
        var result = '';
        if (dat > 0) {
            if (dat == 1) {
                result = dat + ' hr ago';
            }
            else {
                result = dat + ' hrs ago';
            }

        }
        else {
            result = 'recently uploaded';
        }
        return result;

    }
    return (t + '&nbsp;&nbsp;&nbsp;' + d);
}
 function getDp(u){
    fileClient.fetchAndParse(u, 'text/turtle').then(graph => {
        var parsed = JSON.stringify(graph);
        var parsed1 = JSON.parse(parsed);
        var m = parsed1['statements'];
        for(var i=0;i<m.length;i++){
            if(m[i]['predicate'].value =='http://schema.org/dp') {
                res = m[i]['object'].value;
                $('#profile').attr('src',res);
                $('.myProf').attr('src',res);
                $('.postDp').attr('src',res);
                //console.log(res);
                
            }
        }
    });

}
async function likePost(V,WD){
  var post_id = V.getAttribute('class');
  
  var POST_URL_FROM_POST_ID = getUsername(WD) + paths['posts'] + post_id + ".ttl";
  var PREDICATE_TO_APPEND = "http://schema.org/likes";
  const post_File = solid.data[POST_URL_FROM_POST_ID];
  await post_File[PREDICATE_TO_APPEND].add(WD).then(function(){
  loadPosts();
  });

}


function getMultiple(obj,predicate){
  var foundItems = [];
  for(i = 0 ;i<obj.length;i++){
    if(obj[i].predicate.value == predicate){
        foundItems.push(obj[i].object.value);
    }
  }
  return foundItems;
}

function getSingle(obj,predicate){
  var foundItem = "";
  for(i = 0 ;i<obj.length;i++){
    if(obj[i].predicate.value == predicate){
        foundItem = obj[i].object.value;
    }
  }
    return foundItem;
}
function sharePost(V,WD){
    var post_id = V.getAttribute('class');
  console.log(`POST ID ${post_id}`,`${WD}`);
}

async function loadPosts() {

    posts = $('.posts1');
    posts.empty();
    url = userLink+paths['posts'];
    fileClient.readFolder(url).then(folder => {
        if (!folder.files.length) {
            posts.append(`<h3 class="w3-container">you have not posted yet make your first post </h3>`);
        }
        for (var i = 0; folder.files.length; i++) {
            var URI = url + (folder.files[i].name);
            fileClient.fetchAndParse(URI, 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
              //  console.log(parsed1['statements']);
                //console.log(parsed1['statements']);
                var me = getSingle(parsed1['statements'],mediaFile);

                var fecthedData = '';
                if (me != '') {
                    fecthedData = `  <div class="post" >
              <p class="postheader">
                  <img src="${getDp(userLink + paths['profile'])}" alt="X" class="postDp">
                  <span class="myProf">${$('#myPr').text()}</span>
                  &nbsp;
                  shared a post 
                  <br>
                  <span class="duration">${calculateDuration(getSingle(parsed1['statements'],postDate), getSingle(parsed1['statements'],postTime))}</span>
                  <button class="w3-btn w3-right w3-round" onclick="openAclDialog(this.id)" id="${getSingle(parsed1['statements'],postUid)}"><h3>^</h3></button>  
            </p>
              <p class="postData">
              <p class="postText">
              ${getSingle(parsed1['statements'],postText)}
          </p>
          `;
          var attachedFile = getSingle(parsed1['statements'],mediaFile);
          var type = checkType(attachedFile);
          if(type == 'img')
              fecthedData += `<img class="sharedMedia" ondblclick="CloseImage(this)" onclick="OpenImage(this)" src="${attachedFile} " alt="Unsupported File">`;
          if(type == 'vid')
          	fecthedData += `<video class="sharedMedia" preload controlsList="nodownload" controls muted><source src="${attachedFile}"></video>`;
          if(type == 'doc')
          	fecthedData += `<a style="font-size:10px" href="${attachedFile}">${attachedFile}</a>`;
          fecthedData += `    </p>
          
              <p class="controls" >
                  <span onclick="likePost(this,'${$('#webd').text()}')" class="${getSingle(parsed1['statements'],postUid)}">LIKE&nbsp;&nbsp;${getMultiple(parsed1['statements'],postLikes).length}</span>
                  <span onclick="sharePost(this,'${$('#webd').text()}')" class="${getSingle(parsed1['statements'],postUid)}">SHARE</span>
              </p>
              <p class='postfooter'>
                  <textarea placeholder="comment here"></textarea>
              </p>
          </div>
          <hr>`;
                }
                else {
                    fecthedData = `  <div class="post" >
              <p class="postheader">
                  <img src="${getDp(userLink + paths['profile'])}"  alt="X" class="postDp">
                  <span class="myProf">${$('#myPr').text()}</span>
                  &nbsp;
                  shared a post 
                  <br>
                  <span class="duration">${calculateDuration(getSingle(parsed1['statements'],postDate), getSingle(parsed1['statements'],postTime))}</span>
                  <button class="w3-btn w3-right w3-round" onclick="openAclDialog(this.id)" id="${getSingle(parsed1['statements'],postUid)}"><h3>^</h3></button>  
              </p>
              <p class="postData">
              <p class="postText">
              ${getSingle(parsed1['statements'],postText)}
          
              <p class="controls">
              <span onclick="likePost(this,'${$('#webd').text()}')" class="${getSingle(parsed1['statements'],postUid)}">LIKE&nbsp;&nbsp;${getMultiple(parsed1['statements'],postLikes).length}</span>
              <span onclick="sharePost(this,'${$('#webd').text()}')" class="${getSingle(parsed1['statements'],postUid)}">SHARE</span>
              </p>
              <p class='postfooter'>
                  <textarea placeholder="comment here"></textarea>
              </p>
          </div>
          <hr>`;
                }


                posts.append(fecthedData);
            }, err => function(){posts.append(`<h3 class="w3-container">you have not posted yet make your first post </h3>`);});
        }


      }, err => function(){posts.append(`<h3 class="w3-container">you have not posted yet make your first post </h3>`);});




}
function getUsername(profileURL){
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
}
function getWebD(){
    userLink = getUsername($('#webd').text()); 
    solid.auth.trackSession(session=>{
        var uri = getUsername(session.webId);
        getDp(uri + paths['profile']);
        fileClient.fetchAndParse(uri + paths['profile'], 'text/turtle').then(graph => {
            var parsed = JSON.stringify(graph);
            var parsed1 = JSON.parse(parsed);
            var m = parsed1['statements'];
    
            for(var i=0;i<m.length;i++){
                if(m[i]['predicate'].value == 'http://schema.org/name'){
                      
                    $('#myPr').text(m[i]['object'].value);
               
                  }
              }
    
        });
    });
    loadPosts();    
}
function OpenImage(v){
    v.style.transform = "scale(1.5)";
    //var win = window.open(v.src, '_blank');
    //win.focus();  
}
function CloseImage(v){
    v.style.transform = 'scale(1)';
}
$(document).ready(function () {
    $('#buttonpost').hide();
    solid.auth.trackSession(session => {
        $('#webd').text(session.webId);
        
    });

    $('#postbox').on('input',() =>{
        var d = $('#postbox').val();
            if(d.length  > 0){
                $('#buttonpost').fadeIn(250);
            }
            else{
                $('#buttonpost').fadeOut(250);
            }
    });
    $('#files').on('change',() =>{
         $('#buttonpost').fadeIn(250);
    });
});
async function createPost() {
    var mediaLink = '';        
        $('#loader').css("visibility",'visible');
        var today = new Date();
        var date = today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString();
        var time = today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
        var dateTime = date + time;
        var profile = $('#webd').text();
        var postId = 'ZBP' + dateTime;
        var postBody = $('#postbox').val();
        var tags = "";
        var likes = "";
        var comments = "";
        var shares = "";

        var url = userLink+paths['posts'] + postId + '.ttl';
        var tm = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        var dt = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();


        var mF = mediaLink;
        //  console.log('Mf : ', mF);

        const obj = {
            'postId': postId,
            'PostBody': postBody,
            'tags': tags,
            'likes': likes,
            'comments': comments,
            'shares': shares,
            'postFrom': profile,
            'ofFolder':  userLink+paths['posts'] ,
            'url': url,
            'time': tm,
            'date': dt,
            'media': mF
        };

        console.log('YOU POSTED : ', obj);
        const doc = solid.data[url];
        const dtype = solid.data['http://schema.org/Document']
        const about = 'http://schema.org/';
        await doc.type.add(dtype);
        console.log(profile, doc);
        for (k in obj) {
            await doc[about + k].add(obj[k]);
        }

        const folder =  userLink+paths['uploads'] ;
        const fileInput = document.getElementById('files');
        const files = fileInput.files;
        
        if (fileInput.value) {
            for (var i = 0; i < files.length; i++) {
                var URI = folder + files[i].name;
                var content = files[i];
                SolidFileClient.updateFile(URI, content).then(res => {
                    console.log(res);
                    mediaLink = URI;

                    console.log("media link : ", mediaLink);
                }, err => { console.log("upload error : " + err) });

            }
            await doc[about + 'media'].set(folder + files[0].name);
           
        }
        //setTimeout(function(){
            createACL(url,profile,true);
          
//        },500);          
}


//ACL FI