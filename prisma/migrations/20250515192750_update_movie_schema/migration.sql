/*
  Warnings:

  - A unique constraint covering the columns `[movieId,slug]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Episode_movieId_slug_key" ON "Episode"("movieId", "slug");
