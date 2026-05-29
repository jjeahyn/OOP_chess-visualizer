"use client";

import React, { useState, useEffect } from "react";
import {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
  Piece,
} from "@/lib/chess";

const getUnicodeSymbol = (symbol: string) => {
  const map: Record<string, string> = {
    'p': '♟', 'P': '♟',
    'n': '♞', 'N': '♞',
    'b': '♝', 'B': '♝',
    'r': '♜', 'R': '♜',
    'q': '♛', 'Q': '♛',
    'k': '♚', 'K': '♚',
  };
  return map[symbol.toLowerCase()] || symbol;
};

const toAlgebraic = (r: number, c: number) => {
  const colStr = String.fromCharCode(97 + c);
  const rowStr = (8 - r).toString();
  return `${colStr}${rowStr}`;
};

const PIECE_TYPES = [
  { name: "Pawn", icon: "♟", initPos: [6, 0] as [number, number] },
  { name: "Knight", icon: "♞", initPos: [7, 1] as [number, number] },
  { name: "Bishop", icon: "♝", initPos: [7, 2] as [number, number] },
  { name: "Rook", icon: "♜", initPos: [7, 0] as [number, number] },
  { name: "Queen", icon: "♛", initPos: [7, 3] as [number, number] },
  { name: "King", icon: "♚", initPos: [7, 4] as [number, number] },
];

