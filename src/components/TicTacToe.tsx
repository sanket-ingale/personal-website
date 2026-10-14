import { useEffect, useRef, useState } from "react";
import { Circle, Cpu, RotateCcw, Users, X } from "lucide-react";

type Mark = "X" | "O";
type Cell = Mark | null;
type Mode = "cpu" | "2p";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function getResult(board: Cell[]): {
  winner: Mark | "draw" | null;
  line: readonly number[] | null;
} {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

function emptyCells(board: Cell[]) {
  return board.reduce<number[]>((acc, cell, i) => (cell === null ? [...acc, i] : acc), []);
}

/** Win > block > center > corner > random. Beatable on purpose. */
function getCpuMove(board: Cell[]): number {
  const open = emptyCells(board);
  for (const i of open) {
    const next = board.slice();
    next[i] = "O";
    if (getResult(next).winner === "O") return i;
  }
  for (const i of open) {
    const next = board.slice();
    next[i] = "X";
    if (getResult(next).winner === "X") return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return open[Math.floor(Math.random() * open.length)];
}

function cellCenter(i: number) {
  return { x: (i % 3) + 0.5, y: Math.floor(i / 3) + 0.5 };
}

export function TicTacToe() {
  const [mode, setMode] = useState<Mode>("cpu");
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null));
  const [turn, setTurn] = useState<Mark>("X");
  const cpuTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { winner, line } = getResult(board);
  const thinking = mode === "cpu" && turn === "O" && !winner;

  useEffect(() => {
    if (!thinking) return;
    cpuTimeout.current = setTimeout(() => {
      setBoard((b) => {
        if (getResult(b).winner) return b;
        const next = b.slice();
        next[getCpuMove(b)] = "O";
        return next;
      });
      setTurn("X");
    }, 450);
    return () => clearTimeout(cpuTimeout.current);
  }, [thinking]);

  function resetBoard() {
    clearTimeout(cpuTimeout.current);
    setBoard(Array(9).fill(null));
    setTurn("X");
  }

  function handleModeChange(next: Mode) {
    if (next === mode) return;
    setMode(next);
    resetBoard();
  }

  function handleCellClick(i: number) {
    if (board[i] || winner) return;
    if (mode === "cpu" && turn === "O") return;
    const next = board.slice();
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  }

  let status: string;
  if (winner === "draw") status = "DRAW";
  else if (winner) status = mode === "cpu" ? (winner === "X" ? "YOU WIN" : "CPU WINS") : `${winner} WINS`;
  else if (thinking) status = "O IS THINKING";
  else status = mode === "cpu" ? "YOUR TURN" : `${turn}'S TURN`;

  return (
    <div className="w-full sm:w-72">
      <div className="flex items-center justify-between gap-3">
        <p className="telemetry">Tic-Tac-Toe</p>
        <div key={status} className="ttt-status telemetry flex items-center gap-2">
          {thinking && <span className="status-dot status-dot--pulse" />}
          <span className={winner && winner !== "draw" ? "!text-signal" : ""}>{status}</span>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-1.5">
        {board.map((cell, i) => {
          const playable = !cell && !winner && !(mode === "cpu" && turn === "O");
          return (
            <button
              key={i}
              type="button"
              data-spotlight
              onClick={() => handleCellClick(i)}
              disabled={!playable}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ", empty"}`}
              className={`group relative flex aspect-square items-center justify-center rounded-md border bg-panel transition-colors ${playable ? "cursor-pointer hover:border-signal" : ""
                } ${line?.includes(i) ? "ttt-winner-cell border-signal" : "border-line"}`}
            >
              {cell === "X" && (
                <X className="ttt-mark h-7 w-7 text-signal sm:h-8 sm:w-8" strokeWidth={2.5} />
              )}
              {cell === "O" && (
                <Circle className="ttt-mark h-6 w-6 text-ink sm:h-7 sm:w-7" strokeWidth={2.5} />
              )}
              {!cell &&
                playable &&
                (turn === "X" ? (
                  <X
                    className="h-7 w-7 text-muted opacity-0 transition-opacity group-hover:opacity-30 sm:h-8 sm:w-8"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Circle
                    className="h-6 w-6 text-muted opacity-0 transition-opacity group-hover:opacity-30 sm:h-7 sm:w-7"
                    strokeWidth={2.5}
                  />
                ))}
            </button>
          );
        })}
        {line && (
          <svg viewBox="0 0 3 3" className="pointer-events-none absolute inset-0 z-[20]" aria-hidden="true">
            <path
              className="ttt-win-line"
              d={`M ${cellCenter(line[0]).x} ${cellCenter(line[0]).y} L ${cellCenter(line[2]).x} ${cellCenter(line[2]).y}`}
              stroke="currentColor"
              strokeWidth="0.08"
              strokeLinecap="round"
              pathLength={1}
            />
          </svg>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 pt-3">
        <div className="inline-flex rounded-md border border-line p-0.5">
          <button
            type="button"
            onClick={() => handleModeChange("cpu")}
            aria-pressed={mode === "cpu"}
            className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs transition-colors ${mode === "cpu" ? "bg-signal/10 text-signal" : "text-muted hover:text-ink"
              }`}
          >
            <Cpu size={13} /> CPU
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("2p")}
            aria-pressed={mode === "2p"}
            className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs transition-colors ${mode === "2p" ? "bg-signal/10 text-signal" : "text-muted hover:text-ink"
              }`}
          >
            <Users size={13} /> 2P
          </button>
        </div>
        <button
          type="button"
          onClick={resetBoard}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-signal hover:text-signal"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </div>
  );
}
