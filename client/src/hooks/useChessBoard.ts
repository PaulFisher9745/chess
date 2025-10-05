import { Piece, PieceColor, PieceType, PromotionPiece, Square,Threats } from "@/types/types"
import path from "path";
import { useState } from "react";
export const useChessBoard = () => {

    const squares: Square[] = [];
    const numbers = ["1","2","3","4","5","6","7","8"]
    const letters = ["h","g","f","e","d","c","b","a"]
    const [highlightedSquares, setHighlightedSquares] = useState<Square[]>([]);
    const [board,setBoard] = useState<Square[]>([])
    const [promotionData, setPromotionData] = useState<{
        isPromoting: boolean;
        square: Square | null;
        color: PieceColor;
        positionX: number| null;
    }>({
        isPromoting: false,
        square: null,
        color: "white",
        positionX: null,
    });

    const createInitialBoard= (): Square[] => {

        for(let row = 0; row < 8; row++){
            for (let col = 0; col < 8; col++) {
                const isDark = (col + row) % 2 === 1 
                let piece: Piece | null = null
                let num: string = ''
                let lett: string = ''

                const coord: string = letters[col] + numbers[row]

                if (row === 1) {
                    piece = {
                        type: "pawn",
                        color: "white"
                    }
                }
                if (row === 6) {
                    piece = {
                        type: "pawn",
                        color: "black"
                    }
                }
                if (row === 0 || row === 7) {
                    const color: PieceColor = row === 0 ? "white" : "black"
                    const pieces: PieceType[] = ['rook','knight','bishop','king','queen','bishop','knight','rook']
                    lett = letters[col]
                    piece = {
                        type: pieces[col],
                        color
                    }
                }
                if (col === 7 || col === 0) {
                    num = numbers[row]         
                }
                squares.push({col,row,num,lett,coord,isDark,piece})
            }
        }
        return squares
    }

    const getPieces = (piece: Piece): string => {
        const color: PieceColor = piece.color === "black" ? "black" : "white"
        
        const pieces = {
            king: `/assets/pieces/king_${color}.png`,
            queen: `/assets/pieces/queen_${color}.png`,
            rook: `/assets/pieces/rook_${color}.png`,
            bishop: `/assets/pieces/bishop_${color}.png`,
            knight: `/assets/pieces/knight_${color}.png`,
            pawn: `/assets/pieces/pawn_${color}.png`
        };

        return pieces[piece.type]
    };

    const getBoard = () => {
        if (board.length === 0) {
            setBoard(createInitialBoard());
        }
        return board;
    }

    const getMove = (from: Square | null, to: Square) => {
        setBoard(prevBoard => {
            const newBoard = [...prevBoard]

            const fromIndex = newBoard.findIndex(square => square.coord === from?.coord)
            const toIndex = newBoard.findIndex(square => square.coord === to.coord)

            newBoard[toIndex] = {
                ...newBoard[toIndex],
                piece: newBoard[fromIndex].piece
            }

            newBoard[fromIndex] = {
                ...newBoard[fromIndex],
                piece: null
            }

            return newBoard
        })
    }

    const makeTempMove = (from:Square,to:Square,currentBoard:Square[]):Square[] => {
        const newBoard = currentBoard.map(square => ({...square}));
    
        const fromIndex = newBoard.findIndex(sq => sq.coord === from.coord);
        const toIndex = newBoard.findIndex(sq => sq.coord === to.coord);

        newBoard[toIndex].piece = newBoard[fromIndex].piece;
        newBoard[fromIndex].piece = null;
        
        return newBoard;

    }

    const isMoveSafe = (from: Square, to: Square,): boolean => {
        const tempBoard = makeTempMove(from, to, board)
        const kingColor = from.piece?.color;
        if (!kingColor) return false;
        
         const openedNewAttack = checkIfOpensAttack(from, tempBoard, kingColor);

        return !isCheck(tempBoard, kingColor,from,to) && !openedNewAttack
 
    }

    const isCheck = (board: Square[],kingColor: PieceColor,from: Square, to: Square) => {
        const kingSquare = board.find(sq => 
            sq.piece?.type === "king" && 
            sq.piece.color === kingColor
        );
        const threats = getCheckThreats(board,kingColor)
        if (!kingSquare) return false;
        if (threats.length > 1 && from.piece?.type !== "king") return true
        

        const enemyPieces = board.filter(sq => 
            sq.piece && 
            sq.piece.color !== kingColor
        );


        if(from.piece?.type === "king" || !threats.length) {
          return enemyPieces.some(enemy => isValidMove(enemy, kingSquare))  
        } else {
            const safeMove = threats[0].path?.filter(enemy => enemy.coord === to.coord) 

            return !safeMove?.some(move => move.coord === to.coord)
        }
        
    }

    const checkIfOpensAttack = (movedFrom: Square, board: Square[], kingColor: PieceColor): boolean => {
        if (movedFrom.piece?.type === "king") return false;
        
        const kingSquare = board.find(sq => 
            sq.piece?.type === "king" && sq.piece.color === kingColor
        );
        if (!kingSquare) return false;

        const directions = [
            {dx: 1, dy: 0},
            {dx: -1, dy: 0},
            {dx: 0, dy: 1}, 
            {dx: 0, dy: -1},
            {dx: 1, dy: 1},
            {dx: 1, dy: -1},
            {dx: -1, dy: 1}, 
            {dx: -1, dy: -1} 
        ];

        return directions.some(({dx, dy}) => 
            checkDirectionForNewAttack(kingSquare, dx, dy, board, kingColor, movedFrom)
        );
    }

    const checkDirectionForNewAttack = (
            kingSquare: Square, 
            dx: number, 
            dy: number, 
            board: Square[], 
            kingColor: PieceColor,
            movedFrom: Square
        ): boolean => {

        let currentPos = {row: kingSquare.row + dy, col: kingSquare.col + dx};
        
        while (currentPos.row >= 0 && currentPos.row < 8 && currentPos.col >= 0 && currentPos.col < 8) {
            const square = board.find(sq => 
                sq.row === currentPos.row && sq.col === currentPos.col
            );
            
            if (!square) break;
            
            if (square.piece) {
                if (square.piece.color === kingColor) {
                    break;
                }
                else {
                    const canAttack = canPieceAttackFromDirection(square.piece, dx, dy);
                    return canAttack;
                }
            }
            currentPos.row += dy;
            currentPos.col += dx;
        }
        
        return false;
    }

    const canPieceAttackFromDirection = (piece: Piece, dx: number, dy: number): boolean => {
        const isStraight = (dx === 0 || dy === 0);
        const isDiagonal = (Math.abs(dx) === Math.abs(dy));
        
        switch (piece.type) {
            case 'rook': return isStraight;
            case 'bishop': return isDiagonal;
            case 'queen': return isStraight || isDiagonal;
            case 'pawn': 
                const pawnDirection = piece.color === 'white' ? 1 : -1;
                return isDiagonal && dy === pawnDirection;
            case 'king': 
                return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
            case 'knight': 
                return false;
            default: return false;
        }
    }

    const getAttackPath = (from: Square, to: Square, board: Square[]): Square[] => {
        const path: Square[] = [];
        const fromPos = {row: from.row, col: from.col};
        const toPos = {row: to.row, col: to.col};

        const dx = Math.sign(toPos.col - fromPos.col);
        const dy = Math.sign(toPos.row - fromPos.row);

        let currentPos = {...fromPos};

        for (let i = 0; i < 8; i++) {
            currentPos.row += dy;
            currentPos.col += dx;

            if (currentPos.row < 0 || currentPos.row > 7 || 
                currentPos.col < 0 || currentPos.col > 7) {
                break;
            }

            const square = board.find(sq => 
                sq.row === currentPos.row && sq.col === currentPos.col
            );

            if (!square) break;

            path.push(square);

            if (currentPos.row === toPos.row && currentPos.col === toPos.col) {
                break;
            }

            if (square.piece && (currentPos.row !== toPos.row || currentPos.col !== toPos.col)) {
                break;
            }
        }

        return path;
    }

    const getCheckThreats = (board: Square[],kingColor: PieceColor) :Threats[] => {
         const kingSquare = board.find(sq => 
            sq.piece?.type === "king" && 
            sq.piece.color === kingColor
        );     

        if (!kingSquare) return []

        const numberAttacks:Threats[] = []

        board.forEach(sq => {
        if (isValidMove(sq, kingSquare)) {
            const attackPath = getAttackPath(sq, kingSquare, board);
            const attackType = attackPath.length > 0 ? 'linear' : 'direct';
            
            numberAttacks.push({
            attacker: sq,
            path: attackPath,
            type: attackType
            });
        }
        });

        return numberAttacks
    }

    const getSquaresBetween = (from: Square,to: Square, currentBoard: Square[]) => {
        const fromPos = {row: from.row, col: from.col}
        const toPos = {row: to.row, col: to.col}

        const dx = Math.sign(toPos.col - fromPos.col)
        const dy = Math.sign(toPos.row - fromPos.row)

        let currentPos = {...fromPos}

        while(true) {
            currentPos.row += dy
            currentPos.col += dx

            if(currentPos.row === toPos.row && currentPos.col === toPos.col) {
                return true
            }

            const square = currentBoard.find(sq => sq.row === currentPos.row && sq.col === currentPos.col)

            if(square?.piece) {
                return false
            }
        }
        
    }

    const promotePawn = (pieceType: PromotionPiece) => {
        if (!promotionData.square) return;
        
        setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            const squareIndex = newBoard.findIndex(sq => sq.coord === promotionData.square?.coord);
            
            if (squareIndex !== -1) {
                newBoard[squareIndex] = {
                    ...newBoard[squareIndex],
                    piece: {
                        type: pieceType,
                        color: promotionData.color
                    }
                };
            }
            
            return newBoard;
        });
        
        setPromotionData({
            isPromoting: false,
            square: null,
            color: "white",
            positionX: null,
        });
    };

    const findValidMove = (from: Square | null) => {
        if (!from || !from.piece?.color) {
            setHighlightedSquares([]);
            return;
        }

        // ПРОСТАЯ версия - только базовые правила
        const validMoves = board.filter(to => 
            isValidMove(from, to) && isMoveSafe(from, to)
        );
        
        setHighlightedSquares(validMoves);
    }


    const checkFinalStep = (from: Square,to: Square) => {
        const isWhite = from?.piece?.color === "white"
        const isFinalStep = isWhite ? to?.row === 7 : to?.row === 0

        if (from?.piece?.type !== 'pawn')  return

        if (isFinalStep) {
            return setPromotionData({
                isPromoting: true,
                square: to,
                color: from.piece?.color || "white",
                positionX: to.col * 100,
            });
        }

    }

    const isValidMove = (from: Square,to: Square) => {
        const isWhite = from?.piece?.color === "white"
        const isEmptyTarget = !to.piece  
        const isEnemyTarget = to.piece && from.piece?.color !== to.piece?.color


        const validPawnMove = (from: Square,to: Square) => {   
            const direction = isWhite ? 1 : -1
            const isSameCol = from.col === to.col
            const isFirstStep = isWhite ? from.row === 1 : from.row === 6
            const normalMove = isSameCol && isEmptyTarget && to.row === from.row + direction 
            const attackMove = isEnemyTarget && Math.abs(from.col - to.col) === 1 && to.row === from.row + direction
            const doubleMove = isFirstStep && isEmptyTarget && isSameCol && to.row === from.row + 2 * direction

            if(doubleMove) {
                return getSquaresBetween(from,to,board)
            }

            return normalMove || attackMove
        }

        const validRookMove = (from: Square,to: Square) => {
            const isSameCol = from.col === to.col
            const isSameRow = from.row === to.row
            const normalMove = isEmptyTarget && isSameRow || isEmptyTarget && isSameCol
            const attackMove = isEnemyTarget && isSameCol || isEnemyTarget && isSameRow
            if (normalMove || attackMove) {
               return getSquaresBetween(from,to,board)
            }
            return false
        }

        const validBishopMove = (from: Square,to: Square) => {
            const isDiagonal = Math.abs(from.col - to.col) === Math.abs(from.row - to.row)
            const normalMove = isEmptyTarget && isDiagonal
            const attackMove = isEnemyTarget && isDiagonal
            
            if(normalMove || attackMove) {
                return getSquaresBetween(from,to,board)
            }
            return false
        }

        const validKnightMove = (from: Square,to: Square) => {
            const rowMove = Math.abs(from.row - to.row) === 2 && Math.abs(from.col - to.col) === 1
            const colMove = Math.abs(from.row - to.row) === 1 && Math.abs(from.col - to.col) === 2
            const LTypeMove = rowMove || colMove
            const normalMove = isEmptyTarget && LTypeMove
            const attackMove = isEnemyTarget && LTypeMove

            return (normalMove || attackMove)

        }


        const validKingMove = (from: Square,to: Square) => {
            const dx = Math.abs(from.col - to.col);
            const dy = Math.abs(from.row - to.row);

            const isKingMove =  (dx === 1 && dy === 0) ||
                                (dx === 0 && dy === 1) ||   
                                (dx === 1 && dy === 1);
            const normalMove = isEmptyTarget && isKingMove
            const attackMove = isEnemyTarget && isKingMove

            return  normalMove || attackMove
           
        }

        const  validQueenMove = (from: Square,to: Square) => {
            const isDiagonal = Math.abs(from.col - to.col) === Math.abs(from.row - to.row)
            const isSameCol = from.col === to.col
            const isSameRow = from.row === to.row
            const isSameMove = isSameCol || isSameRow
            const normalMove = isDiagonal && isEmptyTarget || isSameMove && isEmptyTarget
            const attackMove = isDiagonal && isEnemyTarget || isSameMove && isEnemyTarget

            if(normalMove || attackMove) {
                return getSquaresBetween(from,to,board)
            }
            return false
        }

        switch (from.piece?.type) {
            case ("pawn") : {
                return validPawnMove(from,to)
            }
            case ("rook") : {
                return validRookMove(from,to)
            }
            case("bishop") : {
                return validBishopMove(from,to)
            }
            case("knight") : {
                return validKnightMove(from,to) 
            }
            case("queen") : {
                return validQueenMove(from,to)
            }
            case("king") : {
                return validKingMove(from,to)
            }
        }
    }

    return {
        createInitialBoard,
        getPieces,
        getBoard,
        getMove,
        isValidMove,
        findValidMove,
        promotionData,
        highlightedSquares,
        promotePawn,
        checkFinalStep,
        isMoveSafe,
    }
}