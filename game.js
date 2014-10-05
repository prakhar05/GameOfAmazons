'use strict';

angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic', 'platformApp'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic) {

    function updateUI(params) {
      $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = [['','','','A','','','A','','',''],
                        ['','','','','','','','','',''],
                        ['','','','','','','','','',''],
                    	['A','','','','','','','','','A'],
                        ['','','','','','','','','',''],
                        ['','','','','','','','','',''],
                        ['B','','','','','','','','','B'],
                        ['','','','','','','','','',''],
                        ['','','','','','','','','',''],
                        ['','','','B','','','B','','','']];
      }
    }
    updateUI({stateAfterMove: {}});
    var game = {
      gameDeveloperEmail: "prakhar05@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      riddles: gameLogic.getRiddles()
    };

    var isLocalTesting = $window.parent === $window;
    $scope.move = "[{setTurn:{turnIndex:0}},{set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},{set: {key: 'pawnPosition', value: {row:0, col:3}}},{set: {key: 'pawnDelta', value: {row:0, col:4}}},{set: {key: 'board', value: [['','','','','A','','A','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['A','','','','','','','','','A'],['','','','','','','','','',''],['','','','','','','','','',''],['B','','','','','','','','','B'],['','','','','','','','','',''],['','','','','','','','','',''],['','','','B','','','B','','','']]}}]";
    
    $scope.makeMove = function () {
      $log.info(["Making move:", $scope.move]);
      var moveObj = eval($scope.move);
      if (isLocalTesting) {
        stateService.makeMove(moveObj);
      } else {
        messageService.sendMessage({makeMove: moveObj});
      }
    };

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
