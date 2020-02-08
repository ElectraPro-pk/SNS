const fc = SolidFileClient;
const { AclParser, AclDoc, AclRule, Permissions, Agents } = SolidAclParser;
const { READ, WRITE, CONTROL } = Permissions;

async function createACL(ACCESSTO,ONWER_WEBID, public_flag = false) {
    let content = `
    @prefix  acl:  <http://www.w3.org/ns/auth/acl#>.
    @prefix foaf: <http://xmlns.com/foaf/0.1/>.
    <#Owner>
        a             acl:Authorization;
        acl:agent     <${ONWER_WEBID}>;
        acl:accessTo  <${ACCESSTO}>;
        acl:mode      acl:Read, acl:Write, acl:Control.`
    
    if(public_flag){
            content += `
            <#Public>
            a               acl:Authorization;
            acl:accessTo    <${ACCESSTO}>;
            acl:mode       acl:Read;
            acl:agent      foaf:Agent.`
        }
    
    fc.updateFile(aclUrl,content,"text/turtle").then(success => {
        console.log(success)
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
async function getAcl(URL) {
    $('#furl').text(null);
    $('#sh').text(null);
    ACL = URL + ".acl";
    fc.readFile(ACL).then(async function(turtle){
        localStorage.setItem('previousContent',turtle.toString());
    },err => console.log(err));
    turtle = localStorage.getItem('previousContent')
    const parser = new AclParser ({ ACL , URL});
    parser['accessTo'] = URL;
    const doc = await  parser.turtleToAclDoc(turtle);
    const public = "http://xmlns.com/foaf/0.1/Agent";
    var ownerPerm = doc.getPermissionsFor($('#webd').text());
    var ONWP  = [...ownerPerm];
    var other = doc.getPermissionsFor(public);
    var OP  = [...other];
    $('#O').text(me);  
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
