"use client"

import React, { useEffect, useState } from 'react';
import styles from './board.module.scss';
import { useChessBoard} from '@/hooks/useChessBoard';
import Image from 'next/image';
import { PieceColor, PromotionPiece, Square } from '@/types/types';
import PromotionModal from '../promotionModal/PromotionModal';

const Board: React.FC = () => {
  const {
        getBoard,
        getPieces,
        getMove,
        isValidMove,
        promotePawn,
        promotionData,
        findValidMove,
        highlightedSquares,
        checkFinalStep,
        isMoveSafe,
        } = useChessBoard()
  const board = getBoard();
  const [darkside, setDarkSide] = useState<boolean>(false)
  const [selectPiece,setSelectPiece] = useState<Square | null>(null)
  const [turnMove,setTurnMove] = useState<PieceColor>("white")


  const choosePiece = (piece: Square) => {  

    if (piece.piece?.color && !selectPiece ) { //&& turnMove === piece.piece.color вставить сюда для ходов по очереди
      findValidMove(piece)
      return setSelectPiece(piece)
    }
    if (piece?.coord === selectPiece?.coord) return deselectPiece()
  }

  const makeMove = (from: Square | null , to: Square,) => {
    if (!selectPiece || from?.coord === to.coord) {
      return 
    }
    if (from && isValidMove(from,to) && isMoveSafe(from,to)) return executeMove(from,to)

    if (from?.piece?.type && to.piece?.type && from !== null) {
      findValidMove(to)
      return setSelectPiece(to)
    }
    return deselectPiece()
  }
 

  const executeMove = (from: Square, to: Square) => {
    getMove(from, to);
    checkFinalStep(from, to);
    setTurnMove(turnMove === "white" ? "black" : "white");
    deselectPiece()
}

  const  deselectPiece = () => {
    findValidMove(null);
    setSelectPiece(null);  
  }


  const handlePromotionSelect = (pieceType: PromotionPiece) => { 
      promotePawn(pieceType);
      setTurnMove(turnMove === "white" ? "black" : "white");
  } 

  return (
    <>
      <div className={`${styles.board} ${darkside ? "" : styles.reverse}`}>
        {board.map((square) => {
        
          const showLetterDarkSide = square.lett && darkside && square.row === 7
          const showLetterLightSide = square.lett && !darkside && square.row === 0
          const showNumberDarkSide = square.num && darkside && square.col === 7
          const showNumberLightSide = square.num && !darkside && square.col === 0
          const checkDark = square.isDark ? styles.dark : styles.light

          return (
            <div
              key={`${square.coord}`}
              className={
                `${styles.square} 
                ${checkDark} 
                ${selectPiece?.coord === square.coord ? styles.select : ""} 
                ${highlightedSquares.some(hl => hl.coord === square.coord && !square.piece) ? styles.highlight : ""}
                ${highlightedSquares.some(hl => hl.coord === square.coord && square.piece) ? styles.highlightEnemy : ""}`
              }
              onClick={() => makeMove(selectPiece,square)}
              data-row={square.row}
              data-col={square.col} 
            >
              {showNumberDarkSide && <div className={`${styles.numbering} ${checkDark}`} >{square.num}</div>}
              {showNumberLightSide && <div className={`${styles.numbering} ${checkDark} ${styles.reverse}`} >{square.num}</div>}
              {showLetterDarkSide && <div className={`${styles.lettering} ${checkDark}`}>{square.lett}</div>}
              {showLetterLightSide &&<div className={`${styles.lettering} ${checkDark} ${styles.reverse}`}>{square.lett}</div>}
               {square.piece && 
                <Image 
                  onClick={() => choosePiece(square)} 
                  className={`${darkside ? '' : styles.piece_reverse}`} 
                  height={100} 
                  width={100} 
                  src={getPieces(square.piece)} 
                  alt="piece"/>
                }
            </div>
        )})}
         <PromotionModal
                isOpen={promotionData.isPromoting}
                color={promotionData.color}
                onSelect={handlePromotionSelect}
                darkside={darkside}
                positionX={promotionData.positionX}
          />
      </div>
      <button onClick={() => setDarkSide((prev) => !prev)}>Перевернуть доску</button>
    </>
  );
};

export default Board;