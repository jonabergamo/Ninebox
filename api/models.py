from django.db import models


class Professor(models.Model):
    nome = models.CharField(max_length=100)
    # Outros campos relevantes
    turmas = models.ManyToManyField("Turma", related_name="professores")


class Turma(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Aluno(models.Model):
    nome = models.CharField(max_length=100)
    turmas = models.ManyToManyField(Turma, related_name="alunos")
    nine_boxes = models.ManyToManyField("NineBox", through="AlunoNineBox")

    def __str__(self):
        return self.nome


class Disciplina(models.Model):
    nome = models.CharField(max_length=100)
    turma = models.ForeignKey(
        Turma, related_name="disciplinas", on_delete=models.CASCADE
    )

    def __str__(self):
        return self.nome


class Atividade(models.Model):
    nome = models.CharField(max_length=100)
    nivel = models.IntegerField()
    disciplinas = models.ManyToManyField(Disciplina, related_name="atividades")
    nine_boxes = models.ManyToManyField("NineBox")
    criterios = models.ManyToManyField("Criterio")

    def __str__(self):
        return self.nome


class NineBox(models.Model):
    descricao = models.CharField(max_length=100)

    def __str__(self):
        return self.descricao


class AlunoNineBox(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    nine_box = models.ForeignKey(NineBox, on_delete=models.CASCADE)
    nivel = models.IntegerField(default=0)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)

    def __str__(self):
        return self.aluno


class Criterio(models.Model):
    descricao = models.CharField(max_length=100)

    def __str__(self):
        return self.descricao


class Avaliacao(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    atividade = models.ForeignKey(Atividade, on_delete=models.CASCADE)
    criterio = models.ForeignKey(Criterio, on_delete=models.CASCADE)
    NOTA_CHOICES = [("E", "Excelente"), ("B", "Bom"), ("R", "Regular"), ("U", "Ruim")]
    nota = models.CharField(choices=NOTA_CHOICES, max_length=1)
