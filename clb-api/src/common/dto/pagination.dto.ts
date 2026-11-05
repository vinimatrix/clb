/**
 * DTO de paginación para endpoints GET.
 * Estandariza limit/offset en toda la API.
 */
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500) // Límite máximo de página para evitar sobrecarga de BD
  limit?: number = 50;

  @IsOptional()
  sort?: string = 'id';

  @IsOptional()
  order?: 'ASC' | 'DESC' = 'ASC';

  get offset(): number {
    return (this.page - 1) * (this.limit ?? 50);
  }

  get take(): number {
    return this.limit ?? 50;
  }
}
