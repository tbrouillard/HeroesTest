import { Component, OnInit } from '@angular/core';
import { ESHeroService } from '../ESheroes.service';
import { HeroFile } from '../heroFile';
import * as herofile from '../heroFile';

@Component({
  selector: 'app-hero-add',
  templateUrl: './hero-add.component.html',
  styleUrls: ['./hero-add.component.css']
})
export class HeroAddComponent implements OnInit {
  constructor(private hs: ESHeroService) { }

  ngOnInit() {
  }

  public submit(name: string, alias: string, quirk: string) {
    name.trim()
    alias.trim()
    quirk.trim()
    name = (name != "")? name : herofile.UNKNOWN
    alias = (alias != "")? alias : herofile.UNKNOWN
    quirk = (quirk != "")? quirk : herofile.UNKNOWN
    this.hs.addHero(name, alias, quirk)
  }

}
