import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { ActivatedRoute } from '@angular/router';
import { Event } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-attended-events',
  templateUrl: './attended-events.component.html',
  styleUrls: ['./attended-events.component.scss'],
})
export class AttendedEventsComponent implements OnInit {
  passedEvents: Event[];

  ifPassedEvents: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private eventService: EventService
  ) {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const searchId = params.get('id');
      this.authService
        .getUserFromSearchId(searchId)
        .subscribe((target: User) => {
          const id = target.uid;
          this.eventService
            .getAttendingEvents(id)
            .subscribe((attendingEvents: Event[]) => {
              if (attendingEvents.length) {
                const now = new Date();
                const events: Event[] = [];
                attendingEvents.forEach((attendedEvent: Event) => {
                  if (attendedEvent.date.toDate() < now) {
                    console.log(attendedEvent);
                    console.log(attendedEvent.date.toDate());
                    console.log(now);
                    events.push(attendedEvent);
                  }
                });
                if (events.length) {
                  this.ifPassedEvents = true;
                  this.passedEvents = events;
                } else {
                  this.ifPassedEvents = false;
                }
              } else {
                this.ifPassedEvents = false;
              }
            });
        });
    });
  }

  ngOnInit(): void {}
}
