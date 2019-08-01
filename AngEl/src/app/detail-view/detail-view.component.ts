import { Component, OnInit } from '@angular/core';
import { ESHeroService } from '../ESheroes.service';
import { HeroFile } from '../heroFile';
import * as herofile from '../heroFile'

@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.css']
})
export class DetailViewComponent implements OnInit {
  hero: HeroFile

  constructor(private hs: ESHeroService) { }

  ngOnInit() {
    // subscribing and setting both work
    this.hs.getSelectedHero().subscribe(hero => this.hero = hero)
  }

  public async delete() {
    await this.hs.delHero(this.hero)
  }

  public unranked() {
    return herofile.UNRANKED
  }

}
