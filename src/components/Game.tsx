import { FC, PropsWithChildren, useEffect, useState } from "react";
import { range } from "../utils";

enum ECellType {
  UNLOCKED = "unlocked",
  LOCKED = "locked",
  WRONG = "wrong",
}
interface ICell {
  type: ECellType;
  children: number;
  isMine: boolean;
}

const cellCount = 252;
const colCount = 18;
const mineCount = 40;

const { cells: initialCells, mineIndexes } = getInitialState();
const Game: FC<{ onWin: () => void; onLose: () => void }> = (props) => {
  const [cells, setCells] = useState(initialCells);
  const [isPause, setIsPause] = useState(false);

  const checkWin = () => {
    if (
      cells.filter((cell) => cell.type === ECellType.LOCKED && !cell.isMine)
        .length === 0
    ) {
      setIsPause(true);
      props.onWin();
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (isPause) return;
    checkWin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);

  const handleUnlock = (i: number) => {
    if (isPause) return;
    const newCells: ICell[] = JSON.parse(JSON.stringify(cells));
    if (newCells[i].isMine) {
      mineIndexes.forEach((index) => (newCells[index].type = ECellType.WRONG));
      setIsPause(true);
      props.onLose();
    } else if (newCells[i].children === 0) {
      newCells[i].type = ECellType.UNLOCKED;
      unlockEmptyAround(newCells, i);
    } else newCells[i].type = ECellType.UNLOCKED;
    setCells(newCells);
  };

  return (
    <div className="game">
      {cells.map((cell, i) => {
        return (
          <Cell key={i} type={cell.type} onUnlock={() => handleUnlock(i)}>
            {cell.children === 0 ? null : cell.children}
          </Cell>
        );
      })}
    </div>
  );
};

export default Game;

//
const Cell: FC<
  PropsWithChildren & { type: ECellType; onUnlock: () => void }
> = (props) => {
  return (
    <div className={`cell ${props.type}`} onMouseDown={props.onUnlock}>
      {props.type === ECellType.UNLOCKED ? props.children : null}
    </div>
  );
};

function unlockEmptyAround(cells: ICell[], index: number) {
  if (cells[index].children !== 0) throw new TypeError("The cell is not empty");
  const aroundIndexes = getAroundIndexes(index);
  aroundIndexes.forEach((idx) => {
    if (cells[idx].type !== ECellType.UNLOCKED) {
      cells[idx].type = ECellType.UNLOCKED;
      if (cells[idx].children === 0) unlockEmptyAround(cells, idx);
    }
  });
}

function getAroundIndexes(index: number): number[] {
  const aroundIndexes: number[][] = [];
  const row = Math.floor(index / colCount);
  const col = index - row * colCount;

  const isFirstRow = row === 0;
  const isFirstCol = col === 0;
  const isLastRow = !isFirstRow && row === cellCount / colCount - 1;
  const isLastCol = !isFirstCol && col === colCount - 1;

  const prevRow = row - 1;
  const prevCol = col - 1;
  const nextRow = row + 1;
  const nextCol = col + 1;

  if (!isFirstRow) aroundIndexes.push([prevRow, col]);
  if (!isFirstCol) aroundIndexes.push([row, prevCol]);
  if (!isLastRow) aroundIndexes.push([nextRow, col]);
  if (!isLastCol) aroundIndexes.push([row, nextCol]);

  if (!isFirstRow && !isFirstCol) aroundIndexes.push([prevRow, prevCol]);
  if (!isLastRow && !isLastCol) aroundIndexes.push([nextRow, nextCol]);
  if (!isFirstRow && !isLastCol) aroundIndexes.push([prevRow, nextCol]);
  if (!isLastRow && !isFirstCol) aroundIndexes.push([nextRow, prevCol]);

  return aroundIndexes.map(([i, j]) => i * colCount + j);
}

function getInitialState(): { cells: ICell[]; mineIndexes: number[] } {
  const mineIndexes: number[] = [];
  for (let i = 0; i < mineCount; i++) {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * cellCount);
    } while (mineIndexes.includes(randomIndex));
    mineIndexes.push(randomIndex);
  }

  const cells: ICell[] = range(cellCount).map((i) => {
    const isMine = mineIndexes.includes(i);
    return {
      type: ECellType.LOCKED,
      children: isMine ? NaN : 0,
      isMine,
    };
  });
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].isMine) {
      const aroundIndexes = getAroundIndexes(i);
      aroundIndexes.forEach((index) => cells[index].children++);
    }
  }
  return { cells, mineIndexes };
}
