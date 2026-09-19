# Use a imagem oficial do Python
FROM python:3.11.5-alpine3.17

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o arquivo de requerimentos e instala as dependências
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia o código fonte para o contêiner
COPY . .

# Executa o servidor web
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
