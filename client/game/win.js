Template.win.onCreated(function(){
    this.steps = new ReactiveVar(0);
    this.id = FlowRouter.getParam('id');
});

Template.win.helpers({
    'getname': function() {
        return OnlineUser.findOne({_id: Template.instance().id}).name;
    }
});


Template.win.events({
    'click .btn-Reenter-game': function() {
        id = Session.get('userId');
        Meteor.call('enterRoom', id, function(error, roomId) {
            FlowRouter.go('/room/'+roomId);
        });
    }
})