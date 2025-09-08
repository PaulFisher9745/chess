"use client"

import React, { useEffect, useState } from 'react';
import styles from './board.module.scss';
import { useChessBoard} from '@/hooks/useChessBoard';
import Image from 'next/image';
import { PieceColor, Square } from '@/types/types';

const Board: React.FC = () => {
  const {getBoard,getPieces,getMove,isValidMove} = useChessBoard()
  const board = getBoard();
  const [darkside, setDarkSide] = useState<boolean>(false)
  const [selectPiece,setSelectPiece] = useState<Square | null>(null)
  const [turnMove,setTurnMove] = useState<PieceColor>("white")

  const choosePiece = (piece: Square) => {
    if (piece.piece?.color && !selectPiece) {
      return setSelectPiece(piece)
    }
    if (piece?.coord === selectPiece?.coord) {
      return setSelectPiece(null)
    }
  }


  const makeMove = (from: Square | null , to: Square,) => {
    if (!selectPiece || from?.coord === to.coord) {
      return 
    }
    if (from && isValidMove(from,to)) {
      getMove(from,to)
      return setSelectPiece(null)
    }
    if (from?.piece?.color === to.piece?.color) {
      return setSelectPiece(to)
    }
    setSelectPiece(null)
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
              className={`${styles.square} ${checkDark} ${selectPiece?.coord === square.coord ? styles.select : ""}`}
              onClick={() => makeMove(selectPiece,square)}
              data-row={square.row}
              data-col={square.col}
            >
              {showNumberDarkSide && <div className={`${styles.numbering} ${checkDark}`} >{square.num}</div>}
              {showNumberLightSide && <div className={`${styles.numbering} ${checkDark} ${styles.reverse}`} >{square.num}</div>}
              {showLetterDarkSide && <div className={`${styles.lettering} ${checkDark}`}>{square.lett}</div>}
              {showLetterLightSide &&<div className={`${styles.lettering} ${checkDark} ${styles.reverse}`}>{square.lett}</div>}
              {square.piece && <Image onClick={() => choosePiece(square)} className={`${darkside ? '' : styles.piece_reverse}`} height={100} width={100} src={getPieces(square.piece)} alt="piece"/>}
            </div>
        )})}
      </div>
      <button onClick={() => setDarkSide((prev) => !prev)}>Перевернуть доску</button>
    </>
  );
};

export default Board;