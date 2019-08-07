import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroAddComponent } from './hero-add/hero-add.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { ListResolverService } from './list-resolver.service';
import { HeroEditComponent } from './hero-edit/hero-edit.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: HeroListComponent, 
    resolve: { heroesList: ListResolverService }},
  { path: 'addHero', component: HeroAddComponent },
  { path: 'detail/:reference', component: DetailViewComponent },
  { path: 'edit/:reference', component: HeroEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ListResolverService]
})
export class AppRoutingModule { }
