Template.lose.onCreated(function(){
    this.steps = new ReactiveVar(0);
    this.id = FlowRouter.getParam('id');
});

Template.lose.helpers({
    'getname': function() {
        return OnlineUser.findOne({_id: Template.instance().id}).name;
    }
});

Template.lose.events({
    'click .btn-Reenter-game': function() {
        id = Session.get('userId');
        Meteor.call('enterRoom', id, function(error, roomId) {
            FlowRouter.go('/room/'+roomId);
        });
    }
})