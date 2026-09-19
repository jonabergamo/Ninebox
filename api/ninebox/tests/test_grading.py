from ninebox.grading import Position, climb, final_grade, next_position


def test_final_grade_is_a_weighted_mean():
    assert final_grade([("E", 1), ("P", 1)]) == 62.5
    assert final_grade([("E", 3), ("P", 1)]) == 81.25
    assert final_grade([("G", 0)]) == 75  # zero weight counts as one
    assert final_grade([]) is None


def test_start_position_is_cell_two():
    assert Position().cell == 2


def test_good_grade_on_same_level_climbs_one():
    p = next_position(Position(), 80, 0)
    assert (p.x, p.y, p.level) == (3, 1, 0)


def test_great_grade_on_harder_level_climbs_two():
    p = next_position(Position(), 95, 1)
    assert p.cell == 5


def test_great_grade_on_same_level_only_climbs_one():
    p = next_position(Position(), 95, 0)
    assert p.cell == 3


def test_good_grade_on_easier_activity_does_not_move():
    p = next_position(Position(level=2), 80, 1)
    assert p.cell == 2 and p.level == 2


def test_middle_grade_holds_and_clears_the_streak():
    p = next_position(Position(fail_streak=1), 60, 0)
    assert p.cell == 2 and p.fail_streak == 0


def test_one_fail_only_counts():
    p = next_position(Position(x=3, y=1), 30, 0)
    assert p.cell == 3 and p.fail_streak == 1


def test_second_fail_drops_a_cell():
    p = next_position(Position(x=3, y=1, fail_streak=1), 30, 0)
    assert p.cell == 2 and p.fail_streak == 0


def test_failing_at_cell_one_with_a_level_drops_the_level():
    p = next_position(Position(level=1, x=1, y=1, fail_streak=1), 10, 1)
    assert (p.level, p.cell) == (0, 9)


def test_failing_at_cell_one_on_level_zero_stays():
    p = next_position(Position(x=1, y=1, fail_streak=1), 10, 0)
    assert (p.level, p.cell) == (0, 1)


def test_climbing_past_nine_levels_up_and_restarts():
    p = climb(Position(x=3, y=3), 1)
    assert (p.level, p.cell) == (1, 2)
    p = climb(Position(x=2, y=3), 2)  # 8 -> 9 -> level up
    assert (p.level, p.cell) == (1, 2)
