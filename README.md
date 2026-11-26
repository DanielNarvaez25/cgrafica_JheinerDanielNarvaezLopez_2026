 Examen 2 - Gestión de Usuarios Hospitalarios
Rama del proyecto
La entrega del proyecto se realiza en la rama:

Examen2-DanielNarvaez
Clonar directamente esa rama:

git clone --branch Examen2-DanielNarvaez URL-del-repositorio
Descripción
Aplicación web para un hospital orientada a la gestión de usuarios del sistema.

Implementa:

Registro de usuarios.
Inicio de sesión mediante identificación y contraseña.
Gestión de usuarios.
Activación y desactivación de cuentas.
Eliminación de usuarios.
Protección mediante JWT.
Contraseñas almacenadas mediante hash bcrypt.
Arquitectura de 3 capas:

Angular 18 + PrimeNG 18
            ↓
      FastAPI
            ↓
       MySQL/MariaDB
El frontend nunca accede directamente a la base de datos.

Tecnologías
Frontend
Angular 18
PrimeNG 18
PrimeIcons
RxJS
Backend
FastAPI
SQLAlchemy
PyMySQL
bcrypt
PyJWT
python-dotenv
Base de datos
MySQL o MariaDB
Compatible con XAMPP
Estructura del proyecto
frontend/
backend/
DB/
frontend
Aplicación Angular.

backend
API FastAPI.

DB
Script de creación de base de datos.

Requisitos
Python 3
Node.js 22 LTS
npm
MySQL o MariaDB en ejecución
Opcionalmente XAMPP con el módulo MySQL en verde
Instalación
Paso 1. Importar DB/schema.sql
Asegúrese de que MySQL o MariaDB esté iniciado.

Opción 1 (recomendada)
Abrir:

http://localhost/phpmyadmin
Ir a:

Importar
Seleccionar:

DB/schema.sql
Pulsar:

Continuar
También puede abrir el archivo en MySQL Workbench y ejecutarlo.

Opción 2 (Shell de XAMPP)
Abrir:

XAMPP → Shell
Ir a la carpeta raíz del repositorio:

cd /d RUTA_DE_SU_REPOSITORIO
Ejecutar:

mysql -u root -e "source DB/schema.sql"
Opción 3 (mysql disponible en PATH)
Comprobar:

mysql --version
Si responde con una versión:

mysql -u root -p -e "source DB/schema.sql"
Si mysql no se reconoce, usar la opción 1 o 2.

Verificación
Abrir phpMyAdmin.

Comprobar:

db_DanielNarvaez2
y que existe la tabla:

usuarios
Paso 2. Backend
Ejecutar:

iniciar_backend.bat
La primera vez se creará:

backend\.env
Completar:

DB_PASSWORD
DB_PORT si aplica
JWT_SECRET
Con XAMPP normalmente:

DB_PASSWORD=
queda vacío.

Paso 3. Frontend
Ejecutar:

iniciar_frontend.bat
Paso 4. Primer usuario
Abrir:

http://localhost:4200
Registrar el primer usuario utilizando el formulario.

Endpoints de la API
Método	Endpoint	Descripción
POST	/auth/registro	Crear usuario
POST	/auth/login	Iniciar sesión
GET	/auth/me	Usuario actual
GET	/usuarios	Listar usuarios
GET	/usuarios/{id}	Obtener usuario
POST	/usuarios	Crear usuario
PUT	/usuarios/{id}	Actualizar usuario
PATCH	/usuarios/{id}/estado	Activar o desactivar
DELETE	/usuarios/{id}	Eliminar usuario
Swagger:

http://localhost:8000/docs
Flujo de pruebas
Registrar usuario.
Iniciar sesión.
Consultar usuarios.
Crear usuario.
Editar usuario.
Cambiar estado.
Eliminar usuario.
Cerrar sesión.
Reingresar.
Solución de problemas
Error 1045
Contraseña incorrecta.

Revise:

DB_PASSWORD
Con XAMPP normalmente está vacía.

Error 2003
No se puede conectar a MySQL.

Verifique:

MySQL iniciado.
Puerto correcto.
Revise:

DB_PORT
Unknown database
La base no existe.

Importe nuevamente:

DB/schema.sql
mysql no se reconoce
Use:

phpMyAdmin
Shell de XAMPP
Error de PowerShell con el signo <
No utilice:

<
Utilice los comandos indicados en el proyecto.

Puerto ocupado
Revise:

8000
4200
3306
Cambie el puerto ocupado o cierre la aplicación que lo use.

No module named
El entorno virtual existe pero faltan dependencias.

Ejecutar:

cd backend
.\venv\Scripts\python -m pip install -r requirements.txt
Prueba de despliegue limpio
Clone nuevamente el proyecto en otra carpeta.

Repita:

Importar DB/schema.sql.
Ejecutar iniciar_backend.bat.
Ejecutar iniciar_frontend.bat.
Registrar usuario.
Iniciar sesión.
Si todo funciona, el repositorio es portable.

Entrega
La URL de entrega corresponde al repositorio GitHub publicado en la rama:

Examen2-DanielNarvaez
La raíz de dicha rama debe contener:

frontend/
backend/
DB/