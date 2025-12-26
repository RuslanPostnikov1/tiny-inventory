import {
  createPaginationMeta,
  calculateSkip,
} from '../../src/common/utils/pagination.util';

describe('Pagination Utility', () => {
  describe('createPaginationMeta', () => {
    it('should create correct pagination meta for first page', () => {
      const result = createPaginationMeta(100, 1, 10);

      expect(result).toEqual({
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      });
    });

    it('should handle partial last page', () => {
      const result = createPaginationMeta(95, 1, 10);

      expect(result).toEqual({
        total: 95,
        page: 1,
        limit: 10,
        totalPages: 10,
      });
    });

    it('should handle single page', () => {
      const result = createPaginationMeta(5, 1, 10);

      expect(result).toEqual({
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty results', () => {
      const result = createPaginationMeta(0, 1, 10);

      expect(result).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('calculateSkip', () => {
    it('should return 0 for first page', () => {
      expect(calculateSkip(1, 10)).toBe(0);
    });

    it('should calculate correct skip for second page', () => {
      expect(calculateSkip(2, 10)).toBe(10);
    });

    it('should calculate correct skip for arbitrary page', () => {
      expect(calculateSkip(5, 20)).toBe(80);
    });
  });
});
