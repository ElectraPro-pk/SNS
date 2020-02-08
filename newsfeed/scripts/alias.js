
var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
  };

  function getUsername(profileURL) {
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
  }  