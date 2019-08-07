import { TestBed } from '@angular/core/testing';

import { ListResolverService } from './list-resolver.service';

describe('ListResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ListResolverService = TestBed.get(ListResolverService);
    expect(service).toBeTruthy();
  });
});
