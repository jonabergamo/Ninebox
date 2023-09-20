from django.db import models
from .student import Student
from .nineBox import NineBox


class StudentNineBox(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    nine_box = models.ForeignKey(NineBox, on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    x = models.IntegerField(default=1)
    y = models.IntegerField(default=1)
    last_rank_fail_count = models.IntegerField(default=0)

    def __str__(self):
        return str(self.student)

    def update_student_ninebox(self, final_grade):
        print("=== Início da função update_student_ninebox ===")  # Debug

        # ranks para cada coordenada (x, y)
        ranks = [(1, 1), (2, 1), (3, 1), (1, 2), (2, 2), (3, 2), (1, 3), (2, 3), (3, 3)]
        current_rank = ranks.index((self.x, self.y))

        print(
            f"Rank atual: {current_rank}, Coordenadas atuais: ({self.x}, {self.y}), Nível atual: {self.level}"
        )  # Debug

        if final_grade < 50:
            print("Nota abaixo de 50.")  # Debug
            deficit_points = 50 - final_grade
            ranks_to_decrease = int(
                deficit_points // 16
            )  # Ajuste esse valor para mudar o "peso" da queda

            print(f"deficit_points: {deficit_points}")  # Debug
            print(f"ranks_to_decrease: {ranks_to_decrease}")  # Debug

            if current_rank == 0:
                print("Está no primeiro rank.")  # Debug
                self.last_rank_fail_count += 1  # Incrementar as falhas

                if self.last_rank_fail_count >= 2 and self.level > 0:
                    print(
                        "Falhou duas vezes no primeiro rank e nível é maior que 0."
                    )  # Debug
                    self.level -= 1
                    self.last_rank_fail_count = 0  # Resetar contador de falhas
                    current_rank = (
                        len(ranks) - 1
                    )  # Vai para o último rank do nível anterior

            else:
                print("Reduzindo o rank.")  # Debug
                new_rank = max(current_rank - ranks_to_decrease, 0)
                current_rank = new_rank

        else:
            print("Nota 50 ou mais.")  # Debug
            self.last_rank_fail_count = 0  # Resetar contador de falhas
            extra_points = final_grade - 50
            ranks_to_increase = extra_points // 20

            print(f"extra_points: {extra_points}")  # Debug
            print(f"ranks_to_increase: {ranks_to_increase}")  # Debug

            if current_rank == len(ranks) - 1 and final_grade > 75:
                print(
                    "Está no último rank e nota maior que 75, subindo de nível."
                )  # Debug
                self.level += 1
                current_rank = 0  # Voltar ao primeiro rank
            elif ranks_to_increase > 0:
                new_rank = current_rank + int(ranks_to_increase)
                print(f"Novo rank calculado: {new_rank}")  # Debug

                if new_rank >= len(ranks):
                    new_rank = len(ranks) - 1  # Ficar no último rank

                current_rank = new_rank  # Atualizar o rank

        self.x, self.y = ranks[current_rank]
        print(
            f"Novas coordenadas após alteração de rank ou nível: ({self.x}, {self.y})"
        )  # Debug
        print(f"Nivel {self.level}")

        self.save()
        print("=== Fim da função update_student_ninebox ===")  # Debug
