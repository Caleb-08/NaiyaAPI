import { Injectable } from '@nestjs/common';
import { httpErrorException } from '../../core/services/utility.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { SearchAdsDto } from './dto';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private jwt: JwtService,
  ) {}

  async searchAds(request: any, payload: SearchAdsDto): Promise<any[]> {
    try {
      const { q, ...searchParams } = payload;

      const searchTerms = q.trim().split(/\s+/);

      const conditions: any = searchTerms.map((term: any) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      }));

      const andConditions: any[] = [];

      const { hasEveryQuery, hasSomeQuery } = this.buildSearchParams(searchParams);

      if (hasEveryQuery.length > 0) {
        andConditions.push({
          adData: {
            hasEvery: hasEveryQuery,
          },
        });
      }

      if (hasSomeQuery.length > 0) {
        andConditions.push({
          adData: {
            hasSome: hasSomeQuery,
          },
        });
      }

      const whereClause: any = {
        OR: conditions,
        AND: andConditions,
      };

      if (payload.subCat !== null) {
        whereClause.subCategory = {
          slug: payload.subCat,
        };
      }

      // whereClause.isPublished = true;

      const searchResult: any = await this.prisma.ads.findMany({
        where: whereClause,
        include: {
          store: {
            select: {
              name: true,
              slug: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          city: {
            select: {
              name: true,
              slug: true,
              state: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (searchResult.length > 0) {
        await this.saveInSearchHistory(request, searchParams['q'], searchParams['subCat']);
      }

      return searchResult;
    } catch (error) {
      httpErrorException(error);
    }
  }

  private buildSearchParams(params: any): {
    hasEveryQuery: { key: string; value: string }[];
    hasSomeQuery: { key: string; value: string }[];
  } {
    const hasEveryQuery: { key: string; value: string }[] = [];
    const hasSomeQuery: { key: string; value: string }[] = [];

    for (const key in params) {
      if (key !== 'q' && key !== 'subCat') {
        if (
          params[key].includes(',') &&
          key.substring(0, 6).toLowerCase() !== 'range-'
        ) {
          const allCommaSeperatedValues = params[key].split(',');
          for (const value of allCommaSeperatedValues) {
            hasSomeQuery.push({
              key,
              value: value,
            });
          }
        } else if (key.substring(0, 6).toLowerCase() === 'range-') {
          const parsedParams = JSON.parse(params[key]);
          const { min, max } = parsedParams || {}; // Use object destructuring to handle potential undefined values

          const minMax =
            Number.isFinite(min) && Number.isFinite(max)
              ? [min, max]
              : [min || Number(max) - 1000, max || Number(min) + 1000];

          // Ensure max is always greater than min
          const [correctedMin, correctedMax] = minMax.sort((a, b) => a - b);

          for (let value = correctedMin; value <= correctedMax; value++) {
            hasSomeQuery.push({
              key: key.slice(6),
              value: value.toString(),
            });
          }
        } else {
          hasEveryQuery.push({
            key,
            value: params[key],
          });
        }
      }
    }

    return { hasEveryQuery, hasSomeQuery };
  }

  // async searchAds(request: any, query: SearchAdsDto): Promise<any[]> {
  //   if (query.q.length < 3) {
  //   }
  //   try {
  //     const searchTerms = query.q.trim().split(/\s+/);
  //
  //     const conditions: any = searchTerms.map((term: any) => ({
  //       OR: [
  //         { title: { contains: term, mode: 'insensitive' } },
  //         { description: { contains: term, mode: 'insensitive' } },
  //       ],
  //     }));
  //
  //     const whereClause: any = {
  //       OR: conditions,
  //     };
  //
  //     if (query.subCat !== null) {
  //       whereClause.subCategory = {
  //         name: query.subCat,
  //       };
  //     }
  //
  //     // Price Filter
  //     if (query.minPrice && query.maxPrice) {
  //       whereClause.price = {
  //         gte: Number(query.minPrice),
  //         lte: Number(query.maxPrice),
  //       };
  //     } else if (query.minPrice) {
  //       whereClause.price = {
  //         gte: Number(query.minPrice),
  //       };
  //     } else if (query.maxPrice) {
  //       whereClause.price = {
  //         lte: Number(query.maxPrice),
  //       };
  //     }
  //
  //     whereClause.isPublished = true;
  //
  //     const searchResult: any = await this.prisma.ads.findMany({
  //       where: whereClause,
  //       include: {
  //         store: {
  //           select: {
  //             name: true,
  //             slug: true,
  //           },
  //         },
  //         subCategory: {
  //           select: {
  //             id: true,
  //             name: true,
  //             slug: true,
  //             category: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 slug: true,
  //               },
  //             },
  //           },
  //         },
  //         city: {
  //           select: {
  //             name: true,
  //             slug: true,
  //             state: {
  //               select: {
  //                 name: true,
  //                 slug: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //
  //     if (searchResult.length > 0) {
  //       await this.saveInSearchHistory(request, query.q, query.subCat);
  //     }
  //
  //     return searchResult;
  //   } catch (error) {
  //     httpErrorException(error);
  //   }
  // }

  async getRelatedSearchCategories(query: SearchAdsDto): Promise<any[]> {
    if (query.q.length < 3) {
    }
    try {
      const searchTerms = query.q.trim().split(/\s+/);

      const conditions: any = searchTerms.map((term: any) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      }));

      const whereClause: any = {
        OR: conditions,
      };

      if (query.subCat !== null) {
        whereClause.subCategory = {
          name: query.subCat,
        };
      }

      // whereClause.isPublished = true;

      const searchResult = await this.prisma.ads.findMany({
        where: whereClause,
        select: {
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      const subcategoryCount: {
        [key: string]: { subCategory: any; count: number };
      } = {};

      searchResult.forEach((result) => {
        const subCategoryKey = JSON.stringify(result.subCategory);

        if (subCategoryKey in subcategoryCount) {
          // Increment count if subcategory already exists in the object
          subcategoryCount[subCategoryKey].count += 1;
        } else {
          // Add new entry to the object with count 1
          subcategoryCount[subCategoryKey] = {
            subCategory: result.subCategory,
            count: 1,
          };
        }
      });

      // Extract subcategories and counts from the object
      const uniqueSubcategories = Object.values(subcategoryCount).map(
        (entry) => ({
          count: entry.count,
          ...entry.subCategory,
        }),
      );

      return uniqueSubcategories;
    } catch (error) {
      httpErrorException(error);
    }
  }

  async saveInSearchHistory(request: any, query: string, subCat: string) {
    if (query == null) {
      return;
    }

    const token = request.headers?.authorization?.replace('Bearer ', '');
    const payload: any = {
      searchTerm: query,
      subCat,
    };

    try {
      const userDetails = await this.jwt.verifyAsync<any>(token, {
        secret: process.env.JWT_SECRET,
      });

      this.eventEmitter.emit('search.storeSearch', {
        ...payload,
        userId: userDetails?.id,
      });
    } catch {
      this.eventEmitter.emit('search.storeSearch', payload);
    }
  }

  async getSearchSuggestion(query: string): Promise<any[]> {
    console.log('getSearchSuggestion');
    const searchTerms = query.trim().split(/\s+/);

    const conditions: any = searchTerms.map((term: any) => ({
      OR: [
        {
          searchTerm: {
            contains: term,
          },
        },
      ],
    }));
    try {
      return await this.prisma.searchedHistory.findMany({
        where: {
          OR: conditions,
        },
        select: {
          searchTerm: true,
          subCat: true,
          searchCount: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getTrendingSearch(): Promise<any[]> {
    try {
      const trendingSearches = await this.prisma.searchedHistory.findMany({
        where: {
          searchCount: {
            gte: 10,
          },
        },
        select: {
          searchTerm: true,
          subCat: true,
          searchCount: true,
        },
      });

      // Shuffle the trending searches randomly
      const shuffledTrendingSearches = this.shuffleArray(trendingSearches);

      // Return the first 5 entries from the shuffled array
      return shuffledTrendingSearches.slice(0, 20);
    } catch (error) {
      httpErrorException(error);
    }
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
