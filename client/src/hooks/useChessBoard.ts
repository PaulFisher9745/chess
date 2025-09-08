import { Coord, Piece, PieceColor, PieceType, Square } from "@/types/types"
import { useState } from "react";
import Image from 'next/image';
export const useChessBoard = () => {

    const squares: Square[] = [];
    const numbers = ["1","2","3","4","5","6","7","8"]
    const letters = ["h","g","f","e","d","c","b","a"]
    const [board,setBoard] = useState<Square[]>([])
    const [pickPiece, setPickPiece] = useState<Piece[]>([])

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
                    const pieces: PieceType[] = ['rook','knight','bishop','queen','king','bishop','knight','rook']
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

    const getSquaresBetween = (from: Square,to: Square) => {
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

            const square = board.find(sq => sq.row === currentPos.row && sq.col === currentPos.col)
            
            if(square?.piece) {
                return false
            }
        }
        
    }

    const InitialPickChess = (isWhite:boolean) => {
        
        const variationPiece: Piece[] = [
            {
                type: "king",
                color: isWhite ? "white" : "black"
            },
            {
                type: "knight",
                color: isWhite ? "white" : "black"
            },
            {
                type: "rook",
                color: isWhite ? "white" : "black"
            },
            {
                type: "bishop",
                color: isWhite ? "white" : "black"
            },
        ]
        
        setPickPiece(variationPiece)
    }

    const isValidMove = (from: Square,to: Square) => {
        const isWhite = from?.piece?.color === "white"
        const isEmptyTarget = !to.piece  
        const isEnemyTarget = to.piece && from.piece?.color !== to.piece?.color

        const validPawnMove = (from: Square,to: Square) => {   
            const direction = isWhite ? 1 : -1
            const isSameCol = from.col === to.col
            const isFirstStep = isWhite ? from.row === 1 : from.row === 6
            const isFinalStep = isWhite ? to.row === 7 : to.row === 0

            const normalMove = isSameCol && isEmptyTarget && to.row === from.row + direction 
            const attackMove = isEnemyTarget && Math.abs(from.col - to.col) === 1 && to.row + direction 
            const doubleMove = isFirstStep && isEmptyTarget && to.row === from.row + 2 * direction

            if (isFinalStep && isEmptyTarget) {
                InitialPickChess(isWhite)
                // setBoard(prevBoard => {
                //     const newBoard = [...prevBoard]

                //     const fromIndex = newBoard.findIndex(square => square.coord === from?.coord)
                //     const toIndex = newBoard.findIndex(square => square.coord === to.coord)

                //     newBoard[toIndex] = {
                //         ...newBoard[toIndex],
                //         piece : {
                //             type: "king",
                //             color: isWhite ? "white" : "black"
                //         }
                //     }
                //     newBoard[fromIndex] = {
                //         ...newBoard[fromIndex],
                //         piece: null
                //     }
                //     return newBoard
                // })
                // return
                return
            }

            if(doubleMove) {
                return getSquaresBetween(from,to)
            }

            return normalMove || attackMove
        }

        const validRookMove = (from: Square,to: Square) => {
            const isSameCol = from.col === to.col
            const isSameRow = from.row === to.row
            const normalMove = isEmptyTarget && isSameRow || isEmptyTarget && isSameCol
            const attackMove = isEnemyTarget && isSameCol || isEnemyTarget && isSameRow
            if (normalMove || attackMove) {
               return getSquaresBetween(from,to)
            }
            return false
        }

        const validBishopMove = (from: Square,to: Square) => {
            const isDiagonal = Math.abs(from.col - to.col) === Math.abs(from.row - to.row)
            const normalMove = isEmptyTarget && isDiagonal
            const attackMove = isEnemyTarget && isDiagonal
            
            if(normalMove || attackMove) {
                return getSquaresBetween(from,to)
            }
            return false
        }

        const validKnightMove = (from: Square,to: Square) => {
            const rowMove = Math.abs(from.row - to.row) === 2 && Math.abs(from.col - to.col) === 1
            const colMove = Math.abs(from.row - to.row) === 1 && Math.abs(from.col - to.col) === 2
            const LTypeMove = rowMove || colMove
            const normalMove = isEmptyTarget && LTypeMove
            const attackMove = isEnemyTarget && LTypeMove

            return normalMove || attackMove
        }

        const validQueenMove = (from: Square,to: Square) => {
            const isQueen = Math.abs(from.col - to.col) === 1 || Math.abs(from.row - to.row) === 1 
            const normalMove = isEmptyTarget && isQueen
            const attackMove = isEnemyTarget && isQueen
            
            if(normalMove || attackMove) {
                return getSquaresBetween(from,to)
            }
            return false
        }

        const  validKingMove = (from: Square,to: Square) => {
            const isDiagonal = Math.abs(from.col - to.col) === Math.abs(from.row - to.row)
            const isSameCol = from.col === to.col
            const isSameRow = from.row === to.row
            const isSameMove = isSameCol || isSameRow
            const normalMove = isDiagonal && isEmptyTarget || isSameMove && isEmptyTarget
            const attackMove = isDiagonal && isEnemyTarget || isSameMove && isEnemyTarget

            if(normalMove || attackMove) {
                return getSquaresBetween(from,to)
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
    }
}