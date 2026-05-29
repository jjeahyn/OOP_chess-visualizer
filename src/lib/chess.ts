export abstract class Piece {
  color: 'white' | 'black';
  position: [number, number];

  constructor(color: 'white' | 'black', position: [number, number]) {
    this.color = color;
    this.position = position;
  }

  abstract get_symbol(): string;
  abstract is_valid_move(dest: [number, number]): boolean;
}

export class Pawn extends Piece {
  __is_first_move: boolean = true;

  get_symbol(): string {
    return this.color === 'white' ? 'P' : 'p';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    const direction = this.color === 'white' ? -1 : 1;

    // Must be same column for normal move
    if (dc === c) {
      if (dr === r + direction) {
        this.__is_first_move = false;
        return true;
      }
      if (this.__is_first_move && dr === r + 2 * direction) {
        this.__is_first_move = false;
        return true;
      }
    }
    
    // Diagonal capture logic for pawn is omitted in this visualizer 
    // since it only visualizes a single piece's valid move paths on an empty board.
    return false;
  }
}

export class Knight extends Piece {
  get_symbol(): string {
    return this.color === 'white' ? 'N' : 'n';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    const rowDiff = Math.abs(r - dr);
    const colDiff = Math.abs(c - dc);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }
}

export class Bishop extends Piece {
  get_symbol(): string {
    return this.color === 'white' ? 'B' : 'b';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    return Math.abs(r - dr) === Math.abs(c - dc);
  }
}

export class Rook extends Piece {
  get_symbol(): string {
    return this.color === 'white' ? 'R' : 'r';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    return r === dr || c === dc;
  }
}

export class Queen extends Piece {
  get_symbol(): string {
    return this.color === 'white' ? 'Q' : 'q';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    return r === dr || c === dc || Math.abs(r - dr) === Math.abs(c - dc);
  }
}

export class King extends Piece {
  get_symbol(): string {
    return this.color === 'white' ? 'K' : 'k';
  }

  is_valid_move(dest: [number, number]): boolean {
    const [r, c] = this.position;
    const [dr, dc] = dest;
    return Math.abs(r - dr) <= 1 && Math.abs(c - dc) <= 1;
  }
}
