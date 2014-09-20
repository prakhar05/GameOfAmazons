/*jslint devel: true, indent: 2 */
/*global console */
var isMoveOk = (function() {
  'use strict';

  function isEqual(object1, object2) {
    if (object1 === object2) {
      return true;
    }
    if (typeof object1 !== 'object' && typeof object2 !== 'object') {
      return object1 === object2;
    }
    try {
      var keys1 = Object.keys(object1),keys2 = Object.keys(object2),i, key;

      if (keys1.length !== keys2.length) {
        return false;
      }
      //the same set of keys (although not necessarily the same order),
      keys1.sort();
      keys2.sort();
      // key test
      for (i = keys1.length - 1; i >= 0; i-=1) {
        if (keys1[i] !== keys2[i]){
          return false;
        }
      }
      // equivalent values for every corresponding key
      for (i = keys1.length - 1; i >= 0; i-=1) {
        key = keys1[i];
        if (!isEqual(object1[key], object2[key])) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }  //taken from tic tac toe logic code

	function copyObject(object) {
		return JSON.parse(JSON.stringify(object));
	}

//function to check if the pawn at i,j can make valid move and return 1 if true else 0
	function canMove(i,j,board){
		var loop = {rowFrom:0,rowTo:0,colFrom:0,colTo:0}, x, y;

		if(i===0 && j===0){loop = {rowFrom:0,rowTo:1,colFrom:0,colTo:1};}
		else if (i===0 && j===9){loop = {rowFrom:0,rowTo:1,colFrom:8,colTo:9};}
		else if (i===9 && j===0){loop = {rowFrom:8,rowTo:9,colFrom:0,colTo:1};}
		else if (i===9 && j===9){loop = {rowFrom:8,rowTo:9,colFrom:8,colTo:9};}
		else{loop = {rowFrom:i-1,rowTo:i+1,colFrom:j-1,colTo:j+1};}

		for(x=loop.rowFrom;x<=loop.rowTo;x+=1){
			for(y=loop.colFrom;j<=loop.colTo;j+=1){
				if(x!==i && y!==j && board[x][y]===''){return 1;}
			}
		}


		return 0;
	}

	function getWinner(board,turnIndex){
		var Actr=0,Bctr=0,i,j;

		for(i=0;i<10;i+=1){
			for (j=0;j<10;j+=1){
				if(board[i][j] === 'A'){ Actr += canMove(i,j,board);}
					else if(board[i][j] === 'B'){ Bctr += canMove(i,j,board);}
			}
		}

		if (turnIndex==='A' && Bctr === 0){return 'A';}
		if (turnIndex==='B' && Actr === 0){return 'B';}
		return '';

	}


	function createMove(board, pawnPosition, pawnDelta, turnIndexBeforeMove){
		var boardAfterMove = copyObject(board),newTurn = turnIndexBeforeMove,pp = pawnPosition,pd = pawnDelta,winner;

		boardAfterMove[pawnPosition.row][pawnPosition.col] = '';
		boardAfterMove[pawnDelta.row][pawnDelta.col] = turnIndexBeforeMove.pawn;            //pawnName can be X,A or B

		if(turnIndexBeforeMove.ctr === 1){
			winner = getWinner(board,turnIndexBeforeMove.pawn);
				if(winner===''){
					if(turnIndexBeforeMove.player===1){newTurn.player=2;newTurn.ctr=2;newTurn.pawn='B';}
						else if(turnIndexBeforeMove.player===2){newTurn.player=1;newTurn.ctr=2;newTurn.pawn='A';}
				}
				else { newTurn = {GameOver : {WinnerIs : winner}}; }
		}
		else{
			newTurn.ctr = 1;newTurn.pawn = 'X';		                //ctr was 2 so make it 1 and change pawn name,player remains same
		}

		return [{setTurn:newTurn},{pawnPosition:{row:pp.row,col:pp.col},pawnDelta:{row:pd.row,col:pd.col}},{'boardAfterMove':boardAfterMove}];
	}

	function horizontalMoveCheck(pos1,pos2,board){

    var i,greaterpos,lesserpos;
		if(Math.abs(pos1.row - pos2.row) === 0){
			if(pos2.col > pos1.col){
				greaterpos = pos2;
        lesserpos = pos1;
				for (i=lesserpos.col+1; i<=greaterpos.col; i+=1){
					if(board[greaterpos.row][i] !== ''){
						return false;
					}
				}
			}
			else{
				greaterpos = pos1;
        lesserpos = pos2;
				for (i=greaterpos.col-1; i>=lesserpos.col; i-=1){
					if(board[greaterpos.row][i] !== ''){
						return false;
					}
				}
			}
		}
		else{
			return false;
		}

		return true;
	}											
	
	function verticalMoveCheck(pos1,pos2,board){

    var greaterpos,lesserpos,i;
		if(Math.abs(pos1.col - pos2.col) === 0){
			if(pos2.row > pos1.row){
				greaterpos = pos2;
				lesserpos = pos1;
				for (i=lesserpos.row+1; i<=greaterpos.row; i+=1){
					if(board[i][greaterpos.col] !== ''){
						return false;
					}
				}
			}
			else{
				greaterpos = pos1;
				lesserpos = pos2;
				for (i=greaterpos.row-1; i>=lesserpos.row; i-=1){
					if(board[i][greaterpos.col] !== ''){
						return false;
					}
				}
			}
		}
		else{
			return false;
		}
		return true;
	}

	function diagonalMoveCheck(pos1,pos2,board){

    var greaterpos,lesserpos,i,j;
		if(Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col)){
			greaterpos = pos2;
			lesserpos = pos1;

			if(pos2.col > pos1.col && pos2.row < pos1.row){	                    //NE direction
        i=lesserpos.row-1;j=lesserpos.col+1;
        while(i>=greaterpos.row && j<=greaterpos.col){
					if(board[i][j] !== ''){
						return false;
					}
          i-=1;j+=1;
        }
			}

			else if(pos2.col > pos1.col && pos2.row > pos1.row){								//SE direction
				i=lesserpos.row+1;j=lesserpos.col+1;
        while(i<=greaterpos.row && j<=greaterpos.col){
					if(board[i][j] !== ''){
						return false;
					}
          i+=1;j+=1;
				}
			}
			else if(pos2.col < pos1.col && pos2.row > pos1.row){								//SW direction
				i=lesserpos.row+1;j=lesserpos.col-1;
          while(i<=greaterpos.row && j>=greaterpos.col){
					if(board[i][j] !== ''){
						return false;
					}
          i+=1;j-=1;
				}
			}

			else if(pos2.col < pos1.col && pos2.row < pos1.row){								//NW direction
				i=lesserpos.row-1;j=lesserpos.col-1;
        while(i>=greaterpos.row && j>=greaterpos.col){
					if(board[i][j] !== ''){
						return false;
					}
          i-=1;j-=1;
				}
			}

			else{
				return false;
			}

		return true;
		}
	}

	function isMoveOk(params){

		var move = params.move,
    turnIndexBeforeMove = params.turnIndexBeforeMove,
    stateBeforeMove = params.stateBeforeMove,
    expectedMove;

    var pawnDelta = move[1].pawnDelta,
    pawnPosition = move[1].pawnPosition,
    board = stateBeforeMove.board;

		//example move:
		// [{setTurn:{player:1,ctr:2,pawn:'A'}},{pawnPosition:{row:,col:},pawnDelta:{row:,col:}},{boardAfterMove:double dim array}]

		//Example turnIndexBeforeMove
		// {player:1,ctr:1,pawn:'X'}
    try{
			if ( horizontalMoveCheck(pawnPosition,pawnDelta,board) ||
           verticalMoveCheck(pawnPosition,pawnDelta,board)  ||
           diagonalMoveCheck(pawnPosition,pawnDelta,board)){
        expectedMove = createMove(board,pawnPosition,pawnDelta,turnIndexBeforeMove);
        if(!isEqual(move,expectedMove)){
					return false;
				}
			}
    }
    catch(e){
			return false;
		}

    return true;
	}

  return isMoveOk;
}());
