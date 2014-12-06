Posts = new Meteor.Collection('posts');

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);
    Session.setDefault("ShowLogin", true);
    Session.setDefault("ShowPosts", false);
    Session.setDefault("Show", false);
    var Username = "";

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });
    
    Template.hello.helpers({
        posts: function() {
            return Posts.find();
        }
    });

  Template.hello.events({
    'click button': function (event, template) {
        //alert("Button clicked");
//        if(Username == ""){
//            Username = document.getElementById('username').value;
//            alert(Username);
//        }
    }
  });
    
    Template.hello.helpers({
        set_name: function (name){
            Username = name;
            //alert(Username);
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
