"use client"

import React from 'react';
import styles from './promotionModal.module.scss';
import Image from 'next/image';
import { PromotionPiece, PieceColor } from '@/types/types';

interface PromotionModalProps {
    isOpen: boolean;
    darkside: boolean;
    color: PieceColor;
    positionX: number | null;
    onSelect: (pieceType: PromotionPiece) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, color, onSelect, darkside,positionX }) => {
    if (!isOpen) return null;

    const pieces: PromotionPiece[] = ['queen','rook','knight',"bishop"]

    return (
        <div style={{left:`${positionX}px`}} className={`${styles.overlay} ${darkside ? "" : styles.reverse} ${color === "black" ?  styles.darkside : styles.whiteside}`}>
            <div className={styles.modal}>
                <div className={styles.pieces}>
                    {pieces.map(pieceType => (
                        <div
                            key={pieceType}
                            className={styles.pieceOption}
                            onClick={() => onSelect(pieceType)}
                        >
                            <Image
                                src={`/assets/pieces/${pieceType}_${color}.png`}
                                alt={pieceType}
                                width={80}
                                height={80}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;