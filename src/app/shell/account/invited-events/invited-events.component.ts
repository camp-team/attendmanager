import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { InviteGetService } from 'src/app/services/invite-get.service';
import { SearchService } from 'src/app/services/search.service';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-invited-events',
  templateUrl: './invited-events.component.html',
  styleUrls: ['./invited-events.component.scss'],
})
export class InvitedEventsComponent implements OnInit {
  index = this.searchService.index.events_date;

  form = this.fb.group({});

  searchOptions = {
    facetFilters: [],
    page: 0,
    hitsPerPage: 3,
  };

  options = [];

  result: {
    nbHits: number;
    hits: any[];
  };

  valueControl: FormControl = new FormControl();

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private searchService: SearchService,
    private userService: UserService,
    private invitedGetService: InviteGetService
  ) {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const searchId = params.get('id');
      this.userService
        .getUserFromSearchId(searchId)
        .subscribe((target: User) => {
          const id = target.uid;
          this.invitedGetService
            .getInvitedEventIds(id)
            .subscribe((invitedEventIds: string[]) => {
              if (invitedEventIds.length) {
                const facetFilters = invitedEventIds.map(
                  (invitedEventId: string) => {
                    return `id:${invitedEventId}`;
                  }
                );
                console.log(facetFilters);

                this.searchOptions = {
                  facetFilters: [facetFilters],
                  page: 0,
                  hitsPerPage: 3,
                };

                this.index.search('', this.searchOptions).then((result) => {
                  console.log(result);
                  this.options = result.hits;
                });

                this.search('', this.searchOptions);
              }
            });
        });
    });
  }

  ngOnInit(): void {}

  search(query: string, searchOptions) {
    this.index.search(query, searchOptions).then((result) => {
      this.result = result;
    });
  }

  clearSearch() {
    this.valueControl.setValue('');
  }
}
