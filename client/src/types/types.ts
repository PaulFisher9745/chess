export type PieceType = "pawn" | "rook" | "bishop" | "knight" | "queen" | "king"

export type PieceColor = "black" | "white" 

export type PromotionPiece = "queen" | "knight" | "bishop" | "rook"

export interface Piece {
    type: PieceType;
    color: PieceColor;
}

export interface Square {
  row: number;
  col: number;
  num: string;
  lett: string
  coord: string;
  piece: Piece | null;
  isDark: boolean;
}

export interface Threats {
  attacker?: Square,
  path?: Square[],
  type?: "direct" | "linear"
}