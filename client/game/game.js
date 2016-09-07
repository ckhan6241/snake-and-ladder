Template.game.onCreated(function(){
    this.steps = new ReactiveVar(0);
    this.id = FlowRouter.getParam('id');
});

Template.game.helpers({
    isPlayerTurn: function(){
        game = GameState.findOne({_id: Template.instance().id});
        var turnId = game.players[parseInt(game.turnId)]._id;
        return turnId == this._id
    },
    players: function(){
        game = GameState.findOne({_id: Template.instance().id});
        if (game) {
            return game.players;
        } else {
            return [];
        }
    },
    numberOfSteps: function(){
        return Template.instance().steps.get();
    },
    isPlayer: function(){
        return this._id == Session.get('userId');
    },
    checkFinished: function(){
        game = GameState.findOne({_id: Template.instance().id});
        if (game.finished) {
            if (game.players[parseInt(game.turnId)]._id == Session.get('userId')) {
                FlowRouter.go('/win/'+Session.get('userId'));
            } else {
                FlowRouter.go('/lose/'+Session.get('userId'));
            }
        }
    },
    gameWaiting: function(){
        game = GameState.findOne({_id: Template.instance().id});
        return !game.started && game.playerCount < 4;
    },
    isFirstPlayer: function(){
        game = GameState.findOne({_id: Template.instance().id});
        var turnId = game.players[parseInt(game.turnId)]._id;
        return turnId == Session.get('userId');
    }
});

Template.game.events({
    'click .btn-move': function(event, template) {
        Meteor.call('move', Template.instance().id, Session.get('userId'), function(error, step) {
            if (step!=-1) {
                template.steps.set(step);
            }
        });
    }
});