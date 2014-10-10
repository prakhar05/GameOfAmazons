'use strict';

angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic','myApp.scaleBodyService', 'platformApp','ngTouch'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, scaleBodyService, stateService, gameLogic) {
      
    
    var isLocalTesting = $window.parent === $window;
//Since each move consists of selecting a pawn and moving it, we should create move only after 2 clicks are obtained, hence global variables to save the state of the clicks and a counter to make sure createMove is only called after both are set
    var pawnPosition = {row:'',col:''};
    var pawnDelta = {row:'',col:''};
    var movCtr = 2;
    
    $scope.isPawn = function(row,col,pawn){
    	if($scope.board[row][col]===pawn){
    		return true;
    	}
    }
    
    
    
    
    function updateUI(params) {
      $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.getInitialBoard();
      }
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;
    }
    
    function sendMakeMove(move) {
      $log.info(["Making move:", move]);
      if (isLocalTesting) {
        stateService.makeMove(move);
      } else {
        messageService.sendMessage({makeMove: move});
      }
    }
    
    //initialise the game using this function call to updateUI
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    var game = {
      gameDeveloperEmail: "prakhar05@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles()
    };

    $scope.move = "[{setTurn:{turnIndex:0}},{set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},{set: {key: 'pawnPosition', value: {row:0, col:3}}},{set: {key: 'pawnDelta', value: {row:0, col:4}}},{set: {key: 'board', value: [['','','','','A','','A','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['A','','','','','','','','','A'],['','','','','','','','','',''],['','','','','','','','','',''],['B','','','','','','','','','B'],['','','','','','','','','',''],['','','','','','','','','',''],['','','','B','','','B','','','']]}}]";
    
    $scope.makeMove = function () {
     sendMakeMove(eval($scope.move));
    };
    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      
      if (!$scope.isYourTurn) {
        return;
      }
      
      if ((($scope.board[row][col]==='A' && $scope.turnIndex===0) ||
      	  	($scope.board[row][col]==='B' && $scope.turnIndex===1)) &&
      	  	(movCtr===2)){	
      	pawnPosition.row = row;
      	pawnPosition.col = col;
      	movCtr-=1;
      }
      
      else if ($scope.board[row][col]==='' && pawnPosition.row !== ''){	
      	pawnDelta.row = row;
      	pawnDelta.col = col;
      	movCtr-=1;
      }
      
      
      if(movCtr===0)
      {
		try 
       	{
	
			var move = gameLogic.createMove(pawnPosition, pawnDelta, $scope.turnIndex, $scope.jsonState);
        	$scope.isYourTurn = false; // to prevent making another move
        	pawnPosition = {row:'',col:''}; //reset pawnPosition,pawnDelta and movCtr
        	pawnDelta = {row:'',col:''};
        	movCtr=2;						
        	sendMakeMove(move);
	} 
      	catch (e) 
      	{
        	$log.info(["False move", row, col]);
        	return;
      	}
      }
    };
    
    scaleBodyService.scaleBody({width: 152, height: 152});   
    
    if (isLocalTesting) {
      game.isMoveOk = gameLogic.isMoveOk;
      game.updateUI = updateUI;
      stateService.setGame(game);
    } else {
      messageService.addMessageListener(function (message) {
        if (message.isMoveOk !== undefined) {
          var isMoveOkResult = gameLogic.isMoveOk(message.isMoveOk);
          messageService.sendMessage({isMoveOkResult: isMoveOkResult});
        } else if (message.updateUI !== undefined) {
          updateUI(message.updateUI);
        }
      });

      messageService.sendMessage({gameReady : game});
    }
  });