export default function ChessOOPVisualizer() {
  const [mounted, setMounted] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMovesGrid, setValidMovesGrid] = useState<boolean[][]>(
    Array(8).fill(false).map(() => Array(8).fill(false))
  );
  const [, setRenderTrigger] = useState(0);

  // Global states
  const [globalColor, setGlobalColor] = useState<'white'|'black'>('white');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showPromotionCelebration, setShowPromotionCelebration] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePieceSelect = (type: { name: string, initPos: [number, number] }, colorOverride?: 'white'|'black') => {
    const colorToUse = colorOverride || globalColor;
    let newPiece: Piece;
    
    // Adjust initial position based on color so pieces start in their respective home territories
    let r = type.initPos[0];
    const c = type.initPos[1];
    if (colorToUse === 'black') {
      if (r === 7) r = 0;
      if (r === 6) r = 1;
    }
    const actualInitPos: [number, number] = [r, c];

    switch (type.name) {
      case "Pawn": newPiece = new Pawn(colorToUse, actualInitPos); break;
      case "Knight": newPiece = new Knight(colorToUse, actualInitPos); break;
      case "Bishop": newPiece = new Bishop(colorToUse, actualInitPos); break;
      case "Rook": newPiece = new Rook(colorToUse, actualInitPos); break;
      case "Queen": newPiece = new Queen(colorToUse, actualInitPos); break;
      case "King": newPiece = new King(colorToUse, actualInitPos); break;
      default: newPiece = new Pawn(colorToUse, actualInitPos);
    }

    setSelectedPiece(newPiece);

    // Compute the 8x8 grid of valid moves for this initial position
    const newGrid: boolean[][] = Array(8).fill(false).map(() => Array(8).fill(false));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const testClone = Object.assign(Object.create(Object.getPrototypeOf(newPiece)), newPiece);
        newGrid[r][c] = testClone.is_valid_move([r, c]);
      }
    }
    
    setValidMovesGrid(newGrid);
  };

  const toggleGlobalColor = () => {
    const newColor = globalColor === 'white' ? 'black' : 'white';
    setGlobalColor(newColor);
    
    // Re-instantiate the current piece with the new color so internal get_symbol() updates properly
    if (selectedPiece) {
      const currentType = PIECE_TYPES.find(p => p.name === selectedPiece.constructor.name);
      if (currentType) {
        // Reset to initial position of the new color so it starts at the correct home rank
        handlePieceSelect(currentType, newColor);
      }
    }
  };

  const handleTileClick = (r: number, c: number) => {
    if (selectedPiece && validMovesGrid[r][c]) {
      selectedPiece.is_valid_move([r, c]);
      selectedPiece.position = [r, c];
      
      let currentPiece = selectedPiece;
      
      // Pawn Promotion check
      if (currentPiece.constructor.name === "Pawn") {
        const isWhitePromotion = globalColor === 'white' && r === 0;
        const isBlackPromotion = globalColor === 'black' && r === 7;
        
        if (isWhitePromotion || isBlackPromotion) {
          // Promote to Queen
          currentPiece = new Queen(globalColor, [r, c]);
          setSelectedPiece(currentPiece);
          
          // Trigger Celebration
          setShowPromotionCelebration(true);
          setTimeout(() => setShowPromotionCelebration(false), 3500);
        }
      }
      
      const newGrid: boolean[][] = Array(8).fill(false).map(() => Array(8).fill(false));
      for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
          const testClone = Object.assign(Object.create(Object.getPrototypeOf(currentPiece)), currentPiece);
          newGrid[tr][tc] = testClone.is_valid_move([tr, tc]);
        }
      }
      
      setValidMovesGrid(newGrid);
      setRenderTrigger(prev => prev + 1);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 font-sans selection:bg-amber-500/30 py-12 px-4 sm:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-amber-700/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-orange-700/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="mb-10 text-center relative z-10 w-full max-w-4xl px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4 drop-shadow-sm">
          OOP Chess Simulator
        </h1>
        <p className="text-stone-300 max-w-2xl mx-auto text-sm md:text-base mb-6">
          Visually experience Object-Oriented Inheritance, Polymorphism, and Encapsulation.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm">
          <div className="bg-stone-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-stone-700/50 flex items-center gap-3 shadow-lg w-full sm:w-auto">
            <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-1 rounded-md text-xs">STEP 1</span>
            <span className="text-stone-300">Click a <strong className="text-white">Piece Card</strong> to place it</span>
          </div>
          <div className="hidden sm:block text-stone-600">➔</div>
          <div className="bg-stone-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-stone-700/50 flex items-center gap-3 shadow-lg w-full sm:w-auto">
            <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-1 rounded-md text-xs">STEP 2</span>
            <span className="text-stone-300">Check highlighted <strong className="text-orange-400">valid moves</strong></span>
          </div>
          <div className="hidden sm:block text-stone-600">➔</div>
          <div className="bg-stone-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-stone-700/50 flex items-center gap-3 shadow-lg w-full sm:w-auto">
            <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-1 rounded-md text-xs">STEP 3</span>
            <span className="text-stone-300">Click a tile to <strong className="text-amber-400">move piece</strong></span>
          </div>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-12 w-full max-w-7xl justify-center items-start relative z-10">
        {/* Main Tree Container */}
        <main className="w-full xl:w-auto flex flex-col items-center flex-1">
          {/* Base Class Node */}
          <div className="flex flex-col items-center">
            <div className="bg-stone-800/90 backdrop-blur-md border border-stone-700/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center w-64 ring-1 ring-white/5">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3 border border-amber-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Piece</h2>
              <p className="text-xs text-stone-400 mb-3">Abstract Base Class</p>
              <div className="w-full space-y-2 relative mt-4">
                <button 
                  onClick={toggleGlobalColor}
                  className="w-full flex justify-between items-center bg-stone-900/80 px-3 py-2.5 rounded-lg border border-stone-700/50 cursor-pointer hover:bg-stone-800 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all active:scale-[0.98] group"
                  title="Click to toggle global color"
                >
                  <span className="font-semibold text-stone-200 group-hover:text-amber-400">color</span> 
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded">String</span>
                </button>
                <button 
                  onClick={() => {
                    if (selectedPiece) {
                      const sym = selectedPiece.get_symbol();
                      const algebraic = toAlgebraic(selectedPiece.position[0], selectedPiece.position[1]);
                      setToastMsg(`${sym}${algebraic}`);
                      setTimeout(() => setToastMsg(null), 3000);
                    }
                  }}
                  className="w-full flex justify-between items-center bg-stone-900/80 px-3 py-2.5 rounded-lg border border-stone-700/50 cursor-pointer hover:bg-stone-800 hover:border-amber-500/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all active:scale-[0.98] group"
                  title="Click to generate algebraic notation"
                >
                  <span className="font-semibold text-stone-200 group-hover:text-amber-400">position</span> 
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded">Tuple</span>
                </button>
                <div className="flex justify-between items-center bg-stone-950/50 px-3 py-2.5 rounded-lg border border-stone-800/80 italic opacity-70">
                  <span className="text-sm text-stone-400">get_symbol()</span>
                </div>
                <div className="flex justify-between items-center bg-stone-950/50 px-3 py-2.5 rounded-lg border border-stone-800/80 italic opacity-70">
                  <span className="text-sm text-stone-400">is_valid_move()</span>
                </div>
              </div>
            </div>
            
            {/* Vertical Line down from Base */}
            <div className="w-px h-12 bg-gradient-to-b from-stone-600 to-stone-700"></div>
          </div>

          {/* Horizontal Line for Branches */}
          <div className="w-full max-w-[700px] h-px bg-stone-700 relative">
            <div className="absolute top-0 left-[8.33%] w-[83.33%] flex justify-between">
              <div className="w-px h-6 bg-stone-700"></div>
              <div className="w-px h-6 bg-stone-700"></div>
              <div className="w-px h-6 bg-stone-700"></div>
              <div className="w-px h-6 bg-stone-700"></div>
              <div className="w-px h-6 bg-stone-700"></div>
              <div className="w-px h-6 bg-stone-700"></div>
            </div>
          </div>

          {/* Subclasses */}
          <div className="w-full max-w-[840px] grid grid-cols-3 sm:grid-cols-6 gap-4 pt-6">
            {PIECE_TYPES.map((item) => {
              const isSelected = selectedPiece?.constructor.name === item.name;
              return (
                <div key={item.name} className="flex flex-col items-center group cursor-pointer" onClick={() => handlePieceSelect(item)}>
                  <div className={`w-full bg-stone-800/80 backdrop-blur-sm border rounded-xl p-4 flex flex-col items-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] ${isSelected ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)] bg-stone-800' : 'border-stone-700/50 hover:bg-stone-800 hover:border-amber-500/50'}`}>
                    <div className={`text-4xl mb-3 transition-transform duration-300 ${isSelected ? 'text-orange-400 scale-110' : 'text-stone-400 group-hover:text-amber-500 group-hover:scale-110'}`}>
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1.5">{item.name}</h3>
                    <div className="text-[9px] text-stone-400 mb-2 text-center leading-tight space-y-1">
                      <div className="opacity-60 uppercase tracking-wider mb-1">Overrides</div>
                      <div className="font-mono bg-stone-900/50 px-1.5 py-0.5 rounded text-orange-400/80">is_valid_move()</div>
                      <div className="font-mono bg-stone-900/50 px-1.5 py-0.5 rounded text-amber-400/80">get_symbol()</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* 8x8 Chessboard Visualizer */}
        <aside className="w-full xl:w-[480px] shrink-0 flex flex-col items-center mt-8 xl:mt-0">
          <div className="bg-stone-800/90 backdrop-blur-md border border-stone-700/50 rounded-3xl p-6 shadow-2xl w-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-orange-400">Interactive</span> Board
            </h3>
            <p className="text-sm text-stone-400 mb-6 text-center h-5">
              {selectedPiece ? (
                <>
                  <strong className="text-white mr-1">{selectedPiece.constructor.name}</strong> 
                  is at 
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-stone-900 text-amber-400 font-mono">
                    {toAlgebraic(selectedPiece.position[0], selectedPiece.position[1])}
                  </span>
                </>
              ) : (
                "Select a piece to visualize moves."
              )}
            </p>
            
            <div className="w-full max-w-[400px] aspect-square grid grid-cols-8 grid-rows-8 border-4 border-stone-900 rounded-md overflow-hidden shadow-2xl relative bg-stone-900">
              
              {/* Grid Tiles */}
              {(globalColor === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]).map((r) => (
                (globalColor === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0]).map((c) => {
                  const isLight = (r + c) % 2 === 0;
                  const baseBg = isLight ? "bg-[#F0D9B5]" : "bg-[#B58863]";
                  
                  const isSelectedPieceHere = selectedPiece && selectedPiece.position[0] === r && selectedPiece.position[1] === c;
                  const isValidDest = validMovesGrid[r][c];
                  
                  let highlightClass = "";
                  if (isValidDest) {
                    highlightClass = "after:absolute after:inset-1 after:rounded-md after:bg-orange-600/40 after:shadow-[inset_0_0_15px_rgba(234,88,12,0.6)] after:cursor-pointer after:transition-all after:hover:bg-orange-500/50";
                  } else if (isSelectedPieceHere) {
                    highlightClass = "after:absolute after:inset-0 after:bg-amber-400/30";
                  }

                  const isVisualLeft = globalColor === 'white' ? c === 0 : c === 7;
                  const isVisualBottom = globalColor === 'white' ? r === 7 : r === 0;

                  return (
                    <div 
                      key={`${r}-${c}`} 
                      onClick={() => handleTileClick(r, c)}
                      className={`relative w-full h-full flex flex-wrap items-center justify-center transition-colors duration-300 ${baseBg} ${highlightClass}`}
                    >
                      {isSelectedPieceHere && (
                        <span 
                          className={`text-4xl sm:text-5xl relative z-10 transition-all duration-300 animate-in zoom-in ${globalColor === 'white' ? 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]' : 'text-stone-950 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]'}`}
                        >
                          {getUnicodeSymbol(selectedPiece.get_symbol())}
                        </span>
                      )}
                      
                      {isVisualLeft && (
                        <span className={`absolute top-0.5 left-1 text-[9px] font-bold opacity-50 select-none ${isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'}`}>
                          {8 - r}
                        </span>
                      )}
                      {isVisualBottom && (
                        <span className={`absolute bottom-0.5 right-1 text-[9px] font-bold opacity-50 select-none ${isLight ? 'text-[#B58863]' : 'text-[#F0D9B5]'}`}>
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500/60 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                <span className="text-stone-300">Click to move</span>
              </div>
              {selectedPiece && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-stone-500/50"></div>
                  <span className="text-stone-300">
                    get_symbol() ➔ <strong className="text-amber-400 font-mono text-base">{selectedPiece.get_symbol()}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Detailed Mechanics List */}
      <footer className="w-full max-w-3xl mt-20 mb-4 px-6 text-center relative z-10 opacity-80">
        <div className="w-16 h-px bg-stone-700 mx-auto mb-6"></div>
        <h4 className="text-stone-500 font-bold mb-3 text-[10px] sm:text-xs uppercase tracking-widest">Key Mechanics to explore</h4>
        <ul className="text-stone-400 text-xs sm:text-sm space-y-2 flex flex-col items-center">
          <li>
            1. Click <code className="bg-stone-800/80 px-1.5 py-0.5 rounded border border-stone-700/50 text-stone-300">color</code> to switch sides. Notice how <code className="bg-stone-800/80 px-1.5 py-0.5 rounded border border-stone-700/50 text-amber-500/80 font-mono">get_symbol()</code> changes case (e.g., P ↔ p).
          </li>
          <li>
            2. Click <code className="bg-stone-800/80 px-1.5 py-0.5 rounded border border-stone-700/50 text-stone-300">position</code> to view the piece's current algebraic notation.
          </li>
          <li>
            3. A <strong className="text-stone-300">Pawn</strong> can move two squares forward only on its very first move.
          </li>
          <li className="text-amber-400 font-semibold drop-shadow-sm mt-1 bg-amber-900/10 px-4 py-1.5 rounded-full border border-amber-700/30">
            4. ✨ A <strong className="text-white">Pawn</strong> that reaches the opposite end of the board is instantly promoted to a <strong className="text-white">Queen</strong>!
          </li>
        </ul>
      </footer>

      {/* Promotion Celebration Overlay */}
      {showPromotionCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-amber-500/10 animate-pulse duration-1000"></div>
          <div className="relative bg-stone-900 border-4 border-amber-500 p-8 rounded-3xl shadow-[0_0_100px_rgba(245,158,11,0.6)] animate-in zoom-in duration-500 flex flex-col items-center">
            <div className="text-[120px] mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce" style={{animationDuration: '1s'}}>
              {getUnicodeSymbol(globalColor === 'white' ? 'Q' : 'q')}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite] bg-clip-text text-transparent mb-3 text-center tracking-widest drop-shadow-sm">
              Congratulations!
            </h2>
            <p className="text-stone-300 font-medium text-lg px-5 py-2 bg-stone-800 rounded-full border border-stone-700">
              Your Pawn has been promoted to a <strong className="text-amber-400">Queen</strong>!
            </p>
            <div className="absolute -inset-4 border-2 border-amber-500/50 rounded-[2.5rem] animate-ping opacity-20" style={{animationDuration: '2s'}}></div>
            <div className="absolute -inset-8 border-2 border-orange-500/30 rounded-[3rem] animate-ping opacity-10" style={{animationDuration: '3s'}}></div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-stone-900 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-white px-6 py-3 rounded-full flex items-center gap-3 font-mono text-lg">
            <span className="text-2xl drop-shadow-md">{getUnicodeSymbol(toastMsg.charAt(0))}</span>
            <span className="text-orange-400 font-bold tracking-widest">{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
