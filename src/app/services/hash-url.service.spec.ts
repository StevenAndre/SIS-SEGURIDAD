import { TestBed } from '@angular/core/testing';

import { HashUrlService } from './hash-url.service';

describe('HashUrlService', () => {
  let service: HashUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
