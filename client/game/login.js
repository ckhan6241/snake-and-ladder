Template.login.events({
    'click .btn-enter-game': function() {
        var name = document.getElementById('name-box').value;
        if (name) {
            Meteor.call('login', name, function(error, id) {
                Session.set('userId', id);
                Meteor.call('enterRoom', id, function(error, roomId) {
                    FlowRouter.go('/room/'+roomId);
                });
            });
        }
    }
});

Template.login.helpers({
    haveRoom: function() {
        return GameState.findOne({started: false, playerCount: {$lt: 4}}) != undefined;
    },
    currentPlayers: function() {
        return GameState.findOne({started: false, playerCount: {$lt: 4}}).players.filter(function(player){
            return (!player.isBot);
        });
    }
})