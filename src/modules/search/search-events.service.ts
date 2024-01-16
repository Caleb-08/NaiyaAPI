import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SearchEventsService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('search.storeSearch', { async: true })
  async addSearchTerm(payload: any): Promise<any> {
    const whereClause: any = {
      searchTerm: payload.searchTerm,
    };

    if (payload.subCat !== null) {
      whereClause.subCat = payload.subCat;
    }
    const existingSearch: any = await this.prisma.searchedHistory.findFirst({
      where: whereClause,
    });

    if (existingSearch) {
      const newUserList: any[] = [
        ...existingSearch.users,
        {
          userId: payload.userId,
          date: new Date(),
        },
      ];

      const lastOccurrences = {};
      // New array to store unique objects
      const uniqueArray = [];

      for (const obj of newUserList) {
        // Check if the name has already occurred
        if (lastOccurrences[obj.userId]) {
          // Replace the previous occurrence with the current one in the uniqueArray
          uniqueArray[lastOccurrences[obj.userId]] = obj;
        } else {
          // If it's the first occurrence, add it to the tracking object
          lastOccurrences[obj.userId] = uniqueArray.length;
          // Add the object to the uniqueArray
          uniqueArray.push(obj);
        }
      }

      console.log(newUserList);
      console.log(uniqueArray);

      await this.prisma.searchedHistory.update({
        where: { searchTerm: payload.searchTerm },
        data: {
          searchCount: existingSearch.searchCount + 1,
          subCat: payload.subCat,
          users: payload.userId ? uniqueArray : existingSearch.users,
        },
      });
    } else {
      await this.prisma.searchedHistory.create({
        data: {
          searchTerm: payload.searchTerm,
          subCat: payload.subCat,
          users: payload.userId
            ? [
                {
                  userId: payload.userId,
                  date: new Date(),
                },
              ]
            : [],
        },
      });
    }
  }
}
