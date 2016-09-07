FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('main', {content: 'login'});
    }
});

FlowRouter.route('/room/:id', {
    name: 'room',
    action() {
        BlazeLayout.render('main', {content: 'game'})
    }
});

FlowRouter.route('/win/:id', {
    name: 'win',
    action() {
        BlazeLayout.render('main', {content: 'win'})
    }
});

FlowRouter.route('/lose/:id', {
    name: 'lose',
    action() {
        BlazeLayout.render('main', {content: 'lose'})
    }
});