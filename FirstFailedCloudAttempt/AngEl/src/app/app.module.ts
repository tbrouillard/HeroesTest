import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestEsComponent } from './test-es/test-es.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { HeroAddComponent } from './hero-add/hero-add.component';
import { HeroEditComponent } from './hero-edit/hero-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    TestEsComponent,
    TopBarComponent,
    HeroListComponent,
    DetailViewComponent,
    HeroAddComponent,
    HeroEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
