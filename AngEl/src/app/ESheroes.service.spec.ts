import { TestBed } from '@angular/core/testing';

import { HeroServiceService } from './ESheroes.service';

describe('HeroServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HeroServiceService = TestBed.get(HeroServiceService);
    expect(service).toBeTruthy();
  });
});
