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
        # ranks para cada coordenada (x, y)
        ranks = [(1, 1), (2, 1), (3, 1), (1, 2), (2, 2), (3, 2), (1, 3), (2, 3), (3, 3)]

        current_rank = ranks.index((self.x, self.y))

        # Caso a nota seja abaixo de 50
        if final_grade < 50:
            if (
                current_rank == 0 and self.level > 0
            ):  # Verificar se ele está no primeiro rank e nível > 0
                self.level -= 1  # Reduz o nível
                current_rank = (
                    len(ranks) - 1
                )  # Vai para o último rank do nível anterior

            elif current_rank == len(ranks) - 1:  # Se já está no último rank
                self.last_rank_fails += 1  # Incrementar as falhas
                if self.last_rank_fails >= 2:  # Verificar se falhou duas vezes
                    self.level -= 1  # Reduzir nível
                    self.last_rank_fails = 0  # Resetar contador de falhas

            else:
                current_rank -= 1  # Reduzir o rank

        # Caso a nota seja 50 ou mais
        else:
            self.last_rank_fails = 0  # Resetar contador de falhas se passar
            extra_points = final_grade - 50
            ranks_to_increase = extra_points // 15

            if ranks_to_increase > 0:
                new_rank = current_rank + ranks_to_increase
                if new_rank >= len(ranks):
                    self.level += 1  # Aumentar o nível
                    new_rank = 0  # Voltar ao primeiro rank
                current_rank = new_rank  # Atualizar o rank

        # Atualizar x e y
        self.x, self.y = ranks[current_rank]
        self.save()
