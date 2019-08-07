import { Component, OnInit, DoCheck } from '@angular/core';
import { ESHeroService } from '../ESheroes.service';
import { HeroFile } from '../heroFile';
import * as herofile from '../heroFile';
import { ActivatedRoute, Router } from '@angular/router';
import { delay } from 'q';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit {
  heroes: HeroFile[] = []

  constructor(private hs: ESHeroService,
              private route: ActivatedRoute,
              private router: Router) { 
    // this.route.data.subscribe(heroes => this.heroes = heroes.heroesList) WHEN SUBSCRIBED PAGE DISPLAYS BEFORE UPDATES
  }

  async ngOnInit() {
    await this.updateList()                            // SAME AS BELOW
    // let heroes = await this.route.data.toPromise()  // WHEN PROMISED PAGE SHOWS EMPTY LIST REQUIRING BUTTON UPDATE BEFORE SHOWING ACTUAL DATA
    // this.heroes = heroes.heroesList                 // THIS IS BECAUSE THIS DOES NOTHING IT IS ALL OTHERS CALLING UPDATE LIST THAT CAUSES THIS
  }

  async updateList() {
    await delay(1000)  // Effectively causes it to wait as desired but not proper
    this.heroes = await this.hs.getHeroPage()
  }

  public async updateSort(sort: string) {
    this.hs.updateSort(sort)
    await this.updateList()
  }

  public async pageUp() {
    this.hs.pageUp(this.heroes.length)
    await this.updateList()
  }

  public async pageDown() {
    this.hs.pageDown()
    await this.updateList()
  }

  public async search(value: string) {
    this.hs.searchTerm(value)
    await this.updateList()
  }

  public async select(hero: HeroFile) {
    this.hs.selectHero(hero)
    await this.updateList()
  }

  public getPage() {
    return this.hs.getPage()
  }

  public unranked() {
    return herofile.UNRANKED
  }

  public unknown() {
    return herofile.UNKNOWN
  }

  public unlicensed() {
    return herofile.UNLICENSED
  }
}
