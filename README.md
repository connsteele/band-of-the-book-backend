# band-of-the-book-backend
Backend for book blog

# Running locally
* Create a database with psql and ensure the database is active
* Create a `.env` file in the root with the following variables
  * DATABASE_URL="postgresql://<role_name>:<role_password>*@localhost:5432/<database>?schema=public"
  * ALLOWED_ORIGINS="origin,origin"
    * Comma seperated list of allowed origins
* Reset the local database with the following command `npx prisma db push --force-reset && npx prisma db push`

# Deployment
* Ensure a prisma migration has been created `npx prisma migrate --name name`
  * This migration should be created locally and pushed to deployment platform or created on the platform
  * On platform run `npx prisma migrate deploy` as a pre-deployment step if a migration already exists on deployment platform