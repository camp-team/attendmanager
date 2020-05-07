import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'welcome',
    pathMatch: 'full',
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./shell/shell.module').then((m) => m.ShellModule),
  },
  // {
  //   path: '**', // this path should be the last.
  //   pathMatch: 'full',
  //   component: NotfoundComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
