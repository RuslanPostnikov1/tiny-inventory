import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoresDto } from './dto/query-stores.dto';
import {
  StoreResponseDto,
  StoreWithCountResponseDto,
  StoreStatsResponseDto,
  PaginatedStoresResponseDto,
} from './dto/store-response.dto';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({
    status: 201,
    description: 'Store created successfully',
    type: StoreResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of stores',
    type: PaginatedStoresResponseDto,
  })
  findAll(@Query() query: QueryStoresDto) {
    return this.storesService.findAll(query);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get store statistics including inventory value' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({
    status: 200,
    description: 'Store statistics',
    type: StoreStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.getStats(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({
    status: 200,
    description: 'Store details',
    type: StoreWithCountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({
    status: 200,
    description: 'Store updated successfully',
    type: StoreResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 204, description: 'Store deleted successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id);
  }
}
