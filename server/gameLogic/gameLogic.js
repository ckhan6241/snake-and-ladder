import { Random } from 'meteor/random';

function createNewGame(pId, p1, p2, p3, p4) {
    return {
        turnId: "0",
        players: initializePlayerArray(pId, p1, p2, p3, p4),
        boardState: initializeBoardState(),
        finished: false,
        started: false,
        playerCount: 1
    };
}

function initializePlayerArray(pId, p1, p2, p3, p4) {
    playerNames = [p1, p2, p3, p4]
    players = [];
    for (i=0; i<4; i++) {
        players.push(createPlayer(i, playerNames[i]));
    }
    players[0].isBot = false;
    players[0]._id = pId;
    return players;
}

function createPlayer(id, playerName) {
    return {
        _id: id.toString(),
        name: playerName,
        score: 0,
        isBot: true,
        status: undefined
    };
}

function initializeBoardState() {
    newBoard = new Array(100);
    randomPairs = generateNonRepeatingRandomPairs(10);
    for (i=0; i<5; i++) {
        newBoard = insertSnake(newBoard, randomPairs[i]);
    }
    for (i=5; i<10; i++) {
        newBoard = insertLadder(newBoard, randomPairs[i]);
    }
    return newBoard;
}

function generateNonRepeatingRandomPairs(number) {
    numberGenerated = 0;
    randomList = [];
    number = 2*number;
    while (numberGenerated < number) {
        randomInt = getRandomInt(0, 99);
        if (randomList.indexOf(randomInt) == -1) {
            randomList.push(randomInt);
            numberGenerated++;
        }
    }
    return pairUp(randomList);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function pairUp(list) {
    paired = []
    for (i=0; i<list.length; i=i+2) {
        paired.push([list[i], list[i+1]]);
    }
    return paired;
}

function insertSnake(board, pair){
    head = Math.max(pair[0], pair[1]);
    tail = Math.min(pair[0], pair[1]);
    board[head] = tail;
    return board;
}

function insertLadder(board, pair){
    bottom = Math.min(pair[0], pair[1]);
    up = Math.max(pair[0], pair[1]);
    board[bottom] = up;
    return board;
}

function movePlayer(game, id, initial, step) {
    board = game.boardState;
    if (initial >= 0) {
        board[initial] = undefined;
    }
    position = initial + step;
    if (position < 0) {
        return 0;
    } else if (position > 99) {
        position = 198-position;
    }
    finalposition = getPositionIfInsert(game, parseInt(id), position, initial, "Move: ");
    board[finalposition] = id;
    return finalposition+1;
}

function getPositionIfInsert(game, index, position, initial, message) {
    board = game.boardState;
    if (!board[position]) {
        game.players[index].status = message + (initial+1).toString() +" -> "+(position+1).toString();
        return position;
    }else if (typeof(board[position]) == "number") {
        if (board[position] > position) {
            message = "Ladder at "+(position+1).toString()+": " 
        } else {
            message = "Snake at "+(position+1).toString()+": "
        }
        return getPositionIfInsert(game, index, board[position], initial, message);
    }else {
        var newIndex = parseInt(board[position]);
        if (initial != -1) { 
            board[initial] = board[position];
        }
        game.players[newIndex].score = initial+1;
        game.players[newIndex].status = "Swapped: " + (position+1).toString() +" -> "+(initial+1).toString() 
        game.players[index].status = message + (initial+1).toString() +" -> "+(position+1).toString();
        board[position] = undefined;
        return position;
    }
}

function automateBots(board, index) {
    if (board.finished) {
        return index
    }
    index = (index + 1)%4;
    if (!board.players[index].isBot) {
        return index.toString();
    } else {
        executeTurn(board, index);
        return automateBots(board, index);
    }
}

function executeTurn(board, index) {
    initial = board.players[index].score-1;
    var step = getRandomInt(1, 7);
    score = movePlayer(board, index.toString(), initial, step);
    board.players[index].score = score;
    if (score == 100) {
        game.finished = true;
    }
    return step;
}


function addPlayer(gameId, playerId, playerName) {
    game = GameState.findOne({_id: gameId});
    player = createPlayer(playerId, playerName);
    player.isBot = false;
    game.players[game.playerCount++] = player;
    GameState.remove({_id: gameId});
    GameState.insert(game);
}

function createNewRoom(playerId, p1) {
    id = Random.id();
    game = createNewGame(playerId, p1, "Bob (*bot*)", "Charlie (*bot*)", "Danny (*bot*)")
    game._id = id;
    GameState.insert(game);
    return id;
}

Meteor.methods({
    'move': function(gameId, playerId) {
        game = GameState.findOne({_id: gameId});
        currPlayerId = game.players[parseInt(game.turnId)]._id;
        if (game.finished || playerId != currPlayerId ) {
            return -1;
        }
        game.started = true;
        playerId = parseInt(game.turnId);
        step = executeTurn(game, playerId);
        game.turnId = automateBots(game, parseInt(game.turnId));
        GameState.remove({_id: gameId});
        GameState.insert(game);
        return step;
    },
    'enterRoom': function(playerId) {
        game = GameState.findOne({started: false, playerCount: {$lt: 4}});
        if (game) {
            addPlayer(game._id, playerId, OnlineUser.findOne({_id: playerId}).name);
            return game._id;
        } else {
            return createNewRoom(playerId, OnlineUser.findOne({_id: playerId}).name);
        }
    }
})