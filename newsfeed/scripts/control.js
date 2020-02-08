$(document).ready(function(){
 $('#nf').click(() => {
        window.location.href="index.html";
    });
  $('#ch').click(function(){
    window.location.href = 'chat.html';
  });
  $('#fl').click(function(){
    window.location.href = 'flm.html';
  });
  
  $('#st').click(function(){
    window.location.href = '../cs/cs.html';
  });
  $('#hp').click(function(){
    window.location.href = '../cs/cs.html';
  });
  
  $('#pr').click(function () {
        window.location.href='profile.html';
    });
  $('#lo').click(() => { solid.auth.logout(); console.log('DONE'); window.location.href = '../index.html' });

  $("#search").on("change",function(){
    window.location.href = 'searched.html?id='+encodeURIComponent($('#search').val());
  });
});