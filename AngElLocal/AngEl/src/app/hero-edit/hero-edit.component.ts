import { Component, OnInit } from '@angular/core';
import { ESHeroService } from '../ESheroes.service';
import { HeroFile } from '../heroFile';
import * as herofile from '../heroFile';

@Component({
  selector: 'app-hero-edit',
  templateUrl: './hero-edit.component.html',
  styleUrls: ['./hero-edit.component.css']
})
export class HeroEditComponent implements OnInit {
  hero: HeroFile

  constructor(private hs: ESHeroService) { }

  ngOnInit() {
    this.hs.getSelectedHero().subscribe(hero => this.hero = hero)
  }

  public submit(name: string, alias: string, quirk: string, rank: string) {
    rank.trim()
    name.trim()
    alias.trim()
    quirk.trim()
    rank = (rank != "" && !isNaN(Number(rank)))? rank : "" + herofile.UNRANKED
    name = (name != "")? name : herofile.UNKNOWN
    alias = (alias != "")? ((alias != this.hero.alias)? alias : null) : herofile.UNKNOWN
    quirk = (quirk != "")? quirk : herofile.UNKNOWN
    this.hs.editHero(this.hero, name, alias, quirk, Number(rank))
  }

  public unranked() {
    return herofile.UNRANKED
  }
}
