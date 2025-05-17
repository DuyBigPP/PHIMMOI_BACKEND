const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const BATCH_SIZE = 10; // Số lượng phim import song song mỗi lần

async function importMovies() {
  try {
    const dataDir = path.join(__dirname, '../../data');
    let totalMovies = 0;
    let importedMovies = 0;

    // Đọc tất cả các file từ movie_details_1.json đến movie_details_114.json
    for (let i = 1; i <= 114; i++) {
      const filePath = path.join(dataDir, `movie_details_${i}.json`);
      try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const movies = JSON.parse(jsonData);

        console.log(`Processing file movie_details_${i}.json with ${movies.length} movies`);
        totalMovies += movies.length;

        // Chia nhỏ dữ liệu thành các batch
        for (let j = 0; j < movies.length; j += BATCH_SIZE) {
          const batch = movies.slice(j, j + BATCH_SIZE);
          await Promise.all(batch.map(async (movieData) => {
            const movie = movieData.movie;
            try {
              // Tạo hoặc cập nhật phim
              const createdMovie = await prisma.movie.upsert({
                where: { slug: movie.slug },
                update: {
                  name: movie.name,
                  originName: movie.origin_name,
                  content: movie.content,
                  type: movie.type,
                  status: movie.status,
                  posterUrl: movie.poster_url,
                  thumbUrl: movie.thumb_url,
                  isCopyright: movie.is_copyright,
                  subDocquyen: movie.sub_docquyen,
                  chieurap: movie.chieurap,
                  trailerUrl: movie.trailer_url,
                  time: movie.time,
                  episodeCurrent: movie.episode_current,
                  episodeTotal: movie.episode_total,
                  quality: movie.quality,
                  lang: movie.lang,
                  notify: movie.notify,
                  showtimes: movie.showtimes,
                  year: movie.year,
                  view: movie.view,
                  tmdbId: movie.tmdb?.id,
                  tmdbType: movie.tmdb?.type,
                  tmdbVoteAverage: movie.tmdb?.vote_average,
                  tmdbVoteCount: movie.tmdb?.vote_count,
                  imdbId: movie.imdb?.id,
                  createdAt: new Date(movie.created.time),
                  updatedAt: new Date(movie.modified.time)
                },
                create: {
                  slug: movie.slug,
                  name: movie.name,
                  originName: movie.origin_name,
                  content: movie.content,
                  type: movie.type,
                  status: movie.status,
                  posterUrl: movie.poster_url,
                  thumbUrl: movie.thumb_url,
                  isCopyright: movie.is_copyright,
                  subDocquyen: movie.sub_docquyen,
                  chieurap: movie.chieurap,
                  trailerUrl: movie.trailer_url,
                  time: movie.time,
                  episodeCurrent: movie.episode_current,
                  episodeTotal: movie.episode_total,
                  quality: movie.quality,
                  lang: movie.lang,
                  notify: movie.notify,
                  showtimes: movie.showtimes,
                  year: movie.year,
                  view: movie.view,
                  tmdbId: movie.tmdb?.id,
                  tmdbType: movie.tmdb?.type,
                  tmdbVoteAverage: movie.tmdb?.vote_average,
                  tmdbVoteCount: movie.tmdb?.vote_count,
                  imdbId: movie.imdb?.id,
                  createdAt: new Date(movie.created.time),
                  updatedAt: new Date(movie.modified.time)
                }
              });

              // Xử lý actors
              if (movie.actor && movie.actor.length > 0) {
                await Promise.all(movie.actor.map(async (actorName) => {
                  await prisma.actor.upsert({
                    where: { name: actorName },
                    update: {},
                    create: { name: actorName }
                  });

                  await prisma.movieActor.upsert({
                    where: {
                      movieId_actorName: {
                        movieId: createdMovie.id,
                        actorName: actorName
                      }
                    },
                    update: {},
                    create: {
                      movieId: createdMovie.id,
                      actorName: actorName
                    }
                  });
                }));
              }

              // Xử lý directors
              if (movie.director && movie.director.length > 0) {
                await Promise.all(movie.director.map(async (directorName) => {
                  await prisma.director.upsert({
                    where: { name: directorName },
                    update: {},
                    create: { name: directorName }
                  });

                  await prisma.movieDirector.upsert({
                    where: {
                      movieId_directorName: {
                        movieId: createdMovie.id,
                        directorName: directorName
                      }
                    },
                    update: {},
                    create: {
                      movieId: createdMovie.id,
                      directorName: directorName
                    }
                  });
                }));
              }

              // Xử lý categories
              if (movie.category && movie.category.length > 0) {
                await Promise.all(movie.category.map(async (category) => {
                  await prisma.category.upsert({
                    where: { slug: category.slug },
                    update: {
                      name: category.name
                    },
                    create: {
                      slug: category.slug,
                      name: category.name
                    }
                  });

                  await prisma.movieCategory.upsert({
                    where: {
                      movieId_categorySlug: {
                        movieId: createdMovie.id,
                        categorySlug: category.slug
                      }
                    },
                    update: {},
                    create: {
                      movieId: createdMovie.id,
                      categorySlug: category.slug
                    }
                  });
                }));
              }

              // Xử lý countries
              if (movie.country && movie.country.length > 0) {
                await Promise.all(movie.country.map(async (country) => {
                  await prisma.country.upsert({
                    where: { slug: country.slug },
                    update: {
                      name: country.name
                    },
                    create: {
                      slug: country.slug,
                      name: country.name
                    }
                  });

                  await prisma.movieCountry.upsert({
                    where: {
                      movieId_countrySlug: {
                        movieId: createdMovie.id,
                        countrySlug: country.slug
                      }
                    },
                    update: {},
                    create: {
                      movieId: createdMovie.id,
                      countrySlug: country.slug
                    }
                  });
                }));
              }

              // Xử lý episodes
              if (movieData.episodes && movieData.episodes.length > 0) {
                for (const server of movieData.episodes) {
                  await Promise.all(server.server_data.map(async (episode) => {
                    await prisma.episode.upsert({
                      where: {
                        movieId_slug: {
                          movieId: createdMovie.id,
                          slug: episode.slug
                        }
                      },
                      update: {
                        name: episode.name,
                        filename: episode.filename,
                        linkEmbed: episode.link_embed,
                        linkM3u8: episode.link_m3u8,
                        serverName: server.server_name
                      },
                      create: {
                        movieId: createdMovie.id,
                        slug: episode.slug,
                        name: episode.name,
                        filename: episode.filename,
                        linkEmbed: episode.link_embed,
                        linkM3u8: episode.link_m3u8,
                        serverName: server.server_name
                      }
                    });
                  }));
                }
              }

              importedMovies++;
              if (importedMovies % 10 === 0) {
                console.log(`Imported ${importedMovies}/${totalMovies} movies`);
              }
            } catch (err) {
              console.error(`Error importing movie: ${movie.name}`, err);
            }
          }));
        }
      } catch (error) {
        console.error(`Error processing file movie_details_${i}.json:`, error);
      }
    }

    console.log(`Import completed. Total movies imported: ${importedMovies}`);
  } catch (error) {
    console.error('Error importing movies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importMovies(); 