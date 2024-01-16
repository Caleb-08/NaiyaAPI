import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateCities, CreateState } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Post('createState')
  createState(@Body() data: CreateState) {
    return this.regionsService.createState(data.states);
  }

  @Get('allStates')
  getAllStates(): any {
    return this.regionsService.getAllStates();
  }

  @Post('createCities')
  createCities(@Body() data: CreateCities) {
    return this.regionsService.createCities(data.cities, data.id);
  }

  @Get('allCities')
  getAllCities(): any {
    return this.regionsService.getAllCities();
  }

  @Get('getAllCitiesByStateId/:id')
  getAllCitiesByStateId(@Param('id') id: string): any {
    return this.regionsService.getAllCitiesByStateId(id);
  }

  @Get('getAllStatesAndCities')
  getAllStatesAndCities(): any {
    return this.regionsService.getAllStatesAndCities();
  }
}
