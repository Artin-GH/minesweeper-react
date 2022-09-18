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

const Game: FC<{onWin: () => void, onLose: () => void}> = (props) => {
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
      getEmptyAroundIndexes(i).forEach(
        (idx) => (newCells[idx].type = ECellType.UNLOCKED)
      );
    } else newCells[i].type = ECellType.UNLOCKED;
    setCells(newCells);
  };

  return (
    <div className="game">
      {cells.map((cell, i) => {
        return (
          <Cell
            key={i}
            type={cell.type}
            onUnlock={() => handleUnlock(i)}
          >
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
    <div className={`cell ${props.type}`} onClick={props.onUnlock}>
      {props.type === ECellType.UNLOCKED ? props.children : null}
    </div>
  );
};

function getEmptyAroundIndexes(index: number, ignore?: number[]): number[] {
  if (initialCells[index].children !== 0)
    throw new TypeError("The cell is not empty");
  const result = getAroundIndexes(index).filter(
    (idx) => !ignore?.includes(idx)
  );
  const empties: number[] = result.filter(
    (idx) => initialCells[idx].children === 0
  );
  ignore = (ignore ?? []).concat(...result, index);
  empties.forEach((emp) => {
    result.push(...getEmptyAroundIndexes(emp, ignore));
  });
  return result;
}

function getAxisOf(index: number): [number, number] {
  const row = Math.floor(index / colCount);
  const col = index - row * colCount;
  return [row, col];
}

function getAroundIndexes(index: number): number[] {
  const aroundIndexes: number[][] = [];
  const [row, col] = getAxisOf(index);

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

const cellCount = 252;
const colCount = 18;
const mineCount = 40;

const mineIndexes: number[] = [];
for (let i = 0; i < mineCount; i++) {
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * cellCount);
  } while (mineIndexes.includes(randomIndex));
  mineIndexes.push(randomIndex);
}

const initialCells: ICell[] = range(cellCount).map((i) => {
  const isMine = mineIndexes.includes(i);
  return {
    type: ECellType.LOCKED,
    children: isMine ? NaN : 0,
    isMine,
  };
});
for (let i = 0; i < initialCells.length; i++) {
  if (initialCells[i].isMine) {
    const aroundIndexes = getAroundIndexes(i);
    aroundIndexes.forEach((index) => initialCells[index].children++);
  }
}
