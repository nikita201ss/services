# Проект с услугами для людей (Django + React)

Проект нацелен на поиск и предоставление услуг.

## Чтобы запустить проект потребуется:

1. Клонируем репозиторий с проектом удобным способом (например по https)
  ```
  git clone https://github.com/nikita201ss/services.git
  ```

2. Переходим в директорию
  ```
  cd services
  ```

3. Создаем виртуальное окружение и активируем его
  ```
  python -m venv venv

  venv\Scripts\activate
  ```

4. Устанавливаем зависимости из requirements.txt (проект работает на СУБД MySQL)
  ```
  pip install -r requirements.txt
  ```

5. Создаём БД в MySQL командой ниже (запускаем MySql клиент, пишем пароль из .env - root)
  ```
  CREATE DATABASE myprojectdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
Если вышло предупреждение, значит БД уже создана
ERROR 1007 (HY000): Can't create database 'myproject_db'; database exists

6. Создаём миграции (если не созданы)
  ```
  cd backend
  python manage.py migrate
  ```

7. Создаём суперпользователя
  ```
  python manage.py createsuperuser
  ```

8. Устанавливаем зависимости для Frontend
  ```
  cd .\frontend\
  npm install
  ```
    
9. Запуск проекта (два терминала)
  ```
  cd .\backend\
  python manage.py runserver
  ```
  ```
  cd .\frontend\
  npm start
  ```
