import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateSlug,
  httpErrorException,
} from '../../core/services/utility.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async createState(states: string[]): Promise<any> {
    const createdStates: any[] = [];
    for (const state of states) {
      const stateSlug = generateSlug(state);
      try {
        const createState: any = await this.prisma.state.create({
          data: {
            name: state,
            slug: stateSlug,
          },
        });
        createdStates.push(createState);
      } catch (error) {
        const err: any = {
          error,
          createdBeforeError: createdStates,
        };
        httpErrorException(err);
      }
    }
    return createdStates;
  }

  async getAllStates() {
    try {
      return await this.prisma.state.findMany();
    } catch (error) {
      httpErrorException(error);
    }
  }

  async createCities(states: string[], stateId: string): Promise<any> {
    const createdCities: any[] = [];
    for (const city of states) {
      const citySlug = generateSlug(city);
      try {
        const createState: any = await this.prisma.cities.create({
          data: {
            state: {
              connect: {
                id: stateId,
              },
            },
            name: city,
            slug: citySlug,
          },
        });
        createdCities.push(createState);
      } catch (error) {
        const err: any = {
          error,
          createdBeforeError: createdCities,
        };
        httpErrorException(err);
      }
    }
    return createdCities;
  }

  async getAllCities() {
    try {
      return await this.prisma.cities.findMany();
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllCitiesByStateId(stateId: string): Promise<any> {
    try {
      return await this.prisma.cities.findMany({
        where: {
          stateId,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }

  async getAllStatesAndCities(): Promise<any> {
    try {
      return await this.prisma.state.findMany({
        include: {
          cities: true,
        },
      });
    } catch (error) {
      httpErrorException(error);
    }
  }
}
