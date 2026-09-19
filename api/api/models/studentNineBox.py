from django.db import models
from .student import Student
from .nineBox import NineBox


class StudentNineBox(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    nine_box = models.ForeignKey(NineBox, on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    x = models.IntegerField(default=2)
    y = models.IntegerField(default=1)
    last_rank_fail_count = models.IntegerField(default=0)

    def __str__(self):
        return str(self.student)

    def update_student_ninebox(self, final_grade, activity_level):
        print("=== Início da função update_student_ninebox ===")  # Debug

        # Mapeando x,y para ranks
        rank_map = {
            (1, 1): 1,
            (2, 1): 2,
            (3, 1): 3,
            (1, 2): 4,
            (2, 2): 5,
            (3, 2): 6,
            (1, 3): 7,
            (2, 3): 8,
            (3, 3): 9,
        }

        # Definindo transições
        transition_map = {
            1: {"up": 2, "down": 1},
            2: {"up": 3, "down": 1},
            3: {"up": 5, "down": 2},
            4: {"up": 5, "down": 2},
            5: {"up": 6, "down": 4},
            6: {"up": 8, "down": 5},
            7: {"up": 8, "down": 5},
            8: {"up": 9, "down": 7},
            9: {"up": "level_up", "down": 8},
        }

        current_rank = rank_map[(self.x, self.y)]
        next_rank = current_rank

        if final_grade < 50:
            self.last_rank_fail_count += 1
            if self.last_rank_fail_count >= 2:
                if current_rank == 1 and self.level > 0:
                    self.level -= 1
                    next_rank = len(transition_map)
                else:
                    next_rank = transition_map[current_rank]["down"]
                self.last_rank_fail_count = (
                    0  # Resetar contador de falhas ao cair de rank
                )
        else:
            self.last_rank_fail_count = 0  # Resetar contador de falhas
            if final_grade >= 90 and activity_level > self.level:
                next_rank = transition_map[current_rank]["up"]
                if next_rank == "level_up":
                    self.level += 1
                    next_rank = 2  # Voltar para o rank inicial quando subir de nível
                next_rank = transition_map[next_rank]["up"]
            elif final_grade >= 75 and activity_level >= self.level:
                next_rank = transition_map[current_rank]["up"]
                if next_rank == "level_up":
                    self.level += 1
                    next_rank = 2  # Voltar para o rank inicial quando subir de nível

        # Atualiza as coordenadas x e y com base no próximo rank
        self.x, self.y = [k for k, v in rank_map.items() if v == next_rank][0]

        print(
            f"Novas coordenadas após alteração de rank ou nível: ({self.x}, {self.y})"
        )  # Debug
        print(f"Nível {self.level}")

        self.save()
        print("=== Fim da função update_student_ninebox ===")  # Debug
