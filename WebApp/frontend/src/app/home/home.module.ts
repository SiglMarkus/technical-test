import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NbButtonModule, NbCardModule, NbDialogModule, NbIconModule, NbInputModule, NbListModule, NbTooltipModule} from '@nebular/theme';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    HomeComponent,
  ],
    imports: [
        CommonModule,
        NbCardModule,
        NbButtonModule,
        NbDialogModule.forRoot(),
        HomeRoutingModule,
        NbInputModule,
        ReactiveFormsModule,
        NbIconModule,
        NbListModule,
        NbTooltipModule,
    ]
})
export class HomeModule { }
