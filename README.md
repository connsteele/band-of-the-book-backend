# band-of-the-book-backend
Backend for book blog

# Running locally
* Create a database with psql and ensure the database is active
* Create a `.env` file in the root with the following variables
  * DATABASE_URL="postgresql://<role_name>:<role_password>*@localhost:5432/<database>?schema=public"
  * ALLOWED_ORIGINS="origin,origin"
    * Comma seperated list of allowed origins
* Reset the local database with the following command `npx prisma db push --force-reset && npx prisma db push`