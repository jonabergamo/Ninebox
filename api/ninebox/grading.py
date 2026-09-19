"""The rules that move a student around the 9 box grid.

x is performance, y is potential, both 1..3. Cells are numbered 1..9 bottom left to top right.
A graded activity gives a final grade from 0 to 100 and the student's cell moves by these rules,
kept as they were written for the 2023 pilot:

  below 50 twice in a row   drop one cell (or a level, when already at cell 1)
  90 or more, harder level  climb two cells
  75 or more, same level    climb one cell
  climbing past cell 9      level up, restart at cell 2

Pure functions, so they're easy to test and the views stay thin.
"""

from dataclasses import dataclass, replace

GRADE_VALUE = {"E": 100, "G": 75, "A": 50, "P": 25}

CELL = {(1, 1): 1, (2, 1): 2, (3, 1): 3, (1, 2): 4, (2, 2): 5, (3, 2): 6, (1, 3): 7, (2, 3): 8, (3, 3): 9}
XY = {v: k for k, v in CELL.items()}

UP = {1: 2, 2: 3, 3: 5, 4: 5, 5: 6, 6: 8, 7: 8, 8: 9, 9: None}  # None means level up
DOWN = {1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 5, 7: 5, 8: 7, 9: 8}

START_CELL = 2


@dataclass(frozen=True)
class Position:
    level: int = 0
    x: int = 2
    y: int = 1
    fail_streak: int = 0

    @property
    def cell(self):
        return CELL[(self.x, self.y)]


def final_grade(marks):
    """marks is an iterable of (grade letter, weight). Weighted mean on the 25..100 scale."""
    total = 0.0
    weight_sum = 0
    for letter, weight in marks:
        w = weight if weight > 0 else 1
        total += GRADE_VALUE[letter] * w
        weight_sum += w
    if weight_sum == 0:
        return None
    return round(total / weight_sum, 2)


def climb(pos: Position, steps: int) -> Position:
    level, cell = pos.level, pos.cell
    for _ in range(steps):
        nxt = UP[cell]
        if nxt is None:
            level += 1
            cell = START_CELL
        else:
            cell = nxt
    x, y = XY[cell]
    return replace(pos, level=level, x=x, y=y)


def next_position(pos: Position, grade: float, activity_level: int) -> Position:
    if grade < 50:
        streak = pos.fail_streak + 1
        if streak < 2:
            return replace(pos, fail_streak=streak)
        if pos.cell == 1 and pos.level > 0:
            x, y = XY[9]
            return Position(level=pos.level - 1, x=x, y=y)
        x, y = XY[DOWN[pos.cell]]
        return Position(level=pos.level, x=x, y=y)

    pos = replace(pos, fail_streak=0)
    if grade >= 90 and activity_level > pos.level:
        return climb(pos, 2)
    if grade >= 75 and activity_level >= pos.level:
        return climb(pos, 1)
    return pos
