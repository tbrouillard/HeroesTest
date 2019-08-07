import { Injectable } from '@angular/core';
import { Router, Resolve } from '@angular/router';
import { HeroFile } from './heroFile';
import { ESHeroService } from './ESheroes.service';

@Injectable({
  providedIn: 'root'
})
export class ListResolverService implements Resolve<HeroFile[]> {

  constructor(private hs: ESHeroService, private router: Router) { }

  resolve() {
    return this.hs.getHeroPage()
  }
}
