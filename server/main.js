import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'login': function(name) {
        var id = Random.id();
        OnlineUser.insert({
                        _id: id,
                        name: name});
        return id;
    }
})